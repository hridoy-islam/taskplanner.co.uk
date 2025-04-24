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
import { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';

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
  const [editingTaskName, setEditingTaskName] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [tempTaskName, setTempTaskName] = useState('');
  const [tempDesc, setTempDesc] = useState('');
  const [tempDueDate, setTempDueDate] = useState('');
  const user = useSelector((state: any) => state.auth.user);
  const taskNameTextareaRef = useRef<HTMLTextAreaElement>(null);
  const descTextareaRef = useRef<HTMLTextAreaElement>(null);
  const dueDateInputRef = useRef<HTMLInputElement>(null);

  // Sync task prop into local state
  useEffect(() => {
    if (!localTask || localTask._id !== task?._id) {
      setLocalTask(task);
      if (task) {
        setTempTaskName(task.taskName);
        setTempDesc(task.description);
        setTempDueDate(task.dueDate);
      }
    }
  }, [task]);

  useEffect(() => {
    if (localTask && user?._id) {
      setIsImportant(localTask.importantBy?.includes(user._id) ?? false);
    }
  }, [localTask, user?._id]);

  // Focus the textarea when editing starts
  useEffect(() => {
    if (editingTaskName && taskNameTextareaRef.current) {
      taskNameTextareaRef.current.focus();
      const length = taskNameTextareaRef.current.value.length;
      taskNameTextareaRef.current.setSelectionRange(length, length);
    }
  }, [editingTaskName]);

  // Focus the description textarea when editing starts
  useEffect(() => {
    if (editingDesc && descTextareaRef.current) {
      descTextareaRef.current.focus();
      const length = descTextareaRef.current.value.length;
      descTextareaRef.current.setSelectionRange(length, length);
    }
  }, [editingDesc]);

  // Focus the date input when editing starts
  useEffect(() => {
    if (editingDueDate && dueDateInputRef.current) {
      dueDateInputRef.current.focus();
    }
  }, [editingDueDate]);

  const handleMarkAsImportant = async () => {
    if (!user?._id || !localTask) return;

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
      await onUpdate({ importantBy: newImportantBy });
    } catch (error) {
      console.error('Failed to update importance:', error);
      setIsImportant(!willBeImportant);
      setLocalTask({
        ...localTask,
        importantBy: currentImportantBy,
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
    
    const currentStatus = localTask.status;
    const updatedStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const currentImportantBy = localTask.importantBy || [];
    
    setLocalTask({
      ...localTask,
      status: updatedStatus,
      importantBy: currentImportantBy
    });

    try {
      await onUpdate({ status: updatedStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
      setLocalTask({
        ...localTask,
        status: currentStatus
      });
    }
  };

  const handleTaskNameClick = () => {
    setEditingTaskName(true);
  };

  const handleTaskNameBlur = async () => {
    if (!localTask || tempTaskName.trim() === localTask.taskName) {
      setEditingTaskName(false);
      return;
    }

    const originalTaskName = localTask.taskName;
    setLocalTask({
      ...localTask,
      taskName: tempTaskName.trim()
    });
    setEditingTaskName(false);

    try {
      await onUpdate({ taskName: tempTaskName.trim() });
    } catch (error) {
      console.error('Failed to update task name:', error);
      setLocalTask({
        ...localTask,
        taskName: originalTaskName
      });
      setTempTaskName(originalTaskName);
    }
  };

  const handleTaskNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTaskNameBlur();
    }
  };

  const handleDescClick = () => {
    setEditingDesc(true);
  };

  const handleDescBlur = async () => {
    if (!localTask || tempDesc === localTask.description) {
      setEditingDesc(false);
      return;
    }

    const originalDesc = localTask.description;
    setLocalTask({
      ...localTask,
      description: tempDesc
    });
    setEditingDesc(false);

    try {
      await onUpdate({ description: tempDesc });
    } catch (error) {
      console.error('Failed to update description:', error);
      setLocalTask({
        ...localTask,
        description: originalDesc
      });
      setTempDesc(originalDesc);
    }
  };

  const handleDescKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleDescBlur();
    }
  };

  const handleDueDateClick = () => {
    setEditingDueDate(true);
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempDueDate(e.target.value);
  };

  const handleDueDateBlur = async () => {
    if (!localTask || tempDueDate === localTask.dueDate) {
      setEditingDueDate(false);
      return;
    }

    const originalDueDate = localTask.dueDate;
    setLocalTask({
      ...localTask,
      dueDate: tempDueDate
    });
    setEditingDueDate(false);

    try {
      await onUpdate({ dueDate: tempDueDate });
    } catch (error) {
      console.error('Failed to update due date:', error);
      setLocalTask({
        ...localTask,
        dueDate: originalDueDate
      });
      setTempDueDate(originalDueDate);
    }
  };

  if (!localTask) {
    return <div className="p-6 text-center">Loading task details...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-row items-start justify-between space-y-1">
        {editingTaskName ? (
          <Textarea
            ref={taskNameTextareaRef}
            value={tempTaskName}
            onChange={(e) => setTempTaskName(e.target.value)}
            onBlur={handleTaskNameBlur}
            onKeyDown={handleTaskNameKeyDown}
            className="text-xl font-semibold text-gray-900 resize-none"
            rows={1}
          />
        ) : (
          <h1 
            className="text-xl font-semibold text-gray-900 text-justify cursor-pointer hover:bg-gray-100 rounded p-1"
            onClick={handleTaskNameClick}
          >
            {localTask.taskName}
          </h1>
        )}

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
          {editingDueDate ? (
            <input
              ref={dueDateInputRef}
              type="date"
              value={tempDueDate}
              onChange={handleDueDateChange}
              onBlur={handleDueDateBlur}
              className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800"
            />
          ) : (
            <span 
              className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800 cursor-pointer hover:bg-orange-200"
              onClick={handleDueDateClick}
            >
              {localTask.dueDate ? formatDate(localTask.dueDate) : 'No due date'}
            </span>
          )}
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
        {editingDesc ? (
          <Textarea
            ref={descTextareaRef}
            value={tempDesc}
            onChange={(e) => setTempDesc(e.target.value)}
            onBlur={handleDescBlur}
            onKeyDown={handleDescKeyDown}
            className="text-sm text-gray-600"
            rows={4}
          />
        ) : (
          <p 
            className="text-sm text-gray-600 cursor-pointer hover:bg-gray-100 rounded p-1 whitespace-pre-wrap"
            onClick={handleDescClick}
          >
            {localTask.description || 'No description provided.'}
          </p>
        )}
      </div>
      <div className="space-y-2 flex flex-col">
      <h2 className="text-sm font-medium text-gray-700">Frequency</h2>
      <Select defaultValue="none">
        <SelectTrigger className="w-40 border-gray-400">
          <SelectValue placeholder="Select frequency" />
        </SelectTrigger>
        <SelectContent className="border-gray-400">
          <SelectItem value="none">None</SelectItem>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="weekdays">Weekdays</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
        </SelectContent>
      </Select>
    </div>
    </div>
  );
}