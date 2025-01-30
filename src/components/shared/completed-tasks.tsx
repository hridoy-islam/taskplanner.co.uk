import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import axiosInstance from '../../lib/axios';
import { useEffect, useState } from 'react';
import TaskList from './task-list';
import { useToast } from '../ui/use-toast';
import { Input } from '../ui/input';
import {
  TaskSlice,
  useFetchCompletedTasksQuery
} from '@/redux/features/taskSlice';
import Loader from './loader';
import notask from '@/assets/imges/home/notask.png';

export default function CompletedTasks({ user }) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, refetch, isLoading, isFetching, isSuccess } =
    useFetchCompletedTasksQuery(
      {
        userId: user._id,
        searchTerm,
        sortOrder,
        page,
        limit: 15
      },
      { skip: !user._id }
    );

  const getCompletedTaskFn = TaskSlice.usePrefetch('fetchCompletedTasks');
  useEffect(() => {
    getCompletedTaskFn({
      userId: user._id,
      searchTerm: '',
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
    // Find the task in the state
    const taskToToggle = tasks.find((task) => task._id === taskId);
    if (!taskToToggle) return;

    // Optimistically update UI - Toggle only the clicked task
    const previousTasks = [...tasks];
    const updatedTasks = tasks.map((task) =>
      task._id === taskId
        ? { ...task, status: 'pending' } // Change only this task to pending
        : task
    );

    setTasks(updatedTasks.filter((task) => task.status == 'completed'));

    try {
      // Update server
      const response = await axiosInstance.patch(`/task/${taskId}`, {
        status: 'pending' // Since we know all tasks are "completed", toggle to "pending"
      });

      if (response.data.success) {
        // Update RTK Query cache
        TaskSlice.util.updateQueryData(
          'fetchCompletedTasks',
          { userId: user._id, searchTerm, sortOrder, page, limit: 15 },
          (draft) => {
            const task = draft?.data?.result?.find((t) => t._id === taskId);
            if (task) {
              task.status = 'pending'; // Change only this task
            }
          }
        );

        toast({
          title: 'Task Updated',
          description: 'The task is now pending.'
        });
      } else {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      // Revert optimistic update on error
      setTasks(previousTasks);
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
          <Link to={'completedtask'}>See All</Link>
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
