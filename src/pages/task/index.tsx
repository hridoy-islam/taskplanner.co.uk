import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import PageHead from '@/components/shared/page-head';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../lib/axios';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  CornerDownLeft,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import {
  createNewTask,
  updateTask,
} from '@/redux/features/allTaskSlice';
import { AppDispatch, RootState } from '@/redux/store';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

import { usePollTasks } from '@/hooks/usePolling';
import TaskList from '@/components/shared/task-list';
import { getNextScheduledDate } from '@/utils/taskUtils';
import moment from 'moment';

type PopulatedUserReference = {
  _id: string;
  name: string;
};

type Task = {
  _id: string;
  taskName: string;
  description?: string;
  status: string;
  dueDate?: string;
  // important: boolean;
  author: string | PopulatedUserReference;
  assigned?: string | PopulatedUserReference;
  updatedAt: string;
  seen: boolean;
  tempId?: string; // Add this field to track optimistic updates
};

export default function TaskPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();

  const { tasks } = useSelector((state: RootState) => state.alltasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(false);
  const [userDetail, setUserDetail] = useState<any>();
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset } = useForm();
  const user = useSelector((state: RootState) => state.auth.user);

  const [optimisticTasks, setOptimisticTasks] = useState<Record<string, Task>>({});

  useEffect(() => {
    const currentOptimisticTasks =
      optimisticTasks && typeof optimisticTasks === 'object'
        ? optimisticTasks
        : {};
  
    const enrichedServerTasks = tasks.map((serverTask) => {
      const needsEnrichment =
        typeof serverTask.author === 'string' || !serverTask.author?.name ||
        typeof serverTask.assigned === 'string' || !serverTask.assigned?.name;
  
      if (!needsEnrichment) return serverTask;
  
      const matchingOptimisticTask = Object.values(currentOptimisticTasks).find((optTask) => {
        if (!optTask) return false;
  
        const nameMatch = optTask.taskName === serverTask.taskName;
        const tempIdMatch = serverTask.tempId && serverTask.tempId === optTask.tempId;
  
        const assignedMatch =
          typeof optTask.assigned === 'object' &&
          (
            (typeof serverTask.assigned === 'object' &&
              optTask.assigned?._id === serverTask.assigned?._id) ||
            (typeof serverTask.assigned === 'string' &&
              optTask.assigned?._id === serverTask.assigned)
          );
  
        return (nameMatch && assignedMatch) || tempIdMatch;
      });
  
      if (!matchingOptimisticTask) return serverTask;
  
      return {
        ...serverTask,
        author:
          typeof serverTask.author === 'string' &&
          typeof matchingOptimisticTask.author === 'object'
            ? { _id: serverTask.author, name: matchingOptimisticTask.author.name }
            : serverTask.author,
        assigned:
          typeof serverTask.assigned === 'string' &&
          typeof matchingOptimisticTask.assigned === 'object'
            ? { _id: serverTask.assigned, name: matchingOptimisticTask.assigned.name }
            : serverTask.assigned,
      };
    });
  
    const optimisticIds = Object.values(currentOptimisticTasks)
      .filter(Boolean)
      .map((task) => ({
        tempId: task._id,
        taskName: task.taskName,
        assignedId: typeof task.assigned === 'object' ? task.assigned._id : task.assigned,
      }));
  
    const serverTasks = enrichedServerTasks.filter((serverTask) => {
      return !optimisticIds.some((opt) =>
        serverTask.taskName === opt.taskName &&
        (typeof serverTask.assigned === 'object'
          ? serverTask.assigned?._id === opt.assignedId
          : serverTask.assigned === opt.assignedId) &&
        new Date(serverTask.updatedAt).getTime() > Date.now() - 5000
      );
    });
  
    const merged = [
      ...Object.values(currentOptimisticTasks || {}).filter(Boolean),
      ...serverTasks,
    ];
  
    const filtered = merged
      .filter((task) => {
        if (!task || !task?.assigned || !task?.author) return false;
  
        const matchesSearch = (task.taskName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const isPending = task.status === 'pending';
  
        const authorId = typeof task.author === 'object' ? task.author._id : task.author;
        const assignedId = typeof task.assigned === 'object' ? task.assigned._id : task.assigned;
  
        const condition1 = authorId === id && assignedId === user._id;
        const condition2 = authorId === user._id && assignedId === id;
  
        return matchesSearch && isPending && (condition1 || condition2);
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
    setFilteredTasks(filtered);
  }, [searchTerm, tasks, id, optimisticTasks, user]);
  
  
  usePollTasks({
    userId: user?._id,
    tasks, 
    setOptimisticTasks,
  });

  const fetchUserDetails = async () => {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      setUserDetail(response.data.data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to fetch user details!',
      });
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const onSubmit = async (data) => {
    if (loading || !user || !userDetail) return;
    setLoading(true);
  
    const tempId = `temp-${Date.now()}`;
    const isSameUser = user?._id === id;

    const optimisticTask: Task = {
      _id: tempId,
      taskName: data.taskName,
      description: data.description || '',
      status: 'pending',
      dueDate: undefined,
      author: { _id: user?._id, name: user.name },
      assigned: {
        _id: id || '',
        name: userDetail?.name || 'Unassigned',
      },
      seen: isSameUser,
      updatedAt: new Date().toISOString(),
      tempId: tempId, // Store tempId to help with cleanup
    };
  
    // Add to optimistic tasks
    setOptimisticTasks(prev => ({ ...prev, [tempId]: optimisticTask }));
    
    // Reset form
    reset();
  
    try {
      // Create task on server
      const result = await dispatch(
        createNewTask({
          taskName: data.taskName,
          description: data.description || '',
          author: user?._id,
          assigned: id,
          seen: isSameUser,
        })
      ).unwrap();
      
      // Clear the optimistic task after successful server update
      // We delay this slightly to ensure the redux store is updated first
      setTimeout(() => {
        setOptimisticTasks(prev => {
          const newState = { ...prev };
          delete newState[tempId];
          return newState;
        });
      }, 500);
  
      toast({ title: 'Task Added' });
    } catch (error) {
      // Remove optimistic task on error
      setOptimisticTasks(prev => {
        const newState = { ...prev };
        delete newState[tempId];
        return newState;
      });
  
      toast({
        variant: 'destructive',
        title: 'Failed to add task',
        description: error?.message || 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search input change
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle marking a task as important
  const handleMarkAsImportant = async (taskId: string) => {
    const originalTasks = [...filteredTasks];
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
  

  // Handle toggling task completion status
  const handleToggleTaskCompletion = async (taskId: string) => {
      const taskToToggle = filteredTasks.find((task) => task._id === taskId);
      if (!taskToToggle) return;
  
      // Store original tasks for rollback in case of error
      const originalTasks = [...filteredTasks];
  
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
    <div className="flex h-full flex-col justify-between p-4 md:p-6">
      <div>
        <PageHead title="Task Page" />
        <Breadcrumbs
          items={[
            { title: 'Dashboard', link: '/dashboard' },
            { title: userDetail?.name || 'User Tasks', link: `/task/${id}` },
          ]}
        />
      </div>

      <Card className="mt-2 flex h-[calc(86vh-7rem)] flex-col overflow-hidden">
        <Input
          className="mx-6 my-4 flex h-[40px] items-center px-4 py-4"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <ScrollArea className="flex-1 overflow-y-auto px-6 scrollbar-hide">
          <TaskList
            tasks={filteredTasks}
            onMarkAsImportant={handleMarkAsImportant}
            onToggleTaskCompletion={handleToggleTaskCompletion}
          />
        </ScrollArea>
      </Card>

      <div className="mt-4 rounded-xl bg-white p-3 shadow">
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
          <Button type="submit" variant="outline" disabled={loading}>
            <CornerDownLeft className="mr-2 h-4 w-4" />
            Add
          </Button>
        </form>
      </div>
    </div>
  );
}