import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Calendar as CalendarIcon, Plus, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import TaskList from './components/task-list';
import WorkLoadTaskList from './components/workload-list';

// Types
type ScheduleTask = {
  _id: string;
  taskName: string;
  description?: string;
  status: 'pending' | 'completed';
  dueDate: string;
  author: { _id: string; name: string } | string;
  assigned: { _id: string; name: string } | string;
  createdAt: string;
  updatedAt: string;
  priority?: string;
  IsRecurring: boolean;
  frequency: string;
  scheduledAt?: string;
  scheduledDate?: number | null;
  completedBy?: any[];
};

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const frequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },

];

const createScheduleTaskSchema = z.object({
  taskName: z.string().min(1, { message: 'Task title is required' }),
  description: z.string().optional(),
  priority: z.string().min(1, { message: 'Priority is required' }),
  dueDate: z.date({ required_error: 'Due date is required' }),
  frequency: z.string().min(1, { message: 'Frequency is required' }),
  scheduledDate: z.number().optional().nullable()
});

type CreateTaskFormValues = z.infer<typeof createScheduleTaskSchema>;

export default function StaffScheduleTaskPage() {
  const { uid:id } = useParams();
  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);

  const isPersonalView = Boolean(user?._id && id && user._id === id);
  const [userDetail, setUserDetail] = useState<any>(null);

  const [assignedToTasks, setAssignedToTasks] = useState<ScheduleTask[]>([]);
  const [personalTasks, setPersonalTasks] = useState<ScheduleTask[]>([]);

  const getInitialTab = () => {
    const saved = sessionStorage.getItem('saved_schedule_tab');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id === id && parsed.tab) return parsed.tab;
      } catch (e) {}
    }
    return 'personal';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    if (id) {
      sessionStorage.setItem('saved_schedule_tab', JSON.stringify({ id, tab: val }));
    }
  };

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const LIMIT = 50;
  const [pageTo, setPageTo] = useState(1);
  const [hasMoreTo, setHasMoreTo] = useState(true);
  const [pagePersonal, setPagePersonal] = useState(1);
  const [hasMorePersonal, setHasMorePersonal] = useState(true);

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
    resolver: zodResolver(createScheduleTaskSchema),
    defaultValues: {
      taskName: '',
      description: '',
      dueDate: undefined,
      priority: 'low',
      frequency: 'daily',
      scheduledDate: null
    }
  });

  const selectedFrequency = watch('frequency');
  const selectedScheduledDate = watch('scheduledDate');

  // Auto-set dueDate based on frequency
  useEffect(() => {
    if (selectedFrequency === 'daily') {
      setValue('dueDate', moment().toDate(), { shouldValidate: true });
    } else {
      // For weekly, monthly, custom — clear until user picks
      setValue('dueDate', undefined as any, { shouldValidate: false });
      setValue('scheduledDate', null);
    }
  }, [selectedFrequency]);

  // --- Fetch User Details ---
  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        const res = await axiosInstance.get(`/users/${id}`);
        setUserDetail(res.data.data);
      } catch (error) {
        console.error('User fetch error', error);
      }
    };
    fetchUser();
  }, [id]);

  // --- Fetch Assigned Tasks ---
  const fetchAssignedToTasks = useCallback(
    async (pageNum: number, isLoadMore = false) => {
      if (!user?._id || !id) return;
      try {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);
        const res = await axiosInstance.get(
          `/schedule-task/assignedScheduleTasks/${user._id}/${id}?page=${pageNum}&limit=${LIMIT}&status=pending`
        );
        const fetchedTasks = res.data?.data?.result || res.data?.data || [];
        if (fetchedTasks.length < LIMIT) setHasMoreTo(false);
        setAssignedToTasks((prev) => {
          const newTasks = isLoadMore ? [...prev, ...fetchedTasks] : fetchedTasks;
          return Array.from(new Map(newTasks.map((item: any) => [item._id, item])).values());
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user?._id, id]
  );

  // --- Fetch Personal Tasks ---
  const fetchPersonalTasks = useCallback(
    async (pageNum: number, isLoadMore = false) => {
      if (!user?._id) return;
      try {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);
        const res = await axiosInstance.get(
          `/schedule-task/personal-task/${id}?page=${pageNum}&limit=${LIMIT}&status=pending`
        );
        const fetchedTasks = res.data?.data?.result || res.data?.data || [];
        if (fetchedTasks.length < LIMIT) setHasMorePersonal(false);
        setPersonalTasks((prev) => {
          const newTasks = isLoadMore ? [...prev, ...fetchedTasks] : fetchedTasks;
          return Array.from(new Map(newTasks.map((item: any) => [item._id, item])).values());
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user?._id]
  );

  useEffect(() => {
    if (activeTab === 'personal') {
      setPagePersonal(1);
      setHasMorePersonal(true);
      fetchPersonalTasks(1);
    } else if (activeTab === 'assignedTo') {
      setPageTo(1);
      setHasMoreTo(true);
      fetchAssignedToTasks(1);
    }
  }, [activeTab, fetchAssignedToTasks, fetchPersonalTasks]);

  const handleLoadMore = () => {
    if (activeTab === 'personal') {
      const next = pagePersonal + 1;
      setPagePersonal(next);
      fetchPersonalTasks(next, true);
    } else if (activeTab === 'assignedTo') {
      const next = pageTo + 1;
      setPageTo(next);
      fetchAssignedToTasks(next, true);
    }
  };

  // --- Form Submit ---
  const onSubmit = async (data: CreateTaskFormValues) => {
    if (!user?._id || !id) return;
    try {
      const payload = {
        taskName: data.taskName,
        description: data.description,
        dueDate: data.dueDate,
        author: id,
        assigned: id,
        isRecurring: data.frequency !== 'custom',
        frequency: data.frequency,
        // weekly → scheduledDate is 0–6 (day index)
        // monthly → scheduledDate is 1–31 (day of month)
        // daily/custom → null
        scheduledDate:
          data.frequency === 'weekly' || data.frequency === 'monthly'
            ? data.scheduledDate
            : null,
        status: 'pending',
        priority: data.priority
      };

      const res = await axiosInstance.post('/schedule-task', payload);
      let createdTask = res.data?.data || res.data;

      if (createdTask && userDetail) {
        createdTask = {
          ...createdTask,
          assigned: {
            _id: payload.assigned,
            name: isPersonalView ? user.name : userDetail.name
          }
        };
      }

      if (isPersonalView || activeTab === 'personal') {
        setPersonalTasks((prev) => [createdTask, ...prev]);
      } else {
        setAssignedToTasks((prev) => [createdTask, ...prev]);
      }

      reset();
      setIsDialogOpen(false);
      toast({ title: 'Schedule task created successfully' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to create schedule task' });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-1 flex-col overflow-hidden bg-white p-2">
        <Tabs
          value={activeTab}
          className="flex h-full flex-col"
          onValueChange={handleTabChange}
        >
          <div className="mb-2 flex items-center justify-between">
            <TabsList className="bg-taskplanner p-1">
              <TabsTrigger
                value="personal"
                className="px-6 text-white data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                Personal Schedules
              </TabsTrigger>
              <TabsTrigger
                value="assignedTo"
                className="px-6 text-white data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                               Assigned To Other Schedule

              </TabsTrigger>
            </TabsList>

            {/* ── Dialog ── */}
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
                  New Schedule
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[50vw]">
                <DialogHeader>
                  <DialogTitle>Create New Schedule Task</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  {/* Task Title */}
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

                  {/* Description */}
                  <div className="grid gap-2">
                    <Textarea
                      placeholder="Description (Optional)"
                      className="h-[20vh] resize-none border-gray-300"
                      {...register('description')}
                    />
                  </div>

                  {/* Due Date / Priority / Frequency */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    {/* Due Date */}
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
                              className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                              dateFormat="dd-MM-yyyy"
                              placeholderText={
                                selectedFrequency === 'daily'
                                  ? 'Auto: Today'
                                  : selectedFrequency === 'weekly'
                                  ? 'Select a weekday below'
                                  : selectedFrequency === 'monthly'
                                  ? 'Select a day below'
                                  : 'Select date'
                              }
                              wrapperClassName="w-full"
                              minDate={new Date()}
                              readOnly={['daily', 'weekly', 'monthly'].includes(selectedFrequency)}
                              disabled={['daily', 'weekly', 'monthly'].includes(selectedFrequency)}
                            />
                          )}
                        />
                        <CalendarIcon className="pointer-events-none absolute right-3 top-2.5 h-4 w-4" />
                      </div>
                      {errors.dueDate && (
                        <span className="text-xs text-red-500">
                          {errors.dueDate.message}
                        </span>
                      )}
                     
                    </div>

                    {/* Priority */}
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

                    {/* Frequency */}
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-slate-700">Frequency</span>
                      <Controller
                        control={control}
                        name="frequency"
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={frequencyOptions}
                            placeholder="Select Frequency"
                            value={frequencyOptions.find((c) => c.value === field.value)}
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

                  {/* ── WEEKLY: Weekday picker ── */}
                  {selectedFrequency === 'weekly' && (
                    <div className="mt-2 space-y-3 rounded-xl border border-gray-100 bg-slate-50 p-4">
                      <span className="text-sm font-semibold text-gray-700">
                        Select Day of the Week
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                          (dayLabel, dayIndex) => {
                            const today = moment().startOf('day');
                            const candidate = moment().day(dayIndex).startOf('day');
                            if (candidate.isBefore(today)) candidate.add(1, 'week');

                            // scheduledDate = 0–6 for weekly
                            const isSelected = selectedScheduledDate === dayIndex;

                            return (
                              <Button
                                key={dayLabel}
                                type="button"
                                variant={isSelected ? 'default' : 'outline'}
                                className={`h-10 min-w-[56px] px-3 font-medium transition-colors ${
                                  isSelected
                                    ? 'border-transparent bg-taskplanner text-white shadow-sm'
                                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                                onClick={() => {
                                  setValue('scheduledDate', dayIndex, { shouldValidate: true });
                                  setValue('dueDate', candidate.toDate(), { shouldValidate: true });
                                }}
                              >
                                {dayLabel}
                              </Button>
                            );
                          }
                        )}
                      </div>
                      {watch('dueDate') &&
                        selectedScheduledDate !== null &&
                        selectedScheduledDate !== undefined && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            This task will repeat every{' '}
                            <strong>{moment(watch('dueDate')).format('dddd')}</strong>. Next
                            due: {moment(watch('dueDate')).format('DD MMM YYYY')}
                          </p>
                        )}
                    </div>
                  )}

                  {/* ── MONTHLY: Day-of-month picker ── */}
                  {selectedFrequency === 'monthly' && (
                    <div className="mt-2 space-y-3 rounded-xl border border-gray-100 bg-slate-50 p-4">
                      <span className="text-sm font-semibold text-gray-700">
                        Select Day of the Month
                      </span>
                      <div className="grid grid-cols-7 gap-2 sm:grid-cols-8 md:grid-cols-10">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                          const today = moment().startOf('day');
                          const candidate = moment().date(day).startOf('day');
                          if (candidate.isBefore(today)) candidate.add(1, 'month');

                          const isOverflow = candidate.date() !== day;
                          // scheduledDate = 1–31 for monthly
                          const isSelected =
                            selectedScheduledDate === day &&
                            watch('dueDate') &&
                            moment(watch('dueDate')).isSame(candidate, 'day');

                          return (
                            <Button
                              key={day}
                              type="button"
                              variant={isSelected ? 'default' : 'outline'}
                              className={`h-10 w-full p-0 font-medium transition-colors ${
                                isSelected
                                  ? 'border-transparent bg-taskplanner text-white shadow-sm'
                                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              } ${isOverflow ? 'opacity-40' : ''}`}
                              onClick={() => {
                                setValue('scheduledDate', day, { shouldValidate: true });
                                setValue('dueDate', candidate.toDate(), { shouldValidate: true });
                              }}
                            >
                              {day}
                            </Button>
                          );
                        })}
                      </div>
                      {selectedScheduledDate && watch('dueDate') && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          This task will repeat on the{' '}
                          <strong>
                            {selectedScheduledDate}
                            {selectedScheduledDate === 1
                              ? 'st'
                              : selectedScheduledDate === 2
                              ? 'nd'
                              : selectedScheduledDate === 3
                              ? 'rd'
                              : 'th'}
                          </strong>{' '}
                          of every month. Next due:{' '}
                          {moment(watch('dueDate')).format('DD MMM YYYY')}
                        </p>
                      )}
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
                  <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Schedule'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex-1 overflow-auto">
            <TabsContent value="personal" className="m-0 h-full">
              {loading ? (
                <div className="flex h-[60vh] items-center justify-center">
                  <BlinkingDots size="large" color="bg-taskplanner" />
                </div>
              ) : personalTasks.length === 0 ? (
                <EmptyState
                  title="No personal schedules found"
                  desc="Create a new schedule to get started."
                />
              ) : (
                <>
                  <TaskList tasks={personalTasks} />
                  <LoadMoreButton
                    onClick={handleLoadMore}
                    loading={loadingMore}
                    hasMore={hasMorePersonal}
                  />
                </>
              )}
            </TabsContent>

            <TabsContent value="assignedTo" className="m-0 h-full">
              {loading ? (
                <div className="flex h-[60vh] items-center justify-center">
                  <BlinkingDots size="large" color="bg-taskplanner" />
                </div>
              ) : assignedToTasks.length === 0 ? (
                <EmptyState
                  title="No assigned schedules found"
                  desc="Create a new schedule to assign to this user."
                />
              ) : (
                <>
                  <WorkLoadTaskList tasks={assignedToTasks} />
                  <LoadMoreButton
                    onClick={handleLoadMore}
                    loading={loadingMore}
                    hasMore={hasMoreTo}
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
        {title && <h3 className="text-lg font-semibold text-slate-700">{title}</h3>}
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
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? 'Loading...' : 'Load More'}
      </button>
    </div>
  );
};