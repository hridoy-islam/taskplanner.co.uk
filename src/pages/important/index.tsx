import PageHead from '@/components/shared/page-head';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import TaskList from '@/components/shared/task-list';
import axiosInstance from '../../lib/axios';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export default function ImportantPage() {
  const { user } = useSelector((state: any) => state.auth);
  const [tasks, setTasks] = useState([]);
  const { toast } = useToast();

  const fetchTasks = async () => {
    const response = await axiosInstance.get(
      `/task?author=${user?._id}&important=true`
    );
    setTasks(response.data.data.result);
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const handleMarkAsImportant = async (taskId) => {
    const task: any = tasks.find((t: any) => t._id === taskId);

    const response = await axiosInstance.patch(
      `/task/${taskId}`,
      { important: !task.important } // Toggle important status
    );
    console.log(response.data);

    if (response.data.success) {
      fetchTasks();
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
  };

  const handleToggleTaskCompletion = async (taskId) => {
    const task: any = tasks.find((t: any) => t._id === taskId);

    const response = await axiosInstance.patch(`/task/${taskId}`, {
      status: task?.status === 'completed' ? 'pending' : 'completed'
    });

    if (response.data.success) {
      fetchTasks();
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
  };

  const handleNewTaskSubmit = async (data) => {
    const response = await axiosInstance.post(`/task`, data);
    if (response.data.success) {
      fetchTasks();
      toast({
        title: 'Task Added',
        description: 'Thank You'
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Something Went Wrong!'
      });
    }
  };

  return (
    <div className="p-4 md:p-8">
      <PageHead title="Task Page" />
      <Breadcrumbs
        items={[
          { title: 'Dashboard', link: '/dashboard' },
          { title: 'Important Tasks', link: `/important` }
        ]}
      />
      <TaskList
        tasks={tasks}
        onMarkAsImportant={handleMarkAsImportant}
        onToggleTaskCompletion={handleToggleTaskCompletion}
        onNewTaskSubmit={handleNewTaskSubmit}
        showAddTaskForm={false} // Set to true to show the add task form
        fetchTasks={fetchTasks}
      />
    </div>
  );
}
