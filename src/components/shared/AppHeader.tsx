import { cn } from '@/lib/utils';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { AppNav } from './AppNav';
import UserNav from '../shared/user-nav';
import { NotificationDropdown } from '../shared/notification-dropdown';
import { Loader2, Mail, Menu, UserPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useToast } from '../ui/use-toast';
import { useState } from 'react';
import axiosInstance from "@/lib/axios"
interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { id } = useParams(); // Removed uid since we use user._id directly

  const {toast} = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);


  // 1. Create a dynamic base path so links never break on deep nested routes
  const getBasePath = () => {
    if (!user) return '/';

    if (user.role === 'admin' || user.role === 'director') {
      return '/dashboard/admin';
    }
    if (user.role === 'company') {
      return `/company/${user._id}`;
    }
    if (user.role === 'creator' || user.role === 'user') {
      const companyId = user.company || id;
      // Using user._id fixes the "undefined" issue from useParams()
      return `/company/${companyId}/user/${user._id}`;
    }

    return '/';
  };

  const basePath = getBasePath();

  // 2. Use absolute paths for all nav items
  const navItems = [
    // --- Admin Routes ---
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
      label: 'Subscription Plans',
      roles: ['admin']
    },

    // --- Dynamic Routes (Company / Creator / User) ---
    {
      title: 'Dashboard',
      href: basePath,
      icon: 'dashboard',
      label: 'Dashboard',
      roles: ['company', 'user', 'creator']
    },
    {
      title: 'Groups',
      href: `${basePath}/group`,
      icon: 'group',
      label: 'Groups',
      roles: ['user', 'company', 'creator']
    },
    {
      title: 'Notes',
      href: `${basePath}/notes`,
      icon: 'notes',
      label: 'Notes',
      roles: ['user', 'company', 'creator']
    },
    {
      title: 'Important',
      href: `${basePath}/important`,
      icon: 'important',
      label: 'Important',
      roles: ['user', 'company', 'creator']
    },
    {
      title: 'Planner',
      href: `${basePath}/planner`,
      icon: 'planner',
      label: 'Planner',
      roles: ['user', 'company', 'creator']
    },
    {
      title: 'Staff',
      href: `${basePath}/users`,
      icon: 'user',
      label: 'Staff',
      roles: ['company', 'creator']
    },
    {
      title: 'Schedule Task',
      href: `${basePath}/schedule-task`,
      icon: 'schedule-task',
      label: 'Schedule Task',
      roles: ['company', 'creator', 'user']
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role)
  );


  const handleAddUserByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !user?._id) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get(`/users?email=${email}`);
      const fetchedUser = response.data.data.result[0];

      if (fetchedUser?._id) {
        await axiosInstance.patch(`/users/addmember/${user._id}`, {
          colleagueId: fetchedUser._id,
          action: 'add'
        });

        toast({
          title: `${fetchedUser.name} has been added`
        
        });

     

        setEmail('');
        setIsDialogOpen(false); 
      } else {
        toast({ title: 'User not found', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({
        title: 'Error Adding User',
        description: error.response?.data?.message || 'User not found',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };



  return (
    <header className="sticky top-0 z-50 w-full border-b border-taskplanner/60 bg-white shadow-sm">
      <nav className="relative flex h-14 w-full items-center justify-between px-6">
        <div className="flex h-full flex-row items-center gap-0">
          {/* --- LEFT SIDE: Logo & Mobile Menu --- */}
          <div className="z-20 flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="block rounded p-1 text-gray-500 hover:bg-gray-100 focus:outline-none md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo Link now easily uses the dynamic base path */}
            <Link to={basePath} className="flex items-center space-x-2">
              <img src="/favicon.png" alt="Taskplanner" className="h-10" />
            </Link>
          </div>

          {/* AppNav Container */}
          <div className="hidden h-full items-center md:flex">
            <AppNav items={filteredNavItems} />
          </div>
        </div>

        {/* --- RIGHT SIDE --- */}
        <div className="z-20 flex items-center gap-2 sm:gap-4">
          {user.role === 'company' && (
            <>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative -mr-8 h-10 w-10 rounded-full bg-white transition-all"
                    title="Add Colleague"
                  >
                    <UserPlus className="h-5 w-5" />
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Add Colleague</DialogTitle>
                  </DialogHeader>

                  <div className="border-t border-slate-100 bg-white pt-4">
                    <Label className="mb-2 block text-xs font-bold uppercase">
                      Quick Add by Email
                    </Label>
                    <form
                      onSubmit={handleAddUserByEmail}
                      className="flex gap-2"
                    >
                      <div className="relative flex-1">
                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="email@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-10 pl-9"
                          type="email"
                        />
                      </div>
                      <Button
                        type="submit"
                        size="sm"
                        className="h-10 px-4"
                        disabled={loading || !email}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Add'
                        )}
                      </Button>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}

          <NotificationDropdown />
          <UserNav />
        </div>
      </nav>
    </header>
  );
}