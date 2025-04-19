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
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Loader from '@/components/shared/loader';

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useSelector((state: any) => state.auth);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const navigate = useNavigate();
  const [loadNotification, setLoadNotification] = useState(10);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const loadNotifications = async (userId: string) => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/notifications/${userId}?limit=${loadNotification}`
        );
        setNotifications(response.data.data.result);
        setHasMore(response.data.data.result.length >= loadNotification);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
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
  }, [user?._id, loadNotification]);

  const markAsRead = async (id: string, notification: Notification) => {
    try {
      await axiosInstance.patch(`/notifications/${id}/read`, { isRead: true });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      if (notification.type === 'task' && notification.docId) {
        navigate(`/dashboard/task-details/${notification.docId}`);
      } else if (notification?.type === 'group' && notification?.docId) {
        navigate(`/dashboard/group/${notification?.docId}`);
      } else if (notification?.type === 'note' || notification?.docId) {
        navigate(`/dashboard/notes`);
      }
      setSelectedNotification(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleLoadMore = () => {
    setLoadNotification((prev) => prev + 10);
  };

  return (
    <div className="flex flex-col p-4">
      <div className="pb-2">
        <h1 className="text-2xl font-bold">All Notifications</h1>
      </div>

      {loading ? (
        <div className="flex h-[calc(60vh)] items-center justify-center">
          <Loader />
        </div>
      ) : (
        <ScrollArea className="h-[calc(94vh-7rem)] overflow-y-auto scrollbar-hide">
          <div className="space-y-2">
            {notifications?.map((notification) => (
              <Card
                key={notification._id}
                onClick={() => markAsRead(notification._id, notification)}
                className={`cursor-pointer text-black ${
                  notification.isRead ? '' : 'bg-blue-50'
                }`}
              >
                <CardContent className="max-h-40 overflow-y-auto p-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* Avatar and message */}
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      {notification.senderId ? (
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage
                            src={notification.senderId?.image}
                            alt="Profile picture"
                            className="rounded-full"
                          />
                          <AvatarFallback className="bg-muted">
                            {notification.senderId?.name
                              ?.split(' ')
                              .map((n) => n[0])
                              .join('') || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <CircleUser className="h-5 w-5" />
                        </div>
                      )}

                      <p className="min-w-0 flex-1 break-words text-sm font-medium text-black">
                        {notification.message}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <div className="flex-shrink-0">
                      <p className="whitespace-nowrap text-xs text-muted-foreground">
                        {moment(notification.createdAt).fromNow()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {notifications?.length === 0 && (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground">
                  No notifications found
                </CardContent>
              </Card>
            )}
          </div>

          {hasMore && notifications.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Button 
                onClick={handleLoadMore} 
                disabled={loadingMore}
                className="mx-auto"
                variant='secondary'
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
}