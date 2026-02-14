import ProtectedRoute from '@/components/shared/ProtectedRoute';
import AssignedTaskPage from '@/pages/assignedtask';
import ForgotPassword from '@/pages/auth/forget-password';
import SignUpPage from '@/pages/auth/sign-up';
import CompanyPage from '@/pages/adminModule/company';
import CompanyProfileDetail from '@/pages/adminModule/company/profile/company-profile-detail';
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
import AdminDashboardPage from '@/pages/adminModule/AdminDashboard';
import AdminUserPage from '@/pages/adminModule/user';
import SubscriptionPlanPage from '@/pages/adminModule/SubscriptionPlan';
import { CompanyDetailsPage } from '@/pages/adminModule/company/companyDetails';
import CompanyDashboardPage from '@/pages/companyModule/CompanyDashboard';
import CompanyLayout from '@/components/layout/company-layout';
import CompanyUserTaskPage from '@/pages/companyModule/task';
import CompanyUserTableList from '@/pages/companyModule/users/components/UserTableList';
import CompanyUserProfileDetail from '@/pages/companyModule/users/profile/user-profile-detail';

import CompanyImportantPage from '@/pages/companyModule/important';
import CompanyGroupPage from '@/pages/companyModule/group';
import CompanyGroupChat from '@/pages/companyModule/group/chat';
import CompanyTaskPlanner from '@/pages/companyModule/planner';
import CompanyNotesPage from '@/pages/companyModule/notes';
import CompanyNotificationsPage from '@/pages/companyModule/notification';
import StaffLayout from '@/components/layout/staff-layout';
import StaffDashboardPage from '@/pages/staffModule/StaffDashboard';
import StaffTaskPage from '@/pages/staffModule/task';
import StaffGroupPage from '@/pages/staffModule/group';
import StaffGroupChat from '@/pages/staffModule/group/chat';
import StaffImportantPage from '@/pages/staffModule/important';
import StaffTaskPlanner from '@/pages/staffModule/planner';
import StaffNotesPage from '@/pages/staffModule/notes';
import StaffNotificationsPage from '@/pages/staffModule/notification';
import ManageUserPage from '@/pages/staffModule/users';
import ManageUserTableList from '@/pages/staffModule/users/components/UserTableList';
import CompanyTaskPage from '@/pages/companyModule/task';

const DashboardLayout = lazy(
  () => import('@/components/layout/dashboard-layout')
);
const Layout = lazy(() => import('@/components/layout/layout'));
const SignInPage = lazy(() => import('@/pages/auth/signin'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));

// ----------------------------------------------------------------------

export default function AppRouter() {
  const AdmindashboardRoutes = [
    {
      path: '/dashboard/admin',
      element: (
        <DashboardLayout>
          <ProtectedRoute allowedRoles={['admin', 'director']}>
            <Suspense>
              <Outlet />
            </Suspense>
          </ProtectedRoute>
        </DashboardLayout>
      ),
      children: [
        {
          element: <AdminDashboardPage />,
          index: true
        },

        {
          path: 'director',
          element: (
            <ProtectedRoute allowedRoles={['admin']}>
              <DirectorPage />
            </ProtectedRoute>
          )
        },
        {
          path: 'director/:id',
          element: (
            <ProtectedRoute allowedRoles={['admin']}>
              <DirectorProfileDetail />
            </ProtectedRoute>
          )
        },
        {
          path: 'company',
          element: (
            <ProtectedRoute allowedRoles={['admin']}>
              <CompanyPage />
            </ProtectedRoute>
          )
        },
        {
          path: 'company/:id',
          element: (
            <ProtectedRoute allowedRoles={['admin']}>
              <CompanyDetailsPage />
            </ProtectedRoute>
          )
        },

        {
          path: 'notifications',
          element: <NotificationsPage />
        },
        
        {
          path: 'users',
          element: (
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUserPage />
            </ProtectedRoute>
          )
        },
        {
          path: 'profile',
          element: <ProfilePage />
        },
        {
          path: 'subscription-plans',
          element: (
            <ProtectedRoute allowedRoles={['admin']}>
              <SubscriptionPlanPage />
            </ProtectedRoute>
          )
        }
      ]
    }
  ];


   const CompanyDashboardRoutes = [
    {
      path: '/company/:id',
      element: (
        <CompanyLayout>
          <ProtectedRoute
            allowedRoles={['admin', 'director', 'company', 'creator', 'user']}
          >
            <Suspense>
              <Outlet />
            </Suspense>
          </ProtectedRoute>
        </CompanyLayout>
      ),
      children: [
        {
          element: <CompanyDashboardPage />,
          index: true
        },
        {
          path: 'group',
          element: <CompanyGroupPage />
        },
        {
          path: 'group/:gid',
          element: <CompanyGroupChat />
        },
        {
          path: 'users',
          element: <CompanyUserTableList />
        },
        {
          path: 'users/:uid',
          element: <CompanyUserProfileDetail />
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
          element: <CompanyImportantPage />
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
          path: 'company/:cid',
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
          element: <CompanyNotesPage />
        },
        {
          path: 'planner',
          element: <CompanyTaskPlanner />
        },
        {
          path: 'profile',
          element: <ProfilePage />
        },
        {
          path: 'task/:uid',
          element: <CompanyTaskPage />
        },
        {
          path: 'task-details/:tid',
          element: <TaskDetailsPage />
        },
        {
          path: 'notifications',
          element: <CompanyNotificationsPage />
        }
      ]
    }
  ];


   const userDashboardRoutes = [
    {
      path: '/company/:id/user/:uid',
      element: (
        <StaffLayout>
          <ProtectedRoute
            allowedRoles={['admin', 'director', 'company', 'creator', 'user']}
          >
            <Suspense>
              <Outlet />
            </Suspense>
          </ProtectedRoute>
        </StaffLayout>
      ),
      children: [
        {
          element: <StaffDashboardPage />,
          index: true
        },
        {
          path: 'group',
          element: <StaffGroupPage />
        },
        {
          path: 'group/:gid',
          element: <StaffGroupChat />
        },
        {
          path: 'users',
          element: <ManageUserPage />
        },
        {
          path: 'users/:sid',
          element: <ManageUserTableList />
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
          element: <StaffImportantPage />
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
          path: 'director/:sid',
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
          path: 'company/:cid',
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
          path: 'creator/:sid',
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
          element: <StaffNotesPage />
        },
        {
          path: 'planner',
          element: <StaffTaskPlanner />
        },
        {
          path: 'profile',
          element: <ProfilePage />
        },
        {
          path: 'task/:sid',
          element: <StaffTaskPage />
        },
        {
          path: 'task-details/:tid',
          element: <TaskDetailsPage />
        },
        {
          path: 'notifications',
          element: <StaffNotificationsPage />
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
    ...CompanyDashboardRoutes,
    ...publicRoutes,
    ...layoutRoutes,
    ...AdmindashboardRoutes,
    ...userDashboardRoutes
  ]);

  return routes;
}
