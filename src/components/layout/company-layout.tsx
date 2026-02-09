import { useEffect, useState } from 'react';
import MobileSidebar from '../shared/mobile-sidebar';
import AutoLogout from '../shared/auto-logout';
import Header from '../shared/AppHeader';
import UserList from '../shared/user-list';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchCompanyUsers } from '@/redux/features/userSlice';

const navItems = [
  // 1. Dashboard (Visible to everyone)
  {
    title: 'Dashboard',
    href: '/dashboard/admin',
    icon: 'dashboard',
    label: 'Dashboard',
    roles: ['admin']
  },
  {
    title: 'Company',
    href: '/dashboard/admin/company',
    icon: 'company',
    label: 'Company',
    roles: ['admin']
  },
  {
    title: 'Manager',
    href: '/dashboard/admin/manager',
    icon: 'dashboard',
    label: 'Dashboard',
    roles: ['admin']
  },
  {
    title: 'Users',
    href: '/dashboard/admin/users',
    icon: 'users',
    label: 'Users',
    roles: ['admin']
  },
  {
    title: 'Subscription Plans',
    href: '/dashboard/admin/subscription-plans',
    icon: 'users',
    label: 'Users',
    roles: ['admin']
  },

  {
    title: 'Today',
    href: '/dashboard/today',
    icon: 'today',
    label: 'Today',
    roles: ['user', 'company', 'creator']
  },
  {
    title: 'Groups',
    href: '/dashboard/group',
    icon: 'group',
    label: 'Groups',
    roles: ['user', 'company', 'creator']
  },
  {
    title: 'Notes',
    href: '/dashboard/notes',
    icon: 'notes',
    label: 'Notes',
    roles: ['user', 'company', 'creator']
  },
  {
    title: 'Important',
    href: '/dashboard/important',
    icon: 'important',
    label: 'Important',
    roles: ['user', 'company', 'creator']
  },
  {
    title: 'Planner',
    href: '/dashboard/planner',
    icon: 'planner',
    label: 'Planner',
    roles: ['user', 'company', 'creator']
  },

  {
    title: 'Manager',
    href: '/dashboard/creator',
    icon: 'creator',
    label: 'Manager',
    roles: ['company']
  },
  {
    title: 'Users',
    href: '/dashboard/users',
    icon: 'user',
    label: 'Users',
    roles: ['company', 'creator']
  }
];
export default function CompanyLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const { users } = useSelector((state: RootState) => state.users);

  const [searchQuery, setSearchQuery] = useState('');
  const [team, setTeam] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user?._id) {
        try {
          await dispatch(fetchCompanyUsers(user._id));
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, [user?._id, dispatch]);

  useEffect(() => {
    if (Array.isArray(users)) {
      setTeam(users);
    }
  }, [users]);

  const filteredUsers = team.filter((u: any) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Note: filteredNavItems is calculated but currently unused in the render
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden ">
      <AutoLogout inactivityLimit={30 * 60 * 1000} />

      {/* Mobile Sidebar (Overlay) */}
      <MobileSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Header stays at the top */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      {/* 2. Main Layout Area: Flex Row to put Sidebar next to Content */}
      <div className="flex flex-1 overflow-hidden">
        
        <aside className="hidden w-64 overflow-y-auto border-r border-gray-200 bg-white sm:block">
         

          <UserList user={user} filteredUsers={filteredUsers} />
        </aside>

        
        <main className="flex-1 overflow-y-auto ">{children}</main>
      </div>
    </div>
  );
}