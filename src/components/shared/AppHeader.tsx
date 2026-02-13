import { cn } from '@/lib/utils';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { AppNav } from './AppNav';
import UserNav from '../shared/user-nav';
import { NotificationDropdown } from '../shared/notification-dropdown';
import { Menu, } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}


export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useSelector((state: RootState) => state.auth);
    const {id,uid} = useParams()
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
      title: 'Dashboard',
      href: `/company/${user?._id}`,
      icon: 'dashboard',
      label: 'Dashboard',
      roles: ['company']
    },

    {
      title: 'Dashboard',
      href: `/company/${id}/user/${uid}`,
      icon: 'dashboard',
      label: 'Dashboard',
      roles: ['user','creator']
    },
  
    // {
    //   title: 'Today',
    //   href: 'today',
    //   icon: 'today',
    //   label: 'Today',
    //   roles: ['user', 'company', 'creator']
    // },
    {
      title: 'Groups',
      href: 'group',
      icon: 'group',
      label: 'Groups',
      roles: ['user', 'company', 'creator']
    },
    {
      title: 'Notes',
      href: 'notes',
      icon: 'notes',
      label: 'Notes',
      roles: ['user', 'company', 'creator']
    },
    {
      title: 'Important',
      href: 'important',
      icon: 'important',
      label: 'Important',
      roles: ['user', 'company', 'creator']
    },
    {
      title: 'Planner',
      href: 'planner',
      icon: 'planner',
      label: 'Planner',
      roles: ['user', 'company', 'creator']
    },
  

    {
      title: 'Users',
      href: 'users',
      icon: 'user',
      label: 'Users',
      roles: ['company', 'creator']
    },
   
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role)
  );

return (
  <header className="sticky top-0 z-50 w-full border-b border-taskplanner/60 bg-white shadow-sm ">
    {/* Relative container required for absolute centering of the nav */}
    <nav className="relative flex h-14 w-full items-center justify-between px-6">
      
     
      <div className='flex h-full flex-row items-center gap-0'>

        {/* --- LEFT SIDE: Logo & Mobile Menu --- */}
        <div className="z-20 flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="block rounded p-1 text-gray-500 hover:bg-gray-100 focus:outline-none md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link to="/" className="flex items-center space-x-2">
            {/* <span className="text-lg font-bold tracking-tight text-taskplanner">
              Task Planner
            </span> */}
            <img src="/favicon.png" alt="Taskplanner" className='h-10'  />
          </Link>
        </div>

        {/* AppNav Container */}
        <div className="hidden h-full items-center md:flex">
          <AppNav items={filteredNavItems} />
        </div>
      </div>

      {/* --- RIGHT SIDE --- */}
      <div className="z-20 flex items-center gap-2 sm:gap-4">
        <NotificationDropdown />
        <UserNav />
      </div>
    </nav>
  </header>
);
}
