import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { usePathname } from '@/routes/hooks';
import { cn } from '@/lib/utils';
import UserList from './user-list';
import {
  X,
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  UserCircle,
  Users2,
  StickyNote,
  Star,
  Calendar
} from 'lucide-react';

const IconMap: Record<string, any> = {
  dashboard: LayoutDashboard,
  company: Building2,
  users: Users,
  'subscription-plans': CreditCard,
  user: UserCircle,
  group: Users2,
  notes: StickyNote,
  important: Star,
  planner: Calendar
};

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filteredUsers: any[];
  userId: any;
}

export default function MobileSidebar({
  isOpen,
  onClose,
  filteredUsers,
  userId
}: MobileSidebarProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { id, uid } = useParams();
  const path = usePathname();

  // Same logic as AppHeader
  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard/admin',
      icon: 'dashboard',
      roles: ['admin']
    },
    {
      title: 'Company',
      href: '/dashboard/admin/company',
      icon: 'company',
      roles: ['admin']
    },
    {
      title: 'Users',
      href: '/dashboard/admin/users',
      icon: 'users',
      roles: ['admin']
    },
    {
      title: 'Subscription Plans',
      href: '/dashboard/admin/subscription-plans',
      icon: 'subscription-plans',
      roles: ['admin']
    },
    {
      title: 'Dashboard',
      href: `/company/${user?._id}`,
      icon: 'dashboard',
      roles: ['company']
    },
    {
      title: 'Dashboard',
      href: `/company/${id}/user/${uid}`,
      icon: 'dashboard',
      roles: ['user', 'creator']
    },
    {
      title: 'Groups',
      href: 'group',
      icon: 'group',
      roles: ['user', 'company', 'creator']
    },
    {
      title: 'Notes',
      href: 'notes',
      icon: 'notes',
      roles: ['user', 'company', 'creator']
    },
    {
      title: 'Important',
      href: 'important',
      icon: 'important',
      roles: ['user', 'company', 'creator']
    },
    {
      title: 'Planner',
      href: 'planner',
      icon: 'planner',
      roles: ['user', 'company', 'creator']
    },
    {
      title: 'Staff',
      href: 'users',
      icon: 'user',
      roles: ['company', 'creator']
    }
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  const getLogoLink = () => {
    if (!user) return '/';
    if (user?.role === 'admin' || user?.role === 'director')
      return '/dashboard/admin';
    if (user.role === 'company') return `/company/${user?._id}`;
    if (user.role === 'creator' || user?.role === 'user') {
      const companyId = user?.company || id;
      return `/company/${companyId}/user/${user._id}`;
    }
    return null;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[60] bg-black/50 transition-opacity md:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-[70] flex w-72 flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile Header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-taskplanner/60 px-4">
          <Link
            to={getLogoLink() || '/'}
            onClick={onClose}
            className="flex items-center space-x-2"
          >
            <img src="/favicon.png" alt="Taskplanner" className="h-8" />
          </Link>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top: Mobile Navigation Items */}
          <nav className="flex shrink-0 flex-col gap-1 border-b border-gray-100 p-3">
            {filteredNavItems.map((item, index) => {
              const isActive = path === item.href;
              const Icon = item.icon ? IconMap[item.icon] : null;

              return (
                <Link
                  key={index}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-taskplanner text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {user?.role !== 'admin' && (
            <div className="flex-1 overflow-hidden">
              {/* Note: We pass the URL ID or current user ID based on your layout's logic */}
              <UserList user={userId || ''} filteredUsers={filteredUsers} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
