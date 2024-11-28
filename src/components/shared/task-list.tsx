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
      <main className="flex-1 overflow-auto p-4">
        <ScrollArea className="h-[calc(85vh-8rem)]">
          <div className="space-y-2">
            {tasks?.map((task) => (
              <div
                key={task._id}
                className={`flex items-center space-x-2 rounded-lg p-3 shadow ${
                  task.important ? 'bg-orange-100' : 'bg-white'
                }`}
              >
                <Checkbox
                  checked={task.status === 'completed'}
                  onCheckedChange={() => onToggleTaskCompletion(task._id)}
                  disabled={task.author?._id !== user?._id}
                />
                <span
                  className={`flex-1 ${
                    task.status === 'completed'
                      ? 'text-gray-500 line-through'
                      : ''
                  }`}
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
                  {task.taskName}
                </span>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 bg-green-100 text-black"
                      >
                        <UserRoundCheck className="h-3 w-3" />
                        {task.author.name}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Created By {task.author.name}</p>
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
