import { useEffect, useState } from 'react';
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  parse
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  UserRoundCheck,
  ArrowRight,
  CircleUser
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import axiosInstance from '../../lib/axios';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useFetchPlannerMonthQuery,
  useFetchPlannerWeekQuery
} from '@/redux/features/taskSlice';

type Task = {
  _id: string;
  taskName: string;
  dueDate: Date;
  important: boolean;
  author: {
    name: string;
  };
  assigned: {
    name: string;
  };
};

type CalendarViewType = 'month' | 'week' | 'day';

export default function TaskPlanner() {
  const { user } = useSelector((state: any) => state.auth);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<CalendarViewType>('month');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const year = moment(currentDate).format('YYYY');
  const month = moment(currentDate).format('MM');
  const week = moment(currentDate).isoWeek();
  const fetchTasks = async () => {
    try {
      // if (calendarView === 'month') {
      //   const response = await axiosInstance(
      //     `/task/planner/${year}/${month}/${user._id}`
      //   );
      //   setTasks(response.data.data);
      // }
      // if (calendarView === 'week') {
      //   const response = await axiosInstance(
      //     `/task/planner/week/${year}/${week}/${user._id}`
      //   );
      //   setTasks(response.data.data);
      // }
      if (calendarView === 'day') {
        const formattedDate = currentDate.toISOString().split('T')[0];
        const response = await axiosInstance(
          `/task/planner/day/${formattedDate}/${user._id}`
        );
        setTasks(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const filteredTasks = (tasks || []).filter((task) =>
    task.taskName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchTasks();
  }, [currentDate]);

  const {
    data: monthTasks,
    isLoading: isMonthLoading,
    isError: isMonthError
  } = useFetchPlannerMonthQuery({ year, month, userId: user._id });

  // const {
  //   data: weekTasks,
  //   isLoading: isWeekLoading,
  //   isError: isWeekError
  // } = useFetchPlannerWeekQuery({ year, week, userId: user._id });

  useEffect(() => {
    const fetchTasks = () => {
      try {
        if (calendarView === 'month') {
          if (isMonthError) throw new Error('Failed to fetch month tasks');
          setTasks(monthTasks?.data || []);
        }
        // else if (calendarView === 'week') {
        //   if (isWeekError) throw new Error('Failed to fetch week tasks');
        //   setTasks(weekTasks?.data || []);
        // }
        // else if (calendarView === 'day') {
        //   if (isDayError) throw new Error('Failed to fetch day tasks');
        //   setTasks(dayTasks?.data || []);
        // }
      } catch (error) {
        console.error(error);
        setTasks([]); // Fallback to an empty array in case of errors
      }
    };

    fetchTasks();
  }, [
    calendarView,
    isMonthError,
    monthTasks
    // weekTasks,
    // dayTasks,
    // isWeekError,
    // isDayError
  ]);

  const renderHeader = () => {
    let dateDisplay;

    if (calendarView === 'month') {
      dateDisplay = format(currentDate, 'MMMM yyyy'); // Month view
    } else if (calendarView === 'week') {
      const startDate = startOfWeek(currentDate); // Start of the week
      const endDate = addDays(startDate, 6); // 7th day (end of the week)
      dateDisplay = `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
    } else {
      dateDisplay = format(currentDate, 'EEEE, MMMM d, yyyy'); // Day view
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

  const renderDays = () => {
    const dateFormat = 'EEE';
    const days: React.ReactNode[] = [];
    let startDate = startOfWeek(currentDate);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-semibold">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="mb-2 grid grid-cols-7 gap-2">{days}</div>;
  };

  const nextView = () => {
    if (calendarView === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (calendarView === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const prevView = () => {
    if (calendarView === 'month') {
      setCurrentDate(addMonths(currentDate, -1));
    } else if (calendarView === 'week') {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const dateFormat = 'd';
    const rows: React.ReactNode[] = [];
    let days: React.ReactNode[] = [];
    let day = startDate;
    let formattedDate = '';
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        days.push(
          <div
            key={day.toString()}
            className={`my-1 rounded-sm border p-2  ${
              !isSameMonth(day, monthStart)
                ? 'text-gray-400'
                : isSameDay(day, new Date())
                  ? 'bg-blue-100'
                  : ''
            } cursor-pointer`}
            onClick={() =>
              onDateClick(parse(formattedDate, dateFormat, new Date()))
            }
          >
            <span className="float-right">{formattedDate}</span>
            <ScrollArea className="mt-2 lg:h-16 ">
              {filteredTasks
                .filter((task) => isSameDay(task.dueDate, cloneDay))
                .slice(0, 3)
                .map((task) => (
                  <div
                    key={task._id}
                    className={`mb-1 rounded p-1 text-xs font-semibold  max-lg:hidden ${task?.important ? 'bg-orange-400' : 'bg-green-400'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTask(task);
                    }}
                  >
                    {task.taskName}
                  </div>
                ))}
              {filteredTasks.filter((task) => isSameDay(task.dueDate, cloneDay))
                .length > 3 && (
                <div className="text-xs font-semibold text-gray-500">
                  +
                  {filteredTasks.filter((task) =>
                    isSameDay(task.dueDate, cloneDay)
                  ).length - 3}{' '}
                  more
                </div>
              )}
            </ScrollArea>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-2">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="mb-4">{rows}</div>;
  };

  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate);
    const endDate = addDays(startDate, 6);
    const days: React.ReactNode[] = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i);
      days.push(
        <div key={i} className="p-2 lg:border ">
          <div className="mb-2 font-semibold max-lg:hidden">
            {format(day, 'EEE, MMM,YYY ')}
          </div>
          <ScrollArea className=" lg:h-40">
            {filteredTasks
              .filter((task) => isSameDay(task.dueDate, day))
              .map((task) => (
                <div
                  key={task._id}
                  className={`mb-2 rounded p-2 max-lg:hidden ${task?.important ? 'bg-orange-400' : 'bg-green-400'} cursor-pointer`}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="text-xs font-semibold">{task.taskName}</div>
                </div>
              ))}
          </ScrollArea>
        </div>
      );
    }
    return <div className="grid grid-cols-7 gap-2">{days}</div>;
  };

  const renderDayView = () => {
    return (
      <ScrollArea className="h-[calc(100vh-200px)] ">
        {filteredTasks
          .filter((task) => isSameDay(task.dueDate, currentDate))
          .map((task) => (
            <Card
              key={task._id}
              className="mb-4 cursor-pointer"
              onClick={() => setSelectedTask(task)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{task.taskName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-2 flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span className="text-sm">
                    {format(task.dueDate, 'EEE, MMM d, yyyy')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
      </ScrollArea>
    );
  };

  const renderDueTasksForSmallScreen = () => {
    let filteredTasksForView: Task[] = [];

    if (calendarView === 'month') {
      // Filter tasks for the entire month
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(monthStart);
      filteredTasksForView = filteredTasks.filter((task) => {
        const taskDueDate = new Date(task.dueDate); // Convert dueDate to Date object
        return taskDueDate >= monthStart && taskDueDate <= monthEnd;
      });
    } else if (calendarView === 'week') {
      // Filter tasks for the current week
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      filteredTasksForView = filteredTasks.filter((task) => {
        const taskDueDate = new Date(task.dueDate); // Convert dueDate to Date object
        return taskDueDate >= weekStart && taskDueDate <= weekEnd;
      });
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
              onClick={() => setSelectedTask(task)}
            >
              <CardHeader>
                <CardTitle className="text-md md:text-lg">
                  {task.taskName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=" flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  <span className="text-sm">
                    {format(new Date(task.dueDate), 'EEE, MMM d, yyyy')}{' '}
                    {/* Convert dueDate to Date object */}
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
      <div className="mb-4 flex flex-col items-center  justify-between md:flex-row">
        <h1 className="text-2xl font-bold">Task Planner</h1>
        <div className="flex flex-col items-center justify-center gap-2 space-x-2  md:flex-row">
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
          <div className="flex w-full flex-row items-center  justify-between gap-4 max-md:hidden">
            <Button
              variant="outline"
              onClick={() => {
                const today = new Date();
                setCurrentDate(today);
                setSelectedDate(today);
              }}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Today
            </Button>
            <Popover>
              <PopoverTrigger>
                <Button variant="outline">
                  <CalendarIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setCurrentDate(date);
                      setSelectedDate(date);
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
          />
        </div>
      </div>
      <div className="flex flex-col">
        {renderHeader()}
        <div className={calendarView === 'month' ? 'max-md:hidden' : ''}>
          {calendarView === 'month' && renderDays()}
          {calendarView === 'month' && renderCells()}
        </div>
        {calendarView === 'week' && renderWeekView()}

        {calendarView === 'day' && renderDayView()}
        {renderDueTasksForSmallScreen()}
      </div>

      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask?.taskName}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-3">
              <Badge
                variant="outline"
                className="flex items-center gap-1 bg-indigo-600"
              >
                <UserRoundCheck className="h-3 w-3" />
                {selectedTask?.author.name}
              </Badge>
              <Badge variant="outline" className={'bg-black'}>
                <ArrowRight className="h-3 w-3 " />
              </Badge>
              <Badge
                variant="outline"
                className="flex items-center gap-1 bg-sky-600"
              >
                <CircleUser className="h-3 w-3" />
                {selectedTask?.assigned?.name}
              </Badge>
              <Badge
                variant={'outline'}
                className="flex items-center gap-1 bg-red-700 text-white"
              >
                {moment(selectedTask?.dueDate).format('MMM Do YYYY')}
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
