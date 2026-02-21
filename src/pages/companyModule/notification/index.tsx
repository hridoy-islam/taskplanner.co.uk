import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { CircleUser, Loader2, BellRing, CheckCheck } from 'lucide-react';

import axiosInstance from '@/lib/axios';
import { socket, setupSocket } from '@/lib/socket';

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Loader from '@/components/shared/loader';
import { BlinkingDots } from '@/components/shared/blinking-dots';

interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
  senderId?: {
    image?: string;
    name?: string;
  };
  type?: string;
  docId?: string;
  updatedAt: Date;
  createdAt: Date;
}

export default function CompanyNotificationsPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
    const{id:userId} = useParams()
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadNotification, setLoadNotification] = useState(15);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchNotifications = async (userId: string) => {
      if (loadNotification === 15) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const response = await axiosInstance.get(
          `/notifications/${userId}?limit=${loadNotification}`
        );
        const result = response.data?.data?.result || [];
        
        setNotifications(result);
        setHasMore(result.length >= loadNotification);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    if (user?._id) {
      fetchNotifications(user._id);
    }

    if (user?._id) {
      setupSocket(user._id);

      const handleNewNotification = (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
      };

      socket.on('notification', handleNewNotification);

      return () => {
        socket.off('notification', handleNewNotification);
      };
    }
  }, [user?._id, loadNotification]);

  const markAsRead = async (id, notification: Notification) => {
    try {
      if (!notification.isRead) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        await axiosInstance.patch(`/notifications/${id}/read`, { isRead: true });
      }

      if (notification.type === 'task' && notification.docId) {
        navigate(`/company/${userId}/task-details/${notification.docId}`);
      } else if (notification?.type === 'group' && notification?.docId) {
        navigate(`/company/${userId}/group/${notification?.docId}`);
      } else if (notification?.type === 'note') {
        navigate(`/company/${userId}/notes`);
      }else if (notification.type === 'comment' && notification.docId) {
        navigate(`/company/${userId}/task-details/${notification.docId}`);}
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await axiosInstance.patch(`/notifications/readall`);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleLoadMore = () => {
    setLoadNotification((prev) => prev + 15);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex flex-col w-full p-4">
      {/* Header Section */}
      <div className="flex items-center justify-between pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Notifications</h1>
          <p className="text-sm  mt-1">
            Stay updated on your company's latest activities.
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={markAllAsRead}
            className="hidden sm:flex items-center gap-2 text-taskplanner hover:bg-taskplanner/90 border-taskplanner"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 w-full">
         <BlinkingDots color='bg-taskplanner' size='large'/>
        </div>
      ) : (
        <div className="w-full   ">
          <div className="w-full bg-white border border-taskplanner/60 rounded-xl shadow-sm overflow-hidden mb-8">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 border border-gray-100 mb-4">
                  <BellRing className="h-7 w-7 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-black">You're all caught up!</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                  You don't have any new notifications at the moment. Check back later for updates.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-taskplanner/60 flex flex-col w-full">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => markAsRead(notification._id, notification)}
                    className={`group relative  flex items-start gap-4 p-4 sm:p-5 cursor-pointer transition-colors focus:outline-none w-full ${
                      !notification.isRead 
                        ? 'bg-blue-50 hover:bg-blue-100' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0 mt-0.5">
                      <Avatar className="h-10 w-10 border border-gray-200">
                        <AvatarImage
                          src={notification.senderId?.image || 'placeholder.png'}
                          alt={notification.senderId?.name || "User"}
                          className="object-cover"
                        />
                        <AvatarFallback className="p-0">
    <img
      src="/placeholder.png"
      alt="User placeholder"
      className="h-full w-full object-cover rounded-full"
    />
  </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className={`text-[15px] leading-snug break-words pr-8 ${
                        !notification.isRead ? 'text-black font-semibold' : 'text-black font-medium'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-[13px] text-gray-500 flex items-center gap-2">
                        {moment(notification.createdAt).fromNow()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Load More Button */}
          {hasMore && notifications.length > 0 && (
            <div className="flex justify-center pb-12">
              <Button 
                onClick={handleLoadMore} 
                disabled={loadingMore}
                variant="outline"
                className="w-full sm:w-auto min-w-[200px] bg-white border-gray-300 text-black hover:bg-gray-50 shadow-sm"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-taskplaner" />
                    Loading more...
                  </>
                ) : (
                  'Load older notifications'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}