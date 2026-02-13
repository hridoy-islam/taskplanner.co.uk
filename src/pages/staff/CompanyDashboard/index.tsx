import { useState, useEffect, useCallback } from 'react';
import { Building2, Calendar, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store'; // Adjust path if necessary
import TaskList from '@/components/shared/task-list'; // Adjust path if necessary
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import moment from 'moment';

const StaffDashboardPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id,uid } = useParams();

  // State
  const [statsLoading, setStatsLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [todayTasks, setTodayTasks] = useState<any[]>([]);

  // 2. Fetch Today's Tasks
  const fetchTodayTasks = useCallback(async () => {
    if (!user?._id) return;
    
    setTasksLoading(true);
    try {
      
      const res = await axiosInstance.get(`/task/today/${uid}`);
      const tasks = res.data?.data || res.data || [];
      
      setTodayTasks(tasks);
    } catch (error) {
      console.error("Failed to fetch today's tasks", error);
    } finally {
      setTasksLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchTodayTasks();
  }, [fetchTodayTasks]);

  // 3. Task Handlers (Optimistic Updates)
  const handleMarkAsImportant = async (taskId: string) => {
    const task = todayTasks.find((t) => t._id === taskId);
    if (!task) return;

    const userId = user._id;
    const isImportant = task.importantBy?.includes(userId);
    const newImportantBy = isImportant
      ? task.importantBy.filter((id: string) => id !== userId)
      : [...(task.importantBy || []), userId];

    // Optimistic Update
    setTodayTasks((prev) =>
      prev.map((t) =>
        t._id === taskId ? { ...t, importantBy: newImportantBy } : t
      )
    );

    try {
      await axiosInstance.patch(`/task/${taskId}`, { importantBy: newImportantBy });
    } catch (error) {
      // Revert
      setTodayTasks((prev) =>
        prev.map((t) =>
          t._id === taskId ? { ...t, importantBy: task.importantBy } : t
        )
      );
      toast({ variant: 'destructive', title: 'Failed to update importance' });
    }
  };

  const handleToggleTaskCompletion = async (taskId: string) => {
    const task = todayTasks.find((t) => t._id === taskId);
    if (!task) return;

    const newStatus = task.status === 'pending' ? 'completed' : 'pending';

    // Optimistic Update
    setTodayTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await axiosInstance.patch(`/task/${taskId}`, { status: newStatus });
    } catch (error) {
      // Revert
      setTodayTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: task.status } : t))
      );
      toast({ variant: 'destructive', title: 'Failed to update status' });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-5">
      
     

      {/* --- Today's Tasks Section --- */}
      <Card className="border-gray-300 border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Today's Tasks
            <Badge variant="secondary" className="ml-2">
              {todayTasks.length}
            </Badge>
          </CardTitle>
          <div className="text-sm  font-medium">
            {moment().format('MMMM Do, YYYY')}
          </div>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
             <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
             </div>
          ) : todayTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-200 rounded-lg">
              <div className="rounded-full bg-slate-100 p-3 mb-3">
                <Calendar className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-900">No tasks for today</h3>
              <p className="text-sm ">You're all caught up!</p>
            </div>
          ) : (
            <TaskList
              tasks={todayTasks}
              onMarkAsImportant={handleMarkAsImportant}
              onToggleTaskCompletion={handleToggleTaskCompletion}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffDashboardPage;