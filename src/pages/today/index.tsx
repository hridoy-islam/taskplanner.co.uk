import PageHead from '@/components/shared/page-head';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import TaskList from '@/components/shared/task-list';
import axiosInstance from '../../lib/axios';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { TaskSlice, useFetchTodayTasksQuery, useUpdateTaskMutation } from '@/redux/features/taskSlice';

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
  const [updateTask] = useUpdateTaskMutation();

  const { data, refetch, isLoading,error} =
    useFetchTodayTasksQuery(
      {
        userId: user?._id,

        sortOrder,
        page,
        limit: 5000
      },
      { pollingInterval: 5000, refetchOnFocus: true, refetchOnReconnect: true }
    );

    const getTodayTaskFn = TaskSlice.usePrefetch('fetchTodayTasks');
    useEffect(() => {
      getTodayTaskFn({
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
    if (data?.data) {
      setTasks(data.data); // Extract the `result` array
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
      toast({ title: 'Task Updated' });
    } catch (error) {
      // Revert optimistic update on error
      setTasks(previousTasks);
      toast({ variant: 'destructive', title: 'Something Went Wrong!' });
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
