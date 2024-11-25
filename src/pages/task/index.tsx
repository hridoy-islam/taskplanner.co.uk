import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import PageHead from '@/components/shared/page-head';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../lib/axios';
import { useSelector } from 'react-redux';
import TaskList from '@/components/shared/task-list';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CornerDownLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import DynamicPagination from '@/components/shared/DynamicPagination';

export default function TaskPage() {
  const { id } = useParams();
  const { user } = useSelector((state: any) => state.auth);
  const { toast } = useToast();
  const [userDetail, setUserDetail] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset } = useForm();

  // const fetchTasks = async () => {
  //   const response = await axiosInstance.get(
  //     `/task/getbothuser/${user?._id}/${id}`
  //   );
  //   setTasks(response.data.data);
  // };

  const fetchUserDetails = async () => {
    const response = await axiosInstance.get(`/users/${id}`);
    setUserDetail(response.data.data);
  };

  // useEffect(() => {
  //   fetchTasks();
  //   fetchUserDetails();
  // }, [id]);

  const fetchTasks = useCallback(
    async (page, entriesPerPage, searchTerm = '', sortOrder = 'desc') => {
      try {
        const sortQuery = sortOrder === 'asc' ? 'dueDate' : '-dueDate';
        const res = await axiosInstance.get(
          `/task/getbothuser/${user?._id}/${id}?page=${page}&limit=${entriesPerPage}&searchTerm=${searchTerm}&sort=${sortQuery}`
        );
        setTasks(res.data.data.result);
        console.log(res.data.data);
        setTotalPages(res.data.data.meta.totalPage);
      } catch (err) {
        console.log(err);
      }
    },
    []
  );

  useEffect(() => {
    fetchTasks(currentPage, entriesPerPage, searchTerm, sortOrder);
    fetchUserDetails();
  }, [currentPage, entriesPerPage, searchTerm, sortOrder, id]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleEntriesPerPageChange = (event) => {
    setEntriesPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when changing entries per page
  };

  const handleSortToggle = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    fetchTasks(currentPage, entriesPerPage, searchTerm, newSortOrder); // Fetch with the new sort order
  };

  const handleMarkAsImportant = async (taskId) => {
    const task: any = tasks.find((t: any) => t._id === taskId);

    const response = await axiosInstance.patch(
      `/task/${taskId}`,
      { important: !task.important } // Toggle important status
    );

    if (response.data.success) {
      fetchTasks(currentPage, entriesPerPage, searchTerm, sortOrder);
      toast({
        title: 'Task Updated',
        description: 'Thank You'
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Something Went Wrong!'
      });
    }
  };

  const handleToggleTaskCompletion = async (taskId) => {
    const task: any = tasks.find((t: any) => t._id === taskId);

    const response = await axiosInstance.patch(`/task/${taskId}`, {
      status: task?.status === 'completed' ? 'pending' : 'completed'
    });

    if (response.data.success) {
      fetchTasks(currentPage, entriesPerPage, searchTerm, sortOrder);
      toast({
        title: 'Task Updated',
        description: 'Thank You'
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Something Went Wrong!'
      });
    }
  };
  // New Task Form
  const onSubmit = async (data) => {
    if (loading) return;
    setLoading(true);
    data.author = user?._id;
    data.assigned = id;

    try {
      const response = await axiosInstance.post(`/task`, data);
      console.log(response);
      if (response.data.success) {
        reset();
        fetchTasks(currentPage, entriesPerPage, searchTerm, sortOrder);
        toast({
          title: 'Task Added',
          description: 'Thank You'
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Something Went Wrong!'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred while adding the task.'
      });
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="p-4 md:p-8">
      <PageHead title="Task Page" />
      <Breadcrumbs
        items={[
          { title: 'Dashboard', link: '/dashboard' },
          { title: userDetail?.name, link: `/task/${id}` }
        ]}
      />
      <div className="my-2 flex justify-between gap-2">
        <Input
          placeholder="Search notes..."
          value={searchTerm}
          onChange={handleSearch}
        />

        <Button variant={'outline'} onClick={handleSortToggle}>
          {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>

        <select
          value={entriesPerPage}
          onChange={handleEntriesPerPageChange}
          className="block w-[180px] rounded-md border border-gray-300 bg-white p-2 shadow-sm transition  duration-150 ease-in-out focus:border-black focus:outline-none focus:ring-black"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
      <TaskList
        tasks={tasks}
        onMarkAsImportant={handleMarkAsImportant}
        onToggleTaskCompletion={handleToggleTaskCompletion}
        fetchTasks={fetchTasks}
      />

      <div className="z-999 -mt-4 mb-2">
        <DynamicPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <footer className="bg-white p-4 shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-2">
          <Input
            {...register('taskName', { required: true })}
            type="text"
            placeholder="Add a task"
            className="flex-1"
          />
          <Button type="submit" variant={'outline'}>
            <CornerDownLeft className="mr-2 h-4 w-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
