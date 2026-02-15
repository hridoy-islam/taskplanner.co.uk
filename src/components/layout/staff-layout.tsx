import { useEffect, useState } from 'react';
import AutoLogout from '../shared/auto-logout';
import Header from '../shared/AppHeader';
import UserList from '../shared/user-list';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchCompanyUsers } from '@/redux/features/userSlice';
import { useParams } from 'react-router-dom';
import MobileSidebar from '../shared/mobile-nav';

export default function StaffLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const { id, uid } = useParams();
  const { users } = useSelector((state: RootState) => state.users);

  const [searchQuery, setSearchQuery] = useState('');
  const [team, setTeam] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          await dispatch(fetchCompanyUsers(uid));
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 100000);

    return () => clearInterval(interval);
  }, [id, dispatch]);

  useEffect(() => {
    if (Array.isArray(users)) {
      setTeam(users);
    }
  }, [users]);

  const filteredUsers = team.filter((u: any) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden ">
      <AutoLogout inactivityLimit={30 * 60 * 1000} />

      {/* Header stays at the top */}
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        filteredUsers={filteredUsers}
        userId={uid}
      />
      {/* 2. Main Layout Area: Flex Row to put Sidebar next to Content */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-64 overflow-y-auto border-r border-taskplanner/60 bg-white sm:block">
          <UserList user={uid} filteredUsers={filteredUsers} />
        </aside>

        <main className="flex-1 overflow-y-auto bg-white">{children}</main>
      </div>
    </div>
  );
}
