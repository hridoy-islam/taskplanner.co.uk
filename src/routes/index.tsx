import ProtectedRoute from '@/components/shared/ProtectedRoute';
import ForgotPassword from '@/pages/auth/forget-password';
import SignUpPage from '@/pages/auth/sign-up';
import CompanyPage from '@/pages/company';
import CreatorPage from '@/pages/creator';
import DirectorPage from '@/pages/director';
import HomePage from '@/pages/home';
import ImportantPage from '@/pages/important';
import NotFound from '@/pages/not-found';
import NotesPage from '@/pages/notes';
import PlannerPage from '@/pages/planner';
import ProfilePage from '@/pages/profile';
import TaskPage from '@/pages/task';
import TodayPage from '@/pages/today';
import UserPage from '@/pages/users';
import { Suspense, lazy } from 'react';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';

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
          path: 'users',
          element: <UserPage />
        },
        {
          path: 'important',
          element: <ImportantPage />
        },
        {
          path: 'director',
          element: <DirectorPage />
        },
        {
          path: 'company',
          element: <CompanyPage />
        },
        {
          path: 'creator',
          element: <CreatorPage />
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
