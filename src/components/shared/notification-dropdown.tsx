import { useEffect, useState } from 'react';
import { Bell, CircleUser } from 'lucide-react';
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
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../lib/axios';
import { socket, setupSocket } from '../../lib/socket';
import { useSelector } from 'react-redux';
import { Badge } from '../ui/badge';
import ReactHowler from 'react-howler';
import notification from '@/assets/sound/notification.mp3';
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
  senderId?: string;
  updatedAt: string;
  createdAt?: string;
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useSelector((state: any) => state.auth);
  const [playSound, setPlaySound] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const navigate = useNavigate();

  // Fetch notifications on component mount
  useEffect(() => {
    const loadNotifications = async (userId: string) => {
      try {
        const { data } = await axiosInstance.get(`/notifications/${userId}`);
        setNotifications(data.data.result); // Set the fetched notifications in state
        const unread = data.data.result.filter(
          (n: Notification) => !n.isRead
        ).length;
        setUnreadCount(unread);
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
        console.log('New notification received:', notification);
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prevUnread) => prevUnread + 1);
        setPlaySound(true);
      });

      // Cleanup socket listeners on unmount
      return () => {
        socket.off('notification');
      };
    }
  }, []);

  const markAsRead = async (id: string, notification: Notification) => {
    try {
      if (!notification.isRead) {
        await axiosInstance.patch(`/notifications/${id}/read`, { isRead: true }); // API call to mark notification as read
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prevUnread) => Math.max(0, prevUnread - 1)); // Only reduce count if unread
      }
  
      if (notification.type === 'task' && notification.docId) {
        navigate(`/dashboard/task-details/${notification.docId}`);
      } else if (notification?.type === 'group' && notification?.docId) {
        navigate(`/dashboard/group/${notification?.docId}`);
      } else if (notification?.type === 'note' || notification?.docId) {
        navigate(`/dashboard/notes`);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };


  const markAllAsSeen = async () => {
    try {
      await axiosInstance.patch(`/notifications/readall`);
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Optionally show error toast
    }
  };
  

  // Function to calculate duration
  const calculateDuration = (createdAt: string): string => {
    const currentTime = new Date();
    const updatedTime = new Date(createdAt);
    const durationInMinutes = Math.floor(
      (currentTime.getTime() - updatedTime.getTime()) / 60000
    );

    if (durationInMinutes < 60) {
      return `${durationInMinutes}m `;
    } else if (durationInMinutes < 1440) {
      return `${Math.floor(durationInMinutes / 60)}h`;
    } else {
      const days = Math.floor(durationInMinutes / 1440);
      return days === 1 ? `${days}d` : `${days}d`;
    }
  };

  return (
    <>
      <ReactHowler
        src={notification}
        playing={playSound}
        onEnd={() => setPlaySound(false)}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={'ghost'} size="icon" className="relative shadow-none bg-transparent hover:bg-transparent hover:text-taskplanner ">
            

            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-2 -top-2 h-5 min-w-[20px] rounded-full px-2"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="mr-4 w-80 bg-primary ">
          <DropdownMenuLabel className="font-normal flex flex-row items-center justify-between">
            <h2 className="text-left text-lg font-semibold text-black">
              Notifications
            </h2>
            <button className='text-black text-xs font-semibold ' onClick={markAllAsSeen}>Mark As Seen All</button>
          </DropdownMenuLabel>
          {/* <DropdownMenuSeparator /> */}
          <DropdownMenuGroup className="max-h-[300px] overflow-y-auto bg-primary">
            {notifications?.map((notification) => (
              <DropdownMenuItem
                className=" hover:bg-transparent border-b focus:bg-transparent rounded-none border-gray-200 p-0"
                key={notification._id}
                onClick={() => markAsRead(notification._id, notification)}
              >
                <NotificationItem
                  notification={notification}
                  userImage={
                    notification.senderId
                      ? {
                          image: notification?.senderId?.image,
                          name: notification.senderId?.name
                        }
                      : undefined
                  }
                  duration={calculateDuration(notification?.createdAt)}
                />
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          {/* <DropdownMenuSeparator /> */}
          <DropdownMenuItem className="hover:border-none hover:bg-transparent focus:border-none focus:bg-transparent">
            <Link
              to="/dashboard/notifications"
              className="w-full text-black hover:bg-primary hover:underline"
            >
              View all notifications
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog
        open={selectedNotification !== null}
        onOpenChange={(open) => !open && setSelectedNotification(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedNotification && (
              <div>
                <div className="flex flex-row items-center gap-1  pb-2">
                  <CircleUser className="h-4 w-4" />
                  <h1 className="font-semibold ">
                    {selectedNotification?.senderId?.name}
                  </h1>
                </div>
                <p className="text-sm text-gray-800">
                  {selectedNotification.message}
                </p>
                <p className="mt-2 text-[12px] font-bold text-gray-500">
                  {moment(selectedNotification.updatedAt).format(
                    'MMMM Do YYYY, h:mm:ss a'
                  )}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
