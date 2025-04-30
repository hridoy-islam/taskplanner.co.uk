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
import AssignedTasksPage from '@/pages/assignedtask';
import TaskDetailsPage from '@/pages/task-details';
import VerifyPage from '@/pages/auth/verify';
import PersonalInformationPage from '@/pages/personalInformation';
import Planner from '@/pages/plannerpage';
import TaskManagementPage from '@/pages/TaskManagement';
import ProjectManagement from '@/pages/projectManagement';
import TeamCollaborationPage from '@/pages/TeamCollab';
import GroupProjectPage from '@/pages/groupProject';
import NotePage from '@/pages/notePage';
import RemainderPage from '@/pages/remainderPage';
import ReminderPage from '@/pages/remainderPage';
import CustomerSupportPage from '@/pages/customer-support';
import PersonalPage from '@/pages/personalPage';
import MarketingAndSalesPage from '@/pages/marketingPage';
import EducationPage from '@/pages/education';
import CustomerStories from '@/pages/customerstories';
import HelpResources from '@/pages/Help';
import TaskPlannerGuide from '@/pages/taskplannerGuide';
import AutomationPage from '@/pages/automation';
import PricingPage from '@/pages/pricing';
import DownloadApp from '@/pages/downloadPage';
import FaqPage from '@/pages/faq';
import ProductivityMethods from '@/pages/productivity';
import AboutUs from '@/pages/aboutus';
import Careers from '@/pages/career';
import TermsAndConditions from '@/pages/terms';
import PrivacyPolicyPage from '@/pages/privacyPolicy';
import SecurityPolicyPage from '@/pages/securiyPolicy';

const DashboardLayout = lazy(
  () => import('@/components/layout/dashboard-layout')
);
const Layout = lazy(() => import('@/components/layout/layout'));
const SignInPage = lazy(() => import('@/pages/auth/signin'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));

// ----------------------------------------------------------------------

export default function AppRouter() {
  const dashboardRoutes = [
    {
      path: '/dashboard',
      element: (
        <DashboardLayout>
          <ProtectedRoute
            allowedRoles={['admin', 'director', 'company', 'creator', 'user']}
          >
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
          element: <AssignedTasksPage />
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
          element: (
            <ProtectedRoute allowedRoles={['admin', 'director']}>
              <DirectorPage />
            </ProtectedRoute>
          )
        },
        {
          path: 'director/:id',
          element: (
            <ProtectedRoute allowedRoles={['admin', 'director']}>
              <DirectorProfileDetail />
            </ProtectedRoute>
          )
        },
        {
          path: 'company',
          element: (
            <ProtectedRoute allowedRoles={['admin', 'director', 'company']}>
              <CompanyPage />
            </ProtectedRoute>
          )
        },
        {
          path: 'company/:id',
          element: (
            <ProtectedRoute allowedRoles={['admin', 'director', 'company']}>
              <CompanyProfileDetail />
            </ProtectedRoute>
          )
        },
        {
          path: 'creator',
          element: (
            <ProtectedRoute
              allowedRoles={['admin', 'director', 'company', 'creator']}
            >
              <CreatorPage />
            </ProtectedRoute>
          )
        },
        {
          path: 'creator/:id',
          element: (
            <ProtectedRoute
              allowedRoles={['admin', 'director', 'company', 'creator']}
            >
              <CreatorProfileDetail />
            </ProtectedRoute>
          )
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
          path: 'task-details/:id',
          element: <TaskDetailsPage />
        },
        {
          path: 'notifications',
          element: <NotificationsPage />
        }
      ]
    }
  ];

  const layoutRoutes = [
    {
      path: '/',
      element: (
        <Layout>
          <Outlet />
        </Layout>
      ),
      children: [
        {
          element: <HomePage />,
          index: true
        },
        {
          path: 'planner',
          element: <Planner />,
          index: true
        },
        {
          path: 'task-management',
          element: <TaskManagementPage />,
          index: true
        },
        {
          path: 'project-management',
          element: <ProjectManagement />,
          index: true
        },
        {
          path: 'team-collaboration',
          element: <TeamCollaborationPage />,
          index: true
        },
        {
          path: 'group-project',
          element: <GroupProjectPage />,
          index: true
        },
        {
          path: 'note',
          element: <NotePage />,
          index: true
        },
        {
          path: 'reminder',
          element: <ReminderPage />,
          index: true
        },
        {
          path: 'customer-support',
          element: <CustomerSupportPage />,
          index: true
        },
        {
          path: 'personal',
          element: <PersonalPage />,
          index: true
        },
        {
          path: 'marketing-sales',
          element: <MarketingAndSalesPage />,
          index: true
        },
        {
          path: 'automation',
          element: <AutomationPage />,
          index: true
        },
        {
          path: 'education',
          element: <EducationPage />,
          index: true
        },
        {
          path: 'customer-stories',
          element: <CustomerStories />,
          index: true
        },
        {
          path: 'help',
          element: <HelpResources />,
          index: true
        },
        {
          path: 'guide',
          element: <TaskPlannerGuide />,
          index: true
        },
        {
          path: 'pricing',
          element: <PricingPage />,
          index: true
        },
        {
          path: 'download-app',
          element: <DownloadApp />,
          index: true
        },
        {
          path: 'faq',
          element: <FaqPage />,
          index: true
        },
        {
          path: 'productivity-method',
          element: <ProductivityMethods />,
          index: true
        },
        {
          path: 'about-us',
          element: <AboutUs />,
          index: true
        },

        {
          path: 'careers',
          element: <Careers />,
          index: true
        },
        {
          path: 'terms',
          element: <TermsAndConditions />,
          index: true
        },
        {
          path: 'privacy-policy',
          element: <PrivacyPolicyPage />,
          index: true
        }
        ,
        {
          path: 'security-policy',
          element: <SecurityPolicyPage />,
          index: true
        }
      ]
    }
  ];

  const publicRoutes = [
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
      path: '/not-verified',
      element: <VerifyPage />,
      index: true
    },
    {
      path: '/personal-details',
      element: <PersonalInformationPage />,
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

  const routes = useRoutes([
    ...dashboardRoutes,
    ...publicRoutes,
    ...layoutRoutes
  ]);

  return routes;
}
