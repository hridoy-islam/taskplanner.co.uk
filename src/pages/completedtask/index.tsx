



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

export default function CompletedTasks() {
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

          const taskNameMatches = (task.taskName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
                  const isCompleted = task.status === 'completed';
            
                  return taskNameMatches && isCompleted;
        })
        .sort((a, b) => {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
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
  const currentTask = tasks.find(task => task._id === taskId);
  if (!currentTask) return;

  // Optimistic update while preserving all nested objects
  setFilteredTasks(prev =>
    prev.map(task => {
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
        taskData: { important: !currentTask.important },
      })
    ).unwrap();
  } catch (error) {
    // Revert on error
    setFilteredTasks(originalTasks);
    toast({
      variant: 'destructive',
      title: 'Failed to update task importance',
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
    <Card className="flex h-[calc(88vh-7rem)] flex-col overflow-hidden px-2">
      <Input
        className="mx-6 my-4 flex h-[40px] items-center px-4 py-4"
        placeholder="Search due tasks..."
        value={searchTerm}
        onChange={handleSearch}
      />
      <ScrollArea className=" flex-1 overflow-y-auto px-6 scrollbar-hide">
      <TaskList
      tasks={filteredTasks}
      onMarkAsImportant={handleMarkAsImportant}
      onToggleTaskCompletion={handleToggleTaskCompletion}
      />
      </ScrollArea>
    </Card>
  );
}