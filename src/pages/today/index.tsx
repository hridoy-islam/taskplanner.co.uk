import PageHead from '@/components/shared/page-head';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import TaskList from '@/components/shared/task-list';
import axiosInstance from '../../lib/axios';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export default function TodayPage() {
  const { user } = useSelector((state: any) => state.auth);
  const [tasks, setTasks] = useState([]);
  const { toast } = useToast();

  const fetchTasks = async () => {
    const response = await axiosInstance.get(`/task/today/${user?._id}`);
    setTasks(response.data.data);
  };

  useEffect(() => {
    fetchTasks();

    const intervalId = setInterval(() => {
      fetchTasks();
    }, 30000); // 30 seconds

    return () => {
      // clearInterval(intervalId);
      clearTimeout(intervalId);
    };
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

  return (
    <div className="p-4 md:p-8 ">
      <PageHead title="Task Page" />
      <div className="pb-4">
        <Breadcrumbs
          items={[
            { title: 'Dashboard', link: '/dashboard' },
            { title: 'Todays Task', link: `/task` }
          ]}
        />
      </div>
      <TaskList
        tasks={tasks}
        onMarkAsImportant={handleMarkAsImportant}
        onToggleTaskCompletion={handleToggleTaskCompletion}
        fetchTasks={fetchTasks}
      />
    </div>
  );
}
