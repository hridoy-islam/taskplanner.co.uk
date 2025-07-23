


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { fetchAllTasks, updateTask } from '@/redux/features/allTaskSlice';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store';

import moment from 'moment';

import { usePollTasks } from '@/hooks/usePolling';
import TaskList from '@/components/shared/task-list';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getNextScheduledDate } from '@/utils/taskUtils';

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

export default function UpcomingTasksPage() {
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
          const isPending = task.status === 'pending';
        
          if (!task.dueDate) return false;

          const due = moment(task.dueDate).startOf('day');
          const tomorrow = moment().add(1, 'day').startOf('day');
          const nextWeek = moment().add(7, 'days').endOf('day');
        
          // Check if the task is due within the next 7 days
          const isInNext7Days = due.isSameOrAfter(tomorrow) && due.isSameOrBefore(nextWeek);
          
          return taskNameMatches && isPending && isInNext7Days;
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
    setOptimisticTasks: setFilteredTasks
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // In parent component
  const handleMarkAsImportant = async (taskId: string) => {
    const originalTasks = [...tasks];
    const currentTask = filteredTasks.find((task) => task?._id === taskId);
    if (!currentTask || !user?._id) return;
  
    const alreadyMarked = currentTask.importantBy?.includes(user._id);
  
    // Toggle the user's ID in the array
    const updatedImportantBy = alreadyMarked
      ? currentTask.importantBy?.filter((id) => id !== user._id) // remove
      : [...(currentTask.importantBy || []), user._id]; // add
  
    // Optimistic update
    setFilteredTasks((prev) =>
      prev.map((task) =>
        task._id === taskId
          ? { ...task, importantBy: updatedImportantBy }
          : task
      )
    );
  
    try {
      await dispatch(
        updateTask({
          taskId,
          taskData: {
            importantBy: updatedImportantBy
          },
        })
      ).unwrap();
    } catch (error) {
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
 
     // Store original tasks for rollback in case of error
     const originalTasks = [...tasks];
 
     // Create updated history with current completion date
     const updatedHistory = [
       ...(taskToToggle.history || []),
       {
         date: taskToToggle.dueDate, // Use current date for completion
         completed: true
       }
     ];
 
     // For one-time tasks, mark as completed
     const shouldCompleteTask =
       taskToToggle.frequency === 'once' ||
       (taskToToggle.frequency === 'custom' &&
         taskToToggle.customSchedule?.every((date) =>
           updatedHistory.some((h) => moment(h.date).isSame(date, 'day'))
         ));
 
     // Calculate next date using CURRENT frequency
     const nextDate = getNextScheduledDate({
       ...taskToToggle,
       history: updatedHistory,
       frequency: taskToToggle.frequency
     });
 
     // Prepare update data
     const updateData = {
       history: updatedHistory,
       ...(nextDate && { dueDate: nextDate.toISOString() }),
       ...(shouldCompleteTask && { status: 'completed' })
     };
 
     try {
       // Optimistic update
       setFilteredTasks((prevTasks) =>
         prevTasks.map((task) =>
           task._id === taskId
             ? {
                 ...task,
                 ...updateData,
                 // Ensure we maintain other properties that might not be in updateData
                 status: shouldCompleteTask ? 'completed' : task.status
               }
             : task
         )
       );
 
       // Dispatch the actual update
       await dispatch(
         updateTask({
           taskId,
           taskData: updateData
         })
       ).unwrap();
 
       toast({ title: 'Task status updated' });
     } catch (error: any) {
       // Revert on error
       setFilteredTasks(originalTasks);
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