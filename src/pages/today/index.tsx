
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import {  updateTask } from '@/redux/features/allTaskSlice';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store';

import moment from 'moment';

import { usePollTasks } from '@/hooks/usePolling';
import TaskList from '@/components/shared/task-list';
import { ScrollArea } from '@/components/ui/scroll-area';
import PageHead from '@/components/shared/page-head';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

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
  author: string | PopulatedUserReference;
  assigned?: string | PopulatedUserReference;
  updatedAt: string;
};

export default function TodayPage() {
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const { tasks } = useSelector((state: RootState) => state.alltasks);
  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    const filterTasks = () => {
      const filtered = tasks
        .filter((task) => {
          if (!task) return false;

          // Match task name with the search term (case-insensitive)
          const matchesSearch = (task.taskName?.toLowerCase() || '').includes(
            searchTerm.toLowerCase()
          );
          const isPending = task.status === 'pending';
          const isDueToday = task.dueDate
            ? moment(task.dueDate).isSame(moment(), 'day')
            : false;

          return matchesSearch && isPending && isDueToday;
        })
        .sort((a, b) => {
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        });

      setFilteredTasks(filtered);
    };

    filterTasks();
  }, [searchTerm, tasks, user._id]);

  // Enable polling to keep tasks updated
  usePollTasks({
    userId: user._id,
    tasks,
    filteredTasks
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // In parent component
  const handleMarkAsImportant = async (taskId: string) => {
    const originalTasks = [...tasks];

    // Find the current task
    const currentTask = tasks.find((task) => task._id === taskId);
    if (!currentTask) return;

    // Optimistic update while preserving all nested objects
    setFilteredTasks((prev) =>
      prev.map((task) => {
        if (task._id === taskId) {
          return {
            ...task,
            important: !task.important
          };
        }
        return task;
      })
    );

    try {
      await dispatch(
        updateTask({
          taskId,
          taskData: { important: !currentTask.important }
        })
      ).unwrap();
    } catch (error) {
      // Revert on error
      setFilteredTasks(originalTasks);
      toast({
        variant: 'destructive',
        title: 'Failed to update task importance'
      });
    }
  };

  const handleToggleTaskCompletion = async (taskId: string) => {
    const taskToToggle = tasks.find((task) => task._id === taskId);
    if (!taskToToggle) return;

    const updatedStatus =
      taskToToggle.status === 'completed' ? 'pending' : 'completed';

    try {
      await dispatch(
        updateTask({
          taskId,
          taskData: { status: updatedStatus }
        })
      ).unwrap();

      toast({ title: 'Task status updated' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to update task',
        description: error?.message || 'An error occurred'
      });
    }
  };

  return (
    <div className="p-4 ">
          <PageHead title="Task Page" />
          <div className="px-4">
            <Breadcrumbs
              items={[
                { title: 'Dashboard', link: '/dashboard' },
                { title: 'Today Task', link: `#` }
              ]}
            />
          </div>
          <div className="px-6">
            <Input
              className=" my-4 flex h-[40px] w-full items-center px-6 py-4"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
      <ScrollArea className="h-[calc(88vh-7rem)] flex-1 overflow-y-auto px-6 scrollbar-hide">
        <TaskList
          tasks={filteredTasks}
          onMarkAsImportant={handleMarkAsImportant}
          onToggleTaskCompletion={handleToggleTaskCompletion}
        />
      </ScrollArea>
    </div>
  );
}
