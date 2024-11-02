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
  // @ts-ignore
  const [calendarView, setCalendarView] = useState<CalendarViewType>('month');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTasks = async () => {
    const year = moment(currentDate).format('YYYY'); // Get the year in YYYY format
    const month = moment(currentDate).format('MM'); // Get the month in MM format
    const week = moment(currentDate).isoWeek();

    try {
      if (calendarView === 'month') {
        const response = await axiosInstance(
          `/task/planner/${year}/${month}/${user._id}`
        );
        setTasks(response.data.data);
      }
      if (calendarView === 'week') {
        const response = await axiosInstance(
          `/task/planner/week/${year}/${week}/${user._id}`
        );
        setTasks(response.data.data);
      }
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
  }, [currentDate]); // Re-fetch tasks whenever the current date changes

  const renderHeader = () => {
    const dateFormat =
      calendarView === 'month'
        ? 'MMMM yyyy'
        : calendarView === 'week'
          ? 'MMM d, yyyy'
          : 'EEEE, MMMM d, yyyy';
    return (
      <div className="mb-4 flex items-center justify-between">
        <Button variant="outline" onClick={prevView}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">
          {format(currentDate, dateFormat)}
        </h2>
        <Button variant="outline" onClick={nextView}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = 'EEE';
    const days: React.ReactNode[] = []; // Explicitly define the type here
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
            className={`my-1 rounded-sm border p-2 ${
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
            <ScrollArea className="mt-2 h-24">
              {filteredTasks
                .filter((task) => isSameDay(task.dueDate, cloneDay))
                .slice(0, 3)
                .map((task) => (
                  <div
                    key={task._id}
                    className={`mb-1 rounded p-1 text-xs font-semibold ${task?.important ? 'bg-orange-400' : 'bg-green-400'}`}
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
    const days: React.ReactNode[] = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i);
      days.push(
        <div key={i} className="border p-2">
          <div className="mb-2 font-semibold">{format(day, 'EEE, MMM d')}</div>
          <ScrollArea className="h-96">
            {filteredTasks
              .filter((task) => isSameDay(task.dueDate, day))
              .map((task) => (
                <div
                  key={task._id}
                  className={`mb-2 rounded p-2 ${task?.important ? 'bg-orange-400' : 'bg-green-400'} cursor-pointer`}
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
      <ScrollArea className="h-[calc(100vh-200px)]">
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
                    {format(task.dueDate, 'HH:mm')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
      </ScrollArea>
    );
  };

  const onDateClick = (day: Date) => {
    setSelectedDate(day);
    setCurrentDate(day);
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

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Task Planner</h1>
        <div className="flex space-x-2">
          {/* <Tabs value={calendarView} onValueChange={(value: CalendarViewType) => setCalendarView(value)}>
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
          </Tabs> */}
          <Button
            variant="outline"
            onClick={() => {
              const today = new Date();
              setCurrentDate(today);
              setSelectedDate(today); // Set selected date to today for highlighting
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
      <div className="mb-4 flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {renderHeader()}
      {calendarView === 'month' && renderDays()}
      {calendarView === 'month' && renderCells()}
      {calendarView === 'week' && renderWeekView()}
      {calendarView === 'day' && renderDayView()}

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
