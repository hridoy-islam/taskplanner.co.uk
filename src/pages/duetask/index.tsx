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

export default function DueTaskPage() {
  const { user } = useSelector((state: any) => state.auth);
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDueTasks = useCallback(
    async (page, entriesPerPage, searchTerm = '', sortOrder = 'desc') => {
      try {
        const sortQuery = sortOrder === 'asc' ? 'dueDate' : '-dueDate';
        const res = await axiosInstance.get(
          `/task/duetasks/${user._id}?page=${page}&limit=${entriesPerPage}&searchTerm=${searchTerm}&sort=${sortQuery}`
        );
        setTasks(res.data.data.result);
        setTotalPages(res.data.data.meta.totalPage);
      } catch (err) {
      } finally {
      }
    },
    []
  );

  useEffect(() => {
    fetchDueTasks(currentPage, entriesPerPage, searchTerm, sortOrder);
  }, [currentPage, entriesPerPage, searchTerm, sortOrder, user]);

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
    fetchDueTasks(currentPage, entriesPerPage, searchTerm, newSortOrder); // Fetch with the new sort order
  };

  const handleMarkAsImportant = async (taskId) => {
    const task: any = tasks.find((t: any) => t._id === taskId);

    const response = await axiosInstance.patch(
      `/task/${taskId}`,
      { important: !task.important } // Toggle important status
    );

    if (response.data.success) {
      fetchDueTasks(currentPage, entriesPerPage, searchTerm, sortOrder);
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
      fetchDueTasks(currentPage, entriesPerPage, searchTerm, sortOrder);
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
          { title: 'Due Task', link: '/duetask' }
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
        fetchTasks={fetchDueTasks}
      />
      <div className="z-999 -mt-6">
        <DynamicPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
