'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Star,
  UserRoundCheck,
  MessageSquareText
} from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Calendar } from '@/components/ui/calendar';
import { useSelector } from 'react-redux';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { useToast } from '@/components/ui/use-toast';
import moment from 'moment';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  ArrowRight,
  CircleUser,
  Timer
} from 'lucide-react';
import { usePollTasks } from '@/hooks/usePolling';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { updateTask } from '@/redux/features/allTaskSlice';

type Task = {
  _id: string;
  taskName: string;
  dueDate: string;
  important: boolean;
  author: {
    name: string;
  };
  assigned: {
    name: string;
  };
  updatedAt: string;
  status: string;
  seen?: boolean;
};

type CalendarViewType = 'month' | 'week' | 'day';

export default function TaskPlanner() {
  const { user } = useSelector((state: any) => state.auth);
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(moment());
  const [calendarView, setCalendarView] = useState<CalendarViewType>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [optimisticTasks, setOptimisticTasks] = useState<Record<string, Partial<Task>>>({});

  const { tasks } = useSelector((state: RootState) => state.alltasks);

  // Apply optimistic updates to tasks
  const tasksWithOptimisticUpdates = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    
    return tasks.map(task => {
      if (optimisticTasks[task._id]) {
        return { ...task, ...optimisticTasks[task._id] };
      }
      return task;
    });
  }, [tasks, optimisticTasks]);

  // Filtering tasks with optimistic updates applied
  useEffect(() => {
    const filterTasks = () => {
      const baseFiltered = tasksWithOptimisticUpdates.filter((task) => {
        if (!task) return false;

        const taskNameMatches = (task.taskName?.toLowerCase() || '').includes(
          searchTerm.toLowerCase()
        );
        const isPending = task.status === 'pending';
        if (!task.dueDate) return false;

        const dueDate = moment(task.dueDate);

        // Filter based on calendar view
        if (calendarView === 'month') {
          const monthStart = currentDate.clone().startOf('month');
          const monthEnd = currentDate.clone().endOf('month');
          if (!dueDate.isBetween(monthStart, monthEnd, null, '[]'))
            return false;
        } else if (calendarView === 'week') {
          const weekStart = currentDate.clone().startOf('week');
          const weekEnd = currentDate.clone().endOf('week');
          if (!dueDate.isBetween(weekStart, weekEnd, null, '[]')) return false;
        } else if (calendarView === 'day') {
          if (!dueDate.isSame(currentDate, 'day')) return false;
        }

        return taskNameMatches && isPending;
      });

      const sorted = baseFiltered.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      setFilteredTasks(sorted);
    };

    filterTasks();
  }, [searchTerm, tasksWithOptimisticUpdates, currentDate, calendarView]);

  // Polling hook with optimistic updates
  usePollTasks({
    userId: user._id,
    tasks,
    setOptimisticTasks,
  });

  // Update task with optimistic UI
  const updateTaskOptimistically = useCallback((taskId: string, updates: Partial<Task>) => {
    setOptimisticTasks(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], ...updates }
    }));
  }, []);

  // Open task details with optimistic UI update
  const openTaskDetails = async (task: Task) => {
    // Only need to mark as seen if the user is not the author
    if (user?._id !== task?.author?._id && !task.seen) {
      updateTaskOptimistically(task._id, { seen: true });
      
      try {

        await dispatch(updateTask({
                  taskId: task?._id.toString(),
                  taskData: { seen: true }
                })).unwrap();;
      } catch (error) {
        console.error("Error marking task as seen:", error);
        setOptimisticTasks(prev => {
          const newOptimistic = { ...prev };
          delete newOptimistic[task._id];
          return newOptimistic;
        });
        
        toast({
          variant: 'destructive',
          title: 'Failed to update task',
          description: 'Please try again'
        });
      }
    }
    
    // Navigate to task details
    navigate(`/dashboard/task-details/${task._id}`);
  };

  // Navigation functions
  const nextView = () => {
    if (calendarView === 'month') {
      setCurrentDate(currentDate.clone().add(1, 'month'));
    } else if (calendarView === 'week') {
      setCurrentDate(currentDate.clone().add(1, 'week'));
    } else {
      setCurrentDate(currentDate.clone().add(1, 'day'));
    }
  };

  const prevView = () => {
    if (calendarView === 'month') {
      setCurrentDate(currentDate.clone().subtract(1, 'month'));
    } else if (calendarView === 'week') {
      setCurrentDate(currentDate.clone().subtract(1, 'week'));
    } else {
      setCurrentDate(currentDate.clone().subtract(1, 'day'));
    }
  };

  // Render header
  const renderHeader = () => {
    let dateDisplay;

    if (calendarView === 'month') {
      dateDisplay = currentDate.format('MMMM YYYY');
    } else if (calendarView === 'week') {
      dateDisplay = `${currentDate.clone().startOf('week').format('MMM D, YYYY')} - ${currentDate.clone().endOf('week').format('MMM D, YYYY')}`;
    } else {
      dateDisplay = currentDate.format('dddd, MMMM D, YYYY');
    }

    return (
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="default"
          onClick={prevView}
          className="max-md:scale-75"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-[15px] font-semibold lg:text-xl">{dateDisplay}</h2>
        <Button
          variant="default"
          onClick={nextView}
          className="max-md:scale-75"
        >
          <ChevronRight className="h-4 md:w-4" />
        </Button>
      </div>
    );
  };

  // Render days of week for month view
  const renderDays = () => {
    const days: JSX.Element[] = [];
    const startDate = currentDate.clone().startOf('week');

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-semibold">
          {startDate.clone().add(i, 'days').format('ddd')}
        </div>
      );
    }

    return <div className="mb-2 grid grid-cols-7 gap-2">{days}</div>;
  };

  // Render cells for month view
  const renderCells = () => {
    const monthStart = currentDate.clone().startOf('month');
    const monthEnd = currentDate.clone().endOf('month');
    const startDate = currentDate.clone().startOf('month').startOf('week');
    const endDate = currentDate.clone().endOf('month').endOf('week');

    const rows: JSX.Element[] = [];
    let days: JSX.Element[] = [];

    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day.clone();
        const dayTasks = Array.isArray(filteredTasks)
        ? filteredTasks.filter((task) =>
          task?.dueDate && moment(task.dueDate).isSame(cloneDay, 'day')
        ): [];

        days.push(
          <div
            key={day.toString()}
            className={`my-1 flex min-h-[80px] flex-col rounded-sm border p-2 ${
              !day.isSame(monthStart, 'month')
                ? 'text-gray-400'
                : day.isSame(moment(), 'day')
                  ? 'bg-blue-100'
                  : ''
            } cursor-pointer`}
            onClick={() => {
              setCurrentDate(cloneDay);
              setSelectedDate(cloneDay);
            }}
          >
            <span className="float-right mb-1">{day.format('D')}</span>
            <div className="flex-1 overflow-y-auto">
              {dayTasks.map((task) => (
                <div
                  key={task._id}
                  className={`mb-1 w-full truncate rounded p-1 text-xs font-semibold max-lg:hidden ${
                      task.importantBy?.includes(user?._id) ?  'bg-orange-400' : 'bg-green-400'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    openTaskDetails(task);
                  }}
                >
                  {task.taskName}
                </div>
              ))}
            </div>
          </div>
        );
        day = day.clone().add(1, 'day');
      }
      rows.push(
        <div
          key={day.toString()}
          className="grid grid-cols-7 gap-2"
          style={{ minHeight: '120px' }} // Minimum height for each row
        >
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="mb-4 max-h-[calc(96vh-300px)] overflow-y-auto">
        {rows}
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    let days: JSX.Element[] = [];
    const startDate = currentDate.clone().startOf('week');

    for (let i = 0; i < 7; i++) {
      const day = startDate.clone().add(i, 'days');
      const dayTasks = Array.isArray(filteredTasks)
      ? filteredTasks.filter((task) =>
        moment(task.dueDate).isSame(day, 'day')
      ): [];

      days.push(
        <div
          key={i}
          className={`my-1 flex min-h-[150px] flex-col rounded-sm border p-2 ${
            !day.isSame(currentDate, 'month')
              ? 'text-gray-400'
              : day.isSame(moment(), 'day')
                ? 'bg-blue-100'
                : ''
          } cursor-pointer`}
          onClick={() => {
            setCurrentDate(day);
            setSelectedDate(day);
          }}
        >
          <div className="mb-2 font-semibold max-lg:hidden">
            {day.format('ddd, MMM D')}
          </div>
          <div className="flex-1 overflow-y-auto">
            {dayTasks.map((task) => (
              <div
                key={task._id}
                className={`mb-1 w-full truncate rounded p-1 text-xs font-semibold max-lg:hidden ${
                  task.importantBy?.includes(user?._id) ?  'bg-orange-400' : 'bg-green-400'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  openTaskDetails(task);
                }}
              >
                {task.taskName}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="grid max-h-[calc(96vh-300px)] grid-cols-7 gap-2 overflow-y-auto">
        {days}
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    return (
      <ScrollArea className="max-h-[calc(98vh-280px)] overflow-y-auto">
        {Array.isArray(filteredTasks) &&
          filteredTasks
            .filter((task) => moment(task.dueDate).isSame(currentDate, 'day'))
            .map((task) => (
              <Card
                key={task._id}
                className="mb-4 cursor-pointer"
                onClick={() => openTaskDetails(task)}
              >
                <div
                  className={`flex items-center space-x-2 rounded-lg border border-gray-200 p-3 shadow-md
                    ${user?._id === task.assigned?._id && !task.seen ? 'bg-blue-100' : 
                      task.importantBy?.includes(user?._id) ? 'bg-orange-100' : 'bg-white'}
                  `}
                >
                  <div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
                    <div className="flex w-full flex-row items-center justify-between gap-2">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`flex-1 max-lg:text-xs ${
                            task.status === 'completed'
                              ? 'text-gray-500 line-through '
                              : ''
                          }`}
                        >
                          {task.taskName}
                        </span>
                      </div>
                      <div className="flex flex-row gap-8">
                        <div className="flex items-center justify-center gap-2 max-lg:hidden">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge
                                  variant="outline"
                                  className="flex items-center gap-1 bg-green-100 text-black"
                                >
                                  <UserRoundCheck className="h-3 w-3" />
                                  <span className="truncate">
                                    {task?.author?.name}
                                  </span>
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Created By {task?.author?.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <Badge>
                            <ArrowRight className="h-3 w-3" />
                          </Badge>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge
                                  variant="outline"
                                  className="flex items-center gap-1 bg-purple-100 text-black"
                                >
                                  <CircleUser className="h-3 w-3" />
                                  <span className="truncate">
                                    {task?.assigned?.name}
                                  </span>
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Assigned To {task?.assigned?.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge
                                  variant="outline"
                                  className="flex items-center gap-1 bg-red-700 text-white"
                                >
                                  <span className="truncate">
                                    <div className="flex flex-row gap-1">
                                      {moment(task.dueDate).format(
                                        'MMM Do YYYY'
                                      )}{' '}
                                    </div>
                                  </span>
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Deadline</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-1 lg:hidden">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 bg-green-100 px-2 py-1 text-[6px] text-black  lg:text-xs"
                            >
                              <UserRoundCheck className="h-2.5 w-2.5" />
                              {task?.author?.name}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              Created By {task?.author?.name}
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
                              className="flex items-center gap-1  bg-purple-100 px-2 py-1 text-[6px] text-black  lg:text-xs"
                            >
                              <CircleUser className="h-2.5 w-2.5" />
                              {task?.assigned?.name}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              Assigned To {task?.assigned?.name}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 bg-red-700 px-2 py-1 text-[6px] text-white  lg:text-xs"
                            >
                              <Calendar className="h-2.5 w-2.5" />
                              {moment(task.dueDate).format('MMM Do YYYY')}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Deadline</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
      </ScrollArea>
    );
  };

  // Render tasks for mobile view
  const renderMobileTasks = () => {
    let filteredTasksForView = [];

    if (Array.isArray(filteredTasks)) {
      if (calendarView === 'month') {
        const monthStart = currentDate.clone().startOf('month');
        const monthEnd = currentDate.clone().endOf('month');

        filteredTasksForView = filteredTasks.filter(
          (task) =>
            moment(task.dueDate).isSame(currentDate, 'day') &&
            moment(task.dueDate).isBetween(monthStart, monthEnd, null, '[]')
        );
      } else if (calendarView === 'week') {
        const weekStart = currentDate.clone().startOf('week');
        const weekEnd = currentDate.clone().endOf('week');

        filteredTasksForView = filteredTasks.filter(
          (task) =>
            moment(task.dueDate).isSame(currentDate, 'day') &&
            moment(task.dueDate).isBetween(weekStart, weekEnd, null, '[]')
        );
      }
    }

    return (
      <div className="lg:hidden">
        <h2 className="mb-4 text-lg font-semibold">
          {calendarView === 'month' ? 'Monthly Tasks' : 'Weekly Tasks'}
        </h2>
        <ScrollArea className="h-[calc(100vh-200px)] pb-8">
          {filteredTasksForView.map((task) => (
            <Card
              key={task._id}
              className="mb-4 cursor-pointer"
              onClick={() => openTaskDetails(task)}
            >
              <CardHeader>
                <CardTitle className="text-md md:text-lg">
                  {task.taskName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span className="text-sm">
                    {moment(task.dueDate).format('ddd, MMM D, YYYY')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-2 md:p-8">
      <div className="mb-4 flex flex-col items-center justify-between md:flex-row">
        <h1 className="text-2xl font-bold">Task Planner</h1>
        <div className="flex flex-col items-center justify-center gap-2 space-x-2 md:flex-row">
          <Tabs
            value={calendarView}
            onValueChange={(value: CalendarViewType) => setCalendarView(value)}
          >
            <TabsList className="border border-gray-200">
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex w-full flex-row items-center justify-between gap-4 max-md:hidden">
            <Popover>
              <PopoverTrigger>
                <Button variant="outline" className="h-8">
                  <CalendarIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={selectedDate.toDate()}
                  onSelect={(date) => {
                    if (date) {
                      setCurrentDate(moment(date));
                      setSelectedDate(moment(date));
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="mb-4 flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex flex-col">
        {renderHeader()}
        <>
          {calendarView === 'month' && (
            <>
              {renderDays()}
              {renderCells()}
            </>
          )}
          {calendarView === 'week' && renderWeekView()}
          {calendarView === 'day' && renderDayView()}
          {renderMobileTasks()}
        </>
      </div>
    </div>
  );
}