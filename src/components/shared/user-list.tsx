import { Link, useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { usePollTasks } from '@/hooks/usePolling';

// UI Components
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';

// Icons & Utils
import { Search, User as UserIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { countUnseenTasks } from '@/helper/seenCounter';

interface User {
  _id: string;
  name: string;
  role?: string;
  image?: string;
}

interface UserListProps {
  user: string; // Current logged-in user ID
  filteredUsers: User[];
  isLoading?: boolean;
}

export default function UserList({
  user,
  filteredUsers,
  isLoading = false
}: UserListProps) {
  const { tasks } = useSelector((state: RootState) => state.alltasks);
  const { userId: activeUserId } = useParams(); // Currently selected user in the URL

  const [searchQuery, setSearchQuery] = useState('');

  // 1. POLLING: Keep tasks updated (non-blocking)
  usePollTasks({
    userId: user,
    tasks,
    setOptimisticTasks: () => {}
  });

  const processedUsers = useMemo(() => {
    if (!Array.isArray(filteredUsers)) return [];

    const uniqueMap = new Map<string, User>();
    filteredUsers.forEach((u) => {
      if (u && u._id && u.name) {
        // Only keep the latest version of each user
        uniqueMap.set(u._id, u);
      }
    });

    let result = Array.from(uniqueMap.values());

    // B. Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(query) ||
          u.role?.toLowerCase().includes(query)
      );
    }

    // C. STABLE SORT - Alphabetical only (prevents jumping/shuffling)
    // We create a stable sort that doesn't change based on task counts
    result.sort((a, b) => {
      // 1. Keep logged-in user ("Me") at the top
      if (a._id === user) return -1;
      if (b._id === user) return 1;

      // 2. Sort alphabetically by name (case-insensitive)
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();

      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;

      // 3. If names are identical, sort by _id for stability
      return a._id.localeCompare(b._id);
    });

    return result;
  }, [filteredUsers, searchQuery, user]);

  // 3. UNSEEN COUNTS: Calculate notification badges ONLY for valid users
  const unseenCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    // Only calculate counts for users that exist in processedUsers
    const validUserIds = new Set(processedUsers.map((u) => u._id));

    if (Array.isArray(tasks) && tasks.length > 0) {
      processedUsers.forEach((u) => {
        // Only count unseen tasks for users in the current company
        if (validUserIds.has(u._id)) {
          const { unseenTasks } = countUnseenTasks(tasks, u._id, user);
          counts[u._id] = unseenTasks || 0;
        }
      });
    }

    return counts;
  }, [tasks, processedUsers, user]);

  const getDisplayRole = (role?: string) => {
    if (!role) return 'Member';

    switch (role.toLowerCase()) {
      case 'user':
        return 'Staff';
      case 'creator':
        return 'Manager';
      case 'admin':
      case 'director':
        return 'Admin';
      case 'company':
        return 'Company';
      default:
        return role;
    }
  };

  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white">
      {/* Header & Search */}
      <div className="px-4 py-2">
        {/* <h2 className="mb-2 text-lg font-semibold tracking-tight">Your Contact</h2> */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 bg-gray-50/50 pl-8"
          />
        </div>
      </div>

      {/* User List */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-1">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
              Loading team...
            </div>
          ) : processedUsers.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              {searchQuery
                ? 'No users found matching your search.'
                : 'No users found.'}
            </div>
          ) : (
            processedUsers.map((u) => {
              const isActive = u._id === activeUserId;
              const unread = unseenCounts[u._id] || 0;
              const isMe = u._id === user;

              return (
                <Link
                  key={u._id} // Unique stable key
                  to={`task/${u._id}`}
                  className="block outline-none"
                >
                  <div
                    className={cn(
                      'group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-all',
                      isActive
                        ? 'border-l-4 border-blue-600 bg-slate-100 pl-2 font-medium text-slate-900 hover:text-white'
                        : 'border-l-4 border-transparent text-black hover:bg-taskplanner hover:pl-2.5 hover:text-white'
                    )}
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Avatar className="h-9 w-9 border border-gray-100">
                        <AvatarImage
                          src={u.image}
                          alt={u.name}
                          className="object-cover"
                        />

                        <AvatarFallback className="p-0">
                          <img
                            src="/placeholder.png"
                            alt="User placeholder"
                            className="h-full w-full object-cover"
                          />
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col truncate hover:text-white">
                        <span
                          className={cn(
                            'truncate text-sm group-hover:text-white',
                            isActive || unread > 0
                              ? 'font-semibold text-black '
                              : 'font-medium'
                          )}
                        >
                          {u.name}
                        </span>
                        <span className="truncate text-xs capitalize">
                          {u._id === user ? 'Me' : getDisplayRole(u.role)}
                        </span>
                      </div>
                    </div>

                    {/* Unread Badge - Only show if count > 0 and user is valid */}
                   {!isMe && unread > 0 && (
  <Badge className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-taskplanner px-1.5 font-semibold text-white hover:bg-taskplanner/90">
    {unread > 99 ? '99+' : unread}
  </Badge>
)}

                  </div>
                </Link>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
