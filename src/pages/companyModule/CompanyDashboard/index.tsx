import { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Calendar,
  Loader2,
  AlertCircle,
  Clock,
  ChevronDown,
  UserPlus,
  CheckCircle2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import moment from 'moment';
import TaskList from './components/tasklist';
import { BlinkingDots } from '@/components/shared/blinking-dots';
import NeedToFinishList from './components/needtofinish-list';
import AssignTaskList from './components/AssignTasklist';

// Type definition for the paginated state
interface TaskCategoryState {
  data: any[];
  page: number;
  hasMore: boolean;
  loading: boolean; // Initial loading (skeleton/spinner)
  loadingMore: boolean; // Button loading (appending)
}

const INITIAL_STATE: TaskCategoryState = {
  data: [],
  page: 1,
  hasMore: true,
  loading: true,
  loadingMore: false
};

const CompanyDashboardPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();

  // --- State Management ---
  const [statsLoading, setStatsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('today');

  // Separate state for each tab to handle pagination independently
  const [todayState, setTodayState] =
    useState<TaskCategoryState>(INITIAL_STATE);
  const [overdueState, setOverdueState] =
    useState<TaskCategoryState>(INITIAL_STATE);
  const [upcomingState, setUpcomingState] =
    useState<TaskCategoryState>(INITIAL_STATE);
  const [assignedState, setAssignedState] =
    useState<TaskCategoryState>(INITIAL_STATE);
  const [finishState, setFinishState] =
    useState<TaskCategoryState>(INITIAL_STATE);

  const PAGE_LIMIT = 10; // Number of items to load per click

  // --- 2. Generic Task Fetcher ---
  const fetchTaskList = useCallback(
    async (
      type: 'today' | 'overdue' | 'upcoming' | 'assigned' | 'finish',
      page: number,
      isLoadMore: boolean
    ) => {
      if (!id) return;

      // Helper to update specific state based on type
      const updateState = (
        updater: (prev: TaskCategoryState) => TaskCategoryState
      ) => {
        if (type === 'today') setTodayState(updater);
        else if (type === 'overdue') setOverdueState(updater);
        else if (type === 'upcoming') setUpcomingState(updater);
        else if (type === 'assigned') setAssignedState(updater);
        else if (type === 'finish') setFinishState(updater);
      };

      // Set Loading State
      updateState((prev) => ({
        ...prev,
        loading: !isLoadMore,
        loadingMore: isLoadMore
      }));

      try {
        let endpoint = '';
        if (type === 'today') endpoint = `/task/today/${id}`;
        if (type === 'overdue') endpoint = `/task/duetasks/${id}`;
        if (type === 'upcoming') endpoint = `/task/upcommingtasks/${id}`;
        if (type === 'assigned') endpoint = `/task/assignedtasks/${id}`;
        if (type === 'finish') endpoint = `/task/needtofinish/${id}`;

        const response = await axiosInstance.get(endpoint, {
          params: { page, limit: PAGE_LIMIT }
        });

        // Normalize Response Data
        let newData = [];
        if (type === 'today') {
          newData = response.data?.data || response.data || [];
        } else {
          // overdue, upcoming, assigned, finish usually return paginated result object
          newData = response.data?.data?.result || response.data || [];
        }

        // --- DEDUPLICATION LOGIC ---
        updateState((prev) => {
          // Create a Set of existing IDs for efficient lookup
          const existingIds = new Set(prev.data.map((t: any) => t._id));

          // Filter out any new tasks that are already in the list
          const uniqueNewTasks = newData.filter(
            (t: any) => !existingIds.has(t._id)
          );

          return {
            ...prev,
            // If loading more, append ONLY unique tasks. If refreshing (page 1), replace entirely.
            data: isLoadMore ? [...prev.data, ...uniqueNewTasks] : newData,
            page: page,
            hasMore: newData.length === PAGE_LIMIT
          };
        });
      } catch (error) {
        console.error(`Failed to fetch ${type} tasks`, error);
        toast({
          variant: 'destructive',
          title: `Failed to load ${type} tasks`
        });
      } finally {
        updateState((prev) => ({
          ...prev,
          loading: false,
          loadingMore: false
        }));
      }
    },
    [id, toast]
  );

  // --- 3. Initial Load (Page 1 for all) ---
  useEffect(() => {
    if (id) {
      fetchTaskList('today', 1, false);
      fetchTaskList('overdue', 1, false);
      fetchTaskList('upcoming', 1, false);
      fetchTaskList('assigned', 1, false);
      fetchTaskList('finish', 1, false);
    }
  }, [id, fetchTaskList]);

  // --- 4. Load More Handlers ---
  const handleLoadMoreToday = () =>
    fetchTaskList('today', todayState.page + 1, true);
  const handleLoadMoreOverdue = () =>
    fetchTaskList('overdue', overdueState.page + 1, true);
  const handleLoadMoreUpcoming = () =>
    fetchTaskList('upcoming', upcomingState.page + 1, true);
  const handleLoadMoreAssigned = () =>
    fetchTaskList('assigned', assignedState.page + 1, true);
  const handleLoadMoreFinish = () =>
    fetchTaskList('finish', finishState.page + 1, true);

  // --- 5. Optimistic Updates (applied to all lists) ---
  const updateTaskInAllLists = (
    taskId: string,
    updateFn: (task: any) => any
  ) => {
    const applyUpdate = (state: TaskCategoryState) => ({
      ...state,
      data: state.data.map((t) => (t._id === taskId ? updateFn(t) : t))
    });

    setTodayState(applyUpdate);
    setOverdueState(applyUpdate);
    setUpcomingState(applyUpdate);
    setAssignedState(applyUpdate);
    setFinishState(applyUpdate);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Map the tab values to your fetchTaskList types and fetch fresh page 1 data
    switch (value) {
      case 'today':
        fetchTaskList('today', 1, false);
        break;
      case 'overdue':
        fetchTaskList('overdue', 1, false);
        break;
      case 'upcoming':
        fetchTaskList('upcoming', 1, false);
        break;
      case 'assigntoother':
        fetchTaskList('assigned', 1, false);
        break;
      case 'needtofinish':
        fetchTaskList('finish', 1, false);
        break;
    }
  };

  const handleMarkAsImportant = async (taskId: string) => {
    // Find task in any list to get current state
    const allTasks = [
      ...todayState.data,
      ...overdueState.data,
      ...upcomingState.data,
      ...assignedState.data,
      ...finishState.data
    ];

    const task = allTasks.find((t) => t._id === taskId);
    if (!task) return;

    const userId = id;
    const isImportant = task.importantBy?.includes(userId);
    const newImportantBy = isImportant
      ? task.importantBy.filter((uid: string) => uid !== userId)
      : [...(task.importantBy || []), userId];

    updateTaskInAllLists(taskId, (t) => ({
      ...t,
      importantBy: newImportantBy
    }));

    try {
      await axiosInstance.patch(`/task/${taskId}`, {
        importantBy: newImportantBy
      });
    } catch (error) {
      // Revert
      updateTaskInAllLists(taskId, (t) => ({
        ...t,
        importantBy: task.importantBy
      }));
      toast({ variant: 'destructive', title: 'Failed to update importance' });
    }
  };

 const handleToggleTaskCompletion = async (taskId: string) => {
   // 1. Find the task in any of the current tabs
   const allTasks = [
     ...todayState.data,
     ...overdueState.data,
     ...upcomingState.data,
     ...assignedState.data,
     ...finishState.data
   ];

   const task = allTasks.find((t) => t._id === taskId);
   if (!task) return;

   // 2. Extract author and assigned IDs safely
   const authorId =
     typeof task.author === 'string' ? task.author : task.author?._id;
   const assignedId =
     typeof task.assigned === 'string' ? task.assigned : task.assigned?._id;

   let updatedCompletedBy = [];

   // 3. Update completedBy logic
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

   // 4. Optimistically REMOVE the task from all pending lists
   const filterOutTask = (state: TaskCategoryState) => ({
     ...state,
     data: state.data.filter((t) => t._id !== taskId)
   });

   setTodayState(filterOutTask);
   setOverdueState(filterOutTask);
   setUpcomingState(filterOutTask);
   setAssignedState(filterOutTask);
   setFinishState(filterOutTask);

   // 5. Send API Request
   try {
     await axiosInstance.patch(`/task/${taskId}`, {
       status: 'completed',
       completedBy: updatedCompletedBy
     });
     toast({ title: 'Task finished successfully!' });
   } catch (error) {
     console.error('Failed to complete task', error);
     toast({ variant: 'destructive', title: 'Failed to update status' });

     // Optional Rollback: If it fails, refresh the current active tab to restore the task
     fetchTaskList(activeTab as any, 1, false);
   }
 };
  const handleReassignTask = async (taskId: string) => {
    // Optimistically remove completions or reset status
    updateTaskInAllLists(taskId, (t) => ({
      ...t,
      status: 'pending',
      completedBy: []
    }));

    try {
      // Sends ID only via the URL as requested
      await axiosInstance.patch(`/task/reassign/${taskId}`);
      toast({ title: 'Task reassigned successfully' });
    } catch (error) {
      console.error('Failed to reassign', error);
      toast({ variant: 'destructive', title: 'Failed to reassign task' });
    }
  };

  // --- Helper for Load More Button UI ---
  const LoadMoreButton = ({
    onClick,
    loading,
    hasMore
  }: {
    onClick: () => void;
    loading: boolean;
    hasMore: boolean;
  }) => {
    // Optionally hide button if no more data, or show "All loaded" message
    if (!hasMore) return null;

    return (
      <div className="flex justify-center border-t border-dashed border-gray-200 p-4">
        <button
          onClick={onClick}
          disabled={loading}
          className="flex items-center gap-2 rounded-md bg-taskplanner px-4 py-2  text-sm font-medium text-white transition-colors hover:bg-taskplanner/90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : ''}
          {loading ? 'Loading...' : 'Load More'}
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-5">
      {/* --- Stats Section --- */}

      {/* --- Tasks Section with Tabs --- */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        {' '}
        <TabsList className="mb-4 border border-gray-200 bg-white p-1">
          <TabsTrigger
            value="today"
            className="px-6 data-[state=active]:bg-taskplanner data-[state=active]:text-white"
          >
            Today{' '}
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-black">
              {todayState.data.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="overdue"
            className="px-6 data-[state=active]:bg-taskplanner data-[state=active]:text-white"
          >
            Overdue{' '}
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-black">
              {overdueState.data.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="upcoming"
            className="px-6 data-[state=active]:bg-taskplanner data-[state=active]:text-white"
          >
            Upcoming{' '}
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-black">
              {upcomingState.data.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="assigntoother"
            className="px-6 data-[state=active]:bg-taskplanner data-[state=active]:text-white"
          >
            Assign To Others{' '}
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-black">
              {assignedState.data.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="needtofinish"
            className="px-6 data-[state=active]:bg-taskplanner data-[state=active]:text-white"
          >
            Need To Finish{' '}
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-black">
              {finishState.data.length}
            </span>
          </TabsTrigger>
        </TabsList>
        {/* Tab 1: Today */}
        <TabsContent value="today">
          <Card className="rounded-none border-none p-0 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between p-0 pb-2 ">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
                <Calendar className="h-5 w-5 text-taskplanner" />
                Today's Tasks
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {moment().format('MMMM Do, YYYY')}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {todayState.loading ? (
                <div className="flex h-32 items-center justify-center">
                  <BlinkingDots size="large" color="bg-taskplanner" />
                </div>
              ) : todayState.data.length === 0 ? (
                <EmptyState
                  icon={<Calendar className="h-6 w-6 text-slate-400" />}
                  title="No tasks for today"
                  desc="You're all caught up!"
                />
              ) : (
                <>
                  <TaskList
                    tasks={todayState.data}
                    onMarkAsImportant={handleMarkAsImportant}
                    onToggleTaskCompletion={handleToggleTaskCompletion}
                  />
                  <LoadMoreButton
                    onClick={handleLoadMoreToday}
                    loading={todayState.loadingMore}
                    hasMore={todayState.hasMore}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Tab 2: Overdue */}
        <TabsContent value="overdue">
          <Card className=" rounded-none border-none p-0 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between p-0 pb-2 ">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-red-700">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Overdue Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {overdueState.loading ? (
                <div className="flex h-32 items-center justify-center">
                  <BlinkingDots size="large" color="bg-taskplanner" />
                </div>
              ) : overdueState.data.length === 0 ? (
                <EmptyState
                  icon={<AlertCircle className="h-6 w-6 text-slate-400" />}
                  title="No overdue tasks"
                  desc="Great job keeping up!"
                />
              ) : (
                <>
                  <TaskList
                    tasks={overdueState.data}
                    onMarkAsImportant={handleMarkAsImportant}
                    onToggleTaskCompletion={handleToggleTaskCompletion}
                  />
                  <LoadMoreButton
                    onClick={handleLoadMoreOverdue}
                    loading={overdueState.loadingMore}
                    hasMore={overdueState.hasMore}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Tab 3: Upcoming */}
        <TabsContent value="upcoming">
          <Card className="rounded-none border-none p-0 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between p-0 pb-2  ">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-blue-700">
                <Clock className="h-5 w-5 text-blue-600" />
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {upcomingState.loading ? (
                <div className="flex h-32 items-center justify-center">
                  <BlinkingDots size="large" color="bg-taskplanner" />
                </div>
              ) : upcomingState.data.length === 0 ? (
                <EmptyState
                  icon={<Clock className="h-6 w-6 text-slate-400" />}
                  title="No upcoming tasks"
                  desc="Your schedule looks clear."
                />
              ) : (
                <>
                  <TaskList
                    tasks={upcomingState.data}
                    onMarkAsImportant={handleMarkAsImportant}
                    onToggleTaskCompletion={handleToggleTaskCompletion}
                  />
                  <LoadMoreButton
                    onClick={handleLoadMoreUpcoming}
                    loading={upcomingState.loadingMore}
                    hasMore={upcomingState.hasMore}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Tab 4: Assigned To Others */}
        <TabsContent value="assigntoother">
          <Card className="rounded-none border-none shadow-none">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
                <UserPlus className="h-5 w-5 text-taskplanner" />
                Tasks Assigned to Others
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {assignedState.loading ? (
                <div className="flex h-32 items-center justify-center">
                  <BlinkingDots size="large" color="bg-taskplanner" />
                </div>
              ) : assignedState.data.length === 0 ? (
                <EmptyState
                  icon={<UserPlus className="h-6 w-6 text-slate-400" />}
                  title="No tasks assigned"
                  desc="You haven't assigned tasks to others yet."
                />
              ) : (
                <>
                  <AssignTaskList
                    tasks={assignedState.data}
                    onMarkAsImportant={handleMarkAsImportant}
                    onToggleTaskCompletion={handleToggleTaskCompletion}
                  />
                  <LoadMoreButton
                    onClick={handleLoadMoreAssigned}
                    loading={assignedState.loadingMore}
                    hasMore={assignedState.hasMore}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Tab 5: Need To Finish */}
        <TabsContent value="needtofinish">
          <Card className="rounded-none border-none shadow-none">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-green-700">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Need to Finish (Review)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {finishState.loading ? (
                <div className="flex h-32 items-center justify-center">
                  <BlinkingDots size="large" color="bg-taskplanner" />
                </div>
              ) : finishState.data.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle2 className="h-6 w-6 text-slate-400" />}
                  title="Nothing to review"
                  desc="No tasks are currently waiting for your final completion."
                />
              ) : (
                <>
                  <NeedToFinishList
                    tasks={finishState.data}
                    onMarkAsImportant={handleMarkAsImportant}
                    onToggleTaskCompletion={handleToggleTaskCompletion}
                    reAssign={handleReassignTask}
                  />
                  <LoadMoreButton
                    onClick={handleLoadMoreFinish}
                    loading={finishState.loadingMore}
                    hasMore={finishState.hasMore}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Simple Helper Component for Empty States
const EmptyState = ({
  icon,
  title,
  desc
}: {
  icon: any;
  title: string;
  desc: string;
}) => (
  <div className="m-2 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-10 text-center">
    <div className="mb-3 rounded-full bg-slate-100 p-3">{icon}</div>
    <h3 className="text-sm font-medium text-slate-900">{title}</h3>
    <p className="text-sm text-slate-500">{desc}</p>
  </div>
);

export default CompanyDashboardPage;
