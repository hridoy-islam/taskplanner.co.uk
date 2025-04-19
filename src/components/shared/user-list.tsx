import { Link, useParams } from 'react-router-dom';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { RootState } from '@/redux/store';
import { countUnseenTasks } from '@/helper/seenCounter';
import { useSelector } from 'react-redux';
import { Badge } from '../ui/badge';
import { useEffect, useState } from 'react';
import { usePollTasks } from '@/hooks/usePolling';

export default function UserList({ user, filteredUsers }) {
  const { tasks } = useSelector((state: RootState) => state.alltasks);
  const [unseenCounts, setUnseenCounts] = useState<{[key: string]: number}>({});
  const [filteredTasks, setFilteredTasks] = useState(tasks);
console.log(filteredTasks)
  useEffect(() => {
    const newUnseenCounts: {[key: string]: number} = {};
    
    filteredUsers.forEach(filteredUser => {
      const { unseenTasks } = countUnseenTasks(
        tasks,
        filteredUser?._id,
        user?._id
      );
      newUnseenCounts[filteredUser._id] = unseenTasks;
    });

    setUnseenCounts(newUnseenCounts);
  }, [tasks, filteredUsers, user?._id]);
usePollTasks({
    userId: user?._id,
    tasks,
    setOptimisticTasks: setFilteredTasks

  });
  return (
    <ScrollArea className="h-full max-h-[220px] overflow-auto">
      {filteredUsers.map((filteredUser) => (
        <Link
          key={filteredUser?._id}
          to={`/dashboard/task/${filteredUser?._id}`}
        >
          <Button variant="ghost" className="mb-2 w-full justify-between">
            <div className="flex flex-row items-center justify-start">
              <Avatar className="mr-2 h-6 w-6 rounded-full">
                <AvatarImage
                  src={filteredUser?.image}
                  alt="Profile picture"
                />
                <AvatarFallback>
                  {filteredUser?.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex w-full flex-col">
                <span className="text-left">{filteredUser?.name}</span>
                <span className="text-left text-xs text-gray-500">
                  {filteredUser?.role}
                </span>
              </div>
            </div>

            {unseenCounts[filteredUser._id] > 0 && (
              <Badge className="flex h-4 w-4 flex-row items-center justify-center rounded-full bg-red-800">
                <span className="text-left text-xs font-semibold text-white">
                  {unseenCounts[filteredUser._id]}
                </span>
              </Badge>
            )}
          </Button>
        </Link>
      ))}
    </ScrollArea>
  );
}