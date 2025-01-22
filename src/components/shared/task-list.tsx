import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Star,
  UserRoundCheck,
  Calendar,
  ArrowRight,
  CircleUser,
  MessageSquareText,
  AlarmClock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';

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
import { useSelector } from 'react-redux';
import axiosInstance from '../../lib/axios';
import { toast } from '../ui/use-toast';
import UpdateTask from './update-task';

const TaskList = ({
  tasks,
  onMarkAsImportant,
  onToggleTaskCompletion,
  fetchTasks
}) => {
  const { user } = useSelector((state: any) => state.auth);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskDetailsOpen, setTaskDetailsOpen] = useState(false);
  // const { register, handleSubmit, reset } = useForm();

  const [openUpdate, setOpenUpdate] = useState(false);
  const [loading, setLoading] = useState(false);

  // const sortedTasks = tasks?.sort((a, b) => {
  //   return a.status === 'completed' && b.status === 'pending' ? 1 : -1;
  // });

  const openTaskDetails = (task: any) => {
    setSelectedTask(task);
    setTaskDetailsOpen(true);
  };

  const closeTaskDetails = () => {
    setTaskDetailsOpen(false);
    setSelectedTask(null); // Clear the selected task
  };

  const openUpdateModal = (task) => {
    setSelectedTask(task);
    setOpenUpdate(true);
  };

  const closeUpdateModal = () => {
    setOpenUpdate(false);
    setSelectedTask(null);
  };

  useEffect(() => {
    fetchTasks();
  }, [isTaskDetailsOpen]);

  const onUpdateConfirm = async (data) => {
    setLoading(true);
    try {
      const dueDateUTC = moment(data.dueDate).utc().toISOString();
      const res = await axiosInstance.patch(`/task/${selectedTask?._id}`, {
        dueDate: dueDateUTC,
        taskName: data.taskName
      });
      if (res.data.success) {
        fetchTasks(); // Refresh tasks
        //setOpenUpdate(false); // Close modal after update
        toast({
          title: 'Task Updated Successfully',
          description: 'Thank You'
        });
        //reset();
      } else {
        toast({
          title: 'Failed to update due date',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating due date:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <main className="flex-1 overflow-auto lg:p-4 ">
        <ScrollArea className="h-[calc(80vh-8rem)]">
          <div className="space-y-2">
            {tasks?.map((task) => (
              <div
                key={task._id}
                className={`flex items-center space-x-2 rounded-lg p-3 shadow-md ${
                  task.important ? 'bg-orange-100' : 'bg-white'
                }`}
              >
                <div className="border- flex w-full flex-col items-center justify-between gap-2 lg:flex-row ">
                  <div className="flex w-full flex-row items-center justify-between">
                    <div className="flex items-center justify-center gap-2">
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
                        onClick={() => {
                          if (task.author?._id === user?._id) {
                            openUpdateModal(task);
                          } else {
                            toast({
                              title: `Please Contact with ${task?.author?.name}`,
                              description:
                                'You do not have permission for this action',
                              variant: 'destructive'
                            });
                          }
                        }}
                      >
                        {task.taskName}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2 max-lg:hidden">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 bg-green-100 text-black"
                            >
                              <UserRoundCheck className="h-3 w-3" />
                              {task?.author?.name}
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
                              {task?.assigned?.name}
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
                              // onClick={() => openUpdateModal(task)}
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
                              <Calendar className="h-3 w-3" />
                              {moment(task.dueDate).format('MMM Do YYYY')}
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
                                className={`h-4 w-4 ${task.important ? 'text-orange-600' : ''}`}
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
                      {/* <Badge className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-teal-900" />{' '}
                        <span>Once</span>
                      </Badge> */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded-md p-2 focus:outline-none">
                            <AlarmClock className="h-5 w-5 text-indigo-800" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="center"
                          side="top"
                          className="w-48 bg-primary text-black"
                        >
                          <DropdownMenuItem>Daily</DropdownMenuItem>
                          <DropdownMenuItem>Weekdays</DropdownMenuItem>
                          <DropdownMenuItem>Weekly</DropdownMenuItem>
                          <DropdownMenuItem>Monthly</DropdownMenuItem>
                          <DropdownMenuItem>Yearly</DropdownMenuItem>
                          <DropdownMenuItem>Customize</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        </ScrollArea>

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

      {isTaskDetailsOpen && selectedTask !== null && (
        <TaskDetails
          task={selectedTask}
          isOpen={isTaskDetailsOpen}
          onOpenChange={closeTaskDetails}
        />
      )}
    </div>
  );
};

export default TaskList;
