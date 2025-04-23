'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CalendarIcon,
  Info,
  Star,
  ArrowRight,
  UserRoundCheck,
  CircleUser
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface User {
  id?: string;
  name?: string;
  image?: string;
  avatar?: string;
  _id?: string;
}

interface TaskDetailsProps {
  task: {
    _id: string;
    taskName: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    author?: User | string | null;
    assigned?: User | string | null;
    status: string;
    dueDate: string;
    seen: boolean;
    importantBy?: string[];
  } | null;
  onUpdate: (updatedData: any) => Promise<any>;
}

export default function TaskDetails({ task, onUpdate }: TaskDetailsProps) {
  const [localTask, setLocalTask] = useState<TaskDetailsProps['task']>(null);
  const [isImportant, setIsImportant] = useState(false);
  const user = useSelector((state: any) => state.auth.user);

  // Update local state when the task prop changes
// Sync task prop into local state
useEffect(() => {
  // Only update localTask if it's null (initial render) or task._id has changed
  if (!localTask || localTask._id !== task?._id) {
    setLocalTask(task);
  }
}, [task]);


useEffect(() => {
  if (localTask && user?._id) {
    setIsImportant(localTask.importantBy?.includes(user._id) ?? false);
  }
}, [localTask, user?._id]);

  
  if (!localTask) {
    return <div className="p-6 text-center">Loading task details...</div>;
  }

  const handleMarkAsImportant = async () => {
    if (!user?._id || !localTask) return;
  
    // Capture current state before making changes
    const currentImportantBy = localTask.importantBy || [];
    const willBeImportant = !currentImportantBy.includes(user._id);
  
    const newImportantBy = willBeImportant
      ? [...currentImportantBy, user._id]
      : currentImportantBy.filter(id => id !== user._id);
  
    setIsImportant(willBeImportant);
    setLocalTask({
      ...localTask,
      importantBy: newImportantBy,
    });
  
    try {
      // Make the API call with the new state
      await onUpdate({ importantBy: newImportantBy });
    } catch (error) {
      console.error('Failed to update importance:', error);
      // If the API call fails, revert the local state to the previous state
      setIsImportant(!willBeImportant); // Revert the flag
      setLocalTask({
        ...localTask,
        importantBy: currentImportantBy, // Revert the array
      });
    }
  };
  
  const getUserDisplayName = (user: User | string | null | undefined) => {
    if (!user || typeof user === 'string') return 'Unknown';
    return user.name || 'Unnamed';
  };

  const formatDate = (date: string) => {
    return moment(date).format('MMM DD, YYYY');
  };

  const handleStatusChange = async () => {
    if (!localTask) return;
    
    // Store current states before change
    const currentStatus = localTask.status;
    const updatedStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const currentImportantBy = localTask.importantBy || [];
    
    // Optimistically update the task status in the UI while preserving other properties
    setLocalTask({
      ...localTask,
      status: updatedStatus,
      importantBy: currentImportantBy // Explicitly preserve importantBy
    });

    try {
      // Make the API call
      await onUpdate({ status: updatedStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
      // In case of error, revert the UI update
      setLocalTask({
        ...localTask,
        status: currentStatus
      });
    }
  };

  // Memoize rendering of the component
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-row items-start justify-between space-y-1">
        <h1 className="text-xl font-semibold text-gray-900 text-justify">
          {localTask.taskName}
        </h1>

        <div className="flex flex-row items-center gap-2">
         <Button
            variant="ghost"
            size="icon"
            onClick={handleMarkAsImportant}
            className={`group rounded-full p-2 transition-colors duration-200 ${
              isImportant ? 'bg-amber-50' : 'hover:bg-amber-50'
            }`}
            aria-label={isImportant ? 'Remove importance' : 'Mark as important'}
          >
            <Star
              className={`h-5 w-5 transition-colors duration-200 ${
                isImportant
                  ? 'fill-amber-500 text-amber-500'
                  : 'text-gray-400 group-hover:text-amber-400'
              }`}
            />
          </Button>

          <Button
            variant="secondary"
            onClick={handleStatusChange}
          >
            {localTask.status === 'completed' ? 'Reopen' : 'Complete'}
          </Button>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-sm">
          <CalendarIcon className="h-4 w-4 text-orange-500" />
          <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
            {localTask.dueDate ? formatDate(localTask.dueDate) : 'No due date'}
          </span>
        </div>

        <div className="flex flex-row items-center justify-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-green-100 px-2 py-1 text-[6px] text-black lg:text-xs"
                >
                  <UserRoundCheck className="h-2.5 w-2.5" />
                  {getUserDisplayName(localTask?.author)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  Created By {getUserDisplayName(localTask?.author)}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Badge className="flex items-center gap-1 px-2 py-1 text-xs">
            <ArrowRight className="h-1.5 w-1.5 lg:h-2.5 lg:w-2.5" />
          </Badge>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-purple-100 px-2 py-1 text-[6px] text-black lg:text-xs"
                >
                  <CircleUser className="h-2.5 w-2.5" />
                  {getUserDisplayName(localTask?.assigned)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  Assigned To {getUserDisplayName(localTask?.assigned)}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-700">Description</h2>
          <Info className="h-4 w-4 text-gray-400" />
        </div>
        <p className="text-sm text-gray-600">
          {localTask.description || 'No description provided.'}
        </p>
      </div>
    </div>
  );
}