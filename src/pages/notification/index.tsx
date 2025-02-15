import { NotificationItem } from '@/components/shared/notification-item';
import { socket, setupSocket } from '../../lib/socket';
import { useSelector } from 'react-redux';
import axiosInstance from '../../lib/axios';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import moment from 'moment';

interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
  senderId?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useSelector((state: any) => state.auth);

  // Fetch notifications on component mount
  useEffect(() => {
    const loadNotifications = async (userId: string) => {
      try {
        const { data } = await axiosInstance.get(`/notifications/${userId}`);
        setNotifications(data.data.result);
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

  const calculateDuration = (updatedAt: string): string => {
    const currentTime = new Date();
    const updatedTime = new Date(updatedAt);
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
    <div className="container mx-auto mt-2">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Notifications</h1>
      </div>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification._id}
            onClick={() => markAsRead(notification._id)}
            className="overflow-hidden "
          >
            <div
              className={`flex h-auto  w-full cursor-pointer flex-row items-center justify-between space-x-6 rounded-sm border border-gray-200 px-2 py-2  ${notification.isRead ? 'bg-primary' : 'bg-blue-200'}`}
            >
              {/* <Icon className="mt-1 h-5 w-5 text-background" /> */}
              <div className="flex   items-center gap-2 space-x-2">
                {notification.senderId === user?._id ? (
                  // If notification.senderId matches user._id, show the user's image and name
                  <Avatar className="h-8 w-8 bg-black p-2">
                    <AvatarImage src={user?.image} alt="Profile picture" />
                    <AvatarFallback>
                      {user?.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  // If not, show a default placeholder avatar
                  <div className="h-8 w-8 rounded-full bg-black p-2" />
                )}

                <p className="whitespace-normal text-wrap break-words break-all  text-sm font-medium leading-none text-black">
                  {notification.message}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium leading-none text-black">
                  {moment(notification?.updatedAt).fromNow()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
