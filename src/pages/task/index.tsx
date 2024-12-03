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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export default function TaskPage() {
  const { id } = useParams();
  const { user } = useSelector((state: any) => state.auth);
  const { toast } = useToast();
  const [userDetail, setUserDetail] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'unread' | 'recent'>('unread');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset } = useForm();

  const fetchUserDetails = async () => {
    const response = await axiosInstance.get(`/users/${id}`);
    setUserDetail(response.data.data);
  };

  const fetchTasks = useCallback(
    async (page, entriesPerPage, searchTerm = '', sortOrder = 'desc') => {
      try {
        const sortQuery = sortOrder === 'asc' ? 'dueDate' : '-dueDate';
        const res = await axiosInstance.get(
          `/task/getbothuser/${user?._id}/${id}?page=${page}&limit=${entriesPerPage}&searchTerm=${searchTerm}&sort=${sortQuery}&status=pending`
        );
        setTasks(res.data.data.result);
        setTotalPages(res.data.data.meta.totalPage);
      } catch (err) {
        console.log(err);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchTasks(currentPage, entriesPerPage, searchTerm, sortOrder);
    fetchUserDetails();

    const intervalId = setInterval(() => {
      fetchTasks(currentPage, entriesPerPage, searchTerm, sortOrder);
    }, 30000); // 30 seconds

    // const timeoutId = setTimeout(() => {
    //   clearInterval(intervalId);
    // }, 3600000); // 1 hour

    // Cleanup on component unmount
    return () => {
      // clearInterval(intervalId);
      clearTimeout(intervalId);
    };
  }, [currentPage, entriesPerPage, searchTerm, sortOrder, id]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // const handleEntriesPerPageChange = (event) => {
  //   setEntriesPerPage(Number(event.target.value));
  //   setCurrentPage(1); // Reset to first page when changing entries per page
  // };

  // const handleSortToggle = () => {
  //   const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
  //   setSortOrder(newSortOrder);
  //   fetchTasks(currentPage, entriesPerPage, searchTerm, newSortOrder); // Fetch with the new sort order
  // };

  const filteredGroups = tasks
    .filter((task) =>
      task?.taskName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.taskName.localeCompare(b.taskName)
          : b.taskName.localeCompare(a.taskName);
      } else if (sortBy === 'unread') {
        return sortOrder === 'asc'
          ? (b.unreadMessageCount || 0) - (a.unreadMessageCount || 0)
          : (a.unreadMessageCount || 0) - (b.unreadMessageCount || 0);
      } else if (sortBy === 'recent') {
        return sortOrder === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

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
      <div className="my-2 flex items-center justify-between gap-2">
        <Input
          placeholder="Search task..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <Button>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex min-w-fit flex-row">
              {sortBy || 'sort'} {sortOrder === 'asc' ? '↑' : '↓'}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSortBy('name');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                Name
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSortBy('unread');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                New Message
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSortBy('recent');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                Date Created
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Button>

        <div>
          <DynamicPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      <TaskList
        tasks={filteredGroups}
        onMarkAsImportant={handleMarkAsImportant}
        onToggleTaskCompletion={handleToggleTaskCompletion}
        fetchTasks={fetchTasks}
      />

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
