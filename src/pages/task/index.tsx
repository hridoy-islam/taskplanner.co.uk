import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import PageHead from '@/components/shared/page-head';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../lib/axios';
import { useDispatch, useSelector } from 'react-redux';
import TaskList from '@/components/shared/task-list';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CornerDownLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  TaskSlice,
  useCreateTaskMutation,
  useFetchTasksForBothUsersQuery,
  useUpdateTaskMutation
} from '@/redux/features/taskSlice';
import Loader from '@/components/shared/loader';

import { Textarea } from '@/components/ui/textarea';
import { fetchUsers } from '@/redux/features/userSlice';

export default function TaskPage() {
  const { id } = useParams();
  const { user } = useSelector((state: any) => state.auth);
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const dispatch = useDispatch();

  const [userDetail, setUserDetail] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const [entriesPerPage, setEntriesPerPage] = useState(5000);
  const [searchTerm, setSearchTerm] = useState('');
  const { register, handleSubmit, reset } = useForm();

  const fetchUserDetails = async () => {
    const response = await axiosInstance.get(`/users/${id}`);
    setUserDetail(response.data.data);
  };

  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  // const fetchTasks = useCallback(
  //   async (page, entriesPerPage, searchTerm = '', sortOrder = 'desc') => {
  //     try {
  //       const sortQuery = sortOrder === 'asc' ? 'dueDate' : '-dueDate';
  //       const res = await axiosInstance.get(
  //         `/task/getbothuser/${user?._id}/${id}?page=${page}&limit=${entriesPerPage}&searchTerm=${searchTerm}&sort=${sortQuery}&status=pending`
  //       );
  //       setTasks(res.data.data.result);
  //       setTotalPages(res.data.data.meta.totalPage);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   },
  //   [id]
  // );

  const { data, isLoading, refetch } = useFetchTasksForBothUsersQuery(
    {
      authorId: user?._id,
      assignedId: id,
      page: page,
      sortOrder: sortOrder,
      limit: entriesPerPage
    },
    {
      pollingInterval: 5000,
      refetchOnFocus: true,
      refetchOnReconnect: true
    }
  );

  const getTasksForBothUsersFn = TaskSlice.usePrefetch(
    'fetchTasksForBothUsers'
  );
  useEffect(() => {
    getTasksForBothUsersFn({
      authorId: user?._id,
      assignedId: id,
      sortOrder: 'desc',
      page: currentPage,
      limit: entriesPerPage
    });
  }, []);

  useEffect(() => {
    if (data?.data?.result) {
      setTasks(data.data.result);
      fetchUserDetails();
    }
  }, [data]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleSearch = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    if (data?.data?.result) {
      const filteredTasks = data.data.result.filter(
        (task) =>
          task.taskName.toLowerCase().includes(searchTerm) ||
          (task.description &&
            task.description.toLowerCase().includes(searchTerm))
      );

      setTasks(filteredTasks);
    }
  };

  // const handleMarkAsImportant = async (taskId) => {
  //   const taskToToggle = tasks.find((task) => task._id === taskId);
  //   if (!taskToToggle) return;

  //   // Optimistically update UI
  //   const previousTasks = [...tasks];
  //   setTasks((prevTasks) =>
  //     prevTasks.map((task) =>
  //       task._id === taskId ? { ...task, important: !task.important } : task
  //     )
  //   );

  //   try {
  //     // Update server
  //     const response = await axiosInstance.patch(`/task/${taskId}`, {
  //       important: !taskToToggle.important
  //     });

  //     if (response.data.success) {
  //       // Update RTK Query cache
  //       TaskSlice.util.updateQueryData(
  //         'fetchTasksForBothUsers',
  //         { userId: user._id, searchTerm, sortOrder, page, limit: 15 },
  //         (draft) => {
  //           const task = draft?.data?.result?.find((t) => t._id === taskId);
  //           if (task) {
  //             task.important = !task.important;
  //           }
  //         }
  //       );
  //       toast({ title: 'Task Updated', description: 'Thank You' });
  //     } else {
  //       throw new Error('Failed to update task');
  //     }
  //   } catch (error) {
  //     // Revert optimistic update on error
  //     setTasks(previousTasks);
  //     toast({ variant: 'destructive', title: 'Something Went Wrong!' });
  //   }
  // };

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
          important: !taskToToggle.important,
          authorId: user?._id,
          assignedId: id
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

  // const onSubmit = async (data) => {
  //   if (loading) return;
  //   setLoading(true);
  //   data.author = user?._id;
  //   data.assigned = id;

  //   try {
  //     // await axiosInstance.post(`/task`, data);
  //     await createTask(data)
  //     reset();
  //     refetch();
  //     toast({
  //       title: 'Task Added',
  //       description: 'Thank You'
  //     });

  //   } catch (error) {
  //     toast({
  //       variant: 'destructive',
  //       title: 'An error occurred while adding the task.'
  //     });
  //   } finally {
  //     setLoading(false); // Reset loading state
  //   }
  // };

  const onSubmit = async (data) => {
    if (loading) return;
    setLoading(true);

    // Ensure user and assigned ID are available before proceeding
    if (!user?._id || !id) {
      toast({
        variant: 'destructive',
        title: 'User information is missing!'
      });
      setLoading(false);
      return;
    }

    try {
      // Make the API call to create the task
      const response = await createTask({
        taskName: data.taskName,
        description: data.description || '',
        author: user?._id,
        assigned: id
      }).unwrap();

      // Update state only if API call succeeds
      setTasks((prevTasks) => [response.data, ...prevTasks]);

      // Reset the form
      reset();

      // Show success toast
      toast({
        title: 'Task Added',

      });
    } catch (error) {
      // Show error toast
      // console.log(error);
      // toast({
      //   variant: 'destructive',
      //   title: 'An error occurred while adding the task.'
      // });

      reset()
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className=" flex h-full flex-col  justify-between  p-4 md:p-6">
      <div>
        <PageHead title="Task Page" />
        <Breadcrumbs
          items={[
            { title: 'Dashboard', link: '/dashboard' },
            { title: userDetail?.name, link: `/task/${id}` }
          ]}
        />
        <div className="my-2 flex items-center justify-between gap-2">
          <Input
            placeholder="Search task..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      {isLoading ? (
        <div className="-mt-48">
          <Loader />
        </div>
      ) : (
        <div className=" ">
          <TaskList
            tasks={tasks}
            onMarkAsImportant={handleMarkAsImportant}
            onToggleTaskCompletion={handleToggleTaskCompletion}
          />
        </div>
      )}

      <div className="relative mt-2 rounded-xl bg-white p-3 shadow ">
        <form
          id="taskForm"
          onSubmit={handleSubmit(onSubmit)}
          className="flex items-center justify-center space-x-2"
        >
          <Textarea
            {...register('taskName', { required: true })}
            placeholder="Add a task"
            className="h-[40px] flex-1 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const form = e.currentTarget.closest('form');
                form?.requestSubmit();
              }
            }}
          />
          <Button type="submit" variant={'outline'}>
            <CornerDownLeft className="mr-2 h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
