import { Card, CardContent } from '../ui/card';
import axiosInstance from '../../lib/axios';
import { useEffect, useState } from 'react';
import TaskList from './task-list';
import { useToast } from '../ui/use-toast';
import notask from '@/assets/imges/home/notask.png';
import { Input } from '../ui/input';

export default function DueTasks({ user }) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchDueTasks = async (searchTerm = '', sortOrder = 'desc') => {
    try {
      const sortQuery = sortOrder === 'asc' ? 'dueDate' : '-dueDate';
      const response = await axiosInstance(
        `/task/duetasks/${user._id}?searchTerm=${searchTerm}&sort=${sortQuery}`
      );

      if (response.data && response.data.data && response.data.data.result) {
        setTasks(response.data.data.result);
      } else {
        console.error('Unexpected response structure:', response);
      }
    } catch (error) {
      console.error('Error fetching due tasks:', error);
      toast({
        variant: 'destructive',
        title: 'Error fetching tasks',
        description: 'Please try again later.'
      });
    }
  };

  useEffect(() => {
    fetchDueTasks(searchTerm, sortOrder);
    const intervalId = setInterval(() => {
      fetchDueTasks(searchTerm, sortOrder);
    }, 30000); // 30 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [user, searchTerm, sortOrder]);

  const handleMarkAsImportant = async (taskId) => {
    const task = tasks.find((t) => t._id === taskId);

    try {
      const response = await axiosInstance.patch(`/task/${taskId}`, {
        important: !task.important
      });

      if (response.data.success) {
        fetchDueTasks(searchTerm, sortOrder);
        toast({
          title: 'Task Updated',
          description: 'Thank You'
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Something Went Wrong!'
        });
      }
    } catch (error) {
      console.error('Error marking task as important:', error);
      toast({
        variant: 'destructive',
        title: 'Error updating task'
      });
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleToggleTaskCompletion = async (taskId) => {
    const task = tasks.find((t) => t._id === taskId);

    try {
      const response = await axiosInstance.patch(`/task/${taskId}`, {
        status: task?.status === 'completed' ? 'pending' : 'completed'
      });

      if (response.data.success) {
        fetchDueTasks(searchTerm, sortOrder);
        toast({
          title: 'Task Updated',
          description: 'Thank You'
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Something Went Wrong!'
        });
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast({
        variant: 'destructive',
        title: 'Error updating task'
      });
    }
  };

  return (
    <Card className="h-[calc(85vh-8rem)] overflow-hidden p-2">
      <Input
        className="m-4 flex h-[40px] w-[90%] items-center   p-4 md:w-[98%]"
        placeholder="Search notes..."
        value={searchTerm}
        onChange={handleSearch}
      />
      <CardContent className="p-4">
        {tasks.length === 0 ? (
          <div className="mt-36 flex flex-col items-center justify-center">
            <img src={notask} alt="No Task" />
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            onMarkAsImportant={handleMarkAsImportant}
            onToggleTaskCompletion={handleToggleTaskCompletion}
            fetchTasks={fetchDueTasks}
          />
        )}
      </CardContent>
    </Card>
  );
}
