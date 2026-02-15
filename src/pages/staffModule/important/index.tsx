import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';

import { ScrollArea } from '@/components/ui/scroll-area';
import PageHead from '@/components/shared/page-head';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import TaskList from './components/task-list';
import { BlinkingDots } from '@/components/shared/blinking-dots';
// Tip: If you have a Spinner or Skeleton component in your UI library, import it here!
// import { Skeleton } from '@/components/ui/skeleton'; 

type PopulatedUserReference = {
  _id: string;
  name: string;
};

type Task = {
  _id: string;
  taskName: string;
  status: string;
  dueDate?: string;
  important: boolean;
  importantBy?: string[];
  completedBy?: any[];
  author: string | PopulatedUserReference;
  assigned?: string | PopulatedUserReference;
  updatedAt: string;
};

export default function StaffImportantPage() {
  const { toast } = useToast();
  const { uid:id } = useParams();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  // 1. Add loading state initialized to true
  const [isLoading, setIsLoading] = useState(true);

  // 2. Fetching Logic
  const fetchTasks = useCallback(async () => {
    if (!id) return;
    try {
      const response = await axiosInstance.get(`/task/important/${id}`);
      const fetchedTasks = response.data?.data?.result || response.data?.result || response.data || [];
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Failed to fetch important tasks:', error);
    } finally {
      // 3. Set to false once the initial fetch finishes (success or fail)
      // Since we don't set it to true at the top of this function, 
      // the 1-minute polling won't trigger the loading screen again.
      setIsLoading(false);
    }
  }, [id]);

  // Initial Fetch & 1-Minute Polling
  useEffect(() => {
    fetchTasks(); // Initial load

    const intervalId = setInterval(() => {
      fetchTasks();
    }, 60000); // 1 minute

    return () => clearInterval(intervalId);
  }, [fetchTasks]);

  // Derived Filtered Data (using useMemo for performance)
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (!task) return false;

        const matchesSearch = (task.taskName?.toLowerCase() || '').includes(
          searchTerm.toLowerCase()
        );

        // Keep local checks to instantly hide tasks upon optimistic updates
        const isPending = task.status === 'pending';
        const isMarkedByUser = Array.isArray(task.importantBy) && task.importantBy.includes(id || '');

        return matchesSearch && isPending && isMarkedByUser;
      })
      .sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [tasks, searchTerm, id]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Helper function for optimistic updates
  const updateTaskInLists = (taskId: string, updater: (t: Task) => Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t._id === taskId ? updater(t) : t))
    );
  };

  // Action Handlers
  const handleMarkAsImportant = async (taskId: string) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task || !id) return;

    const isImportant = task.importantBy?.includes(id);
    const newImportantBy = isImportant
      ? task.importantBy?.filter((userId) => userId !== id)
      : [...(task.importantBy || []), id];

    // Optimistic Update
    updateTaskInLists(taskId, (t) => ({
      ...t,
      importantBy: newImportantBy,
      updatedAt: new Date().toISOString(),
    }));

    try {
      await axiosInstance.patch(`/task/${taskId}`, { importantBy: newImportantBy });
    } catch (error) {
      updateTaskInLists(taskId, () => task);
      toast({ variant: 'destructive', title: 'Failed to update importance' });
    }
  };

  const handleToggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;
    
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';

    // Optimistic Update
    updateTaskInLists(taskId, (t) => ({
      ...t,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    }));

    try {
      await axiosInstance.patch(`/task/${taskId}`, { status: newStatus });
      toast({ title: 'Task status updated' });
    } catch (error) {
      updateTaskInLists(taskId, () => task); // Revert
      toast({ variant: 'destructive', title: 'Failed to update status' });
    }
  };

  const handleReassignTask = async (taskId: string) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    // Optimistically remove completions or reset status
    updateTaskInLists(taskId, (t) => ({
      ...t,
      status: 'pending',
      completedBy: [],
    }));

    try {
      await axiosInstance.patch(`/task/reassign/${taskId}`);
      toast({ title: 'Task reassigned successfully' });
    } catch (error) {
      updateTaskInLists(taskId, () => task); // Revert
      console.error('Failed to reassign', error);
      toast({ variant: 'destructive', title: 'Failed to reassign task' });
    }
  };

  return (
    <div className="p-4 space-y-3">
      <h1 className='font-semibold text-2xl'>Important Task</h1>
      
      <div className=" ">
        {/* 4. Conditional Rendering based on isLoading state */}
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
          <BlinkingDots size='large' color='bg-taskplanner' />
          </div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onMarkAsImportant={handleMarkAsImportant}
            onToggleTaskCompletion={handleToggleTaskCompletion}
            reAssign={handleReassignTask} 
          />
        )}
      </div>
    </div>
  );
}