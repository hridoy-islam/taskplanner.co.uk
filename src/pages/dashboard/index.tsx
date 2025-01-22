import PageHead from '@/components/shared/page-head.jsx';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs.js';
import { useSelector } from 'react-redux';
import DueTasks from '@/components/shared/due-tasks.js';
import UpcomingTasks from '@/components/shared/upcomming-tasks.js';
import AssignedTasks from '@/components/shared/assigned-tasks';
import CompletedTasks from '@/components/shared/completed-tasks';
import { useState } from 'react';

export default function DashboardPage() {
  const { user } = useSelector((state: any) => state.auth);
  const [selectedTab, setSelectedTab] = useState('dueTasks');

  return (
    <>
      <PageHead title="Dashboard | App" />
      <div className="max-h-screen flex-1 space-y-4 overflow-y-auto p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
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
          className="space-y-4"
        >
          {/* Tabs List for larger screens */}
          <div className="hidden md:flex">
            <TabsList>
              <TabsTrigger value="dueTasks">Overdue</TabsTrigger>
              <TabsTrigger value="upcomingTasks">Due In 7 Days</TabsTrigger>
              <TabsTrigger value="assignedTasks">
                Assigned To others
              </TabsTrigger>
              <TabsTrigger value="completedTasks">Completed</TabsTrigger>
            </TabsList>
          </div>

          {/* Select dropdown for smaller screens */}
          <div className="flex md:hidden">
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
          <TabsContent value="dueTasks" className="space-y-4">
            <DueTasks user={user} />
          </TabsContent>

          <TabsContent value="upcomingTasks" className="space-y-4">
            <UpcomingTasks user={user} />
          </TabsContent>

          <TabsContent value="assignedTasks" className="space-y-4">
            <AssignedTasks user={user} />
          </TabsContent>

          <TabsContent value="completedTasks" className="space-y-4">
            <CompletedTasks user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
