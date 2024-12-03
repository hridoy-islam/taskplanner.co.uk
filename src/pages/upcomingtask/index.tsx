import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import PageHead from '@/components/shared/page-head.jsx';
import { useSelector } from 'react-redux';
import axiosInstance from '../../lib/axios';
import { useCallback, useEffect, useState } from 'react';
import TaskList from '@/components/shared/task-list';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DynamicPagination from '@/components/shared/DynamicPagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
export default function UpcomingTaskPage() {
  const { user } = useSelector((state: any) => state.auth);
  const { toast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'unread' | 'recent'>('unread');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUpcomingTasks = useCallback(
    async (page, entriesPerPage, searchTerm = '', sortOrder = 'desc') => {
      try {
        const sortQuery = sortOrder === 'asc' ? 'dueDate' : '-dueDate';
        const res = await axiosInstance.get(
          `/task/upcommingtasks/${user._id}?page=${page}&limit=${entriesPerPage}&searchTerm=${searchTerm}&sort=${sortQuery}`
        );
        setTasks(res.data.data.result);
        setTotalPages(res.data.data.meta.totalPage);
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  useEffect(() => {
    fetchUpcomingTasks(currentPage, entriesPerPage, searchTerm, sortOrder);
    const intervalId = setInterval(() => {
      fetchUpcomingTasks(currentPage, entriesPerPage, searchTerm, sortOrder);
    }, 30000); // 30 seconds

    // const timeoutId = setTimeout(() => {
    //   clearInterval(intervalId);
    // }, 3600000); // 1 hour

    // Cleanup on component unmount
    return () => {
      // clearInterval(intervalId);
      clearTimeout(intervalId);
    };
  }, [currentPage, entriesPerPage, searchTerm, sortOrder, user]);
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
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // const handleEntriesPerPageChange = (event) => {
  //   setEntriesPerPage(Number(event.target.value));
  //   setCurrentPage(1); // Reset to first page when changing entries per page
  // };

  const handleSortToggle = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    fetchUpcomingTasks(currentPage, entriesPerPage, searchTerm, newSortOrder); // Fetch with the new sort order
  };

  const handleMarkAsImportant = async (taskId) => {
    const task: any = tasks.find((t: any) => t._id === taskId);

    const response = await axiosInstance.patch(
      `/task/${taskId}`,
      { important: !task.important } // Toggle important status
    );

    if (response.data.success) {
      fetchUpcomingTasks(currentPage, entriesPerPage, searchTerm, sortOrder);
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
      fetchUpcomingTasks(currentPage, entriesPerPage, searchTerm, sortOrder);
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

  return (
    <div className="p-4 md:p-8">
      <PageHead title="Due Task" />
      <Breadcrumbs
        items={[
          { title: 'Dashboard', link: '/dashboard' },
          { title: 'Upcoming Task', link: '/upcomingtask' }
        ]}
      />
      <div className="my-2 flex justify-between gap-2">
        <Input
          placeholder="Search notes..."
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
        tasks={tasks}
        onMarkAsImportant={handleMarkAsImportant}
        onToggleTaskCompletion={handleToggleTaskCompletion}
        fetchTasks={fetchUpcomingTasks}
      />
    </div>
  );
}
