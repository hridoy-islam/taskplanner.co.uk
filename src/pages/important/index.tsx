import PageHead from '@/components/shared/page-head';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import TaskList from '@/components/shared/task-list';
import axiosInstance from '../../lib/axios';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  TaskSlice,
  useFetchImportantTasksQuery
} from '@/redux/features/taskSlice';
import { CardContent } from '@/components/ui/card';
import Loader from '@/components/shared/loader';

export default function ImportantPage() {
  const { user } = useSelector((state: any) => state.auth);
  const [tasks, setTasks] = useState([]);
  const { toast } = useToast();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const { data, refetch, isLoading } = useFetchImportantTasksQuery({
    userId: user?._id,
    sortOrder: 'desc',
    page: 1,
    limit: 5000
  });

  const getImportantTaskFn = TaskSlice.usePrefetch('fetchImportantTasks');
  useEffect(() => {
    getImportantTaskFn({
      userId: user?._id,
      sortOrder: 'desc',
      page: 1,
      limit: 15
    });
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (data?.data?.result) {
      setTasks(data.data.result);
    }
  }, [data]);

  const handleMarkAsImportant = async (taskId) => {
    const taskToToggle = tasks.find((task) => task._id === taskId);
    if (!taskToToggle) return;

    // Save a copy of the current tasks for rollback in case of error
    const previousTasks = [...tasks];

    // Optimistically update the UI by removing the task from the list
    setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));

    try {
      // Send the update request to the server
      const response = await axiosInstance.patch(`/task/${taskId}`, {
        important: !taskToToggle.important
      });

      if (response.data.success) {
        // Optionally, update RTK Query cache (if using RTK Query)
        TaskSlice.util.updateQueryData(
          'fetchImportantTasks',
          { userId: user._id, sortOrder, page, limit: 15 },
          (draft) => {
            const taskIndex = draft?.data?.result?.findIndex(
              (t) => t._id === taskId
            );
            if (taskIndex !== -1) {
              draft.data.result.splice(taskIndex, 1); // Remove the task from cache
            }
          }
        );
        toast({
          title: 'Task Updated',
          description: 'Task has been removed from the important list.'
        });
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      // Revert changes on error
      setTasks(previousTasks); // Rollback UI to the previous state
      toast({ variant: 'destructive', title: 'Something Went Wrong!' });
    }
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
          'fetchImportantTasks',
          { userId: user._id, sortOrder, page, limit: 15 },
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
    <div className="p-4 md:p-8">
      <PageHead title="Task Page" />
      <div className="pb-4">
        <Breadcrumbs
          items={[
            { title: 'Dashboard', link: '/dashboard' },
            { title: 'Important Tasks', link: `/important` }
          ]}
        />
      </div>
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
    </div>
  );
}
