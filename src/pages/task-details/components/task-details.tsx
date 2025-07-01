'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CalendarIcon,
  Info,
  Star,
  ArrowRight,
  UserRoundCheck,
  CircleUser,
  CalendarDays
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
import { on } from 'events';

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

    customSchedule?: Date[];
    history?: IHistory[];
  } | null;
  onUpdate: (updatedData: any) => Promise<any>;
}

export default function TaskDetails({ task, onUpdate }: TaskDetailsProps) {
  const [localTask, setLocalTask] = useState<TaskDetailsProps['task']>(null);
  const [isImportant, setIsImportant] = useState(false);
  const [editingTaskName, setEditingTaskName] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [tempTaskName, setTempTaskName] = useState('');
  const [tempDesc, setTempDesc] = useState('');
  const [tempDueDate, setTempDueDate] = useState('');
  const user = useSelector((state: any) => state.auth.user);
  const taskNameTextareaRef = useRef<HTMLTextAreaElement>(null);
  const descTextareaRef = useRef<HTMLTextAreaElement>(null);
  const dueDateInputRef = useRef<HTMLInputElement>(null);
  const [frequency, setFrequency] = useState<TaskFrequency | string>('none');
  const [selectedDays, setSelectedDays] = useState<boolean[]>(
    Array(7).fill(false)
  ); // For weekdays
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

  // Handle clicks outside the date picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  // Initialize task data and frequency-related state
  useEffect(() => {
    if (!localTask || localTask._id !== task?._id) {
      setLocalTask(task);

      if (task) {
        setTempTaskName(task.taskName);
        setTempDesc(task.description);
        setTempDueDate(task.dueDate);
        setFrequency(task.frequency ?? 'once');

        if (task.scheduledDays && task.scheduledDays.length > 0) {
          const newSelectedDays = Array(7).fill(false);
          task.scheduledDays.forEach((day) => {
            newSelectedDays[day] = true;
          });
          setSelectedDays(newSelectedDays);
        }
        if (task.frequency === TaskFrequency.MONTHLY) {
          setMonthlyDay(task?.scheduledDate || 1); // Default to 1 if not specified
        }
        if (task.customSchedule && task.customSchedule.length > 0) {
          const sortedSchedule = [...task.customSchedule].sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
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
      }
    }
  }, [task, onUpdate]);

  useEffect(() => {
    if (localTask && user?._id) {
      setIsImportant(localTask.importantBy?.includes(user._id) ?? false);
    }
  }, [localTask, user?._id]);

  const handleFrequencyChange = async (value: string) => {
    if (value === 'once') {
      setFrequency('once');
      setSelectedDays(Array(7).fill(false));
      setSelectedDates([
        { startDate: new Date(), endDate: new Date(), key: 'selection' }
      ]);

      // Immediately update localTask state
      setLocalTask((prev) => ({
        ...prev,
        frequency: null, // or 'once' depending on your backend
        scheduledDays: null,
        scheduledDate: null,
        customSchedule: null
      }));

      try {
        await onUpdate({
          frequency: null,
          scheduledDays: null,
          scheduledDate: null,
          customSchedule: null
        });
      } catch (error) {
        console.error('Failed to update frequency:', error);
        // Revert localTask on error
        setLocalTask((prev) => ({ ...prev, frequency: localTask?.frequency }));
      }
      return;
    }

    setFrequency(value);

    // Immediately update localTask for other frequencies too
    setLocalTask((prev) => ({
      ...prev,
      frequency: value as TaskFrequency
    }));

    if (value !== 'weekdays' && value !== 'custom' && value !== 'monthly') {
      try {
        await onUpdate({
          frequency: value,
          scheduledDays: null,
          scheduledDate: null,
          customSchedule: null
        });
      } catch (error) {
        console.error('Failed to update frequency:', error);
        // Revert localTask on error
        setLocalTask((prev) => ({ ...prev, frequency: localTask?.frequency }));
      }
    }

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

  const handleSelect = (ranges: any) => {
    const { startDate, endDate } = ranges.selection;
    setSelectedDates([ranges.selection]);
    setSelectedDateRange({
      startDate: moment(startDate).format('MMM DD, YYYY'),
      endDate: moment(endDate).format('MMM DD, YYYY')
    });
  };

  const handleWeekdaysApply = async () => {
    setSelectedDays([...tempSelectedDays]);
    setShowWeekdaysPicker(false);
    const selectedDayIndices = tempSelectedDays
      .map((selected, index) => (selected ? index : null))
      .filter((index) => index !== null);
    try {
      await onUpdate({
        frequency: 'weekdays',
        scheduledDays: selectedDayIndices,
        scheduledDate: null,
        customSchedule: null
      });
      setLocalTask((prev) => ({
        ...prev,
        frequency: 'weekdays',
        scheduledDays: selectedDayIndices
      }));
    } catch (error) {
      console.error('Failed to update weekdays selection:', error);
    }
  };

  const handleWeekdaysCancel = () => {
    setShowWeekdaysPicker(false);
    setTempSelectedDays([...selectedDays]);
  };

  const handleMonthlyDaySelect = async (day: number) => {
    setMonthlyDay(day);

    // Calculate the next due date based on the selected day
    const now = moment();
    let nextDate = moment().date(day);

    // If the selected day has already passed this month, go to next month
    if (now.date() > day || (now.date() === day && now.hour() >= 12)) {
      nextDate = nextDate.add(1, 'month');
    }

    try {
      await onUpdate({
        frequency: TaskFrequency.MONTHLY,
        scheduledDays: null,
        scheduledDate: day, // Store the selected day
        customSchedule: null
      });
      setLocalTask((prev) => ({
        ...prev,
        frequency: TaskFrequency.MONTHLY,
        scheduledDate: day
      }));
    } catch (error) {
      console.error('Failed to update monthly schedule:', error);
    }
  };

  const applyCustomDates = async () => {
    if (frequency !== 'custom') return;
    const { startDate, endDate } = selectedDates[0];
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    try {
      await onUpdate({
        frequency: 'custom',
        scheduledDays: null,
        scheduledDate: null,
        customSchedule: dates
      });
      setShowPicker(false);
    } catch (error) {
      console.error('Failed to update custom dates:', error);
    }
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

  const areAllCustomDatesCompleted = (task: TaskDetailsProps['task']) => {
    if (
      !task ||
      task.frequency !== TaskFrequency.CUSTOM ||
      !task.customSchedule
    ) {
      return false;
    }

    return task.customSchedule.every((scheduleDate) =>
      task.history?.some(
        (entry) =>
          moment(entry.date).isSame(scheduleDate, 'day') && entry.completed
      )
    );
  };

  const handleStatusChange = async () => {
    if (!localTask) return;

    // Create updated history with current completion date
    const updatedHistory = [
      ...(localTask.history || []),
      {
        date: localTask.dueDate, // Use current date for completion
        completed: true
      }
    ];

    // For one-time tasks, mark as completed - use localTask.frequency instead of frequency state
    const shouldCompleteTask =
      localTask.frequency === 'once' ||
      localTask.frequency === null ||
      (localTask.frequency === 'custom' &&
        areAllCustomDatesCompleted({
          ...localTask,
          history: updatedHistory
        }));

    // Calculate next date using localTask.frequency instead of frequency state
    const nextDate = getNextScheduledDate({
      ...localTask,
      history: updatedHistory,
      frequency: localTask.frequency as TaskFrequency // Use localTask.frequency here
    });

    // Prepare update data
    const updateData = {
      history: updatedHistory,
      ...(nextDate && { dueDate: nextDate.toISOString() }),
      ...(shouldCompleteTask && { status: 'completed' })
    };

    try {
      // Optimistic update - this will immediately disable the button
      setLocalTask({
        ...localTask,
        ...updateData
      });

      // Send update to backend
      await onUpdate(updateData);
    } catch (error) {
      console.error('Failed to update status:', error);
      // Revert on error
      setLocalTask(localTask);
    }
  };

  if (!localTask) {
    return <div className="p-6 text-center">Loading task details...</div>;
  }
  const isOnceCompleted =
    frequency === TaskFrequency.ONCE && localTask?.status === 'completed';

  const isCustomCompleted =
    frequency === TaskFrequency.CUSTOM &&
    localTask?.customSchedule?.length > 0 &&
    localTask.customSchedule.every((date) =>
      localTask.history?.some(
        (entry) => moment(entry.date).isSame(date, 'day') && entry.completed
      )
    );
  const isTaskCompleted = isOnceCompleted || isCustomCompleted;
  console.log('status', localTask?.status);
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-row items-start justify-between space-y-1">
        <div className="flex">
          {editingTaskName ? (
            <Textarea
              ref={taskNameTextareaRef}
              value={tempTaskName}
              onChange={(e) => setTempTaskName(e.target.value)}
              onBlur={async () => {
                if (tempTaskName.trim() !== localTask.taskName) {
                  setLocalTask({ ...localTask, taskName: tempTaskName.trim() });
                  try {
                    await onUpdate({ taskName: tempTaskName.trim() });
                  } catch (error) {
                    console.error('Failed to update task name:', error);
                  }
                }
                setEditingTaskName(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  taskNameTextareaRef.current?.blur();
                }
              }}
              className=" text-xl font-semibold text-gray-900 md:min-w-[350px]"
              rows={2}
            />
          ) : (
            <h1
              className="cursor-pointer text-wrap break-words rounded p-1 text-justify text-xl font-semibold text-gray-900 hover:bg-gray-100"
              onClick={() => setEditingTaskName(true)}
            >
              {localTask.taskName}
            </h1>
          )}
        </div>
        <div className="flex flex-row items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMarkAsImportant}
            className={`group rounded-full p-2 transition-colors duration-200 ${
              isImportant ? 'bg-amber-50' : 'hover:bg-amber-50'
            }`}
            aria-label={isImportant ? 'Remove importance' : 'Mark as important'}
          >
            <Star
              className={`h-5 w-5 transition-colors duration-200 ${
                isImportant
                  ? 'fill-amber-500 text-amber-500'
                  : 'text-gray-400 group-hover:text-amber-400'
              }`}
            />
          </Button>
          {/* <Button variant="secondary" onClick={handleStatusChange}>
            {localTask.history?.some((entry) => entry.completed)
              ? 'Undo'
              : 'Complete'}
          </Button> */}

          {localTask.status === 'completed' ||
          (frequency === 'custom' && areAllCustomDatesCompleted(localTask)) ? (
            <Button disabled variant="secondary">
              Completed
            </Button>
          ) : (
            <Button variant="secondary" onClick={handleStatusChange}>
              Complete
            </Button>
          )}
        </div>
      </div>

      {/* Due Date */}
      <div className="flex flex-row items-center justify-between gap-2">
        <Badge
          variant="outline"
          className="flex h-7 max-w-[150px] items-center gap-1 bg-red-700 text-sm"
        >
          {/* <CalendarIcon className="h-4 w-4 text-white" /> */}
          {editingDueDate ? (
            <input
              ref={dueDateInputRef}
              type="date"
              value={tempDueDate}
              onChange={(e) => setTempDueDate(e.target.value)}
              onBlur={async () => {
                if (tempDueDate !== localTask.dueDate) {
                  setLocalTask({ ...localTask, dueDate: tempDueDate });
                  try {
                    await onUpdate({ dueDate: tempDueDate });
                  } catch (error) {
                    console.error('Failed to update due date:', error);
                  }
                }
                setEditingDueDate(false);
              }}
              className="rounded-full bg-red-700 px-2 py-1 text-xs font-medium text-white focus:outline-none"
            />
          ) : (
            <span
              className="cursor-pointer rounded-full bg-red-700 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
              onClick={() => setEditingDueDate(true)}
            >
              {localTask.dueDate
                ? formatDate(localTask.dueDate)
                : 'No due date'}
            </span>
          )}
        </Badge>
        <div className="flex flex-row items-center justify-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-green-100 px-2 py-1 text-[6px] text-black lg:text-xs"
                >
                  <UserRoundCheck className="h-2.5 w-2.5" />
                  {getUserDisplayName(localTask?.author)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  Created By {getUserDisplayName(localTask?.author)}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Badge className="flex items-center gap-1 px-2 py-1 text-xs">
            <ArrowRight className="h-1.5 w-1.5 lg:h-2.5 lg:w-2.5" />
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-purple-100 px-2 py-1 text-[6px] text-black lg:text-xs"
                >
                  <CircleUser className="h-2.5 w-2.5" />
                  {getUserDisplayName(localTask?.assigned)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  Assigned To {getUserDisplayName(localTask?.assigned)}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Frequency */}
      <div className="flex flex-col space-y-2">
        <h2 className="text-sm font-bold text-gray-700">Frequency</h2>
        <Select
          value={frequency as string}
          onValueChange={handleFrequencyChange}
        >
          <SelectTrigger className="w-40 border-gray-400">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent className="border-gray-400">
            <SelectItem value={TaskFrequency.ONCE}>Once</SelectItem>
            <SelectItem value={TaskFrequency.DAILY}>Daily</SelectItem>
            <SelectItem value={TaskFrequency.WEEKLY}>Weekly</SelectItem>
            <SelectItem value={TaskFrequency.WEEKDAYS}>Weekdays</SelectItem>
            <SelectItem value={TaskFrequency.MONTHLY}>Monthly</SelectItem>
            {/* <SelectItem value={TaskFrequency.CUSTOM}>Custom</SelectItem> */}
          </SelectContent>
        </Select>

        {/* Weekdays Picker */}
        {frequency === TaskFrequency.WEEKDAYS && (
          <div className="flex flex-col space-y-2">
            <div className="mt-2 flex flex-wrap gap-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                (day, index) => (
                  <label key={day} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        showWeekdaysPicker
                          ? tempSelectedDays[index]
                          : selectedDays[index]
                      }
                      onChange={() => handleCheckboxChange(index)}
                      className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {day}
                    </span>
                  </label>
                )
              )}
            </div>

            {showWeekdaysPicker && (
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWeekdaysCancel}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleWeekdaysApply}>
                  Apply
                </Button>
              </div>
            )}
          </div>
        )}
        {frequency === TaskFrequency.MONTHLY && (
          <div className="space-y-3 pt-2">
            <div className="flex flex-col space-y-2">
              <label
                htmlFor="monthly-day-select"
                className="text-sm font-medium text-gray-700"
              >
                Monthly recurrence
              </label>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">On day</span>
                <Select
                  value={monthlyDay?.toString() || ''}
                  onValueChange={(value) =>
                    handleMonthlyDaySelect(parseInt(value))
                  }
                >
                  <SelectTrigger
                    id="monthly-day-select"
                    className="w-24 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    aria-label="Select day of month"
                  >
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-gray-300 shadow-lg">
                    <SelectGroup>
                      <SelectLabel>Specific Day</SelectLabel>
                      <div className="grid grid-cols-7 gap-1 p-2">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(
                          (day) => (
                            <SelectItem
                              key={day}
                              value={day.toString()}
                              className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100"
                            >
                              {day}
                            </SelectItem>
                          )
                        )}
                      </div>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-500">of each month</span>
              </div>
            </div>
          </div>
        )}

        {/* Custom Date Picker */}
        {frequency === TaskFrequency.CUSTOM && (
          <>
            {showPicker ? (
              // Show the date picker when showPicker is true
              <div ref={pickerRef} className="relative z-10 ">
                <DateRangePicker
                  ranges={selectedDates}
                  onChange={handleSelect}
                  showDateDisplay={true}
                  rangeColors={['#3D91FF']}
                  className="w-[500px] border border-gray-200 shadow-lg "
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPicker(false)}
                    className="mr-2"
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={applyCustomDates}>
                    Apply
                  </Button>
                </div>
              </div>
            ) : (
              selectedDateRange && (
                <div
                  className="mb-2 flex cursor-pointer items-center gap-2 text-sm text-gray-600"
                  onClick={() => setShowPicker(true)}
                >
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <span>
                    Selected Range: {selectedDateRange.startDate} to{' '}
                    {selectedDateRange.endDate}
                  </span>
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700">Description</h2>
          <Info className="h-4 w-4 text-gray-400" />
        </div>
        {editingDesc ? (
          <Textarea
            ref={descTextareaRef}
            value={tempDesc}
            onChange={(e) => setTempDesc(e.target.value)}
            onBlur={async () => {
              if (tempDesc !== localTask.description) {
                setLocalTask({ ...localTask, description: tempDesc });
                try {
                  await onUpdate({ description: tempDesc });
                } catch (error) {
                  console.error('Failed to update description:', error);
                }
              }
              setEditingDesc(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                descTextareaRef.current?.blur();
              }
            }}
            className="text-sm text-gray-600"
            rows={4}
          />
        ) : (
          <p
            className="cursor-pointer whitespace-pre-wrap rounded p-1 text-sm text-gray-600 hover:bg-gray-100"
            onClick={() => setEditingDesc(true)}
          >
            {localTask.description || 'No description provided.'}
          </p>
        )}
      </div>

      {/* History Section */}
      {localTask?.history && localTask.history.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">History</h2>
          <div className="space-y-2">
            {/* Create a new array before sorting */}
            {[...localTask.history]
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map((entry, index) => (
                <div key={index} className="flex items-center gap-4">
                  {/* Badge with Status */}
                  <div
                    className={`flex items-center gap-3 rounded-lg border border-gray-200 bg-green-50 px-4 py-2 text-sm  font-medium ${
                      entry.completed
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {/* Status Indicator */}
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        entry.completed ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    />
                    <span className="text-gray-700">
                      {moment(entry.date).format('MMM DD, YYYY h:mm A')}
                    </span>
                    <span
                      className={`font-semibold ${
                        entry.completed ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {entry.completed ? 'Completed' : 'Incomplete'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
