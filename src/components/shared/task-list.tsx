import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Star,
  UserRoundCheck,
  Calendar,
  ArrowRight,
  CircleUser,
  MessageSquareText
} from 'lucide-react';

import { Badge } from '../ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import TaskDetails from './task-details';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axiosInstance from '@/lib/axios';
import { toast } from '../ui/use-toast';
import UpdateTask from './update-task';
import { useNavigate } from 'react-router-dom';
import { updateTask } from '@/redux/features/allTaskSlice'; // Import your Redux action

const TaskList = ({ tasks, onMarkAsImportant, onToggleTaskCompletion }) => {
  const { user } = useSelector((state: any) => state.auth);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const navigate = useNavigate();
  const [openUpdate, setOpenUpdate] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch(); // Add dispatch

  const [optimisticTasks, setOptimisticTasks] = useState([]);

  useEffect(() => {
    if (tasks && Array.isArray(tasks)) {
      setOptimisticTasks(tasks);
    }
  }, [tasks]);

  const openTaskDetails = async (task) => {
    if (!task || !user) return;
  
    if (user?._id !== task.author?._id) {
      try {
        // Create optimistic update
        const updatedTasks = optimisticTasks.map(t =>
          t?._id === task?._id ? { ...t, seen: true } : t
        );
        setOptimisticTasks(updatedTasks);
  
        await dispatch(updateTask({
          taskId: task?._id.toString(),
          taskData: { seen: true }
        })).unwrap();;
      } catch (error) {
        console.error("Error marking task as seen:", error);
        // Revert optimistic update
        setOptimisticTasks(optimisticTasks);
      }
    }
    navigate(`/dashboard/task-details/${task?._id}`);
  };

  const openUpdateModal = (task) => {
    setSelectedTask(task);
    setOpenUpdate(true);
  };

  const closeUpdateModal = () => {
    setOpenUpdate(false);
    setSelectedTask(null);
  };

  const onUpdateConfirm = async (data) => {
    setLoading(true);

    const updatedTasks = optimisticTasks.map(task => 
      task?._id === selectedTask?._id 
        ? { 
            ...task, 
            taskName: data.taskName,
            dueDate: data.dueDate 
          } 
        : task
    );
    setOptimisticTasks(updatedTasks);

    try {
      const dueDateUTC = moment(data.dueDate).utc().toISOString();
      
      // Use Redux dispatch instead of direct axios call
      dispatch(updateTask({
        taskId: selectedTask?._id.toString(),
        taskData: {
          dueDate: dueDateUTC,
          taskName: data.taskName
        }
      }));

      toast({
        title: 'Task Updated Successfully',
      });
    } catch (error) {
      setOptimisticTasks(tasks);
      console.error('Error updating task:', error);
      toast({
        title: 'Failed to update task',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const sortedTasks = [...optimisticTasks]?.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div>
      <main className="flex-1 overflow-auto ">
        <div className="space-y-2 pb-2">
          {sortedTasks?.map((task) => (
            <div
              key={task?._id}
              className={`flex items-center space-x-2 rounded-lg border border-gray-200 p-3 shadow-md
                ${user?._id === task.assigned?._id && !task.seen ? 'bg-blue-100' : 
                  task.importantBy?.includes(user?._id) ? 'bg-orange-100' : 'bg-white'}
              `}
              
            >
              <div className=" flex w-full flex-col items-center justify-between gap-2 lg:flex-row ">
                <div className="flex w-full flex-row items-center justify-between gap-2">
                  <div className="flex items-center justify-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={task.status === 'completed'}
                      onCheckedChange={() => onToggleTaskCompletion(task._id)}
                      disabled={task.author?._id !== user?._id}
                    />
                    <span
                      className={`flex-1 max-lg:text-xs ${
                        task.status === 'completed'
                          ? 'text-gray-500 line-through '
                          : ''
                      }`}
                      onClick={() => openTaskDetails(task)}
                    >
                      {task.taskName}
                    </span>
                  </div>
                  <div className="flex flex-row  gap-8"  >
                    <div className="flex items-center justify-center gap-2 max-lg:hidden"  onClick={() => openTaskDetails(task)}>
                      <TooltipProvider >
                        <Tooltip  >
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
                        <ArrowRight className="h-3 w-3 " />
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
                              variant={'outline'}
                              className="flex items-center gap-1 bg-red-700 text-white"
                              onClick={() => {
                                if (task.author?._id === user?._id) {
                                  openUpdateModal(task);
                                } else {
                                  toast({
                                    title: `Please Contact with ${task?.author.name}`,
                                    description:
                                      'You do not have permission for this action',
                                    variant: 'destructive'
                                  });
                                }
                              }}
                            >
                              <span className="truncate">
                                <div className="flex flex-row gap-1">
                                  <Calendar className="h-3 w-3" />
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
                    <div className="flex flex-row  lg:gap-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              variant={null}
                              size="icon"
                              onClick={() => onMarkAsImportant(task._id)}
                            >
                              <Star
                                className={`h-4 w-4 ${task?.importantBy?.includes(user?._id) ? 'text-orange-600' : ''}`}  
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {task.important
                                ? 'Unmark as Important'
                                : 'Mark As Important'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button
                              variant={null}
                              size="icon"
                              onClick={() => openTaskDetails(task)}
                            >
                              <span
                                className={`${task?.unreadMessageCount > 0 ? 'animate-bounce text-balance text-red-700' : 'text-cyan-900'} flex flex-row items-center`}
                              >
                                <MessageSquareText className={`h-4 w-4`} />
                                {task?.unreadMessageCount === 0 ? (
                                  <></>
                                ) : (
                                  <sup>{task?.unreadMessageCount}</sup>
                                )}
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Comments</p>
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
                          onClick={() => {
                            if (task.author?._id === user?._id) {
                              openUpdateModal(task);
                            } else {
                              toast({
                                title: `Please Contact with ${task?.author.name}`,
                                description:
                                  'You do not have permission for this action',
                                variant: 'destructive'
                              });
                            }
                          }}
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
          ))}
        </div>

        <UpdateTask
          task={selectedTask}
          isOpen={openUpdate}
          onClose={closeUpdateModal}
          onConfirm={onUpdateConfirm}
          loading={loading}
          title="Update Task"
          description="Edit the task."
        />
      </main>
    </div>
  );
};

export default TaskList;