import PageHead from '@/components/shared/page-head.jsx';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs.js';
import { useSelector } from 'react-redux';
import DueTasks from '@/pages/duetask/index';
import UpcomingTasks from '@/pages/upcomingtask/index.tsx'
import CompletedTasks from '@/pages/completedtask/index.tsx';
import { useState } from 'react';
import AssignedTasks from '@/pages/assignedtask/index.tsx';

export default function DashboardPage() {
  const { user } = useSelector((state: any) => state.auth);
  const [selectedTab, setSelectedTab] = useState('dueTasks');

  return (
    <>
      <PageHead title="Dashboard | App" />
      <div className="max-h-screen flex-1 space-y-2 overflow-y-auto px-4 pt-2 md:px-8 md:py-4">
        <div className="flex items-center justify-between space-y-1">
          <h2 className="xl:text-xl text-lg font-bold tracking-tight md:text-3xl">
            Hi, {user.name} 👋
          </h2>
        </div>

        {/* <Tabs defaultValue="overview" className="space-y-4">
          <TabsContent value="overview" className="space-y-4">
            <div className="space-y-4">
              <DueTasks user={user} />
              <UpcomingTasks user={user} />
              <AssignedTasks user={user} />
            </div>
          </TabsContent>
        </Tabs> */}

        <Tabs
          defaultValue="dueTasks"
          value={selectedTab}
          onValueChange={setSelectedTab}
          className=""
        >
          {/* Tabs List for larger screens */}
          <div className="hidden md:flex   ">
            <TabsList className="border border-gray-300 shadow-sm">
              <TabsTrigger value="dueTasks">Overdue</TabsTrigger>
              <TabsTrigger value="upcomingTasks">Due In 7 Days</TabsTrigger>
              <TabsTrigger value="assignedTasks">
                Assigned To others
              </TabsTrigger>
              <TabsTrigger value="completedTasks">Completed</TabsTrigger>
            </TabsList>
          </div>

          {/* Select dropdown for smaller screens */}
          <div className="flex  md:hidden">
            <select
              value={selectedTab}
              onChange={(e) => setSelectedTab(e.target.value)}
              className="w-full rounded border p-2 focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="dueTasks">Overdue</option>
              <option value="upcomingTasks">Due In 7 Days</option>
              <option value="assignedTasks">Assigned To others</option>
              <option value="completedTasks">Completed</option>
            </select>
          </div>

          {/* Tab content */}
          <TabsContent value="dueTasks">
            <DueTasks user={user} />
          </TabsContent>

          <TabsContent value="upcomingTasks">
            <UpcomingTasks user={user} />
          </TabsContent>

          <TabsContent value="assignedTasks">
            <AssignedTasks user={user} />
          </TabsContent>

          <TabsContent value="completedTasks">
            <CompletedTasks user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
