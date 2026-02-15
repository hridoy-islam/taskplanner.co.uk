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
import { Star, CheckCircle2, RotateCcw, Eye, MessageCircle, MessageSquareText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import axiosInstance from '@/lib/axios';

const NeedToFinishList = ({ tasks, onMarkAsImportant, onToggleTaskCompletion,reAssign }) => {
  const { user } = useSelector((state: any) => state.auth);
  const { id,uid } = useParams();
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

  const reassign=(task)=>{
    reAssign(task._id)
  }

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
        <img
          src="/notask.png"
          alt="No tasks"
          className="max-w-xs opacity-90"
        />
      </div>
    );
  }
const getUserName = (userObj: any) => {
    if (!userObj) return 'Unknown';
    if (typeof userObj === 'string') return 'User'; // Fallback if not populated
    return userObj.name || 'User';
  };
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
                Assigned To
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

              <TableHead className="pr-6 border border-gray-200 text-right text-xs font-bold capitalize tracking-wider">
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

              const isOverdue =
                moment(task.dueDate).isBefore(moment()) && !isCompleted;
            const isUnseen = user?._id === assigneeId && task.seen === false;
 const authorId = 
                typeof task.author === 'string'
                  ? task.author
                  : task.author?._id;

                  const isAuthor = user?._id === authorId;
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
                    className="border border-gray-200 py-4"
                    onClick={() =>
                      navigate(
                        `/company/${id}/user/${uid}/task-details/${task?._id}`
                      )
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={cn(
                            'text-sm transition-colors',
                            isCompleted && 'text-slate-400 line-through'
                          )}
                        >
                          {task.taskName}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="border border-gray-200">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm font-medium text-slate-700">
                        {getUserName(task.assigned)}
                      </span>
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
                        className={cn(
                          'rounded-md shadow-sm transition-all',
                          isImportant
                            ? 'border border-orange-300 bg-orange-200 text-orange-600 hover:bg-orange-300'
                            : 'border border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                        )}
                        onClick={() => onMarkAsImportant(task._id)}
                      >
                        <Star
                          className={cn(
                            'h-4 w-4',
                            isImportant && 'fill-current'
                          )}
                        />
                      </Button>

                      <Button
                        size="sm"
                        className="relative "
                        onClick={() =>
                          navigate(
                            `/company/${id}/user/${uid}/task-details/${task?._id}`
                          )
                        }
                      >
                        <MessageSquareText className="h-5 w-5 " />

                        {task?.unreadMessageCount > 0 && (
                          <>
                            {/* The background Ping animation */}
                            <span className="absolute right-1 top-1 flex h-3 w-3">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex h-3 w-3 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                                {task.unreadMessageCount > 9
                                  ? '9+'
                                  : task.unreadMessageCount}
                              </span>
                            </span>
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/company/${id}/user/${uid}/task-details/${task?._id}`
                          )
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {isCompletedByAssignee && isAuthor && (
                        <>
                          <Button size="sm" onClick={() => reassign(task)}>
                            Reassign
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => onToggleTaskCompletion(task._id)}
                          >
                            Finish
                          </Button>
                        </>
                      )}
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

export default NeedToFinishList;