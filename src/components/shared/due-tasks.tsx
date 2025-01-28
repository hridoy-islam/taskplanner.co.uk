import { Card, CardContent } from '../ui/card';
import { useEffect, useState } from 'react';
import TaskList from './task-list';
import { useToast } from '../ui/use-toast';
import notask from '@/assets/imges/home/notask.png';
import { Input } from '../ui/input';
import Loader from '@/components/shared/loader';
import {
  useFetchDueTasksQuery,
  useLazyFetchDueTasksQuery
} from '@/redux/features/taskSlice';
import { TaskSlice } from '@/redux/features/taskSlice';
import axiosInstance from '@/lib/axios';
export default function DueTasks({ user }) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [tasks, setTasks] = useState([]);

  // Fetch initial tasks using RTK Query
  const { isLoading, data, isFetching, refetch } = useFetchDueTasksQuery({
    userId: user._id,
    searchTerm,
    sortOrder,
    page,
    limit: 15
  });

  // Lazy fetch for infinite scroll
  // const [triggerFetch, { data: lazyData, isFetching: isLazyFetching }] = useLazyFetchDueTasksQuery();

  // Update tasks when data changes
  useEffect(() => {
    if (data?.data?.result) {
      setTasks(data.data.result); // Extract the `result` array
    }
  }, [data]);

  // // Append new tasks when lazyData changes (infinite scroll)
  // useEffect(() => {
  //   if (lazyData && lazyData.data && lazyData.data.result) {
  //     setTasks((prevTasks) => [...prevTasks, ...lazyData.data.result]); // Append new tasks
  //   }
  // }, [lazyData]);

  // Trigger the query on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleRefetch = () => {
    if (!isFetching) {
      refetch(); // Only refetch if the query is not already in progress
    } else {
      console.warn('Query is already in progress.');
    }
  };

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
      // Update server
      const response = await axiosInstance.patch(`/task/${taskId}`, {
        important: !taskToToggle.important
      });

      if (response.data.success) {
        // Update RTK Query cache
        TaskSlice.util.updateQueryData(
          'fetchDueTasks',
          { userId: user._id, searchTerm, sortOrder, page, limit: 15 },
          (draft) => {
            const task = draft?.data?.result?.find((t) => t._id === taskId);
            if (task) {
              task.important = !task.important;
            }
          }
        );
        toast({ title: 'Task Updated', description: 'Thank You' });
      } else {
        throw new Error('Failed to update task');
      }
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
      // Update server
      const response = await axiosInstance.patch(`/task/${taskId}`, {
        status: taskToToggle.status === 'completed' ? 'pending' : 'completed'
      });

      if (response.data.success) {
        // Update RTK Query cache
        TaskSlice.util.updateQueryData(
          'fetchDueTasks',
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
          description: 'Thank You'
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
    <Card className="flex h-[calc(86vh-8rem)] flex-col overflow-hidden p-2">
      <Input
        className="m-4 flex h-[40px] w-[90%] items-center p-4 md:w-[98%]"
        placeholder="Search notes..."
        value={searchTerm}
        onChange={handleSearch}
      />
      {isLoading ? (
        <Loader />
      ) : (
        <CardContent className="flex-1 overflow-y-auto px-4 scrollbar-hide">
          {tasks.length === 0 ? (
            <div className="mt-36 flex flex-col items-center justify-center">
              <img src={notask} alt="No Task" />
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              onMarkAsImportant={handleMarkAsImportant}
              onToggleTaskCompletion={handleToggleTaskCompletion}
              fetchTasks={handleRefetch}
            />
          )}
        </CardContent>
      )}
    </Card>
  );
}
