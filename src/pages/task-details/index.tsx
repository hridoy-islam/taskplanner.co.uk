

import { useState, useEffect } from 'react';

import TaskDetails from './components/task-details';
import TaskChat from './components/task-chat';
import axiosInstance from "@/lib/axios";
import { useParams } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface Task {
  _id: string;
  taskName: string;
  description?: string;
  author: User | string;
  assigned: User | string;
  status: string;
  isDeleted: boolean;
  important: boolean;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  lastSeen: any[];
    seen: boolean
}

export default function TaskDetailsPage() {
  const { id } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tasks } = useSelector((state: RootState) => state.alltasks);




useEffect(() => {
  if (!id || !tasks || tasks.length === 0) return;

  setLoading(true);
  const foundTask = tasks.find((t) => t._id === id);

  if (foundTask) {
    setTask(foundTask);
    setError(null);
  } else {
    setError('Task not found');
  }
  setLoading(false);
}, [id, tasks]);


  const updateTask = async (updatedData: Partial<Task>) => {
    try {
      const response = await axiosInstance.patch(`/task/${id}`, updatedData);
      const updatedTask = response?.data?.data;
  
      setTask(prev => {
        if (!prev) return null;
  
        return {
          ...prev,
          ...updatedTask,
          author: {
            ...prev.author,
            ...(updatedTask.author || {}),
          },
          assigned:{
            ...prev.assigned,
            ...(updatedTask.assigned || {}),
          }
        };
      });
  
      toast({
        title: "Task Detail Update successfully!"
      });
      return updatedTask;
    } catch (err) {
      
      toast({
        title: "Failed to update task",
        variant:'destructive'
      });
      console.error(err);
      throw err;
    }
  };
  


  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="w-full overflow-y-auto border-r border-gray-200 lg:w-1/2">
        <TaskDetails 
          task={task} 
          onUpdate={updateTask} 
        />
      </div>

      {/* Right side - Task Chat */}
      <div className="w-full  lg:w-1/2">
        <TaskChat task={task} />
      </div>
    </div>
  );
}