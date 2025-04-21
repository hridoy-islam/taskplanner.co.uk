


// import PageHead from '@/components/shared/page-head';
// import { Breadcrumbs } from '@/components/shared/breadcrumbs';
// import { useEffect, useMemo, useState } from 'react';
// import { useToast } from '@/components/ui/use-toast';

// import { CardContent } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';

// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger
// } from '@/components/ui/tooltip';
// import { fetchAllTasks, updateTask } from '@/redux/features/allTaskSlice';
// import { useDispatch, useSelector } from 'react-redux';
// import type { AppDispatch, RootState } from '@/redux/store';
// import moment from 'moment';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Badge } from '@/components/ui/badge';
// import {
//   ArrowRight,
//   Calendar,
//   CircleUser,
//   Star,
//   UserRoundCheck
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import TaskSkeleton from '@/components/shared/skeletonLoader';

// type PopulatedUserReference = {
//   _id: string;
//   name: string;
// };

// type Task = {
//   _id: string;
//   taskName: string;
//   status: string;
//   dueDate?: string;
//   important: boolean;
//   author: string | PopulatedUserReference;
//   assigned?: string | PopulatedUserReference;
// };



// export default function ImportantPage() {
//   const { toast } = useToast();
//   const dispatch = useDispatch<AppDispatch>();
//   const [searchTerm, setSearchTerm] = useState('');
//   const user = useSelector((state: any) => state.auth.user);

//   const { tasks } = useSelector((state: RootState) => state.alltasks);


//   const getUserName = (
//     userRef: string |PopulatedUserReference | undefined
//   ): string => {
//     if (!userRef) return 'Unassigned';
//     return typeof userRef === 'string' ? 'Loading...' : userRef.name;
//   };



//   const filteredTasks = useMemo(() => {
//     return tasks.filter((task) => {
//       if (!task) return false;
  
//       const matchesSearch = (task.taskName?.toLowerCase() || '').includes(
//         searchTerm.toLowerCase()
//       );
//       const isPending = task.status === 'pending';
//       const isImportant = task.important === true;
  
//       return matchesSearch && isPending && isImportant;
//     });
//   }, [tasks, searchTerm]);
  

//   useEffect(() => {
      
  
//       const interval = setInterval(() => {
        
//         dispatch(fetchAllTasks({ userId: user._id }));
//       }, 5000);
  
//       return () => clearInterval(interval);
//     }, [dispatch, user?._id, toast]);

//   const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(event.target.value);
//   };

//   const handleMarkAsImportant = async (taskId: string) => {
//     const taskToToggle = tasks.find((task) => task._id === taskId);
//     if (!taskToToggle) return;

//     const updatedTasks = tasks.map((task) =>
//       task._id === taskId ? { ...task, important: !task.important } : task
//     );
//     // setTasks(updatedTasks);

//     try {
//       await dispatch(
//         updateTask({
//           taskId,
//           taskData: {
//             important: !taskToToggle.important
//           }
//         })
//       ).unwrap();
//       dispatch(fetchAllTasks({ userId: user._id }));

//       toast({ title: 'Task Updated' });
//     } catch (error) {
//       // setTasks(tasks);
//       toast({
//         variant: 'destructive',
//         title: 'Something Went Wrong!'
//       });
//     }
//   };

//   const handleToggleTaskCompletion = async (taskId: string) => {
//     const taskToToggle = tasks.find((task) => task._id === taskId);
//     if (!taskToToggle) return;

//     const updatedStatus =
//       taskToToggle.status === 'completed' ? 'pending' : 'completed';

//     // Immediate UI update
//     // setTasks((prev) =>
//     //   prev.map((task) =>
//     //     task._id === taskId ? { ...task, status: updatedStatus } : task
//     //   )
//     // );

//     try {
//       await dispatch(
//         updateTask({
//           taskId,
//           taskData: { status: updatedStatus }
//         })
//       ).unwrap();
//       dispatch(fetchAllTasks({ userId: user._id }));

//       toast({ title: 'Task status updated' });
//     } catch (error: any) {
//       // setTasks(tasks);
//       toast({
//         variant: 'destructive',
//         title: 'Failed to update task',
//         description: error?.message || 'An error occurred'
//       });
//     }
//   };
//   return (
//     <div className="p-4 ">
//       <PageHead title="Task Page" />
//       <div className="px-4">
//         <Breadcrumbs
//           items={[
//             { title: 'Dashboard', link: '/dashboard' },
//             { title: 'Important Task', link: `#` }
//           ]}
//         />
//       </div>
//       <div className="px-4">
//         <Input
//           className=" my-4 flex h-[40px] w-full items-center px-6 py-4"
//           placeholder="Search notes..."
//           value={searchTerm}
//           onChange={handleSearch}
//         />
//       </div>
//       {/* {isInitialLoad ? (
//         <TaskSkeleton />
//       ) : ( */}
//       <CardContent className="flex-1 overflow-y-auto px-4 scrollbar-hide">
//         <ScrollArea className="h-[calc(86vh-8rem)]">
//           <div className="space-y-2">
//             {filteredTasks.map((task) => (
//               <div
//                 key={task._id}
//                 className={`flex items-center space-x-2 rounded-lg border border-gray-200 p-3 shadow-md ${
//                   task.important ? 'bg-orange-100' : 'bg-white'
//                 }`}
//               >
//                 <div className="flex w-full flex-col items-center justify-between gap-2 lg:flex-row">
//                   <div className="flex w-full flex-row items-center justify-between gap-2">
//                     <div className="flex items-center justify-center gap-2">
//                       <Checkbox
//                         checked={task.status === 'completed'}
//                         onCheckedChange={() =>
//                           handleToggleTaskCompletion(task._id)
//                         }
//                       />
//                       <span
//                         className={`flex-1 max-lg:text-xs ${
//                           task.status === 'completed'
//                             ? 'text-gray-500 line-through'
//                             : ''
//                         }`}
//                       >
//                         {task.taskName}
//                       </span>
//                     </div>

//                     <div className="flex flex-row items-center justify-end gap-4">
//                       <div className="flex flex-row  gap-8">
//                         <div className="flex items-center justify-center gap-2 max-lg:hidden">
//                           <TooltipProvider>
//                             <Tooltip>
//                               <TooltipTrigger>
//                                 <Badge
//                                   variant="outline"
//                                   className="flex items-center gap-1 bg-green-100 text-black"
//                                 >
//                                   <UserRoundCheck className="h-3 w-3" />
//                                   <span className="truncate">
//                                   {getUserName(task.author)}
//                                   </span>
//                                 </Badge>
//                               </TooltipTrigger>
//                               <TooltipContent>
//                                 <p>Created By {getUserName(task.author)}</p>
//                               </TooltipContent>
//                             </Tooltip>
//                           </TooltipProvider>

//                           <Badge>
//                             <ArrowRight className="h-3 w-3 " />
//                           </Badge>

//                           <TooltipProvider>
//                             <Tooltip>
//                               <TooltipTrigger>
//                                 <Badge
//                                   variant="outline"
//                                   className="flex items-center gap-1 bg-purple-100 text-black"
//                                 >
//                                   <CircleUser className="h-3 w-3" />
//                                   <span className="truncate">
//                                   {getUserName(task.assigned)}
//                                   </span>
//                                 </Badge>
//                               </TooltipTrigger>
//                               <TooltipContent>
//                                 <p>Assigned To {getUserName(task.assigned)}</p>
//                               </TooltipContent>
//                             </Tooltip>
//                           </TooltipProvider>
//                         </div>
//                       </div>

//                       <div className="flex flex-row gap-8">
//                         <div className="flex items-center justify-center gap-2 max-lg:hidden">
//                           <Badge
//                             variant="outline"
//                             className="bg-red-700 text-white"
//                           >
//                             <div className="flex flex-row gap-1">
//                               <Calendar className="h-3 w-3" />
//                               {moment(task.dueDate).format('MMM Do YYYY')}
//                             </div>
//                           </Badge>
//                         </div>
//                       </div>
//                       <div className="flex flex-row lg:gap-4">
//                         <Button
//                           variant={null}
//                           size="icon"
//                           onClick={() => handleMarkAsImportant(task._id)}
//                         >
//                           <Star
//                             className={`h-4 w-4 ${task.important ? 'text-orange-600' : ''}`}
//                           />
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </ScrollArea>
//       </CardContent>
//       {/* )} */}
//     </div>
//   );
// }





import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import {  updateTask } from '@/redux/features/allTaskSlice';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store';

import moment from 'moment';

import { usePollTasks } from '@/hooks/usePolling';
import TaskList from '@/components/shared/task-list';
import { ScrollArea } from '@/components/ui/scroll-area';
import PageHead from '@/components/shared/page-head';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

type PopulatedUserReference = {
  _id: string;
  name: string;
};

type Task = {
  _id: string;
  taskName: string;
  status: string;
  dueDate?: string;
  important: boolean;
  author: string | PopulatedUserReference;
  assigned?: string | PopulatedUserReference;
  updatedAt: string;
};

export default function ImportantPage() {
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const { tasks } = useSelector((state: RootState) => state.alltasks);
  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    const filterTasks = () => {
      const filtered = tasks
        .filter((task) => {
          if (!task) return false;
    
          const matchesSearch = (task.taskName?.toLowerCase() || '').includes(
            searchTerm.toLowerCase()
          );
    
          const isPending = task.status === 'pending';
          const isImportant = task.important === true;
          const isMarkedByUser =
            Array.isArray(task.importantBy) && task.importantBy.includes(user._id);
    
          return matchesSearch && isPending && isImportant && isMarkedByUser;
        })
        .sort((a, b) => {
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        });
    
      setFilteredTasks(filtered);
    };
    

    filterTasks();
  }, [searchTerm, tasks, user._id]);

  // Enable polling to keep tasks updated
  usePollTasks({
    userId: user._id,
    tasks,
    setOptimisticTasks: setFilteredTasks

  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // In parent component
  const handleMarkAsImportant = async (taskId: string) => {
    const originalTasks = [...tasks];
    const currentTask = tasks.find((task) => task?._id === taskId);
    if (!currentTask || !user?._id) return;
  
    const alreadyMarked = currentTask.importantBy?.includes(user._id);
  
    // Toggle the user's ID in the array
    const updatedImportantBy = alreadyMarked
      ? currentTask.importantBy?.filter((id) => id !== user._id) // remove
      : [...(currentTask.importantBy || []), user._id]; // add
  
    // Optimistic update
    setFilteredTasks((prev) =>
      prev.map((task) =>
        task._id === taskId
          ? { ...task, importantBy: updatedImportantBy }
          : task
      )
    );
  
    try {
      await dispatch(
        updateTask({
          taskId,
          taskData: {
            importantBy: updatedImportantBy
          },
        })
      ).unwrap();
    } catch (error) {
      setFilteredTasks(originalTasks);
      toast({
        variant: 'destructive',
        title: 'Failed to update task importance',
      });
    }
  };

  const handleToggleTaskCompletion = async (taskId: string) => {
    const taskToToggle = tasks.find((task) => task._id === taskId);
    if (!taskToToggle) return;

    const updatedStatus =
      taskToToggle.status === 'completed' ? 'pending' : 'completed';

    try {
      await dispatch(
        updateTask({
          taskId,
          taskData: { status: updatedStatus }
        })
      ).unwrap();

      toast({ title: 'Task status updated' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to update task',
        description: error?.message || 'An error occurred'
      });
    }
  };

  return (
    <div className="p-4 ">
          <PageHead title="Task Page" />
          <div className="px-4">
            <Breadcrumbs
              items={[
                { title: 'Dashboard', link: '/dashboard' },
                { title: 'Important Task', link: `#` }
              ]}
            />
          </div>
          <div className="px-6">
            <Input
              className=" my-4 flex h-[40px] w-full items-center px-6 py-4"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
      <ScrollArea className="h-[calc(88vh-7rem)] flex-1 overflow-y-auto px-6 scrollbar-hide">
        <TaskList
          tasks={filteredTasks}
          onMarkAsImportant={handleMarkAsImportant}
          onToggleTaskCompletion={handleToggleTaskCompletion}
        />
      </ScrollArea>
    </div>
  );
}
