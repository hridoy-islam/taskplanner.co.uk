import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Star,
  UserRoundCheck,
  Calendar,
  CornerDownLeft,
  ArrowRight,
  CircleUser
} from 'lucide-react';

import { Badge } from '../ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import moment from 'moment';
import { useForm } from 'react-hook-form';
import 'react-datepicker/dist/react-datepicker.css';

const TaskList = ({
  tasks,
  onMarkAsImportant,
  onToggleTaskCompletion,
  onNewTaskSubmit,
  showAddTaskForm,
  fetchTasks
}) => {
  const { register, handleSubmit, reset } = useForm();
  // const [editedTaskId, setEditedTaskId] = useState(null); // Track the task being edited
  // const [dueDate, setDueDate] = useState(null); // Store the new due date
  const sortedTasks = tasks?.sort((a, b) => {
    return a.status === 'completed' && b.status === 'pending' ? 1 : -1;
  });

  const onSubmit = async (data) => {
    await onNewTaskSubmit(data);
    reset();
  };

  // const handleDateChange = async (taskId, date) => {
  //     if (!date) return;

  //     const formattedDate = moment(date).toISOString();
  //     setDueDate(date);
  //     setEditedTaskId(taskId);

  //     try {
  //         const response = await fetch(`/task/${taskId}`, {
  //             method: 'PATCH',
  //             headers: {
  //                 'Content-Type': 'application/json',
  //             },
  //             body: JSON.stringify({ dueDate: formattedDate }),
  //         });

  //         if (!response.ok) {
  //             throw new Error("Network response was not ok");
  //         }

  //         fetchTasks();
  //     } catch (error) {
  //         console.error("Failed to update due date:", error);
  //     }
  // };

  return (
    <div>
      <main className="flex-1 overflow-auto p-4">
        <ScrollArea className="h-[calc(85vh-8rem)]">
          <div className="space-y-2">
            {sortedTasks?.map((task) => (
              <div
                key={task._id}
                className={`flex items-center space-x-2 rounded-lg bg-white p-3 shadow ${
                  task.important ? 'bg-yellow-100' : ''
                }`}
              >
                <Checkbox
                  checked={task.status === 'completed'}
                  onCheckedChange={() => onToggleTaskCompletion(task._id)}
                />
                <span
                  className={`flex-1 ${
                    task.status === 'completed'
                      ? 'text-gray-500 line-through'
                      : ''
                  }`}
                >
                  {task.taskName}
                </span>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 bg-indigo-600"
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

                <Badge variant="outline" className={'bg-black'}>
                  <ArrowRight className="h-3 w-3 " />
                </Badge>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 bg-sky-600"
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
                      >
                        <Calendar className="h-3 w-3" />
                        {moment(task.dueDate).format('MMM Do YY')}
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
              </div>
            ))}
          </div>
        </ScrollArea>
      </main>

      {showAddTaskForm && (
        <footer className="bg-white p-4 shadow">
          <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-2">
            <Input
              {...register('taskName', { required: true })}
              type="text"
              placeholder="Add a task"
              className="flex-1"
            />
            <Button type="submit" variant={'outline'}>
              <CornerDownLeft className="mr-2 h-4 w-4" />
            </Button>
          </form>
        </footer>
      )}
    </div>
  );
};

export default TaskList;
