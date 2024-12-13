import ProtectedRoute from '@/components/shared/ProtectedRoute';
import AssignedTaskPage from '@/pages/assignedtask';
import ForgotPassword from '@/pages/auth/forget-password';
import SignUpPage from '@/pages/auth/sign-up';
import CompanyPage from '@/pages/company';
import CompanyProfileDetail from '@/pages/company/profile/company-profile-detail';
import CompletedTaskPage from '@/pages/completedtask';
import CreatorPage from '@/pages/creator';
import CreatorProfileDetail from '@/pages/creator/profile/creator-profile-detail';
import DirectorPage from '@/pages/director';
import DirectorProfileDetail from '@/pages/director/profile/director-profile-detail';
import DueTaskPage from '@/pages/duetask';
import GroupPage from '@/pages/group';
import HomePage from '@/pages/home';
import ImportantPage from '@/pages/important';
import NotFound from '@/pages/not-found';
import NotesPage from '@/pages/notes';
import PlannerPage from '@/pages/planner';
import ProfilePage from '@/pages/profile';
import TaskPage from '@/pages/task';
import TodayPage from '@/pages/today';
import UpcomingTaskPage from '@/pages/upcomingtask';
import UserPage from '@/pages/users';
import UserProfileDetail from '@/pages/users/profile/user-profile-detail';
import { Suspense, lazy } from 'react';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';
import GroupChat from '../pages/group/chat';
import NotificationsPage from '@/pages/notification';
import Otp from '@/pages/auth/otp';
import NewPassword from '@/pages/new-password';

const DashboardLayout = lazy(
  () => import('@/components/layout/dashboard-layout')
);
const SignInPage = lazy(() => import('@/pages/auth/signin'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));

// ----------------------------------------------------------------------

export default function AppRouter() {
  const dashboardRoutes = [
    {
      path: '/dashboard',
      element: (
        <DashboardLayout>
          <ProtectedRoute>
            <Suspense>
              <Outlet />
            </Suspense>
          </ProtectedRoute>
        </DashboardLayout>
      ),
      children: [
        {
          element: <DashboardPage />,
          index: true
        },
        {
          path: 'group',
          element: <GroupPage />
        },
        {
          path: 'group/:id',
          element: <GroupChat />
        },
        {
          path: 'users',
          element: <UserPage />
        },
        {
          path: 'users/:id',
          element: <UserProfileDetail />
        },
        {
          path: 'assignedtask',
          element: <AssignedTaskPage />
        },
        {
          path: 'duetask',
          element: <DueTaskPage />
        },
        {
          path: 'upcomingtask',
          element: <UpcomingTaskPage />
        },
        {
          path: 'important',
          element: <ImportantPage />
        },
        {
          path: 'completedtask',
          element: <CompletedTaskPage />
        },
        {
          path: 'director',
          element: <DirectorPage />
        },
        {
          path: 'director/:id',
          element: <DirectorProfileDetail />
        },
        {
          path: 'company',
          element: <CompanyPage />
        },
        {
          path: 'company/:id',
          element: <CompanyProfileDetail />
        },
        {
          path: 'creator',
          element: <CreatorPage />
        },
        {
          path: 'creator/:id',
          element: <CreatorProfileDetail />
        },
        {
          path: 'today',
          element: <TodayPage />
        },
        {
          path: 'notes',
          element: <NotesPage />
        },
        {
          path: 'planner',
          element: <PlannerPage />
        },
        {
          path: 'profile',
          element: <ProfilePage />
        },
        {
          path: 'task/:id',
          element: <TaskPage />
        },
        {
          path: 'notifications',
          element: <NotificationsPage />
        }
      ]
    }
  ];

  const publicRoutes = [
    {
      path: '/',
      element: <HomePage />,
      index: true
    },
    {
      path: '/login',
      element: <SignInPage />
    },
    {
      path: '/signup',
      element: <SignUpPage />,
      index: true
    },
    {
      path: '/forgot-password',
      element: <ForgotPassword />,
      index: true
    },
    {
      path: '/otp',
      element: <Otp />,
      index: true
    },
    {
      path: '/new-password',
      element: <NewPassword />,
      index: true
    },
    {
      path: '/404',
      element: <NotFound />
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />
    }
  ];

  const routes = useRoutes([...dashboardRoutes, ...publicRoutes]);

  return routes;
}
