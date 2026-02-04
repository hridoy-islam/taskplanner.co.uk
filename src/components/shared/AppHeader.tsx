import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { AppNav } from './AppNav';
import UserNav from '../shared/user-nav';
import { NotificationDropdown } from '../shared/notification-dropdown';
import { Menu, } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export const navItems = [
  // 1. Dashboard (Visible to everyone)
  {
    title: 'Dashboard',
    href: '/dashboard/admin',
    icon: 'dashboard',
    label: 'Dashboard',
    roles: [ 'admin']
  },
  {
    title: 'Company',
    href: '/dashboard/admin/company',
    icon: 'company',
    label: 'Company',
    roles: [ 'admin']
  },
  {
    title: 'Manager',
    href: '/dashboard/admin/manager',
    icon: 'dashboard',
    label: 'Dashboard',
    roles: [ 'admin']
  },
  {
    title: 'Users',
    href: '/dashboard/admin/users',
    icon: 'users',
    label: 'Users',
    roles: [ 'admin']
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
    title: 'Company',
    href: '/dashboard/company',
    icon: 'company',
    label: 'Company',
    roles: ['admin', 'director']
  },
  {
    title: 'Manager',
    href: '/dashboard/creator',
    icon: 'creator',
    label: 'Manager',
    roles: [ 'company']
  },
  {
    title: 'Users',
    href: '/dashboard/users',
    icon: 'user',
    label: 'Users',
    roles: ['company', 'creator']
  },
  {
    title: 'Subscription Plan',
    href: '/dashboard/subscription',
    icon: 'subscription',
    label: 'Subscription',
    roles: ['admin']
  }
];

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useSelector((state: RootState) => state.auth);

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      {/* Relative container required for absolute centering of the nav */}
      <nav className="relative flex h-14 w-full items-center justify-between px-6">
        {/* --- LEFT SIDE: Logo & Mobile Menu --- */}
        <div className="z-20 flex items-center gap-4">
          {/* Mobile Hamburger */}
          <button
            onClick={onMenuClick}
            className="block rounded p-1 text-gray-500 hover:bg-gray-100 focus:outline-none md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>



          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-lg font-bold tracking-tight text-taskplanner">
              Task Planner
            </span>
          </Link>
        </div>

        
        <div className="absolute left-1/2 top-1/2 hidden h-full -translate-x-1/2 -translate-y-1/2 items-center md:flex">
        
          <AppNav items={filteredNavItems} />
        </div>

        <div className="z-20 flex items-center gap-2 sm:gap-4">
          <NotificationDropdown />

          <UserNav />
        </div>
      </nav>
    </header>
  );
}
