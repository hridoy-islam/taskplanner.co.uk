import { NotificationItem } from '@/components/shared/notification-item';
import { socket, setupSocket } from '../../lib/socket';
import { useSelector } from 'react-redux';
import axiosInstance from '../../lib/axios';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ArrowRight, Bell, CircleUser, UserRoundCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import moment from 'moment';

interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
}

type Task = {
  _id: string;
  taskName: string;
  dueDate: Date;
  important: boolean;
  author: {
    name: string;
  };
  assigned: {
    name: string;
  };
};
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useSelector((state: any) => state.auth);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null); // State for selected notification

  // Fetch notifications on component mount
  useEffect(() => {
    const loadNotifications = async (userId: string) => {
      try {
        const { data } = await axiosInstance.get(`/notifications/${userId}`);
        setNotifications(data.data.result); // Set the fetched notifications in state
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (user?._id) {
      loadNotifications(user._id);
    }

    // Set up socket connection
    if (user?._id) {
      setupSocket(user._id);

      // Listen for real-time notifications
      socket.on('notification', (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });

      // Cleanup socket listeners on unmount
      return () => {
        socket.off('notification');
      };
    }
  }, [user?._id]);

  const markAsRead = async (id: string) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`, { isRead: true }); // API call to mark notification as read
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const selectNotificationById = async (id: string) => {
    try {
      const { data } = await axiosInstance.get(`/notifications/${id}`);
      console.log('Fetched notification details:', data.data.result); // Debugging
      setSelectedNotification(data.data.result); // Adjust to match the API response structure
    } catch (error) {
      console.error('Error fetching notification details:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // setSelectedNotification(notification); // Set immediately for dialog
    selectNotificationById(notification._id); // Fetch more details
    markAsRead(notification._id); // Mark as read
  };

  const calculateDuration = (updatedAt: string): string => {
    const currentTime = new Date();
    const updatedTime = new Date(updatedAt);
    const durationInMinutes = Math.floor(
      (currentTime.getTime() - updatedTime.getTime()) / 60000
    );

    if (durationInMinutes < 60) {
      return `${durationInMinutes}m`;
    } else if (durationInMinutes < 1440) {
      return `${Math.floor(durationInMinutes / 60)}h`;
    } else {
      return `${Math.floor(durationInMinutes / 1440)}d`;
    }
  };

  console.log(handleNotificationClick);
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" className="relative">
            <Bell className="h-5 w-5 " />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-2 -top-2 h-5 min-w-[20px] px-2"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-4 w-80 bg-primary">
          <DropdownMenuLabel className="font-normal">
            <h2 className="text-center text-lg font-semibold text-black">
              Notifications
            </h2>
          </DropdownMenuLabel>
          <DropdownMenuGroup className="max-h-[300px] overflow-y-auto bg-primary">
            {notifications.map((notification) => (
              <DropdownMenuItem
                className="hover:border-none hover:bg-transparent focus:border-none focus:bg-transparent"
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
              >
                <NotificationItem
                  notification={notification}
                  userImage={
                    notification.senderId === user?._id
                      ? { image: user?.image, name: user.name }
                      : undefined
                  }
                  duration={calculateDuration(notification.updatedAt)} // Pass duration as prop
                />
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuItem className="hover:border-none hover:bg-transparent focus:border-none focus:bg-transparent">
            <Link
              to="notifications"
              className="w-full text-black hover:bg-primary hover:underline"
            >
              View all notifications
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={!!selectedNotification}
        onOpenChange={() => setSelectedNotification(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedNotification ? (
              <>
                <p className="text-lg font-semibold">
                  {selectedNotification.message}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {calculateDuration(selectedNotification.updatedAt)} ago
                </p>
              </>
            ) : (
              <p>Loading notification details...</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
