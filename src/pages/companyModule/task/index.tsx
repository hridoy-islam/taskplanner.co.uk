import { useCallback, useEffect, useState } from 'react';
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
import { Calendar as CalendarIcon, Plus, Loader2 } from 'lucide-react';
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
  completedBy?: string[];
  unreadMessageCount?: number;
  seen?: boolean;
  priority?: string;
};

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

// --- 1. ADDED FREQUENCY OPTIONS ---
const frequencyOptions = [
  { value: 'once', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

// --- 2. UPDATED SCHEMA ---
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

  // Set initial tab based on view context
  const [activeTab, setActiveTab] = useState(
    isPersonalView ? 'personal' : 'assignedTo'
  );

  // Ensure tab resets if URL changes between personal/other profiles
  useEffect(() => {
    setActiveTab(isPersonalView ? 'personal' : 'assignedTo');
  }, [isPersonalView]);

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

  // --- 3. UPDATED USEFORM: ADDED WATCH AND SETVALUE ---
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

  // Need To Finish (Dynamically handles Personal vs Other view)
  const fetchNeedToFinishTasks = useCallback(
    async (pageNum: number, isLoadMore = false) => {
      if (!user?._id || !uid) return;
      try {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        // Dynamic endpoint based on whether we are in personal view or not
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

  // --- Tab Switching Logic ---
  useEffect(() => {
    // Both 'assignedTo' (other view) and 'personal' (personal view) use the same state/fetcher
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

  const getHasMore = () => {
    switch (activeTab) {
      case 'assignedTo':
      case 'personal':
        return hasMoreTo;
      case 'assignedBy':
        return hasMoreBy;
      case 'needToFinish':
        return hasMoreNeedFinish;
      case 'complete':
        return hasMoreCompleted;
      case 'workload':
        return hasMoreWorkLoad;
      default:
        return false;
    }
  };

  // --- Actions ---

  const onSubmit = async (data: CreateTaskFormValues) => {
    if (!user?._id || !uid) return;
    try {
      // --- 4. ADDED FREQUENCY AND SCHEDULED DATE TO PAYLOAD ---
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

      // If in personal view, add to needToFinish as well optimistically
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

  // Generic helper to update task in all lists locally
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

  // 1. Remove from all pending lists
  setAssignedToTasks((prev) => prev.filter((t) => t._id !== taskId));
  setAssignedByTasks((prev) => prev.filter((t) => t._id !== taskId));
  setNeedToFinishTasks((prev) => prev.filter((t) => t._id !== taskId));
  setWorkLoadTasks((prev) => prev.filter((t) => t._id !== taskId));

  // 2. Add to completed list
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

   // FIX: Filter out the ASSIGNEE from the completedBy array, not the author
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
       completedBy: filteredCompletedBy, // Assignee is gone, buttons will hide
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


  if (
    loading &&
    assignedToTasks.length === 0 &&
    assignedByTasks.length === 0 &&
    activeTab === (isPersonalView ? 'personal' : 'assignedTo')
  ) {
    return (
      <div className="flex h-screen flex-row items-center justify-center">
        <BlinkingDots size="large" color="bg-taskplanner" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col ">
      <div className="flex flex-1 flex-col overflow-hidden bg-white p-2">
        <Tabs
          value={activeTab}
          className="flex h-full flex-col"
          onValueChange={(val) => setActiveTab(val)}
        >
          <div className="mb-6 flex items-center justify-between">
            <TabsList className="bg-taskplanner p-1">
              {/* CONDITIONAL TABS: Only show if looking at someone else's profile */}
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
                /* CONDITIONAL TAB: Only show if looking at personal profile */
                <TabsTrigger
                  value="personal"
                  className="px-6 text-white data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                >
                  Personal
                </TabsTrigger>
              )}

              {/* GLOBAL TABS: Always show Need To Finish, Complete, Work Load */}
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

                  {/* --- 5. UPDATED GRID FOR DUE DATE, PRIORITY, AND FREQUENCY --- */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  {/* --- 6. MONTHLY SCHEDULE DAY GRID (CONDITIONAL) --- */}
                  {selectedFrequency === 'monthly' && (
                    <div className="space-y-3 mt-2 rounded-xl border border-gray-100 bg-slate-50 p-4">
                      <span className="text-sm font-semibold text-gray-700">Select Day of the Month</span>
                      <div className="grid grid-cols-7 gap-2 sm:grid-cols-8 md:grid-cols-10">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <Button
                            key={day}
                            type="button"
                            variant={selectedScheduledDate === day ? "default" : "outline"}
                            className={`h-10 w-full p-0 font-medium transition-colors ${
                              selectedScheduledDate === day 
                                ? "bg-taskplanner text-white border-transparent shadow-sm" 
                                : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-gray-200"
                            }`}
                            onClick={() => setValue('scheduledDate', day, { shouldValidate: true })}
                          >
                            {day}
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        This task will repeat on the {selectedScheduledDate}{selectedScheduledDate === 1 ? 'st' : selectedScheduledDate === 2 ? 'nd' : selectedScheduledDate === 3 ? 'rd' : 'th'} of every month.
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
            {/* CONDITIONAL TAB CONTENTS */}
            {!isPersonalView ? (
              <>
                <TabsContent value="assignedTo" className="m-0 h-full">
                  <TaskList
                    tasks={assignedToTasks}
                    onMarkAsImportant={handleMarkAsImportant}
                    onToggleTaskCompletion={handleToggleTaskCompletion}
                    reAssign={handleReassignTask}
                  />
                </TabsContent>

                <TabsContent value="assignedBy" className="m-0 h-full">
                  <TaskList
                    tasks={assignedByTasks}
                    onMarkAsImportant={handleMarkAsImportant}
                    onToggleTaskCompletion={handleToggleTaskCompletion}
                    reAssign={handleReassignTask}
                  />
                </TabsContent>
              </>
            ) : (
              <TabsContent value="personal" className="m-0 h-full">
                <TaskList
                  tasks={assignedToTasks} // Uses same state as assignedTo
                  onMarkAsImportant={handleMarkAsImportant}
                  onToggleTaskCompletion={handleToggleTaskCompletion}
                  reAssign={handleReassignTask}
                />
              </TabsContent>
            )}

            <TabsContent value="needToFinish" className="m-0 h-full">
              <NeedToFinishList
                tasks={needToFinishTasks}
                onMarkAsImportant={handleMarkAsImportant}
                onToggleTaskCompletion={handleToggleTaskCompletion}
                reAssign={handleReassignTask}
              />
            </TabsContent>

            <TabsContent value="complete" className="m-0 h-full">
              <CompleteTaskList
                tasks={completedTasks}
                onMarkAsImportant={handleMarkAsImportant}
                onToggleTaskCompletion={handleToggleTaskCompletion}
              />
            </TabsContent>

            <TabsContent value="workload" className="m-0 h-full">
              <WorkLoadTaskList
                tasks={workLoadTasks}
                onMarkAsImportant={handleMarkAsImportant}
                onToggleTaskCompletion={handleToggleTaskCompletion}
              />
            </TabsContent>
          </div>
        </Tabs>

        {getHasMore() && (
          <div className="flex justify-center pt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadMore}
              disabled={loadingMore || loading}
              className="text-slate-600"
            >
              {loadingMore ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Load More Tasks'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}