import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { NotificationItem } from '@/components/shared/notification-item';
import { demoNotifications } from '@/lib/notifications';
import { Link } from 'react-router-dom';

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState(demoNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-primary">
        <DropdownMenuLabel className="font-normal">
          <h2 className="text-lg font-semibold text-black">Notifications</h2>
          <p className="text-sm text-black">
            You have {unreadCount} unread messages
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto bg-primary">
          {notifications.map((notification) => (
            <DropdownMenuItem
              className="hover:border-none hover:bg-transparent focus:border-none focus:bg-transparent
"
              key={notification.id}
              onSelect={() => markAsRead(notification.id)}
            >
              <NotificationItem notification={notification} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="hover:border-none hover:bg-transparent focus:border-none focus:bg-transparent
"
        >
          <Link
            to="notifications"
            className="w-full text-black hover:bg-primary"
          >
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
