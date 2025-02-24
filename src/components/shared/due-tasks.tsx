import { Card, CardContent } from '../ui/card';
import { useEffect, useState } from 'react';
import TaskList from './task-list';
import { useToast } from '../ui/use-toast';
import { Input } from '../ui/input';
import Loader from '@/components/shared/loader';
import { useFetchDueTasksQuery } from '@/redux/features/taskSlice';
import { TaskSlice, useUpdateTaskMutation } from '@/redux/features/taskSlice';

export default function DueTasks({ user }) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [tasks, setTasks] = useState([]);
  const [updateTask] = useUpdateTaskMutation();

  // Fetch initial tasks using RTK Query
  const { isLoading, data, refetch } = useFetchDueTasksQuery(
    {
      userId: user?._id,

      sortOrder,
      page,
      limit: 5000
    },
    { pollingInterval: 10000, refetchOnFocus: true, refetchOnReconnect: true }
  );

  const getDueTaskFn = TaskSlice.usePrefetch('fetchDueTasks');
  useEffect(() => {
    getDueTaskFn({
      userId: user?._id,

      sortOrder: 'desc',
      page: 1,
      limit: 5000
    });
  }, []);



  useEffect(() => {
    refetch();
  }, [refetch]);

  // Update tasks when data changes
  useEffect(() => {
    if (data?.data?.result) {
      setTasks(data.data.result); // Extract the `result` array
    }
  }, [data]);

  const handleMarkAsImportant = async (taskId) => {
    const taskToToggle = tasks.find((task) => task._id === taskId);
    if (!taskToToggle) return;

    // Optimistic update
    const previousTasks = [...tasks];
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId ? { ...task, important: !task.important } : task
      )
    );

    try {
      await updateTask({
        taskId,
        updates: {
          important: !taskToToggle.important
        }
      });
      refetch();
      toast({ title: 'Task Updated'});
    } catch (error) {
      // Revert optimistic update on error
      setTasks(previousTasks);
      toast({ variant: 'destructive', title: 'Something Went Wrong!' });
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleToggleTaskCompletion = async (taskId: string) => {
    // Find the task in the state
    const taskToToggle = tasks.find((task) => task._id === taskId);
    if (!taskToToggle) return;

    // Optimistically update UI
    const previousTasks = [...tasks];
    const updatedTasks = tasks.map((task) =>
      task._id === taskId
        ? {
            ...task,
            status: task.status === 'completed' ? 'pending' : 'completed'
          }
        : task
    );
    setTasks(updatedTasks.filter((task) => task.status !== 'completed')); // Hide completed tasks
    try {
      await updateTask({
        taskId,
        updates: {
          // important: !taskToToggle.important,
          status: taskToToggle.status === 'completed' ? 'pending' : 'completed'
        }
      }).unwrap();
      refetch();
      toast({ title: 'Task Updated'});
    } catch (error) {
      // Revert optimistic update on error
      setTasks(previousTasks);
      toast({ variant: 'destructive', title: 'Something Went Wrong!' });
    }
  };

  return (
    <Card className="flex h-[calc(88vh-7rem)] flex-col overflow-hidden px-2">
      <Input
        className="m-4 flex h-[40px] w-[92%] items-center p-4 md:w-[98%]"
        placeholder="Search notes..."
        value={searchTerm}
        onChange={handleSearch}
      />
      {isLoading ? (
        <Loader />
      ) : (
        <CardContent className="h-[calc(86vh-8rem)] flex-1 overflow-y-hidden px-4 scrollbar-hide">
          <TaskList
            tasks={tasks}
            onMarkAsImportant={handleMarkAsImportant}
            onToggleTaskCompletion={handleToggleTaskCompletion}
          />
        </CardContent>
      )}
    </Card>
  );
}
