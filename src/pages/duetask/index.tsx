import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import PageHead from '@/components/shared/page-head.jsx';
import { useSelector } from 'react-redux';
import axiosInstance from '../../lib/axios';
import { useCallback, useEffect, useState } from 'react';
import TaskList from '@/components/shared/task-list';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import DynamicPagination from '@/components/shared/DynamicPagination';
// import { CalendarIcon } from 'lucide-react';
// import { Calendar } from '@/components/ui/calendar';
// import { cn } from '@/lib/utils';
// import { format } from 'date-fns';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger
// } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
// import { DateRange } from 'react-day-picker';
// import moment from 'moment';

export default function DueTaskPage() {
  const { user } = useSelector((state: any) => state.auth);
  const { toast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<'name' | 'unread' | 'recent'>('unread');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');

  // const [date, setDate] = useState<DateRange | undefined>({
  //   from: new Date(2024, 10, 1),
  //   to: addDays(new Date(2024, 10, 1), 30)
  // });

  // const [date, setDate] = useState<DateRange | undefined>({
  //   from: moment().toDate(), // Today's date
  //   to: moment().add(30, 'days').toDate() // 30 days from today
  // });

  const fetchDueTasks = useCallback(
    async (page, entriesPerPage, searchTerm = '', sortOrder = 'desc') => {
      try {
        const sortQuery = sortOrder === 'asc' ? 'dueDate' : '-dueDate';
        // Include date range in the request
        // const dateQuery = date
        //   ? {
        //     start: date.from ? moment(date.from).startOf('day').toISOString() : undefined,
        //     end: date.to ? moment(date.to).endOf('day').toISOString() : undefined,
        //   }
        //   : {};
        const res = await axiosInstance.get(
          `/task/duetasks/${user._id}?page=${page}&limit=${entriesPerPage}&searchTerm=${searchTerm}&sort=${sortQuery}`
          // {
          //   params: dateQuery, // Add date range to query parameters
          // }
        );
        setTasks(res.data.data.result);
        setTotalPages(res.data.data.meta.totalPage);
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  useEffect(() => {
    fetchDueTasks(currentPage, entriesPerPage, searchTerm, sortOrder);
    const intervalId = setInterval(() => {
      fetchDueTasks(currentPage, entriesPerPage, searchTerm, sortOrder);
    }, 30000); // 30 seconds

    // const timeoutId = setTimeout(() => {
    //   clearInterval(intervalId);
    // }, 3600000); // 1 hour

    // Cleanup on component unmount
    return () => {
      // clearInterval(intervalId);
      clearTimeout(intervalId);
    };
  }, [currentPage, entriesPerPage, searchTerm, sortOrder, user]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // const handleEntriesPerPageChange = (event) => {
  //   setEntriesPerPage(Number(event.target.value));
  //   setCurrentPage(1); // Reset to first page when changing entries per page
  // };

  const filteredGroups = tasks
    .filter((task) =>
      task?.taskName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.taskName.localeCompare(b.taskName)
          : b.taskName.localeCompare(a.taskName);
      } else if (sortBy === 'unread') {
        return sortOrder === 'asc'
          ? (b.unreadMessageCount || 0) - (a.unreadMessageCount || 0)
          : (a.unreadMessageCount || 0) - (b.unreadMessageCount || 0);
      } else if (sortBy === 'recent') {
        return sortOrder === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

  const handleSortToggle = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    fetchDueTasks(currentPage, entriesPerPage, searchTerm, newSortOrder); // Fetch with the new sort order
  };

  const handleMarkAsImportant = async (taskId) => {
    const task: any = tasks.find((t: any) => t._id === taskId);

    const response = await axiosInstance.patch(
      `/task/${taskId}`,
      { important: !task.important } // Toggle important status
    );

    if (response.data.success) {
      fetchDueTasks(currentPage, entriesPerPage, searchTerm, sortOrder);
      toast({
        title: 'Task Updated',
        description: 'Thank You'
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Something Went Wrong!'
      });
    }
  };

  const handleToggleTaskCompletion = async (taskId) => {
    const task: any = tasks.find((t: any) => t._id === taskId);

    const response = await axiosInstance.patch(`/task/${taskId}`, {
      status: task?.status === 'completed' ? 'pending' : 'completed'
    });

    if (response.data.success) {
      fetchDueTasks(currentPage, entriesPerPage, searchTerm, sortOrder);
      toast({
        title: 'Task Updated',
        description: 'Thank You'
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Something Went Wrong!'
      });
    }
  };

  return (
    <div className="p-4 md:p-8">
      <PageHead title="Overdue" />
      <Breadcrumbs
        items={[
          { title: 'Dashboard', link: '/dashboard' },
          { title: 'Overdue', link: '/duetask' }
        ]}
      />
      <div className="my-2 flex justify-between gap-2">
        <Input
          placeholder="Search task..."
          value={searchTerm}
          onChange={handleSearch}
        />

        <Button>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex min-w-fit flex-row">
              {sortBy || 'sort'} {sortOrder === 'asc' ? '↑' : '↓'}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSortBy('name');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                Name
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSortBy('unread');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                New Message
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSortBy('recent');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                Date Created
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Button>
        <div>
          <DynamicPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      {/* <div className="my-2 flex gap-2">
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={'outline'}
                className={cn(
                  'w-[300px] justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, 'LLL dd, y')} -{' '}
                      {format(date.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(date.from, 'LLL dd, y')
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button variant={'outline'}   
        onClick={() => fetchDueTasks(currentPage, entriesPerPage, searchTerm, sortOrder)}
        >Generate</Button>
      </div> */}
      <TaskList
        tasks={tasks}
        onMarkAsImportant={handleMarkAsImportant}
        onToggleTaskCompletion={handleToggleTaskCompletion}
        fetchTasks={fetchDueTasks}
      />
    </div>
  );
}
