'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CalendarIcon,
  Info,
  Star,
  RotateCcw,
  CheckCheck,
  Clock,
  ArrowLeft,
  Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import axiosInstance from '@/lib/axios';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ReactSelect from 'react-select';

interface User {
  id?: string;
  name?: string;
  image?: string;
  avatar?: string;
  _id?: string;
}

enum TaskFrequency {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

interface IHistory {
  date: Date;
  completed: boolean;
}

interface CompletedBy {
  _id?: string;
  userId: User | string;
  createdAt?: string;
}

interface TaskDetailsProps {
  task: {
    _id: string;
    taskName: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    author?: User | string | null;
    assigned?: User | string | null;
    status: string;
    dueDate: string;
    seen: boolean;
    importantBy?: string[];
    frequency?: TaskFrequency;
    scheduledDays?: number[];
    scheduledDate?: number;
    completedBy?: CompletedBy[];
    history?: IHistory[];
    priority?: string; // --- ADDED PRIORITY ---
  } | null;
  onUpdate: (updatedData: any) => Promise<any>;
}

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

export default function TaskDetails({ task, onUpdate }: TaskDetailsProps) {
  const [localTask, setLocalTask] = useState<TaskDetailsProps['task']>(null);
  const [isImportant, setIsImportant] = useState(false);
  const [members, setMembers] = useState<User[]>([]);

  // Dialog State
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form States
  const [tempTaskName, setTempTaskName] = useState('');
  const [tempDesc, setTempDesc] = useState('');
  const [tempDueDate, setTempDueDate] = useState('');
  const [tempAssigned, setTempAssigned] = useState<string>('');
  const [frequency, setFrequency] = useState<TaskFrequency | string>('once');
  const [monthlyDay, setMonthlyDay] = useState<number | null>(1);
  const [tempPriority, setTempPriority] = useState<string>('medium'); // --- ADDED PRIORITY STATE ---

  const user = useSelector((state: any) => state.auth.user);
  const navigate = useNavigate();

  // Fetch Members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!user?._id) return;
      try {
        const response = await axiosInstance.get(`/users/company/${user._id}`);
        setMembers(response.data.data || []);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };
    fetchMembers();
  }, [user?._id]);

  // Initialize task data
  useEffect(() => {
    if (!localTask || localTask._id !== task?._id) {
      setLocalTask(task);
      syncFormState(task);
    }
  }, [task]);

  const syncFormState = (taskData: any) => {
    if (!taskData) return;
    setTempTaskName(taskData.taskName || '');
    setTempDesc(taskData.description || '');
    setTempDueDate(taskData.dueDate || '');
    setFrequency(taskData.frequency ?? 'once');
    setMonthlyDay(taskData?.scheduledDate || 1);
    setTempPriority(taskData.priority || 'medium'); // --- SYNC PRIORITY ---

    const assignedId =
      typeof taskData.assigned === 'object'
        ? taskData.assigned?._id
        : taskData.assigned;
    setTempAssigned(assignedId || '');
  };

  useEffect(() => {
    if (localTask && user?._id) {
      setIsImportant(localTask.importantBy?.includes(user._id) ?? false);
    }
  }, [localTask, user?._id]);

  const handleEditClick = () => {
    syncFormState(localTask);
    setIsEditOpen(true);
  };

  // --- Logic Helpers ---

  const getAuthorId = () => {
    if (!localTask?.author) return null;
    return typeof localTask.author === 'string'
      ? localTask.author
      : localTask.author._id;
  };

  const isAuthor = user?._id === getAuthorId();

  const checkIsCompletedByUser = (targetUserId: string) => {
    if (!localTask?.completedBy) return false;
    return localTask.completedBy.some((entry) => {
      const entryUserId =
        typeof entry.userId === 'string' ? entry.userId : entry.userId._id;
      return entryUserId === targetUserId;
    });
  };

  const isCompletedByMe = user?._id ? checkIsCompletedByUser(user._id) : false;
  const hasAnyCompletion =
    localTask?.completedBy && localTask.completedBy.length > 0;

  // --- Actions ---

  const handleComplete = async () => {
    if (!localTask || !user?._id) return;

    const authorId =
      typeof localTask.author === 'string'
        ? localTask.author
        : localTask.author?._id;
    const assignedId =
      typeof localTask.assigned === 'string'
        ? localTask.assigned
        : localTask.assigned?._id;

    let updatedCompletedBy = [];

    if (authorId === assignedId && user._id === authorId) {
      updatedCompletedBy = [{ userId: user._id }, { userId: user._id }];
    } else {
      updatedCompletedBy = [
        ...(localTask.completedBy || []),
        { userId: user._id }
      ];
    }

    const updatedHistory = [
      ...(localTask.history || []),
      { date: new Date(), completed: true }
    ];

    try {
      const updatePayload = {
        completedBy: updatedCompletedBy
      };
      setLocalTask({
        ...localTask,
        completedBy: updatedCompletedBy as any
      });
      await onUpdate(updatePayload);
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleFinishTask = async () => {
    if (!localTask || !user?._id) return;

    const authorId =
      typeof localTask.author === 'string'
        ? localTask.author
        : localTask.author?._id;
    const assignedId =
      typeof localTask.assigned === 'string'
        ? localTask.assigned
        : localTask.assigned?._id;

    let updatedCompletedBy = [];

    if (authorId === assignedId && user._id === authorId) {
      updatedCompletedBy = [{ userId: user._id }, { userId: user._id }];
    } else {
      const newCompletedByEntry = { userId: user._id };
      const filteredCompletedBy = (localTask.completedBy || []).filter((c) => {
        const cId = typeof c.userId === 'string' ? c.userId : c.userId._id;
        return cId !== user._id;
      });
      updatedCompletedBy = [...filteredCompletedBy, newCompletedByEntry];
    }

    try {
      const updatePayload = {
        status: 'completed',
        completedBy: updatedCompletedBy
      };
      setLocalTask({
        ...localTask,
        status: 'completed',
        completedBy: updatedCompletedBy as any
      });
      await onUpdate(updatePayload);
    } catch (error) {
      console.error('Failed to finish task:', error);
    }
  };

  const handleReassign = async () => {
    if (!localTask) return;
    try {
      const filteredCompletedBy = (localTask.completedBy || []).filter((c) => {
        const cId = typeof c.userId === 'string' ? c.userId : c.userId._id;
        return cId !== user._id;
      });
      const updatedHistory = [...(localTask.history || [])];
      if (updatedHistory.length > 0) {
        updatedHistory.pop();
      }
      setLocalTask({
        ...localTask,
        status: 'pending',
        completedBy: filteredCompletedBy as any,
        history: updatedHistory
      });
      const response = await axiosInstance.patch(
        `/task/reassign/${localTask._id}`
      );
      await onUpdate(response.data);
    } catch (error) {
      console.error('Failed to reassign task:', error);
    }
  };

  // --- Edit Form Handlers ---

  const handleSaveChanges = async () => {
    if (!localTask) return;

    const updates: any = {};
    let hasChanges = false;

    if (tempTaskName.trim() !== localTask.taskName) {
      updates.taskName = tempTaskName.trim();
      hasChanges = true;
    }
    if (tempDesc !== localTask.description) {
      updates.description = tempDesc;
      hasChanges = true;
    }
    if (tempDueDate !== localTask.dueDate) {
      updates.dueDate = tempDueDate;
      hasChanges = true;
    }

    const currentAssignedId =
      typeof localTask.assigned === 'object'
        ? localTask.assigned?._id
        : localTask.assigned;

    if (tempAssigned !== currentAssignedId) {
      updates.assigned = tempAssigned;
      hasChanges = true;
    }

    if (frequency !== localTask.frequency) {
      updates.frequency = frequency;
      hasChanges = true;
    }

    // --- SAVE PRIORITY LOGIC ---
    if (tempPriority !== (localTask.priority || 'medium')) {
      updates.priority = tempPriority;
      hasChanges = true;
    }

    if (
      frequency === 'once' ||
      frequency === 'daily' ||
      frequency === 'weekly'
    ) {
      if (localTask.frequency !== frequency) {
        updates.scheduledDays = null;
        updates.scheduledDate = null;
        hasChanges = true;
      }
    } else if (frequency === TaskFrequency.MONTHLY) {
      if (
        monthlyDay !== localTask.scheduledDate ||
        frequency !== localTask.frequency
      ) {
        updates.scheduledDate = monthlyDay;
        updates.scheduledDays = null;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      try {
        await onUpdate(updates);
        setLocalTask((prev) => (prev ? { ...prev, ...updates } : null));
        setIsEditOpen(false);
      } catch (error) {
        console.error('Failed to update task', error);
      }
    } else {
      setIsEditOpen(false);
    }
  };

  const handleFrequencyChange = (value: string) => {
    setFrequency(value);
  };

  const handleMarkAsImportant = async () => {
    if (!user?._id || !localTask) return;
    const currentImportantBy = localTask.importantBy || [];
    const willBeImportant = !currentImportantBy.includes(user._id);
    const newImportantBy = willBeImportant
      ? [...currentImportantBy, user._id]
      : currentImportantBy.filter((id) => id !== user._id);
    setIsImportant(willBeImportant);
    setLocalTask({
      ...localTask,
      importantBy: newImportantBy
    });
    try {
      await onUpdate({ importantBy: newImportantBy });
    } catch (error) {
      console.error('Failed to update importance:', error);
      setIsImportant(!willBeImportant);
      setLocalTask({
        ...localTask,
        importantBy: currentImportantBy
      });
    }
  };

  const getUserDisplayName = (user: User | string | null | undefined) => {
    if (!user || typeof user === 'string') {
      if (typeof user === 'string') {
        const member = members.find((m) => m._id === user);
        return member ? member.name : 'Unknown';
      }
      return 'Unknown';
    }
    return user.name || 'Unnamed';
  };

  const formatDate = (date: string) => {
    return moment(date).format('MMM DD, YYYY');
  };

  if (!localTask) {
    return (
      <div className="flex h-40 items-center justify-center text-sm font-medium text-black">
        <BlinkingDots size="large" color="bg-taskplanner" />
      </div>
    );
  }

  const memberOptions = members.map((member) => ({
    value: member._id,
    label: member.name
  }));

  const getOrdinal = (day: number) => {
    if (day > 3 && day < 21) return `${day}th`;

    switch (day % 10) {
      case 1:
        return `${day}st`;
      case 2:
        return `${day}nd`;
      case 3:
        return `${day}rd`;
      default:
        return `${day}th`;
    }
  };

  // Helper to color code priority badge
  const getPriorityColor = (priority?: string) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'text-red-600';
      case 'low': return 'text-green-600';
      default: return 'text-amber-600';
    }
  }

  return (
    <div className=" rounded-lg bg-white p-2">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs font-medium">
            <div className="flex flex-row items-center gap-2">
              <Button size={'sm'} onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-1 h-4 w-5" /> Back
              </Button>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={handleEditClick}
                    className="gap-2"
                    // Disable if the user is assigned AND not the author
                    disabled={
                      !isAuthor &&
                      user?._id ===
                        (typeof localTask.assigned === 'string'
                          ? localTask.assigned
                          : localTask.assigned?._id)
                    }
                    // Optional: Hide entirely if not author
                    style={{ display: isAuthor ? 'flex' : 'none' }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] w-[85vw] max-w-[1200px] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogDescription>
                      Make changes to your task here. Click save when you're
                      done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="taskName">Task Name</Label>
                      <Input
                        id="taskName"
                        value={tempTaskName}
                        onChange={(e) => setTempTaskName(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="assignedUser">Assigned User</Label>
                        <ReactSelect
                          id="assignedUser"
                          options={memberOptions}
                          value={
                            memberOptions.find(
                              (opt) => opt.value === tempAssigned
                            ) || null
                          }
                          onChange={(selectedOption: any) =>
                            setTempAssigned(selectedOption?.value || '')
                          }
                          placeholder="Select user..."
                          className="text-sm"
                          isClearable
                        />
                      </div>

                      {/* --- ADDED PRIORITY DROPDOWN --- */}
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="priority">Priority</Label>
                        <ReactSelect
                          id="priority"
                          options={priorityOptions}
                          value={
                            priorityOptions.find(
                              (opt) => opt.value === tempPriority
                            ) || priorityOptions[1] // Default to medium
                          }
                          onChange={(selectedOption: any) =>
                            setTempPriority(selectedOption?.value || 'medium')
                          }
                          placeholder="Select priority..."
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={tempDesc}
                        onChange={(e) => setTempDesc(e.target.value)}
                        className="min-h-[20vh]"
                      />
                    </div>

                    <div className="mt-2 grid grid-cols-1 items-start gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <div className="relative">
                          <DatePicker
                            selected={
                              tempDueDate ? new Date(tempDueDate) : null
                            }
                            onChange={(date: Date) =>
                              setTempDueDate(date.toISOString())
                            }
                            dateFormat="dd-MM-yyyy"
                            placeholderText="Select due date"
                            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 pl-10 text-base"
                            popperClassName="react-datepicker-popper"
                            showYearDropdown
                            showMonthDropdown
                            dropdownMode='select'
                            wrapperClassName="w-full"
                            minDate={new Date()}
                          />
                          <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Frequency</Label>
                        <Select
                          value={frequency as string}
                          onValueChange={handleFrequencyChange}
                        >
                          <SelectTrigger className="h-11 rounded-xl border-gray-200">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={TaskFrequency.ONCE}>
                              Once
                            </SelectItem>
                            <SelectItem value={TaskFrequency.DAILY}>
                              Daily
                            </SelectItem>
                            <SelectItem value={TaskFrequency.WEEKLY}>
                              Weekly
                            </SelectItem>
                            <SelectItem value={TaskFrequency.MONTHLY}>
                              Monthly
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* NEW: Clean 1-31 Grid Selector for Monthly Frequency */}
                      {frequency === TaskFrequency.MONTHLY && (
                        <div className="col-span-1 mt-4 space-y-3 rounded-xl border border-gray-100 bg-slate-50 p-4 md:col-span-2">
                          <Label className="text-sm font-semibold text-gray-700">
                            Select Day of the Month
                          </Label>
                          <div className="grid grid-cols-7 gap-2 sm:grid-cols-8 md:grid-cols-10">
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(
                              (day) => (
                                <Button
                                  key={day}
                                  type="button"
                                  variant={
                                    monthlyDay === day ? 'default' : 'outline'
                                  }
                                  className={`h-10 w-full p-0 font-medium transition-colors ${
                                    monthlyDay === day
                                      ? 'border-transparent bg-taskplanner text-white shadow-sm'
                                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                  }`}
                                  onClick={() => setMonthlyDay(day)}
                                >
                                  {day}
                                </Button>
                              )
                            )}
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            This task will repeat on the {monthlyDay}
                            {monthlyDay === 1
                              ? 'st'
                              : monthlyDay === 2
                                ? 'nd'
                                : monthlyDay === 3
                                  ? 'rd'
                                  : 'th'}{' '}
                            of every month.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveChanges}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleMarkAsImportant}
                className={`group rounded-full p-2 transition-colors duration-200 ${
                  isImportant ? 'bg-amber-50' : 'hover:bg-amber-50'
                }`}
              >
                <Star
                  className={`h-5 w-5 transition-colors duration-200 ${
                    isImportant
                      ? 'fill-amber-500 text-amber-500'
                      : 'text-gray-400 group-hover:text-amber-400'
                  }`}
                />
              </Button>

              {!isAuthor &&
                (isCompletedByMe ? (
                  <Button disabled size="sm">
                    <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
                    Completed
                  </Button>
                ) : (
                  <Button onClick={handleComplete} size="sm">
                    Complete
                  </Button>
                ))}

              {isAuthor && (
                <div className="flex gap-2">
                  {hasAnyCompletion && (
                    <Button size="sm" onClick={handleReassign}>
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                      Reassign
                    </Button>
                  )}

                  {!isCompletedByMe && (
                    <Button onClick={handleFinishTask} size="sm">
                      Finish
                    </Button>
                  )}

                  {isCompletedByMe && (
                    <Button disabled size="sm">
                      <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
                      Closed
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <h1 className="text-sm font-medium leading-tight text-black">
            {localTask.taskName}
          </h1>
        </div>
      </div>

      {/* --- INCREASED GRID COLUMNS TO ACCOMMODATE PRIORITY --- */}
      <div
        className={`mb-8 grid grid-cols-1 gap-4 ${
          localTask.frequency !== 'once' ? 'sm:grid-cols-5' : 'sm:grid-cols-4'
        }`}
      >
        <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
            Due Date
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {localTask.dueDate ? formatDate(localTask.dueDate) : 'No due date'}
          </div>
        </div>

        {/* --- NEW PRIORITY DISPLAY BLOCK --- */}
        <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
            Priority
          </div>
          <div className={`text-sm font-semibold capitalize ${getPriorityColor(localTask.priority)}`}>
            {localTask.priority || 'Once'}
          </div>
        </div>

        {localTask.frequency !== 'once' && (
          <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
              Frequency
            </div>

            <div className="text-sm font-semibold capitalize text-gray-900">
              {localTask.frequency === 'monthly' && localTask.scheduledDate
                ? `${getOrdinal(localTask.scheduledDate)} of every month`
                : localTask.frequency}
            </div>
          </div>
        )}

        <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
            Assigned To
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {getUserDisplayName(localTask?.assigned)}
            </span>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
            Created By
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {getUserDisplayName(localTask?.author)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Info className="h-4 w-4 text-black" />
            <h3 className="text-sm font-bold text-black">Description</h3>
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-4">
            <div className="min-h-auto whitespace-pre-wrap text-sm leading-relaxed text-black">
              {localTask.description || (
                <span className="italic text-neutral-400">
                  No description provided.
                </span>
              )}
            </div>
          </div>
        </div>

        {localTask.frequency !== 'once' && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-black" />
              <h3 className="text-sm font-bold text-black">Activity</h3>
            </div>

            <div className="rounded-lg border border-black/10 bg-white p-4">
              {localTask?.history && localTask.history.length > 0 ? (
                <div className="space-y-4">
                  {[...localTask.history]
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((entry, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="pt-1">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              entry.completed ? 'bg-black' : 'bg-neutral-300'
                            }`}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-black">
                            {entry.completed
                              ? 'Task Completed'
                              : 'Status Updated'}
                          </span>
                          <span className="text-xs">
                            {moment(entry.date).format('MMM DD, YYYY')}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs italic text-neutral-400">
                  No activity recorded yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}