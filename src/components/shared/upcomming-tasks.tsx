import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import axiosInstance from '../../lib/axios';
import { useEffect, useState } from 'react';
import TaskList from './task-list';
import { useToast } from '../ui/use-toast';
import { Input } from '../ui/input';
import Loader from './loader';
import {
  TaskSlice,
  useFetchUpcomingTasksQuery,
  useUpdateTaskMutation
} from '@/redux/features/taskSlice';

export default function UpcomingTasks({ user }) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [updateTask] = useUpdateTaskMutation();

  const { data, refetch, isLoading, isFetching, isSuccess } =
    useFetchUpcomingTasksQuery(
      {
        userId: user._id,
        searchTerm,
        sortOrder,
        page,
        limit: 5000
      },
      { pollingInterval: 10000, refetchOnFocus: true, refetchOnReconnect: true }
    );

  const getUpcommingTaskFn = TaskSlice.usePrefetch('fetchUpcomingTasks');
  useEffect(() => {
    getUpcommingTaskFn({
      userId: user._id,
      searchTerm: '',
      sortOrder: 'desc',
      page: 1,
      limit: 5000
    });
  }, []);

  useEffect(() => {
    if (data?.data?.result) {
      setTasks(data.data.result);
    }
  }, [data]);

  const handleMarkAsImportant = async (taskId) => {
    const taskToToggle = tasks.find((task) => task._id === taskId);
    if (!taskToToggle) return;

    // Optimistically update UI
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
      }).unwrap();
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
      // Update server
      const response = await axiosInstance.patch(`/task/${taskId}`, {
        status: taskToToggle.status === 'completed' ? 'pending' : 'completed'
      });

      if (response.data.success) {
        // Update RTK Query cache
        TaskSlice.util.updateQueryData(
          'fetchUpcomingTasks',
          { userId: user._id, searchTerm, sortOrder, page, limit: 15 },
          (draft) => {
            const task = draft?.data?.result?.find((t) => t._id === taskId);
            if (task) {
              task.status =
                task.status === 'completed' ? 'pending' : 'completed';
            }
          }
        );
        toast({
          title: 'Task Updated',
       
        });
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      // Revert optimistic update on error
      setTasks(previousTasks); // Restore previous state
      console.error('Error toggling task completion:', error);
      toast({
        variant: 'destructive',
        title: 'Something Went Wrong!'
      });
    }
  };

  return (
    <Card className="flex h-[calc(88vh-7rem)] flex-col overflow-hidden px-2">
      {/* <CardHeader>
        <CardTitle className="flex justify-between gap-2">
          <span></span>
          <Link to={'upcomingtask'}>See All</Link>
        </CardTitle>
      </CardHeader> */}
      <Input
        className="m-4 flex h-[40px] w-[92%] items-center p-4 md:w-[98%]"
        placeholder="Search notes..."
        value={searchTerm}
        onChange={handleSearch}
      />
      {isLoading ? (
        <Loader />
      ) : (
        <CardContent className="flex-1 overflow-y-auto px-4 scrollbar-hide">
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
