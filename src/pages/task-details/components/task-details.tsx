'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CalendarIcon,
  Info,
  Star,
  ArrowRight,
  UserRoundCheck,
  CircleUser,
  CalendarDays,
  RotateCcw,
  CheckCheck,
  Clock,
  ChevronDown,
  ArrowLeft,
  Pencil // Added for Edit button
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { getNextScheduledDate } from '@/utils/taskUtils';
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
  WEEKDAYS = 'weekdays',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom'
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
    customSchedule?: Date[];
    history?: IHistory[];
  } | null;
  onUpdate: (updatedData: any) => Promise<any>;
}

export default function TaskDetails({ task, onUpdate }: TaskDetailsProps) {
  const [localTask, setLocalTask] = useState<TaskDetailsProps['task']>(null);
  const [isImportant, setIsImportant] = useState(false);

  // Dialog State
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form States (now used for the Dialog)
  const [tempTaskName, setTempTaskName] = useState('');
  const [tempDesc, setTempDesc] = useState('');
  const [tempDueDate, setTempDueDate] = useState('');
  const [frequency, setFrequency] = useState<TaskFrequency | string>('none');
  const [selectedDays, setSelectedDays] = useState<boolean[]>(
    Array(7).fill(false)
  );
  const [selectedDates, setSelectedDates] = useState([
    { startDate: new Date(), endDate: new Date(), key: 'selection' }
  ]);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [showWeekdaysPicker, setShowWeekdaysPicker] = useState(false);
  const [tempSelectedDays, setTempSelectedDays] = useState<boolean[]>(
    Array(7).fill(false)
  );
  const [selectedDateRange, setSelectedDateRange] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);
  const [monthlyDay, setMonthlyDay] = useState<number | null>();

  const user = useSelector((state: any) => state.auth.user);
  const navigate = useNavigate();

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

    if (taskData.scheduledDays && taskData.scheduledDays.length > 0) {
      const newSelectedDays = Array(7).fill(false);
      taskData.scheduledDays.forEach((day: number) => {
        newSelectedDays[day] = true;
      });
      setSelectedDays(newSelectedDays);
      setTempSelectedDays(newSelectedDays); // Sync temp days too
    } else {
      setSelectedDays(Array(7).fill(false));
      setTempSelectedDays(Array(7).fill(false));
    }

    if (taskData.customSchedule && taskData.customSchedule.length > 0) {
      const sortedSchedule = [...taskData.customSchedule].sort(
        (a: any, b: any) => new Date(a).getTime() - new Date(b).getTime()
      );
      const firstDate = new Date(sortedSchedule[0]);
      const lastDate = new Date(sortedSchedule[sortedSchedule.length - 1]);

      setSelectedDates([
        { startDate: firstDate, endDate: lastDate, key: 'selection' }
      ]);
      setSelectedDateRange({
        startDate: moment(firstDate).format('MMM DD, YYYY'),
        endDate: moment(lastDate).format('MMM DD, YYYY')
      });
    }
  };

  useEffect(() => {
    if (localTask && user?._id) {
      setIsImportant(localTask.importantBy?.includes(user._id) ?? false);
    }
  }, [localTask, user?._id]);

  // Handle opening the dialog - refresh state from current localTask
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
    const newCompletedByEntry = { userId: user._id };
    const updatedCompletedBy = [
      ...(localTask.completedBy || []),
      newCompletedByEntry
    ];
    const updatedHistory = [
      ...(localTask.history || []),
      { date: new Date(), completed: true }
    ];
    try {
      const updatePayload = {
        completedBy: updatedCompletedBy,
        history: updatedHistory
      };
      setLocalTask({
        ...localTask,
        completedBy: updatedCompletedBy as any,
        history: updatedHistory
      });
      await onUpdate(updatePayload);
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleFinishTask = async () => {
    if (!localTask || !user?._id) return;
    const newCompletedByEntry = { userId: user._id };
    const filteredCompletedBy = (localTask.completedBy || []).filter((c) => {
      const cId = typeof c.userId === 'string' ? c.userId : c.userId._id;
      return cId !== user._id;
    });
    const updatedCompletedBy = [...filteredCompletedBy, newCompletedByEntry];
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

    // Frequency Logic
    if (frequency !== localTask.frequency) {
      updates.frequency = frequency;
      hasChanges = true;
    }

    // Handle Frequency Specific Data
    if (frequency === 'once') {
      if (localTask.frequency !== 'once') {
        updates.scheduledDays = null;
        updates.scheduledDate = null;
        updates.customSchedule = null;
        hasChanges = true;
      }
    } else if (frequency === 'weekdays') {
      const selectedDayIndices = selectedDays
        .map((selected, index) => (selected ? index : null))
        .filter((index) => index !== null);

      // Simple array comparison
      const currentDays = localTask.scheduledDays || [];
      const isDifferent =
        JSON.stringify(selectedDayIndices.sort()) !==
        JSON.stringify(currentDays.sort());

      if (isDifferent || frequency !== localTask.frequency) {
        updates.scheduledDays = selectedDayIndices;
        updates.scheduledDate = null;
        updates.customSchedule = null;
        hasChanges = true;
      }
    } else if (frequency === TaskFrequency.MONTHLY) {
      if (
        monthlyDay !== localTask.scheduledDate ||
        frequency !== localTask.frequency
      ) {
        updates.scheduledDate = monthlyDay;
        updates.scheduledDays = null;
        updates.customSchedule = null;
        hasChanges = true;
      }
    } else if (frequency === TaskFrequency.CUSTOM) {
      // We assume applyCustomDates updates the state 'selectedDates' or 'selectedDateRange'
      // But for the logic to hold, we need to regenerate the date array if changed
      // In this refactor, we regenerate dates here for safety
      const { startDate, endDate } = selectedDates[0];
      const dates: Date[] = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // This is a heavy check, so we trust if the frequency changed or user picked new dates
      // For simplicity, if type is custom, we send the custom schedule from the picker state
      updates.customSchedule = dates;
      updates.scheduledDays = null;
      updates.scheduledDate = null;
      hasChanges = true;
    }

    if (hasChanges) {
      try {
        await onUpdate(updates);
        // Optimistic update of local task (merged)
        setLocalTask((prev) => (prev ? { ...prev, ...updates } : null));
        setIsEditOpen(false);
      } catch (error) {
        console.error('Failed to update task', error);
      }
    } else {
      setIsEditOpen(false);
    }
  };

  // Form Field Handlers
  const handleFrequencyChange = (value: string) => {
    setFrequency(value);
    if (value === 'weekdays') {
      setTempSelectedDays([...selectedDays]);
      setShowWeekdaysPicker(true);
    }
    if (value === 'custom') {
      setShowPicker(true);
    } else {
      setShowPicker(false);
    }
  };

  const handleCheckboxChange = (index: number) => {
    const newTempDays = [...tempSelectedDays];
    newTempDays[index] = !newTempDays[index];
    setTempSelectedDays(newTempDays);
  };

  const handleWeekdaysApply = () => {
    setSelectedDays([...tempSelectedDays]);
    setShowWeekdaysPicker(false);
  };

  const handleWeekdaysCancel = () => {
    setShowWeekdaysPicker(false);
    setTempSelectedDays([...selectedDays]);
  };

  const handleSelectDateRange = (ranges: any) => {
    const { startDate, endDate } = ranges.selection;
    setSelectedDates([ranges.selection]);
    setSelectedDateRange({
      startDate: moment(startDate).format('MMM DD, YYYY'),
      endDate: moment(endDate).format('MMM DD, YYYY')
    });
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
    if (!user || typeof user === 'string') return 'Unknown';
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

  return (
    <div className=" rounded-lg bg-white p-2">
      {/* Top Header Row */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 space-y-2">
          {/* Breadcrumb / Meta */}
          <div className="flex items-center justify-between gap-2 text-xs font-medium">
            <div className="flex flex-row items-center gap-2">
              <Button
                size={'sm'}
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-5 mr-1" /> Back 
              </Button>
              {/* <span className="font-bold uppercase tracking-wider">
                Task Details
              </span> */}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {/* Edit Button */}
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={handleEditClick} className="gap-2">
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
                    {/* Task Name */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="taskName">Task Name</Label>
                      <Input
                        id="taskName"
                        value={tempTaskName}
                        onChange={(e) => setTempTaskName(e.target.value)}
                      />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={tempDesc}
                        onChange={(e) => setTempDesc(e.target.value)}
                        className="min-h-[30vh]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 space-y-4">
                      {/* Due Date */}
                      <div className="mt-4 space-y-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <div className="relative">
                          <DatePicker
                            selected={tempDueDate}
                            onChange={(date: Date) => setTempDueDate(date)}
                            dateFormat="dd-MM-yyyy"
                            placeholderText="Select due date"
                            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 pl-10 text-base"
                            popperClassName="react-datepicker-popper"
                            wrapperClassName="w-full"
                          />
                          <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        </div>
                      </div>

                      {/* Frequency */}
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
                            <SelectItem value={TaskFrequency.WEEKDAYS}>
                              Weekdays
                            </SelectItem>
                            <SelectItem value={TaskFrequency.MONTHLY}>
                              Monthly
                            </SelectItem>
                            <SelectItem value={TaskFrequency.CUSTOM}>
                              Custom Range
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Dynamic Frequency Settings */}
                    {(frequency === TaskFrequency.WEEKDAYS ||
                      frequency === TaskFrequency.MONTHLY ||
                      frequency === TaskFrequency.CUSTOM) && (
                      <div className="rounded-md border border-gray-100 bg-gray-50 p-4">
                        {frequency === TaskFrequency.WEEKDAYS && (
                          <div className="space-y-3">
                            <span className="text-xs font-semibold">
                              Active Days
                            </span>

                            <div className="flex flex-wrap gap-2">
                              {[
                                'Sun',
                                'Mon',
                                'Tue',
                                'Wed',
                                'Thu',
                                'Fri',
                                'Sat'
                              ].map((day, index) => {
                                const isSelected = selectedDays[index];

                                return (
                                  <label
                                    key={day}
                                    className={`cursor-pointer rounded border px-3 py-1.5 text-xs font-medium transition-colors ${
                                      isSelected
                                        ? 'border-black bg-black text-white'
                                        : 'border-gray-200 bg-white text-black hover:border-gray-300'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() =>
                                        setSelectedDays((prev) =>
                                          prev.map((d, i) =>
                                            i === index ? !d : d
                                          )
                                        )
                                      }
                                      className="hidden"
                                    />
                                    {day}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {frequency === TaskFrequency.MONTHLY && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              Repeat monthly on day:
                            </span>
                            <Select
                              value={monthlyDay?.toString() || ''}
                              onValueChange={(value) =>
                                setMonthlyDay(parseInt(value))
                              }
                            >
                              <SelectTrigger className="h-8 w-20 bg-white">
                                <SelectValue placeholder="1" />
                              </SelectTrigger>
                              <SelectContent className="max-h-60">
                                {Array.from(
                                  { length: 31 },
                                  (_, i) => i + 1
                                ).map((day) => (
                                  <SelectItem key={day} value={day.toString()}>
                                    {day}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {frequency === TaskFrequency.CUSTOM && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                Date Range
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPicker(!showPicker)}
                                className="h-7 text-xs"
                              >
                                {showPicker ? 'Hide Calendar' : 'Change Range'}
                              </Button>
                            </div>
                            {showPicker && (
                              <div className="rounded-md border bg-white p-2 shadow-sm">
                                <DateRangePicker
                                  ranges={selectedDates}
                                  onChange={handleSelectDateRange}
                                  showDateDisplay={false}
                                  rangeColors={['#000000']}
                                />
                              </div>
                            )}
                            <div className="text-sm">
                              Selected: {selectedDateRange?.startDate} —{' '}
                              {selectedDateRange?.endDate}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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

          {/* Read Only Title */}
          <h1 className="text-sm font-medium leading-tight text-black">
            {localTask.taskName}
          </h1>
        </div>
      </div>

      {/* Properties Grid - Read Only */}
      <div className="mb-8 grid grid-cols-1 gap-px sm:grid-cols-4">
        {/* Due Date */}
        <div className="bg-white p-4">
          <div className="mb-1 text-xs font-bold uppercase tracking-wider ">
            Due Date
          </div>
          <div className="text-xs font-medium text-black">
            {localTask.dueDate ? formatDate(localTask.dueDate) : 'No due date'}
          </div>
        </div>

        {/* Frequency */}
        <div className="bg-white p-4">
          <div className="mb-1 text-xs font-bold uppercase tracking-wider ">
            Frequency
          </div>
          <div className="text-xs font-medium capitalize text-black">
            {localTask.frequency || 'Once'}
          </div>
        </div>

        {/* Assigned To */}
        <div className="bg-white p-4">
          <div className="mb-1 text-xs font-bold uppercase tracking-wider ">
            Assigned To
          </div>
          <div className="flex items-center gap-2">
            <span className=" text-xs font-medium text-black">
              {getUserDisplayName(localTask?.assigned)}
            </span>
          </div>
        </div>

        {/* Author */}
        <div className="bg-white p-4">
          <div className="mb-1 text-xs font-bold uppercase tracking-wider ">
            Created By
          </div>
          <div className="flex items-center gap-2">
            <span className=" text-xs font-medium text-black">
              {getUserDisplayName(localTask?.author)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Description */}
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

        {/* Activity */}
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
      </div>
    </div>
  );
}
