import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select'; 
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import moment from 'moment';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import {
  Calendar as CalendarIcon,
  Plus,
  Loader2,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import TaskList from './components/task-list'; // Import the refactored component

// Types
type Task = {
  _id: string;
  taskName: string;
  description?: string;
  status: 'pending' | 'completed';
  dueDate: string;
  author: { _id: string; name: string } | string;
  assigned: { _id: string; name: string } | string;
  importantBy: string[];
  createdAt: string;
  updatedAt: string;
  completedBy?: string[];
  unreadMessageCount?: number;
  seen?: boolean;
  priority?: string;
};

// --- Define Priority Options ---
const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

// --- Zod Schema ---
const createTaskSchema = z.object({
  taskName: z.string().min(1, { message: "Task title is required" }),
  description: z.string().optional(),
  priority: z.string().min(1, { message: "Priority is required" }),
  dueDate: z.date({ required_error: "Due date is required" }),
});

type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

export default function StaffTaskPage() {
  const { id,uid ,sid } = useParams();
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);

  const [userDetail, setUserDetail] = useState<any>(null);
  const [assignedToTasks, setAssignedToTasks] = useState<Task[]>([]);
  const [assignedByTasks, setAssignedByTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState("assignedTo");
  
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [pageTo, setPageTo] = useState(1);
  const [hasMoreTo, setHasMoreTo] = useState(true);
  
  const [pageBy, setPageBy] = useState(1);
  const [hasMoreBy, setHasMoreBy] = useState(true);

  const LIMIT = 50; 
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      taskName: '',
      description: '',
      dueDate: undefined,
      priority: 'low',
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!sid) return;
      try {
        const res = await axiosInstance.get(`/users/${sid}`);
        setUserDetail(res.data.data);
      } catch (error) {
        console.error('User fetch error', error);
      }
    };
    fetchUser();
  }, [sid]);

  const fetchAssignedToTasks = useCallback(
    async (pageNum: number, isLoadMore = false) => {
      if (!user?._id || !sid) return;
      try {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);
        const res = await axiosInstance.get(
          `/task/getbothuser/${user._id}/${sid}?page=${pageNum}&limit=${LIMIT}&status=pending`
        );
        const fetchedTasks = res.data?.data.result || [];
        if (fetchedTasks.length < LIMIT) setHasMoreTo(false); // Fix: Set false if limit reached
        
        setAssignedToTasks((prev) => {
          const newTasks = isLoadMore ? [...prev, ...fetchedTasks] : fetchedTasks;
          return Array.from(new Map(newTasks.map((item) => [item._id, item])).values());
        });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Failed to fetch assigned to tasks' });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user?._id, sid, toast]
  );

  const fetchAssignedByTasks = useCallback(
    async (pageNum: number, isLoadMore = false) => {
      if (!user?._id || !sid) return;
      try {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);
        const res = await axiosInstance.get(
          `/task/getbothuser/${sid}/${user._id}?page=${pageNum}&limit=${LIMIT}&status=pending`
        );
        const fetchedTasks = res.data?.data.result || [];
        if (fetchedTasks.length < LIMIT) setHasMoreBy(false);

        setAssignedByTasks((prev) => {
          const newTasks = isLoadMore ? [...prev, ...fetchedTasks] : fetchedTasks;
          return Array.from(new Map(newTasks.map((item) => [item._id, item])).values());
        });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Failed to fetch assigned by tasks' });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user?._id, sid, toast]
  );

  useEffect(() => {
    fetchAssignedToTasks(1);
    fetchAssignedByTasks(1);
  }, [fetchAssignedToTasks, fetchAssignedByTasks]);


  const handleLoadMore = () => {
    if (activeTab === "assignedTo") {
        const nextPage = pageTo + 1;
        setPageTo(nextPage);
        fetchAssignedToTasks(nextPage, true);
    } else {
        const nextPage = pageBy + 1;
        setPageBy(nextPage);
        fetchAssignedByTasks(nextPage, true);
    }
  };

  const onSubmit = async (data: CreateTaskFormValues) => {
    if (!user?._id || !sid) return;
    try {
      const payload = {
        taskName: data.taskName,
        description: data.description,
        dueDate: data.dueDate,
        author: user._id,
        assigned: sid,
        frequency: 'once',
        status: 'pending',
        priority: data.priority
      };

      const res = await axiosInstance.post('/task', payload);
      let createdTask = res.data?.data || res.data;

      if (createdTask && userDetail) {
        createdTask = { 
            ...createdTask, 
            assigned: { 
                _id: sid, 
                name: userDetail.name 
            } 
        };
      }

      setAssignedToTasks((prev) => [createdTask, ...prev]);
      reset(); 
      setIsDialogOpen(false);
      toast({ title: 'Task created successfully' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to create task' });
    }
  };

  const handleMarkAsImportant = async (taskId: string) => {
    const updateList = (list: Task[]) => {
        return list.map(t => {
            if (t._id === taskId) {
                const userId = user._id;
                const isImportant = t.importantBy?.includes(userId);
                const newImportantBy = isImportant
                  ? t.importantBy.filter((id) => id !== userId)
                  : [...(t.importantBy || []), userId];
                return { ...t, importantBy: newImportantBy, updatedAt: new Date().toISOString() };
            }
            return t;
        });
    };

    const task = [...assignedToTasks, ...assignedByTasks].find(t => t._id === taskId);
    if (!task) return;

    const userId = user._id;
    const isImportant = task.importantBy?.includes(userId);
    const newImportantBy = isImportant
      ? task.importantBy.filter((id) => id !== userId)
      : [...(task.importantBy || []), userId];

    setAssignedToTasks(prev => updateList(prev));
    setAssignedByTasks(prev => updateList(prev));

    try {
      await axiosInstance.patch(`/task/${taskId}`, { importantBy: newImportantBy });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to update importance' });
    }
  };

  const handleToggleTaskCompletion = async (taskId: string) => {
    const updateList = (list: Task[]) => list.map(t => {
        if (t._id === taskId) {
            const newStatus = t.status === 'pending' ? 'completed' : 'pending';
            return { ...t, status: newStatus, updatedAt: new Date().toISOString() };
        }
        return t;
    });

    const task = [...assignedToTasks, ...assignedByTasks].find(t => t._id === taskId);
    if (!task) return;
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';

    setAssignedToTasks(prev => updateList(prev));
    setAssignedByTasks(prev => updateList(prev));

    try {
      await axiosInstance.patch(`/task/${taskId}`, { status: newStatus });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to update status' });
    }
  };

  if (loading && assignedToTasks.length === 0 && assignedByTasks.length === 0) {
    return (
      <div className='h-screen flex flex-row items-center justify-center'>
        <BlinkingDots size='large' color='bg-taskplanner'/>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col ">
      <div className="flex-1 bg-white p-2  overflow-hidden flex flex-col">
        <Tabs 
            defaultValue="assignedTo" 
            className="h-full flex flex-col"
            onValueChange={(val) => setActiveTab(val)}
        >
            <div className="flex items-center justify-between mb-6">
                <TabsList className="bg-taskplanner p-1">
                    <TabsTrigger value="assignedTo" className="px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-white">
                        To {userDetail?.name?.split(' ')[0] || 'User'}
                    </TabsTrigger>
                    <TabsTrigger value="assignedBy" className="px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-white">
                        By {userDetail?.name?.split(' ')[0] || 'User'}
                    </TabsTrigger>
                    <TabsTrigger value="needToFinish" className="px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-white">
                      Need To Finish
                    </TabsTrigger>
                    <TabsTrigger value="complete" className="px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-white">
                      Completed
                    </TabsTrigger>
                    <TabsTrigger value="workload" className="px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-white">
                      Work Load
                    </TabsTrigger>
                </TabsList>

                <Dialog 
                    open={isDialogOpen} 
                    onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) reset();
                    }}
                >
                    <DialogTrigger asChild>
                    <Button >
                        <Plus className="h-4 w-4" />
                        New Task
                    </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[50vw]">
                    <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                        <Input
                            placeholder="Task Title"
                            {...register('taskName')}
                            autoFocus
                        />
                        {errors.taskName && <span className="text-xs text-red-500">{errors.taskName.message}</span>}
                        </div>

                        <div className="grid gap-2">
                        <Textarea
                            placeholder="Description (Optional)"
                            className="resize-none h-[20vh] border-gray-300"
                            {...register('description')}
                        />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-slate-700">Due Date</span>
                            <div className="relative">
                            <Controller
                                control={control}
                                name="dueDate"
                                render={({ field }) => (
                                <DatePicker
                                    selected={field.value}
                                    onChange={(date) => field.onChange(date)}
                                    className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    dateFormat="dd-MM-yyyy"
                                    placeholderText="Select date"
                                    wrapperClassName='w-full'
                                />
                                )}
                            />
                            <CalendarIcon className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 " />
                            </div>
                            {errors.dueDate && <span className="text-xs text-red-500">{errors.dueDate.message}</span>}
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-slate-700">Priority</span>
                            <Controller
                            control={control}
                            name="priority"
                            render={({ field }) => (
                                <Select
                                {...field}
                                options={priorityOptions}
                                placeholder="Select Priority"
                                value={priorityOptions.find((c) => c.value === field.value)}
                                onChange={(val) => field.onChange(val?.value)}
                                styles={{
                                    control: (base) => ({
                                    ...base,
                                    minHeight: '40px',
                                    borderColor: '#e2e8f0',
                                    }),
                                }}
                                />
                            )}
                            />
                            {errors.priority && <span className="text-xs text-red-500">{errors.priority.message}</span>}
                        </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsDialogOpen(false); reset(); }} type="button">
                        Cancel
                        </Button>
                        <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Task'}
                        </Button>
                    </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            
            <div className="flex-1 overflow-auto">
                <TabsContent value="assignedTo" className="m-0 h-full">
                    <TaskList 
                        tasks={assignedToTasks} 
                        onMarkAsImportant={handleMarkAsImportant} 
                        onToggleTaskCompletion={handleToggleTaskCompletion}
                    />
                </TabsContent>
                
                <TabsContent value="assignedBy" className="m-0 h-full">
                    <TaskList 
                        tasks={assignedByTasks}
                        onMarkAsImportant={handleMarkAsImportant} 
                        onToggleTaskCompletion={handleToggleTaskCompletion}
                    />
                </TabsContent>
            </div>
        </Tabs>

        {((activeTab === 'assignedTo' && hasMoreTo) || (activeTab === 'assignedBy' && hasMoreBy)) && (
            <div className="pt-6 flex justify-center">
                <Button variant="outline" size="sm" onClick={handleLoadMore} disabled={loadingMore || loading} className="text-slate-600">
                    {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Load More Tasks'}
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}