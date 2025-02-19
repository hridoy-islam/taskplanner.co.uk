import PageHead from '@/components/shared/page-head';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import TaskList from '@/components/shared/task-list';
import axiosInstance from '../../lib/axios';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { TaskSlice, useFetchTodayTasksQuery } from '@/redux/features/taskSlice';

import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import Loader from '@/components/shared/loader';

export default function TodayPage() {
  const { user } = useSelector((state: any) => state.auth);
  const [tasks, setTasks] = useState([]);
  const { toast } = useToast();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, refetch, isLoading, isFetching, isSuccess } =
    useFetchTodayTasksQuery(
      {
        userId: user._id,
        searchTerm,
        sortOrder,
        page,
        limit: 15
      },
      { skip: !user._id }
    );

  console.log(tasks);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (data?.data?.result) {
      setTasks(data.data.result);
    }
  }, [data]);

  const handleRefetch = () => {
    if (!isFetching && isSuccess) {
      refetch(); // Only refetch if the query is not already in progress and has been successful
    } else {
      console.log('Query is already in progress or has not been started yet.');
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
          'fetchCompletedTasks',
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
          'fetchCompletedTasks',
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
    <div className="p-4 md:p-8 ">
      <PageHead title="Task Page" />
      <div className="pb-4">
        <Breadcrumbs
          items={[
            { title: 'Dashboard', link: '/dashboard' },
            { title: 'Todays Task', link: `/task` }
          ]}
        />
      </div>
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
