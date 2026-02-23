import { useState, useEffect } from 'react';
import TaskDetails from './components/task-details';
import TaskChat from './components/task-chat';
import { useParams } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import axiosInstance from '@/lib/axios'; // Ensure you have axios installed
import { BlinkingDots } from '@/components/shared/blinking-dots';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

// Keep interfaces if they aren't imported from a types file
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
  seen: boolean;
}

export default function TaskDetailsPage() {
  const { tid: id } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
    const { user } = useSelector((state: RootState) => state.auth);
const [counter,setCounter] = useState(0)

const handleIncrement=()=>{
  setCounter(prev=> prev+1)
}
  // 1. Fetch the specific task directly from API on mount
  const fetchTask = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/task/${id}`);
      setTask(res.data.data || res.data); 
    } catch (err) {
      console.error(err);
      toast({
        title: 'Failed to load task',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {

    fetchTask();
  }, [id,counter]);


  useEffect(() => {
    const markAsSeen = async () => {
      // Check if task exists, user is loaded, and user is the assignee
      const assigneeId = typeof task?.assigned === 'string' 
        ? task.assigned 
        : (task?.assigned as any)?._id;

      if (task && user?._id === assigneeId && task.seen === false) {
        try {
          await axiosInstance.patch(`/task/${task._id}`, { seen: true });
          
          // Update local state so UI reflects "seen" immediately without a full refresh
          setTask((prev) => prev ? { ...prev, seen: true } : null);
        } catch (err) {
          console.error("Failed to mark task as seen", err);
        }
      }
    };

    markAsSeen();
  }, [task?._id, user?._id, task?.seen]);
  

  // 2. Refactored Update Logic
const onUpdate = async (updatedData: Partial<Task>) => {
    if (!id || !task) return;

    const previousTask = task;

    setTask((prev) => {
      if (!prev) return null;
      return { ...prev, ...updatedData };
    });

    try {
      const res = await axiosInstance.patch(`/task/${id}`, updatedData);

     
      setTask(res.data.data); 
    fetchTask();

      toast({
        title: 'Task updated successfully!',
      });

    } catch (err) {
      console.error(err);
      
      setTask(previousTask);

      toast({
        title: 'Failed to update task',
        description: 'Changes have been reverted.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return  <div className="flex h-[50vh] w-full items-center justify-center">
            <BlinkingDots size="large" color="bg-taskplanner" />
          </div>
  }

  if (!task) {
    return <div className="p-4">Task not found</div>;
  }

  return (
    <div className="flex h-screen flex-col gap-4 overflow-hidden p-4 lg:h-[calc(100vh-58px)] lg:flex-row">
      {/* Task Details */}
      <Card className="flex-1 overflow-hidden rounded-xl border border-gray-200">
        <div className="h-full overflow-y-auto">
          {/* Pass the new onUpdate function */}
          <TaskDetails task={task} onUpdate={onUpdate} handleIncrement={handleIncrement} />
        </div>
      </Card>

      {/* Task Chat */}
      <div className="flex-1 overflow-hidden rounded-xl border border-gray-200">
        <div className="h-full overflow-y-auto">
          <TaskChat task={task} />
        </div>
      </div>
    </div>
  );
}