import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import PageHead from '@/components/shared/page-head';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../lib/axios';
import { useSelector } from 'react-redux';
import TaskList from '@/components/shared/task-list';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CornerDownLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function TaskPage() {
  const { id } = useParams();
  const { user } = useSelector((state: any) => state.auth);
  const [tasks, setTasks] = useState([]);
  const { toast } = useToast();
  const [userDetail, setUserDetail] = useState<any>();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const fetchTasks = async () => {
    const response = await axiosInstance.get(
      `/task/getbothuser/${user?._id}/${id}`
    );
    setTasks(response.data.data);
  };

  const fetchUserDetails = async () => {
    const response = await axiosInstance.get(`/users/${id}`);
    setUserDetail(response.data.data);
  };

  useEffect(() => {
    fetchTasks();
    fetchUserDetails();
  }, [id]);

  const handleMarkAsImportant = async (taskId) => {
    const task: any = tasks.find((t: any) => t._id === taskId);

    const response = await axiosInstance.patch(
      `/task/${taskId}`,
      { important: !task.important } // Toggle important status
    );

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
  // New Task Form
  const onSubmit = async (data) => {
    if (loading) return;
    setLoading(true);
    data.author = user?._id;
    data.assigned = id;

    try {
      const response = await axiosInstance.post(`/task`, data);
      if (response.data.success) {
        reset();
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
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred while adding the task.'
      });
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="p-4 md:p-8">
      <PageHead title="Task Page" />
      <Breadcrumbs
        items={[
          { title: 'Dashboard', link: '/dashboard' },
          { title: userDetail?.name, link: `/task/${id}` }
        ]}
      />
      <TaskList
        tasks={tasks}
        onMarkAsImportant={handleMarkAsImportant}
        onToggleTaskCompletion={handleToggleTaskCompletion}
        fetchTasks={fetchTasks}
      />

      <footer className="bg-white p-4 shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-2">
          <Input
            {...register('taskName', { required: true })}
            type="text"
            placeholder="Add a task"
            className="flex-1"
          />
          <Button type="submit" variant={'outline'}>
            <CornerDownLeft className="mr-2 h-4 w-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
