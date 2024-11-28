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

export default function DashboardPage() {
  const { user } = useSelector((state: any) => state.auth);
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

        <Tabs defaultValue="dueTasks" className="space-y-4">
          {/* Tabs list for navigation */}
          <TabsList>
            <TabsTrigger value="dueTasks">Overdue</TabsTrigger>
            <TabsTrigger value="upcomingTasks">Due In 7 Days</TabsTrigger>
            <TabsTrigger value="assignedTasks">Assigned To others</TabsTrigger>
            <TabsTrigger value="completedTasks">Completed</TabsTrigger>
          </TabsList>

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
