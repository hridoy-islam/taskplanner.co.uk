import { NotificationItem } from '@/components/shared/notification-item';
import { socket, setupSocket } from '../../lib/socket';
import { useSelector } from 'react-redux';
import axiosInstance from '../../lib/axios';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import moment from 'moment';
import { CircleUser } from 'lucide-react';

interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
  senderId?: string;
  updatedAt: Date;
  createdAt: Date;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useSelector((state: any) => state.auth);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

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

  const markAsRead = async (id: string, notification: Notification) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`, { isRead: true }); // API call to mark notification as read
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setSelectedNotification(notification);
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
    <div className="container mx-auto mt-2 h-[calc(100vh-7rem)] overflow-y-auto">
      <div className="mb-6 flex h-8 w-full items-center justify-start ">
        <h1 className="fixed z-40 mt-2 min-w-[700px] rounded-md bg-[#f3f4f6]  px-4  py-2 text-2xl font-bold">
          All Notifications
        </h1>
      </div>
      <div className="flex flex-col gap-4">
        {notifications.map((notification) => (
          <div
            key={notification._id}
            onClick={() => markAsRead(notification._id, notification)}
            className="overflow-hidden"
          >
            <div
              className={`flex h-auto w-full cursor-pointer flex-row items-center justify-between space-x-6 rounded-sm border border-gray-200 px-2 py-2  ${notification.isRead ? 'bg-primary' : 'bg-blue-200'}`}
            >
              {/* Avatar and notification message */}
              <div className="flex items-center gap-2 space-x-2">
                {notification.senderId ? (
                  <Avatar className="h-8 w-8  ">
                    <AvatarImage className='rounded-full ' src={notification.senderId?.image} alt="Profile picture" />
                    <AvatarFallback>
                      {notification.senderId?.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-black p-2" />
                )}

                <p className="whitespace-normal text-wrap break-words break-all text-sm font-medium leading-none text-black">
                  {notification.message}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium leading-none text-black">
                  {moment(notification?.createdAt).fromNow()}
                </p>
              </div>
            </div>
          </div>
        ))}
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
      </div>
    </div>
  );
}
