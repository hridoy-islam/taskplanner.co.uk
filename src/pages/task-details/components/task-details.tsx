'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, Info, Star, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import moment from 'moment';
import { EditTaskDialog } from './EditTaskDialog';

interface User {
  id?: string;
  name?: string;
  image?: string;
  avatar?: string;
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
    important: boolean;
    seen: boolean;
  } | null;
  onUpdate: (updatedData: any) => Promise<any>;
}

export default function TaskDetails({ task, onUpdate }: TaskDetailsProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [localTask, setLocalTask] = useState(task);

  useEffect(() => {
    setLocalTask(task);
  }, [task]);

  if (!localTask) {
    return <div className="p-6 text-center">Loading task details...</div>;
  }

  const handleMarkAsImportant = async () => {
    try {
      const updated = { important: !localTask.important };
      const result = await onUpdate(updated);
      // Only update local state if the API call was successful
      if (result && result.data) {
        setLocalTask(prev => prev ? { ...prev, ...updated } : prev);
      }
    } catch (error) {
      console.error('Failed to update importance:', error);
    }
  };

  const handleSave = async (updatedData: {
    taskName: string;
    description: string;
    dueDate: string;
  }) => {
    try {
      const result = await onUpdate(updatedData);
      // Only update local state if the API call was successful
      if (result && result.data) {
        setLocalTask(prev => prev ? { 
          ...prev, 
          ...updatedData, 
          updatedAt: new Date().toISOString() 
        } : prev);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  // Helper function to get author/assigned name
  const getUserName = (user: User | string | null | undefined) => {
    if (!user) return 'Unknown';
    if (typeof user === 'string') return 'Unknown';
    return user.name || 'Unknown';
  };

  // Helper function to get author/assigned image
  const getUserImage = (user: User | string | null | undefined) => {
    if (!user) return '';
    if (typeof user === 'string') return '';
    return user.image || user.avatar || '';
  };

  // Helper function to get initials for avatar fallback
  const getInitials = (user: User | string | null | undefined) => {
    if (!user) return 'U';
    if (typeof user === 'string') return 'U';
    return user.name ? user.name.charAt(0) : 'U';
  };

  return (
    <div className="space-y-6 p-6">
      <EditTaskDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        task={{
          taskName: localTask.taskName,
          description: localTask.description || '',
          dueDate: localTask.dueDate,
        }}
        onSave={handleSave}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleMarkAsImportant}>
            <Star className={`h-4 w-4 ${localTask.important ? 'text-orange-600 fill-orange-600' : ''}`} />
          </Button>
          <label htmlFor="mark-done" className="text-sm text-gray-500">Mark as Important</label>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setEditDialogOpen(true)}>
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-900">{localTask.taskName}</h1>
        <p className="text-sm text-gray-500">
          Created on {moment(localTask.createdAt).format('MMM DD, YYYY')}, last updated {moment(localTask.updatedAt).fromNow()}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-700">Description</h2>
          <Info className="h-4 w-4 text-gray-400" />
        </div>
        <p className="text-sm text-gray-600">{localTask.description || 'No description provided.'}</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-2">
          <h3 className="text-sm text-gray-500">Author</h3>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 border-2 border-white">
              <AvatarImage src={getUserImage(localTask.author) || "/placeholder.svg"} alt="Author Image" />
              <AvatarFallback className="bg-blue-500 text-xs text-white">
                {getInitials(localTask.author)}
              </AvatarFallback>
            </Avatar>
            <span className='text-xs font-medium'>{getUserName(localTask.author)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm text-gray-500">Assigned</h3>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 border-2 border-white">
              <AvatarImage src={getUserImage(localTask.assigned) || "/placeholder.svg"} alt="Assigned Image" />
              <AvatarFallback className="bg-blue-500 text-xs text-white">
                {getInitials(localTask.assigned)}
              </AvatarFallback>
            </Avatar>
            <span className='text-xs font-medium'>{getUserName(localTask.assigned)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm text-gray-500">Status</h3>
          <div className="flex items-center">
            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            {localTask.status.charAt(0).toUpperCase() + localTask.status.slice(1)}

            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-2">
          <h3 className="text-sm text-gray-500">Due date</h3>
          <div className="flex items-center gap-1 text-sm">
            <CalendarIcon className="h-4 w-4 text-orange-500" />
            <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
              {localTask.dueDate ? moment(localTask.dueDate).format('MMM DD, YYYY') : 'No due date'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm text-gray-500">Complete Task</h3>
          <div className="flex items-center">
            <Button 
              variant="secondary"
              size='default'
              onClick={() => onUpdate({ status: localTask.status === 'completed' ? 'pending' : 'completed' })}
            >
              {localTask.status === 'completed' ? 'Reopen' : 'Done'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
