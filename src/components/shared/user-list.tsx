import { Link } from 'react-router-dom';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';

export default function UserList({ user, filteredUsers }) {
  return (
    <ScrollArea className="h-full max-h-[600px] overflow-auto">
      <Link to={`/dashboard/task/${user?._id}`}>
        <Button variant="ghost" className="mb-2 w-full justify-start">
          <img
            src={'https://github.com/shadcn.png'}
            alt={user?.name || 'User'}
            className="mr-2 h-6 w-6 rounded-full"
          />
          <div className="flex flex-col ">
            <span className="text-left">{user?.name}</span>
            <span className="text-left text-xs text-gray-500">
              {user?.role}
            </span>
          </div>
        </Button>
      </Link>
      {filteredUsers.map((user) => (
        <Link key={user.id} to={`/dashboard/task/${user?._id}`}>
          <Button variant="ghost" className="mb-2 w-full justify-start">
            <Avatar className="mr-2 h-6 w-6 rounded-full">
              <AvatarFallback>
                {user?.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col ">
              <span className="text-left">{user?.name}</span>
              <span className="text-left text-xs text-gray-500">
                {user?.role}
              </span>
            </div>
          </Button>
        </Link>
      ))}
    </ScrollArea>
  );
}
