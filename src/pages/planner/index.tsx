// import { useState, useEffect } from "react";
// import {
//   ChevronLeft,
//   ChevronRight,
//   Calendar as CalendarIcon,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useSession } from "next-auth/react";
// import moment from "moment";

import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import PageHead from '@/components/shared/page-head';

// const daysOfWeek = [
//   "Sunday",
//   "Monday",
//   "Tuesday",
//   "Wednesday",
//   "Thursday",
//   "Friday",
//   "Saturday",
// ];

// export default function PlannerPage() {

//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [selectedTasks, setSelectedTasks] = useState([]);
//   const [view, setView] = useState("month");
//   const [tasks, setTasks] = useState([]);

//   const fetchTasksByRange = async (date) => {
//     if (session?.user?.id) {
//       try {
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, "0");
//         const week = String(Math.ceil(date.getDate() / 7)).padStart(2, "0");
//         const token = session.accessToken; // Assuming you have the token in the session

//         let url;

//         if (view === "day") {
//           const formattedDate = date.toISOString().split("T")[0];
//           url = `${process.env.NEXT_PUBLIC_API_URL}/tasks?date=${formattedDate}&author=${session.user.id}`;
//         } else if (view === "week") {
//           url = `${process.env.NEXT_PUBLIC_API_URL}/tasks?year=${year}&week=${week}&author=${session.user.id}`;
//         } else {
//           url = `${process.env.NEXT_PUBLIC_API_URL}/tasks?year=${year}&month=${month}&author=${session.user.id}`;
//         }

//         const response = await fetch(url, {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (!response.ok) {
//           throw new Error("Failed to fetch tasks");
//         }

//         const tasksData = await response.json();
//         setTasks(tasksData);
//       } catch (error) {
//         console.error("Error fetching tasks:", error);
//       }
//     }
//   };

//   useEffect(() => {
//     fetchTasksByRange(currentDate);
//   }, [currentDate, view, session]);

//   const navigateDate = (direction) => {
//     const newDate = new Date(currentDate);
//     if (view === "month") {
//       newDate.setMonth(currentDate.getMonth() + direction);
//     } else if (view === "week") {
//       newDate.setDate(currentDate.getDate() + direction * 7);
//     } else if (view === "day") {
//       newDate.setDate(currentDate.getDate() + direction);
//     }
//     setCurrentDate(newDate);
//   };

//   const getDaysInMonth = (date) => {
//     const year = date.getFullYear();
//     const month = date.getMonth();
//     const days = new Date(year, month + 1, 0).getDate();
//     return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
//   };

//   const getMonthDays = () => {
//     const days = getDaysInMonth(currentDate);
//     const firstDayOfMonth = days[0].getDay();
//     const previousMonthDays = Array.from(
//       { length: firstDayOfMonth },
//       (_, i) => new Date(currentDate.getFullYear(), currentDate.getMonth(), -i)
//     ).reverse();
//     return [...previousMonthDays, ...days];
//   };

//   const getWeekDays = () => {
//     const startOfWeek = new Date(currentDate);
//     startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
//     return Array.from(
//       { length: 7 },
//       (_, i) =>
//         new Date(
//           startOfWeek.getFullYear(),
//           startOfWeek.getMonth(),
//           startOfWeek.getDate() + i
//         )
//     );
//   };

//   const getTasksForDate = (date) => {
//     const formattedDate = date.toISOString().split("T")[0];
//     return tasks?.filter((task) => task.date === formattedDate);
//   };

//   const handleDateClick = (date) => {
//     const dateTasks = getTasksForDate(date);
//     setSelectedDate(date);
//     setSelectedTasks(dateTasks);
//     setIsDialogOpen(true);
//   };

//   const renderMonthView = () => {
//     const monthDays = getMonthDays();
//     return (
//       <div className="grid grid-cols-7 gap-2">
//         {daysOfWeek.map((day) => (
//           <div key={day} className="text-center font-semibold p-2">
//             {day.slice(0, 3)}
//           </div>
//         ))}
//         {monthDays.map((date, index) => {
//           const isCurrentMonth = date.getMonth() === currentDate.getMonth();
//           const isToday = date.toDateString() === new Date().toDateString();
//           const dateTasks = getTasksForDate(date);
//           return (
//             <div
//               key={index}
//               className={`h-auto p-2 border rounded-lg overflow-hidden ${
//                 isCurrentMonth ? "bg-white" : "bg-gray-100"
//               } ${isToday ? "border-blue-500 border-2" : ""}`}
//               onClick={() => handleDateClick(date)}
//             >
//               <div className={`text-sm ${isToday ? "font-bold" : ""}`}>
//                 {date.getDate()}
//               </div>
//               <ScrollArea className="h-24 w-full">
//                 {dateTasks?.map((task) => (
//                   <div
//                     key={task.id}
//                     className={`text-xs p-1 mb-1 rounded ${task.color}`}
//                   >
//                     {task.title}
//                   </div>
//                 ))}
//               </ScrollArea>
//             </div>
//           );
//         })}
//       </div>
//     );
//   };

//   const renderWeekView = () => {
//     const weekDays = getWeekDays();
//     return (
//       <div className="grid grid-cols-7 gap-2">
//         {weekDays.map((date, index) => {
//           const isToday = date.toDateString() === new Date().toDateString();
//           const dateTasks = getTasksForDate(date);
//           return (
//             <div key={index} className="border rounded-lg overflow-hidden">
//               <div
//                 className={`text-center p-2 ${
//                   isToday ? "bg-blue-100 font-bold" : "bg-gray-100"
//                 }`}
//               >
//                 {daysOfWeek[index].slice(0, 3)}
//                 <br />
//                 {date.getDate()}
//               </div>
//               <ScrollArea className="h-96 w-full p-2">
//                 {dateTasks?.map((task) => (
//                   <div
//                     key={task.id}
//                     className={`p-2 mb-2 rounded ${task.color}`}
//                   >
//                     <div className="font-semibold">{task.title}</div>
//                     <div className="text-xs">{task.description}</div>
//                   </div>
//                 ))}
//               </ScrollArea>
//             </div>
//           );
//         })}
//       </div>
//     );
//   };

//   const renderDayView = () => {
//     const dateTasks = getTasksForDate(currentDate);
//     return (
//       <div className="border rounded-lg p-4">
//         <h2 className="text-xl font-bold mb-4">
//           {currentDate.toLocaleDateString("en-US", {
//             weekday: "long",
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//           })}
//         </h2>
//         <ScrollArea className="h-[calc(100vh-200px)] w-full">
//           {dateTasks?.map((task) => (
//             <div key={task.id} className={`p-4 mb-4 rounded ${task.color}`}>
//               <div className="font-semibold text-lg">{task.title}</div>
//               <div className="text-sm mt-2">{task.description}</div>
//             </div>
//           ))}
//         </ScrollArea>
//       </div>
//     );
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <Card className="w-full">
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-2xl font-bold">
//             {currentDate.toLocaleString("default", {
//               month: "long",
//               year: "numeric",
//             })}
//           </CardTitle>
//           <div className="flex items-center space-x-2">
//             <Tabs value={view} onValueChange={setView}>
//               <TabsList>
//                 <TabsTrigger value="month">Month</TabsTrigger>
//                 <TabsTrigger value="week">Week</TabsTrigger>
//                 <TabsTrigger value="day">Day</TabsTrigger>
//               </TabsList>
//             </Tabs>
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={() => navigateDate(-1)}
//             >
//               <ChevronLeft />
//             </Button>
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={() => navigateDate(1)}
//             >
//               <ChevronRight />
//             </Button>
//             <Popover>
//               <PopoverTrigger>
//                 <Button variant="outline">
//                   <CalendarIcon />
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent>
//                 <Calendar
//                   mode="single"
//                   selected={selectedDate}
//                   onSelect={(date) => {
//                     if (date) {
//                       setCurrentDate(date);
//                       setSelectedDate(date);
//                     }
//                   }}
//                   initialFocus
//                 />
//               </PopoverContent>
//             </Popover>
//           </div>
//         </CardHeader>
//         <CardContent>
//           {view === "month" && renderMonthView()}
//           {view === "week" && renderWeekView()}
//           {view === "day" && renderDayView()}
//         </CardContent>
//       </Card>

//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>
//               Tasks for{" "}
//               {selectedDate?.toLocaleDateString("en-US", {
//                 weekday: "long",
//                 year: "numeric",
//                 month: "long",
//                 day: "numeric",
//               })}
//             </DialogTitle>
//           </DialogHeader>
//           <div className="grid grid-cols-1 gap-4">
//             {selectedTasks?.map((task) => (
//               <div key={task.id} className={`p-4 mb-2 rounded ${task.color}`}>
//                 <h3 className="font-semibold">{task.title}</h3>
//                 <p>{task.description}</p>
//               </div>
//             ))}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

export default function PlannerPage() {
  return (
    <div className="space-y-4 p-4 md:p-8">
      <PageHead title="Task Planner" />
      <Breadcrumbs
        items={[
          { title: 'Dashboard', link: '/dashboard' },
          { title: 'Planner', link: '/planner' }
        ]}
      />
      <h1 className="font-bold tracking-tight">Planner Page Comming Soon</h1>
    </div>
  );
}
