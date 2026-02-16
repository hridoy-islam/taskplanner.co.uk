import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  Calendar as CalendarIcon,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import TaskList from './components/task-list';
import CompleteTaskList from './components/complete-list';
import WorkLoadTaskList from './components/workload-list';
import NeedToFinishList from './components/needtofinish-list';

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
  completedBy?: any[]; // Updated to any[] to handle both strings and objects safely
  unreadMessageCount?: number;
  seen?: boolean;
  priority?: string;
};

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const frequencyOptions = [
  { value: 'once', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

const createTaskSchema = z.object({
  taskName: z.string().min(1, { message: 'Task title is required' }),
  description: z.string().optional(),
  priority: z.string().min(1, { message: 'Priority is required' }),
  dueDate: z.date({ required_error: 'Due date is required' }),
  frequency: z.string().min(1, { message: 'Frequency is required' }),
  scheduledDate: z.number().optional().nullable()
});

type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

export default function CompanyTaskPage() {
  const { uid } = useParams();
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);

  // --- IDENTITY CHECK ---
  const isPersonalView = Boolean(user?._id && uid && user._id === uid);

  const [userDetail, setUserDetail] = useState<any>(null);

  // Task States
  const [assignedToTasks, setAssignedToTasks] = useState<Task[]>([]);
  const [assignedByTasks, setAssignedByTasks] = useState<Task[]>([]);
  const [needToFinishTasks, setNeedToFinishTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [workLoadTasks, setWorkLoadTasks] = useState<Task[]>([]);

  const getInitialTab = () => {
    const saved = sessionStorage.getItem('saved_task_tab');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only restore if we are looking at the exact same user profile
        if (parsed.uid === uid && parsed.tab) {
          return parsed.tab;
        }
      } catch (e) {}
    }
    return isPersonalView ? 'personal' : 'assignedTo';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);

  useEffect(() => {
    const saved = sessionStorage.getItem('saved_task_tab');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.uid === uid && parsed.tab) {
          return;
        } else if (parsed.uid !== uid) {
          sessionStorage.removeItem('saved_task_tab');
        }
      } catch (e) {}
    }

    // If we reach here, there's no saved tab, so set the correct default
    setActiveTab(isPersonalView ? 'personal' : 'assignedTo');
  }, [uid, isPersonalView]);

  // 3. Save tab ONLY when explicitly clicked by the user
  const handleTabChange = (val: string) => {
    setActiveTab(val);
    if (uid) {
      sessionStorage.setItem(
        'saved_task_tab',
        JSON.stringify({ uid, tab: val })
      );
    }
  };

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Pagination States
  const LIMIT = 50;
  const [pageTo, setPageTo] = useState(1);
  const [hasMoreTo, setHasMoreTo] = useState(true);

  const [pageBy, setPageBy] = useState(1);
  const [hasMoreBy, setHasMoreBy] = useState(true);

  const [pageNeedFinish, setPageNeedFinish] = useState(1);
  const [hasMoreNeedFinish, setHasMoreNeedFinish] = useState(true);

  const [pageCompleted, setPageCompleted] = useState(1);
  const [hasMoreCompleted, setHasMoreCompleted] = useState(true);

  const [pageWorkLoad, setPageWorkLoad] = useState(1);
  const [hasMoreWorkLoad, setHasMoreWorkLoad] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      taskName: '',
      description: '',
      dueDate: undefined,
      priority: 'low',
      frequency: 'once',
      scheduledDate: 1
    }
  });

  const selectedFrequency = watch('frequency');
  const selectedScheduledDate = watch('scheduledDate');

  // --- Fetch User Details ---
  useEffect(() => {
    const fetchUser = async () => {
      if (!uid) return;
      try {
        const res = await axiosInstance.get(`/users/${uid}`);
        setUserDetail(res.data.data);
      } catch (error) {
        console.error('User fetch error', error);
      }
    };
    fetchUser();
  }, [uid]);

  // --- Fetch Functions ---

  const fetchAssignedToTasks = useCallback(
    async (pageNum: number, isLoadMore = false) => {
      if (!user?._id || !uid) return;
      try {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);
        const res = await axiosInstance.get(
          `/task/getbothuser/${user._id}/${uid}?page=${pageNum}&limit=${LIMIT}&status=pending`
        );
        const fetchedTasks = res.data?.data.result || [];
        if (fetchedTasks.length < LIMIT) setHasMoreTo(false);

        setAssignedToTasks((prev) => {
          const newTasks = isLoadMore
            ? [...prev, ...fetchedTasks]
            : fetchedTasks;
          return Array.from(
            new Map(newTasks.map((item) => [item._id, item])).values()
          );
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user?._id, uid]
  );

  const fetchAssignedByTasks = useCallback(
    async (pageNum: number, isLoadMore = false) => {
      if (!user?._id || !uid) return;
      try {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);
        const res = await axiosInstance.get(
          `/task/getbothuser/${uid}/${user._id}?page=${pageNum}&limit=${LIMIT}&status=pending`
        );
        const fetchedTasks = res.data?.data.result || [];
        if (fetchedTasks.length < LIMIT) setHasMoreBy(false);

        setAssignedByTasks((prev) => {
          const newTasks = isLoadMore
            ? [...prev, ...fetchedTasks]
            : fetchedTasks;
          return Array.from(
            new Map(newTasks.map((item) => [item._id, item])).values()
          );
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user?._id, uid]
  );

  const fetchNeedToFinishTasks = useCallback(
    async (pageNum: number, isLoadMore = false) => {
      if (!user?._id || !uid) return;
      try {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        const endpoint = isPersonalView
          ? `/task/needtofinish/${uid}?page=${pageNum}&limit=${LIMIT}`
          : `/task/needtofinish/${user._id}/${uid}?page=${pageNum}&limit=${LIMIT}`;

        const res = await axiosInstance.get(endpoint);
        const fetchedTasks = res.data?.data.result || [];
        if (fetchedTasks.length < LIMIT) setHasMoreNeedFinish(false);

        setNeedToFinishTasks((prev) => {
          const newTasks = isLoadMore
            ? [...prev, ...fetchedTasks]
            : fetchedTasks;
          return Array.from(
            new Map(newTasks.map((item) => [item._id, item])).values()
          );
        });
      } catch (error) {
        console.error('Failed to fetch need to finish', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user?._id, uid, isPersonalView]
  );

  const fetchCompletedTasks = useCallback(
    async (pageNum: number, isLoadMore = false) => {
      if (!user?._id || !uid) return;
      try {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);
        const res = await axiosInstance.get(
          `/task/completetask/${user._id}/${uid}?page=${pageNum}&limit=${LIMIT}`
        );
        const fetchedTasks = res.data?.data.result || [];
        if (fetchedTasks.length < LIMIT) setHasMoreCompleted(false);

        setCompletedTasks((prev) => {
          const newTasks = isLoadMore
            ? [...prev, ...fetchedTasks]
            : fetchedTasks;
          return Array.from(
            new Map(newTasks.map((item) => [item._id, item])).values()
          );
        });
      } catch (error) {
        console.error('Failed to fetch completed tasks', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user?._id, uid]
  );

  const fetchWorkLoadTasks = useCallback(
    async (pageNum: number, isLoadMore = false) => {
      if (!uid) return;
      try {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);
        const res = await axiosInstance.get(
          `/task/alltasks/${uid}?page=${pageNum}&limit=${LIMIT}&status=pending`
        );
        const fetchedTasks = res.data?.data.result || [];
        if (fetchedTasks.length < LIMIT) setHasMoreWorkLoad(false);

        setWorkLoadTasks((prev) => {
          const newTasks = isLoadMore
            ? [...prev, ...fetchedTasks]
            : fetchedTasks;
          return Array.from(
            new Map(newTasks.map((item) => [item._id, item])).values()
          );
        });
      } catch (error) {
        console.error('Failed to fetch workload', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [uid]
  );

  // --- Filter Tasks Helper (Removes tasks already completed by the current user) ---
  const filterOutCompletedByMe = useCallback(
    (tasks: Task[]) => {
      if (!user?._id) return tasks;
      return tasks.filter((task) => {
        if (!task.completedBy || !Array.isArray(task.completedBy)) return true;
        const isCompletedByMe = task.completedBy.some((c: any) => {
          const cId =
            typeof c === 'string' ? c : c?.userId?._id || c?.userId || c?._id;
          return cId === user._id;
        });
        return !isCompletedByMe;
      });
    },
    [user?._id]
  );

  // Derived filtered states for rendering pending task lists
  const activeAssignedToTasks = useMemo(
    () => filterOutCompletedByMe(assignedToTasks),
    [assignedToTasks, filterOutCompletedByMe]
  );
  const activeAssignedByTasks = useMemo(
    () => filterOutCompletedByMe(assignedByTasks),
    [assignedByTasks, filterOutCompletedByMe]
  );
  const activeNeedToFinishTasks = useMemo(
    () => filterOutCompletedByMe(needToFinishTasks),
    [needToFinishTasks, filterOutCompletedByMe]
  );
  const activeWorkLoadTasks = useMemo(
    () => filterOutCompletedByMe(workLoadTasks),
    [workLoadTasks, filterOutCompletedByMe]
  );

  useEffect(() => {
    setPageTo(1);
    setPageBy(1);
    setPageNeedFinish(1);
    setPageCompleted(1);
    setPageWorkLoad(1);
    setHasMoreTo(true);
    setHasMoreBy(true);
    setHasMoreNeedFinish(true);
    setHasMoreCompleted(true);
    setHasMoreWorkLoad(true);

    if (activeTab === 'assignedTo' || activeTab === 'personal')
      fetchAssignedToTasks(1);
    if (activeTab === 'assignedBy') fetchAssignedByTasks(1);
    if (activeTab === 'needToFinish') fetchNeedToFinishTasks(1);
    if (activeTab === 'complete') fetchCompletedTasks(1);
    if (activeTab === 'workload') fetchWorkLoadTasks(1);
  }, [
    activeTab,
    fetchAssignedToTasks,
    fetchAssignedByTasks,
    fetchNeedToFinishTasks,
    fetchCompletedTasks,
    fetchWorkLoadTasks
  ]);

  const handleLoadMore = () => {
    if (activeTab === 'assignedTo' || activeTab === 'personal') {
      const next = pageTo + 1;
      setPageTo(next);
      fetchAssignedToTasks(next, true);
    } else if (activeTab === 'assignedBy') {
      const next = pageBy + 1;
      setPageBy(next);
      fetchAssignedByTasks(next, true);
    } else if (activeTab === 'needToFinish') {
      const next = pageNeedFinish + 1;
      setPageNeedFinish(next);
      fetchNeedToFinishTasks(next, true);
    } else if (activeTab === 'complete') {
      const next = pageCompleted + 1;
      setPageCompleted(next);
      fetchCompletedTasks(next, true);
    } else if (activeTab === 'workload') {
      const next = pageWorkLoad + 1;
      setPageWorkLoad(next);
      fetchWorkLoadTasks(next, true);
    }
  };

  const onSubmit = async (data: CreateTaskFormValues) => {
    if (!user?._id || !uid) return;
    try {
      const payload = {
        taskName: data.taskName,
        description: data.description,
        dueDate: data.dueDate,
        author: user._id,
        assigned: uid,
        frequency: data.frequency,
        scheduledDate: data.frequency === 'monthly' ? data.scheduledDate : null,
        status: 'pending',
        priority: data.priority
      };

      const res = await axiosInstance.post('/task', payload);
      let createdTask = res.data?.data || res.data;

      if (createdTask && userDetail) {
        createdTask = {
          ...createdTask,
          assigned: { _id: uid, name: userDetail.name }
        };
      }

      setAssignedToTasks((prev) => [createdTask, ...prev]);

      if (isPersonalView) {
        setNeedToFinishTasks((prev) => [createdTask, ...prev]);
      }

      reset();
      setIsDialogOpen(false);
      toast({ title: 'Task created successfully' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to create task' });
    }
  };

  const updateTaskInLists = (taskId: string, updater: (t: Task) => Task) => {
    const applyUpdate = (list: Task[]) =>
      list.map((t) => (t._id === taskId ? updater(t) : t));
    setAssignedToTasks((prev) => applyUpdate(prev));
    setAssignedByTasks((prev) => applyUpdate(prev));
    setNeedToFinishTasks((prev) => applyUpdate(prev));
    setCompletedTasks((prev) => applyUpdate(prev));
    setWorkLoadTasks((prev) => applyUpdate(prev));
  };

  const handleMarkAsImportant = async (taskId: string) => {
    const task = [
      ...assignedToTasks,
      ...assignedByTasks,
      ...needToFinishTasks,
      ...completedTasks,
      ...workLoadTasks
    ].find((t) => t._id === taskId);
    if (!task || !user?._id) return;

    const isImportant = task.importantBy?.includes(user._id);
    const newImportantBy = isImportant
      ? task.importantBy.filter((id) => id !== user._id)
      : [...(task.importantBy || []), user._id];

    updateTaskInLists(taskId, (t) => ({
      ...t,
      importantBy: newImportantBy,
      updatedAt: new Date().toISOString()
    }));

    try {
      await axiosInstance.patch(`/task/${taskId}`, {
        importantBy: newImportantBy
      });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to update importance' });
    }
  };

  const handleToggleTaskCompletion = async (taskId: string) => {
    const task = [
      ...assignedToTasks,
      ...assignedByTasks,
      ...needToFinishTasks,
      ...workLoadTasks
    ].find((t) => t._id === taskId);

    if (!task) return;

    const authorId =
      typeof task.author === 'string' ? task.author : task.author?._id;
    const assignedId =
      typeof task.assigned === 'string' ? task.assigned : task.assigned?._id;

    let updatedCompletedBy = [];

    if (authorId === assignedId && user?._id === authorId) {
      updatedCompletedBy = [{ userId: user?._id }, { userId: user?._id }];
    } else {
      const newCompletedByEntry = { userId: user?._id };
      const filteredCompletedBy = (task.completedBy || []).filter((c: any) => {
        const cId = typeof c.userId === 'string' ? c.userId : c.userId._id;
        return cId !== user?._id;
      });
      updatedCompletedBy = [...filteredCompletedBy, newCompletedByEntry];
    }

    const updatedTask: Task = {
      ...task,
      status: 'completed',
      completedBy: updatedCompletedBy,
      updatedAt: new Date().toISOString()
    };

    // Remove from pending lists
    setAssignedToTasks((prev) => prev.filter((t) => t._id !== taskId));
    setAssignedByTasks((prev) => prev.filter((t) => t._id !== taskId));
    setNeedToFinishTasks((prev) => prev.filter((t) => t._id !== taskId));
    setWorkLoadTasks((prev) => prev.filter((t) => t._id !== taskId));

    // Add to completed list
    setCompletedTasks((prev) => [updatedTask, ...prev]);

    try {
      await axiosInstance.patch(`/task/${taskId}`, {
        status: 'completed',
        completedBy: updatedCompletedBy
      });
      toast({ title: 'Task finished successfully!' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to update status' });
    }
  };

  const handleReassignTask = async (taskId: string) => {
    const task = [
      ...assignedToTasks,
      ...assignedByTasks,
      ...needToFinishTasks,
      ...workLoadTasks
    ].find((t) => t._id === taskId);

    if (!task) return;

    const assigneeId =
      typeof task.assigned === 'string' ? task.assigned : task.assigned?._id;

    const filteredCompletedBy = (task.completedBy || []).filter((c: any) => {
      const cId = typeof c.userId === 'string' ? c.userId : c.userId._id;
      return cId !== assigneeId;
    });

    updateTaskInLists(taskId, (t: any) => {
      const updatedHistory = [...(t.history || [])];
      if (updatedHistory.length > 0) {
        updatedHistory.pop();
      }

      return {
        ...t,
        status: 'pending',
        completedBy: filteredCompletedBy,
        history: updatedHistory,
        updatedAt: new Date().toISOString()
      };
    });

    try {
      await axiosInstance.patch(`/task/reassign/${taskId}`);
      toast({ title: 'Task reassigned successfully' });
    } catch (error) {
      console.error('Failed to reassign', error);
      toast({ variant: 'destructive', title: 'Failed to reassign task' });
    }
  };

  return (
    <div className="flex  flex-col ">
      <div className="flex flex-1 flex-col overflow-hidden bg-white p-2">
        <Tabs
          value={activeTab}
          className="flex h-full flex-col"
          onValueChange={handleTabChange}
        >
          <div className="mb-2 flex items-center justify-between">
            <TabsList className="bg-taskplanner p-1">
              {!isPersonalView ? (
                <>
                  <TabsTrigger
                    value="assignedTo"
                    className="px-6 text-white data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                  >
                    To {userDetail?.name?.split(' ')[0] || 'User'}
                  </TabsTrigger>
                  <TabsTrigger
                    value="assignedBy"
                    className="px-6 text-white data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                  >
                    By {userDetail?.name?.split(' ')[0] || 'User'}
                  </TabsTrigger>
                </>
              ) : (
                <TabsTrigger
                  value="personal"
                  className="px-6 text-white data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  Personal
                </TabsTrigger>
              )}

              <TabsTrigger
                value="needToFinish"
                className="px-6 text-white data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                Need To Finish
              </TabsTrigger>
              <TabsTrigger
                value="complete"
                className="px-6 text-white data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                Completed
              </TabsTrigger>
              <TabsTrigger
                value="workload"
                className="px-6 text-white data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
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
                <Button>
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
                    {errors.taskName && (
                      <span className="text-xs text-red-500">
                        {errors.taskName.message}
                      </span>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Textarea
                      placeholder="Description (Optional)"
                      className="h-[20vh] resize-none border-gray-300"
                      {...register('description')}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-700">
                        Due Date
                      </span>
                      <div className="relative">
                        <Controller
                          control={control}
                          name="dueDate"
                          render={({ field }) => (
                            <DatePicker
                              selected={field.value}
                              onChange={(date) => field.onChange(date)}
                              className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                              dateFormat="dd-MM-yyyy"
                              placeholderText="Select date"
                              wrapperClassName="w-full"
                              minDate={new Date()}
                            />
                          )}
                        />
                        <CalendarIcon className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 " />
                      </div>
                      {errors.dueDate && (
                        <span className="text-xs text-red-500">
                          {errors.dueDate.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-700">
                        Priority
                      </span>
                      <Controller
                        control={control}
                        name="priority"
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={priorityOptions}
                            placeholder="Select Priority"
                            value={priorityOptions.find(
                              (c) => c.value === field.value
                            )}
                            onChange={(val) => field.onChange(val?.value)}
                            styles={{
                              control: (base) => ({
                                ...base,
                                minHeight: '40px',
                                borderColor: '#e2e8f0'
                              })
                            }}
                          />
                        )}
                      />
                      {errors.priority && (
                        <span className="text-xs text-red-500">
                          {errors.priority.message}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-700">
                        Frequency
                      </span>
                      <Controller
                        control={control}
                        name="frequency"
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={frequencyOptions}
                            placeholder="Select Frequency"
                            value={frequencyOptions.find(
                              (c) => c.value === field.value
                            )}
                            onChange={(val) => field.onChange(val?.value)}
                            styles={{
                              control: (base) => ({
                                ...base,
                                minHeight: '40px',
                                borderColor: '#e2e8f0'
                              })
                            }}
                          />
                        )}
                      />
                      {errors.frequency && (
                        <span className="text-xs text-red-500">
                          {errors.frequency.message}
                        </span>
                      )}
                    </div>
                  </div>

                  {selectedFrequency === 'monthly' && (
                    <div className="mt-2 space-y-3 rounded-xl border border-gray-100 bg-slate-50 p-4">
                      <span className="text-sm font-semibold text-gray-700">
                        Select Day of the Month
                      </span>
                      <div className="grid grid-cols-7 gap-2 sm:grid-cols-8 md:grid-cols-10">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(
                          (day) => (
                            <Button
                              key={day}
                              type="button"
                              variant={
                                selectedScheduledDate === day
                                  ? 'default'
                                  : 'outline'
                              }
                              className={`h-10 w-full p-0 font-medium transition-colors ${
                                selectedScheduledDate === day
                                  ? 'border-transparent bg-taskplanner text-white shadow-sm'
                                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                              onClick={() =>
                                setValue('scheduledDate', day, {
                                  shouldValidate: true
                                })
                              }
                            >
                              {day}
                            </Button>
                          )
                        )}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        This task will repeat on the {selectedScheduledDate}
                        {selectedScheduledDate === 1
                          ? 'st'
                          : selectedScheduledDate === 2
                            ? 'nd'
                            : selectedScheduledDate === 3
                              ? 'rd'
                              : 'th'}{' '}
                        of every month.
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      reset();
                    }}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Task'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex-1 overflow-auto">
            {!isPersonalView ? (
              <>
                <TabsContent value="assignedTo" className="m-0 h-full">
                  {loading ? (
                    <div className="flex h-[60vh] items-center justify-center">
                      <BlinkingDots size="large" color="bg-taskplanner" />
                    </div>
                  ) : activeAssignedToTasks.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <>
                      <TaskList
                        tasks={activeAssignedToTasks}
                        onMarkAsImportant={handleMarkAsImportant}
                        onToggleTaskCompletion={handleToggleTaskCompletion}
                        reAssign={handleReassignTask}
                      />
                      <LoadMoreButton
                        onClick={handleLoadMore}
                        loading={loadingMore}
                        hasMore={hasMoreTo}
                      />
                    </>
                  )}
                </TabsContent>

                <TabsContent value="assignedBy" className="m-0 h-full">
                  {loading ? (
                    <div className="flex h-[60vh] items-center justify-center">
                      <BlinkingDots size="large" color="bg-taskplanner" />
                    </div>
                  ) : activeAssignedByTasks.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <>
                      <TaskList
                        tasks={activeAssignedByTasks}
                        onMarkAsImportant={handleMarkAsImportant}
                        onToggleTaskCompletion={handleToggleTaskCompletion}
                        reAssign={handleReassignTask}
                      />
                      <LoadMoreButton
                        onClick={handleLoadMore}
                        loading={loadingMore}
                        hasMore={hasMoreBy}
                      />
                    </>
                  )}
                </TabsContent>
              </>
            ) : (
              <TabsContent value="personal" className="m-0 h-full">
                {loading ? (
                  <div className="flex h-[60vh] items-center justify-center">
                    <BlinkingDots size="large" color="bg-taskplanner" />
                  </div>
                ) : activeAssignedToTasks.length === 0 ? (
                  <EmptyState />
                ) : (
                  <>
                    <TaskList
                      tasks={activeAssignedToTasks}
                      onMarkAsImportant={handleMarkAsImportant}
                      onToggleTaskCompletion={handleToggleTaskCompletion}
                      reAssign={handleReassignTask}
                    />
                    <LoadMoreButton
                      onClick={handleLoadMore}
                      loading={loadingMore}
                      hasMore={hasMoreTo}
                    />
                  </>
                )}
              </TabsContent>
            )}

            <TabsContent value="needToFinish" className="m-0 h-full">
              {loading ? (
                <div className="flex h-[60vh] items-center justify-center">
                  <BlinkingDots size="large" color="bg-taskplanner" />
                </div>
              ) : activeNeedToFinishTasks.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  <NeedToFinishList
                    tasks={activeNeedToFinishTasks}
                    onMarkAsImportant={handleMarkAsImportant}
                    onToggleTaskCompletion={handleToggleTaskCompletion}
                    reAssign={handleReassignTask}
                  />
                  <LoadMoreButton
                    onClick={handleLoadMore}
                    loading={loadingMore}
                    hasMore={hasMoreNeedFinish}
                  />
                </>
              )}
            </TabsContent>

            <TabsContent value="complete" className="m-0 h-full">
              {loading ? (
                <div className="flex h-[60vh] items-center justify-center">
                  <BlinkingDots size="large" color="bg-taskplanner" />
                </div>
              ) : completedTasks.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  <CompleteTaskList
                    tasks={completedTasks}
                    onMarkAsImportant={handleMarkAsImportant}
                    onToggleTaskCompletion={handleToggleTaskCompletion}
                  />
                  <LoadMoreButton
                    onClick={handleLoadMore}
                    loading={loadingMore}
                    hasMore={hasMoreCompleted}
                  />
                </>
              )}
            </TabsContent>

            <TabsContent value="workload" className="m-0 h-full">
              {loading ? (
                <div className="flex h-[60vh] items-center justify-center">
                  <BlinkingDots size="large" color="bg-taskplanner" />
                </div>
              ) : activeWorkLoadTasks.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  <WorkLoadTaskList
                    tasks={activeWorkLoadTasks}
                    onMarkAsImportant={handleMarkAsImportant}
                    onToggleTaskCompletion={handleToggleTaskCompletion}
                  />
                  <LoadMoreButton
                    onClick={handleLoadMore}
                    loading={loadingMore}
                    hasMore={hasMoreWorkLoad}
                  />
                </>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

// Ensure EmptyState is safely at the bottom of the file
const EmptyState = ({
  icon,
  title,
  desc
}: {
  icon?: React.ReactNode;
  title?: string;
  desc?: string;
}) => (
  <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
    {icon ? (
      <>
        {icon}
        {title && (
          <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
        )}
        {desc && <p className="text-sm text-slate-500">{desc}</p>}
      </>
    ) : (
      <img src="/notask.png" alt="No tasks" className="max-w-xs opacity-90" />
    )}
  </div>
);

const LoadMoreButton = ({
  onClick,
  loading,
  hasMore
}: {
  onClick: () => void;
  loading: boolean;
  hasMore: boolean;
}) => {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center border-t border-dashed border-gray-200 p-4">
      <button
        onClick={onClick}
        disabled={loading}
        className="flex items-center gap-2 rounded-md bg-taskplanner px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-taskplanner/90 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : ''}
        {loading ? 'Loading...' : 'Load More'}
      </button>
    </div>
  );
};
