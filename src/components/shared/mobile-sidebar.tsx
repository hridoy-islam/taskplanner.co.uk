import DashboardNav from '@/components/shared/dashboard-nav';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { navItems } from '@/constants/data';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../ui/input';
import UserList from './user-list';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchCompanyUsers } from '@/redux/features/userSlice';

type TMobileSidebarProps = {
  className?: string;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  sidebarOpen: boolean;
};

export default function MobileSidebar({
  setSidebarOpen,
  sidebarOpen,
}: TMobileSidebarProps) {
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

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent side="left" className="bg-primary h-[calc(100vh)] overflow-y-auto !px-0">
        <div className="space-y-4 py-4 ">
          <div className="space-y-4 px-3 py-2">
            <Link to="/" className="px-2 py-2 text-2xl font-bold text-black">
              Task Planner
            </Link>
            <div className="space-y-1 px-2">
              <DashboardNav items={filteredNavItems} setOpen={setSidebarOpen} />
            </div>
          </div>
        </div>
        <div className="space-y-4 -mt-4">
          <div className="px-2 py-2">
            <div className="mt-3 flex flex-col space-y-1">
              <Input
                type="text"
                placeholder="Search users"
                className="mb-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="-ml-2 ">
                <UserList user={user} filteredUsers={filteredUsers} />
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
