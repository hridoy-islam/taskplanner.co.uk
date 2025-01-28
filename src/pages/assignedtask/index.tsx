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
import { useFetchAssignedTasksQuery } from '@/redux/features/taskSlice';
import { TaskSlice } from '@/redux/features/taskSlice';
import notask from '@/assets/imges/home/notask.png';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import Loader from '@/components/shared/loader';
export default function AssignedTaskPage() {
  const { user } = useSelector((state: any) => state.auth);
  const { toast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'unread' | 'recent'>('unread');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const [page, setPage] = useState(1);

  const { isLoading, data, isFetching, refetch } = useFetchAssignedTasksQuery({
    userId: user._id,
    searchTerm,
    sortOrder,
    page,
    limit: 15
  });

  useEffect(() => {
    if (data?.data?.result) {
      setTasks(data.data.result);
    }
  }, [data]);

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

  // const handleSortToggle = () => {
  //   const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
  //   setSortOrder(newSortOrder);
  //   fetchAssignedTasks(currentPage, entriesPerPage, searchTerm, newSortOrder); // Fetch with the new sort order
  // };

  // const handleMarkAsImportant = async (taskId) => {
  //   const task: any = tasks.find((t: any) => t._id === taskId);

  //   const response = await axiosInstance.patch(
  //     `/task/${taskId}`,
  //     { important: !task.important } // Toggle important status
  //   );

  //   if (response.data.success) {
  //     fetchAssignedTasks(currentPage, entriesPerPage, searchTerm, sortOrder);
  //     toast({
  //       title: 'Task Updated',
  //       description: 'Thank You'
  //     });
  //   } else {
  //     toast({
  //       variant: 'destructive',
  //       title: 'Something Went Wrong!'
  //     });
  //   }
  // };

  // const handleToggleTaskCompletion = async (taskId) => {
  //   const task: any = tasks.find((t: any) => t._id === taskId);

  //   const response = await axiosInstance.patch(`/task/${taskId}`, {
  //     status: task?.status === 'completed' ? 'pending' : 'completed'
  //   });

  //   if (response.data.success) {
  //     fetchAssignedTasks(currentPage, entriesPerPage, searchTerm, sortOrder);
  //     toast({
  //       title: 'Task Updated',
  //       description: 'Thank You'
  //     });
  //   } else {
  //     toast({
  //       variant: 'destructive',
  //       title: 'Something Went Wrong!'
  //     });
  //   }
  // };

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
          'fetchAssignedTasks',
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
          'fetchAssignedTasks',
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

  return (
    <div className="p-4 md:p-8">
      {/* Page Title */}
      <PageHead title="Due Task" />

      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { title: 'Dashboard', link: '/dashboard' },
          { title: 'Assigned Task', link: '/assignedtask' }
        ]}
      />

      {/* Search and Pagination */}
      <div className="my-4 flex flex-wrap items-center justify-between gap-4">
        <Input
          placeholder="Search notes..."
          value={searchTerm}
          onChange={handleSearch}
          className="flex-1"
        />
        <DynamicPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Content Section */}
      {isLoading ? (
        // Loader for the Loading State
        <Loader />
      ) : (
        <div className="p-4">
          {tasks.length === 0 ? (
            // No Task Available
            <div className="mt-36 flex flex-col items-center justify-center">
              <img src={notask} alt="No Task" className="max-w-xs" />
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              onMarkAsImportant={handleMarkAsImportant}
              onToggleTaskCompletion={handleToggleTaskCompletion}
              fetchTasks={refetch}
            />
          )}
        </div>
      )}
    </div>
  );
}
