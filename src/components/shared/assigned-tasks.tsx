import { Card, CardContent } from '../ui/card';
import axiosInstance from '../../lib/axios';
import { useEffect, useState } from 'react';
import TaskList from './task-list';
import { useToast } from '../ui/use-toast';
import {
  TaskSlice,
  useFetchAssignedTasksQuery,
  useUpdateTaskMutation
} from '@/redux/features/taskSlice';
import { Input } from '../ui/input';

import Loader from './loader';
import notask from '@/assets/imges/home/notask.png';

export default function AssignedTasks({ user }) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [updateTask] = useUpdateTaskMutation();

  const { data, refetch, isLoading } = useFetchAssignedTasksQuery(
    {
      userId: user._id,
      searchTerm,
      sortOrder,
      page,
      limit: 5000
    },
    { pollingInterval: 10000, refetchOnFocus: true, refetchOnReconnect: true }
  );

  const getAssignedTaskFn = TaskSlice.usePrefetch('fetchAssignedTasks');
  useEffect(() => {
    getAssignedTaskFn({
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
      toast({ title: 'Task Updated', description: 'Thank You' });
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
      toast({ title: 'Task Updated', description: 'Thank You' });
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
        <CardContent className="flex-1 overflow-y-auto px-4 scrollbar-hide">
          <TaskList
            tasks={tasks}
            onMarkAsImportant={handleMarkAsImportant}
            onToggleTaskCompletion={handleToggleTaskCompletion}
          />
          {tasks.length === 0 && (
            <div className="mt-36 flex flex-col items-center justify-center">
              <img src={notask} alt="No Task" />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
