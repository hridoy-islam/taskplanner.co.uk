'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import moment from 'moment';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';

type Task = {
  _id: string;
  taskName: string;
  dueDate: string;
  important: boolean;
  importantBy?: string[];
  author: {
    name: string;
    _id: string;
  };
  assigned: {
    name: string;
    _id: string;
  };
  updatedAt: string;
  status: string;
  seen?: boolean;
};

export default function StaffTaskPlanner() {
  const navigate = useNavigate();
  const { uid: userId } = useParams();
  const [currentDate, setCurrentDate] = useState(moment());
  const [tasks, setTasks] = useState<Task[]>([]);

  // Calculate year and month for fetching
  const year = currentDate.format('YYYY');
  const month = currentDate.format('MM'); // Using 2-digit month

  // Fetch API call using the requested route format
  const fetchTasks = useCallback(async () => {
    if (!userId) return [];
    try {
      const response = await axiosInstance.get(
        `/task/planner/${year}/${month}/${userId}`
      );
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }, [year, month, userId]);

  // Initial fetch & 1-minute Polling
  useEffect(() => {
    let isMounted = true;

    const getInitialTasks = async () => {
      const data = await fetchTasks();
      if (isMounted) setTasks(data);
    };

    getInitialTasks();

    // Poll every 1 minute
    const intervalId = setInterval(async () => {
      const newData = await fetchTasks();
      
      if (isMounted) {
        setTasks((prevTasks) => {
          const prevMap = new Map(prevTasks.map((t) => [t._id, t]));
          let hasChanges = false;
          const updatedTasks = [...prevTasks];

          newData.forEach((newTask: Task) => {
            const existingTask = prevMap.get(newTask._id);
            if (!existingTask || existingTask.updatedAt !== newTask.updatedAt) {
              if (!existingTask) {
                updatedTasks.push(newTask);
              } else {
                const index = updatedTasks.findIndex((t) => t._id === newTask._id);
                if (index !== -1) updatedTasks[index] = newTask;
              }
              hasChanges = true;
            }
          });

          return hasChanges ? updatedTasks : prevTasks;
        });
      }
    }, 60000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [fetchTasks]);

  // Generate days array for the current month columns
  const daysInMonth = currentDate.daysInMonth();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) =>
    currentDate.clone().date(i + 1)
  );

  // Memoize task mapping to days to prevent expensive re-renders
  const tasksByDay = useMemo(() => {
    const map: Record<string, Task[]> = {};
    
    daysArray.forEach((day) => {
      map[day.format('YYYY-MM-DD')] = [];
    });

    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const taskDate = moment(task.dueDate).format('YYYY-MM-DD');
      if (map[taskDate]) {
        map[taskDate].push(task);
      }
    });

    // Sort tasks in each day by recently updated
    Object.values(map).forEach((dayTasks) => {
      dayTasks.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });

    return map;
  }, [tasks, currentDate]);

  const nextMonth = () => setCurrentDate(currentDate.clone().add(1, 'month'));
  const prevMonth = () => setCurrentDate(currentDate.clone().subtract(1, 'month'));

  const openTaskDetails = (task: Task) => {
    navigate(`/company/${userId}/task-details/${task._id}`);
  };

  // Truncate text after 60 characters
  const truncateName = (name: string) => {
    return name.length > 60 ? name.substring(0, 60) + '...' : name;
  };

  // Modern UI Card Styling
  const getTaskStyles = (task: Task) => {
    if (task.importantBy?.includes(userId || ''))
      return 'bg-orange-50 border-orange-200 text-orange-900 border-l-4 border-l-orange-500'; 
    
    if (task.status === 'completed') 
      return 'bg-gray-50 border-gray-200 text-gray-500 line-through'; 


  };

  return (
    <div className="flex h-screen flex-col bg-gray-50/30 p-4 md:p-2">
      
      {/* Header & Controls */}
      <div className="mb-3 flex items-center justify-between">
        {/* Left Side: Title */}
        <div className="flex-1">
          {/* <h1 className="text-2xl font-bold tracking-tight text-gray-900">Task Planner</h1> */}
        </div>
        
        {/* Center: Month Slider */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center space-x-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
            <Button variant="ghost" onClick={prevMonth} size="icon" className="h-8 w-8 rounded-full">
              <ChevronLeft className="h-4 w-4 " />
            </Button>
            <h2 className="w-36 text-center text-[15px] font-semibold text-gray-800">
              {currentDate.format('MMMM YYYY')}
            </h2>
            <Button variant="ghost" onClick={nextMonth} size="icon" className="h-8 w-8 rounded-full ">
              <ChevronRight className="h-4 w-4  " />
            </Button>
          </div>
        </div>

        {/* Right Side: Empty div to ensure absolute centering of the slider */}
        <div className="flex-1"></div>
      </div>

      {/* Main UI: Horizontal Kan-ban Style Calendar Grid */}
      <div className="flex-1 overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm custom-scrollbar">
        <div className="flex min-w-max h-full">
          {daysArray.map((day) => {
            const dayKey = day.format('YYYY-MM-DD');
            const dayTasks = tasksByDay[dayKey];
            const isWeekend = day.day() === 0 || day.day() === 6;
            const isToday = day.isSame(moment(), 'day');

            return (
              <div
                key={dayKey}
                // Expanded width (260px) to allow displaying full task names
                className={`flex w-auto min-w-[5vw] shrink-0 flex-col border-r border-gray-100 last:border-r-0 transition-colors ${
                  isWeekend ? 'bg-gray-50/50' : 'bg-white'
                }`}
              >
                {/* Column Header */}
                <div className={`sticky top-0 z-10 flex flex-col items-center justify-center border-b border-gray-100 py-3 backdrop-blur-md ${isToday ? 'bg-blue-50/90' : 'bg-white/90'}`}>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${isToday ? 'text-taskplanner' : 'text-black'}`}>
                    {day.format('ddd')}
                  </span>
                  <span className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${isToday ? 'bg-taskplanner text-white shadow-sm' : 'text-gray-800'}`}>
                    {day.format('D')}
                  </span>
                </div>

                {/* Tasks Column */}
                <div className="flex flex-1 flex-col gap-3 p-3 overflow-y-auto">
                  {dayTasks.map((task) => (
                    <div
                      key={task._id}
                      onClick={() => openTaskDetails(task)}
                      className={`flex cursor-pointer flex-col gap-2 rounded-lg border p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${getTaskStyles(task)}`}
                      title={task.taskName} 
                    >
                      {/* 60 Character Truncated Name */}
                      <span className="text-[13px] font-semibold leading-tight break-words">
                        {truncateName(task.taskName)}
                      </span>
                      
                     
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}