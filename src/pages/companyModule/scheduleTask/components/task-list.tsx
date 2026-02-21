import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Star,
  CheckCircle2,
  RotateCcw,
  Eye,
  MessageCircle,
  Mail,
  MessageSquareText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import axiosInstance from '@/lib/axios';

const TaskList = ({
  tasks,
  onMarkAsImportant,
  onToggleTaskCompletion,
  reAssign
}) => {
  const { user } = useSelector((state: any) => state.auth);
  const { id } = useParams();
  const navigate = useNavigate();

  // --- Reassign Modal State ---
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [loading, setLoading] = useState(false);

  const openUpdateModal = (task) => {
    setSelectedTask(task);
    setOpenUpdate(true);
  };

  const closeUpdateModal = () => {
    setOpenUpdate(false);
    setSelectedTask(null);
  };

  const reassign = (task) => {
    reAssign(task._id);
  };

  const onUpdateConfirm = async (data) => {
    if (!selectedTask) return;
    setLoading(true);
    try {
      const dueDateUTC = moment(data.dueDate).utc().toISOString();
      const payload = {
        taskName: data.taskName,
        dueDate: dueDateUTC
      };
      await axiosInstance.patch(`/task/${selectedTask._id}`, payload);
      toast({ title: 'Task Updated Successfully' });
      setOpenUpdate(false);
      setSelectedTask(null);
      // Note: Parent component needs to refresh data or manage optimistic state if deep updates are needed
    } catch (error) {
      console.error('Error updating task:', error);
      toast({ title: 'Failed to update task', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // --- Sorting Logic (Priority > Date) ---
  const sortedTasks = useMemo(() => {
    if (!tasks) return [];

    const priorityWeight: Record<string, number> = {
      high: 3,
      medium: 2,
      low: 1
    };

    return [...tasks].sort((a, b) => {
      const weightA = priorityWeight[a.priority?.toLowerCase() || ''] || 0;
      const weightB = priorityWeight[b.priority?.toLowerCase() || ''] || 0;

      if (weightA !== weightB) {
        return weightB - weightA; // Descending Priority
      }

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(); // Recent First
    });
  }, [tasks]);

  const priorityColors: Record<string, string> = {
    high: 'bg-red-50 text-red-600 border-red-100',
    medium: 'bg-amber-50 text-amber-600 border-amber-100',
    low: 'bg-blue-50 text-blue-600 border-blue-100'
  };

  if (sortedTasks.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <img src="/notask.png" alt="No tasks" className="max-w-xs opacity-90" />
      </div>
    );
  }

  return (
    <>
      <div className=" bg-white">
        <Table>
          <TableHeader className="bg-taskplanner text-white">
            <TableRow className="border-none ">
              <TableHead className="w-[40%] border border-gray-200 text-xs font-bold capitalize tracking-wider">
                Task
              </TableHead>

              <TableHead className="border border-gray-200 text-center text-xs font-bold capitalize tracking-wider">
                Priority
              </TableHead>

              <TableHead className="border border-gray-200 text-center text-xs font-bold capitalize tracking-wider">
                Create Date
              </TableHead>

              <TableHead className="border border-gray-200 text-center text-xs font-bold capitalize tracking-wider">
                Due Date
              </TableHead>

              <TableHead className="border border-gray-200 pr-6 text-right text-xs font-bold capitalize tracking-wider">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedTasks.map((task) => {
              // 1. Get Assignee ID safely
              const assigneeId =
                typeof task.assigned === 'string'
                  ? task.assigned
                  : task.assigned?._id;

              // 2. FIX: Check if completedBy array contains an object with userId matching assigneeId
              const isCompletedByAssignee = task.completedBy?.some((entry) => {
                const entryUserId =
                  typeof entry.userId === 'string'
                    ? entry.userId
                    : entry.userId?._id;
                return entryUserId === assigneeId;
              });

              const isImportant = task.importantBy?.includes(user?._id);

              const isCompleted = task.status === 'completed';
              const isUnseen = user?._id === assigneeId && task.seen === false;
              const isOverdue =
                moment(task.dueDate).isBefore(moment()) && !isCompleted;
              const authorId =
                typeof task.author === 'string'
                  ? task.author
                  : task.author?._id;

              const isAuthor = user?._id === authorId;
              const isAssigned = user?._id === assigneeId;
              return (
                <TableRow
                  key={task._id}
                  className={cn(
                    'group border-b border-gray-100 transition-colors',
                    isUnseen
                      ? 'bg-blue-50 hover:bg-blue-100/80'
                      : isImportant
                        ? 'bg-orange-50 hover:bg-orange-100'
                        : 'hover:bg-slate-50/50'
                  )}
                >
                  {/* Task */}
                  <TableCell
                    className="cursor-pointer border border-gray-200 py-4"
                    onClick={() =>
                      navigate(`/company/${id}/scheduletask-details/${task?._id}`)
                    }
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Left Side - Task Name */}
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm transition-colors">
                          {task.taskName}
                        </span>
                      </div>

                      {/* Right Side - Frequency Badge */}
                      {task.frequency &&
                        task.frequency.toLowerCase() !== 'once' && (
                          <Badge variant="default" className="capitalize">
                            {task.frequency}
                          </Badge>
                        )}
                    </div>
                  </TableCell>

                  {/* Priority */}
                  <TableCell className="border border-gray-200 text-center">
                    {task.priority && (
                      <Badge
                        variant="outline"
                        className={`mx-auto font-semibold capitalize ${
                          priorityColors[task.priority] ||
                          'bg-slate-50 text-black'
                        }`}
                      >
                        {task.priority}
                      </Badge>
                    )}
                  </TableCell>

                  {/* Create Date */}
                  <TableCell className="border border-gray-200 text-center">
                    <div className="flex items-center justify-center text-sm font-medium">
                      {moment(task.createdAt).format('MMM D, YYYY')}
                    </div>
                  </TableCell>

                  {/* Due Date */}
                  <TableCell className="border border-gray-200 text-center">
                    <div
                      className={cn(
                        'flex items-center justify-center text-sm font-medium',
                        isOverdue ? 'text-red-500' : 'text-black'
                      )}
                    >
                      {moment(task.dueDate).format('MMM D, YYYY')}
                    </div>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="border border-gray-200 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                     

                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(`/company/${id}/scheduletask-details/${task?._id}`)
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                 
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default TaskList;
