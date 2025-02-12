import DashboardNav from '@/components/shared/dashboard-nav';
import { navItems } from '@/constants/data';
import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';
import { ChevronsLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import UserList from './user-list';
import { Input } from '../ui/input';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCompanyUsers } from '@/redux/features/userSlice';
import { AppDispatch, RootState } from '@/redux/store';

type SidebarProps = {
  className?: string;
};

export default function Sidebar({ className }: SidebarProps) {
  const { isMinimized, toggle } = useSidebar();
  const [status, setStatus] = useState(false);
  const [team, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useSelector((state: RootState) => state.auth);

  const handleToggle = () => {
    setStatus(true);
    toggle();
    setTimeout(() => setStatus(false), 500);
  };

  // Get the users state from the Redux store
  const { users } = useSelector((state: RootState) => state.users);

  // Dispatch function
  const dispatch = useDispatch<AppDispatch>();

  // const fetchUsers = async () => {
  //   try {
  //     const response = await axiosInstance.get(`/users/company/${user?._id}`);

  //     setTeams(response.data.data);
  //   } catch (error) {
  //     console.error('Error fetching users:', error);
  //   }
  // };

  // useEffect(() => {
  //   fetchUsers(); // Fetch users on component mount
  // }, []);

  // const { data, isLoading , isFetching, refetch ,error} = useFetchUsersQuery({
  //   userId: user?._id,

  // })

  const fetchData = async () => {
    try {
      if (user?._id) {
        await dispatch(fetchCompanyUsers(user._id));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 10000); // Polling interval of 10 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [user, dispatch]);

  useEffect(() => {
    if (users && Array.isArray(users)) {
      setTeams(users);
    }
  }, [users]);

  // useEffect(() => {
  //   if(data){
  //     setTeams(data)
  //   }

  //   console.log("Users Data:", data);

  // }, [data]);

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  const filteredUsers = team?.filter((user: any) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <nav
      className={cn(
        `relative z-10 hidden h-screen flex-none  overflow-y-auto px-3 md:block`,
        status && 'duration-500',
        !isMinimized ? 'w-72' : 'w-[80px]',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center px-0 py-5 md:px-2',
          isMinimized ? 'justify-center ' : 'justify-between'
        )}
      >
        {!isMinimized && <h1 className="text-2xl font-bold">Task Planner</h1>}
        <ChevronsLeft
          className={cn(
            'size-8 cursor-pointer rounded-full border bg-background text-foreground',
            isMinimized && 'rotate-180'
          )}
          onClick={handleToggle}
        />
      </div>
      <div className="space-y-4">
        <div className="px-2 py-2">
          <div className="mt-3 flex flex-col space-y-1">
            <DashboardNav items={filteredNavItems} />
            {!isMinimized && (
              <Input
                type="text"
                placeholder="Search users"
                className="lg: mb-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            )}
            <div className="-ml-2 py-4">
              <UserList user={user} filteredUsers={filteredUsers} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
