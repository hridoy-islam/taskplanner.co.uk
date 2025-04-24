import { useState, useEffect } from 'react';
import TaskDetails from './components/task-details';
import TaskChat from './components/task-chat';
import { useParams } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { updateTask } from '@/redux/features/allTaskSlice';
import { Card } from '@/components/ui/card';

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
  const { id } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { tasks } = useSelector((state: RootState) => state.alltasks);
  const dispatch = useDispatch();

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

  const onUpdate = async (updatedData: Partial<Task>) => {
    if (!id) return;

    try {
      // Optimistic local update
      setTask((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          ...updatedData,
          author: {
            ...(typeof prev.author === 'object'
              ? prev.author
              : { id: prev.author, name: 'Unknown' }),
            ...(typeof updatedData.author === 'object'
              ? updatedData.author
              : {})
          },
          assigned: {
            ...(typeof prev.assigned === 'object'
              ? prev.assigned
              : { id: prev.assigned, name: 'Unassigned' }),
            ...(typeof updatedData.assigned === 'object'
              ? updatedData.assigned
              : {})
          }
        };
      });

      // Dispatch to Redux
      dispatch(
        updateTask({
          taskId: id.toString(),
          taskData: updatedData
        })
      );

      toast({
        title: 'Task updated successfully!'
      });

      return updatedData;
    } catch (err) {
      toast({
        title: 'Failed to update task',
        variant: 'destructive'
      });
      console.error(err);
      throw err;
    }
  };

  return (
    <div className="flex h-screen flex-col gap-4 overflow-hidden p-4 lg:h-[calc(100vh-100px)] lg:flex-row">
    {/* Task Details */}
    <Card className="flex-1 overflow-hidden rounded-xl border border-gray-200">
      <div className="h-full overflow-y-auto">
        <TaskDetails task={task} onUpdate={onUpdate} />
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
