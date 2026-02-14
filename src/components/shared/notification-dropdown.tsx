import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Bell,
  BellRing,
  CircleUser,
  CheckCheck,
  Receipt,
  FileText,
  MessageSquare,
  Ticket,
  BriefcaseBusiness
} from 'lucide-react';
import ReactHowler from 'react-howler';
import moment from 'moment';

import axiosInstance from '../../lib/axios';
import { socket, setupSocket } from '../../lib/socket';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Refined Typescript Interface
interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
  type?: 'task' | 'group' | 'note' | 'invoice' | string;
  docId?: string;
  senderId?: {
    _id?: string;
    name?: string;
    image?: string;
  };
  updatedAt: string;
  createdAt: string;
}

// Helper to pick the right icon based on notification type
const getNotificationIcon = (type?: string, isRead?: boolean) => {
  const iconClass = `h-5 w-5 ${isRead ? 'text-black' : 'text-taskplanner'}`;
  switch (type) {
    case 'invoice':
    case 'task':
      return <BriefcaseBusiness className={iconClass} />;
    case 'note':
      return <FileText className={iconClass} />;
    case 'group':
    case 'message':
      return <MessageSquare className={iconClass} />;
    default:
      return <Ticket className={iconClass} />;
  }
};

export function NotificationDropdown() {
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [playSound, setPlaySound] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const { id: userId,uid } = useParams();
  useEffect(() => {
    const loadNotifications = async (userId: string) => {
      try {
        const { data } = await axiosInstance.get(`/notifications/${userId}`);
        const fetchedNotifications = data?.data?.result || [];

        setNotifications(fetchedNotifications);
        setUnreadCount(
          fetchedNotifications.filter((n: Notification) => !n.isRead).length
        );
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (user?._id) {
      loadNotifications(user._id);
      setupSocket(user._id);

      const handleNewNotification = (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        setPlaySound(true);
      };

      socket.on('notification', handleNewNotification);

      return () => {
        socket.off('notification', handleNewNotification);
      };
    }
  }, [user?._id]);

const markAsRead = async (id: string, notification: Notification) => {
    try {
      if (!notification.isRead) {
        // 1. Update the notification list
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        
        // 2. Reduce the unread count (ensuring it doesn't go below 0)
        setUnreadCount((prev) => Math.max(0, prev - 1));

        // 3. Update the database
        await axiosInstance.patch(`/notifications/${id}/read`, {
          isRead: true
        });
      }

      // ============================================
      // USER / CREATOR ROUTING
      // ============================================
      if (user?.role === 'user' || user?.role === 'creator') {
        if (notification.type === 'task' && notification.docId) {
          navigate(`/company/${userId}/user/${uid}/task-details/${notification.docId}`);
        } else if (notification?.type === 'group' && notification?.docId) {
          navigate(`/company/${userId}/user/${uid}/group/${notification?.docId}`);
        } else if (notification?.type === 'note') {
          navigate(`/company/${userId}/user/${uid}/notes`);
        }
      } 
      // ============================================
      // COMPANY / DEFAULT ROUTING
      // ============================================
      else {
        if (notification.type === 'task' && notification.docId) {
          navigate(`/company/${userId}/task-details/${notification.docId}`);
        } else if (notification?.type === 'group' && notification?.docId) {
          navigate(`/company/${userId}/group/${notification?.docId}`);
        } else if (notification?.type === 'note') {
          navigate(`/company/${userId}/notes`);
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsSeen = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await axiosInstance.patch(`/notifications/readall`);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const calculateDuration = (createdAt: string): string => {
    if (!createdAt) return 'Just now';

    const durationInMinutes = Math.floor(
      (new Date().getTime() - new Date(createdAt).getTime()) / 60000
    );

    if (durationInMinutes < 1) return 'Just now';
    if (durationInMinutes < 60) return `${durationInMinutes}m`;
    if (durationInMinutes < 1440)
      return `${Math.floor(durationInMinutes / 60)} hours ago`;
    return moment(createdAt).format('MMM D, YYYY'); // Matches the "Nov 25, 2024" format in the screenshot
  };

  return (
    <>
      <ReactHowler
        src={import('@/assets/sound/notification.mp3')}
        playing={playSound}
        onEnd={() => setPlaySound(false)}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-full bg-white transition-all "
          >
            <Bell className="0 h-5 w-5" />
            {unreadCount > 0 && (
              <div className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-taskplanner p-1 text-[10px] font-bold text-white shadow-sm">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>

        {/* Clean White Dropdown matching the screenshot */}
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-[360px] overflow-hidden rounded-xl border border-taskplanner/20 bg-white p-0 shadow-md "
        >
          {/* Header */}
          <DropdownMenuLabel className="flex items-center justify-between border-b border-taskplanner/60 bg-white px-4 py-4">
            <span className="text-[15px] font-semibold text-gray-900">
              Notifications
            </span>
            <button
              onClick={markAllAsSeen}
              className="flex items-center gap-1.5 text-[13px] font-medium text-taskplanner transition-colors hover:text-taskplanner/90"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
          </DropdownMenuLabel>

          {/* Notification List (No Dividers) */}
          <DropdownMenuGroup className="max-h-[380px] overflow-y-auto py-2">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-3 bg-white px-4 py-10 text-center">
                <BellRing className="h-8 w-8 text-gray-300" />
                <p className="text-sm font-medium text-black">
                  You're all caught up!
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification._id}
                  onClick={() => markAsRead(notification._id, notification)}
                  className={cn(
                    'flex cursor-pointer items-start gap-3.5 rounded-none px-4 py-3 transition-colors focus:outline-none',
                    !notification.isRead
                      ? 'bg-taskplanner/10 hover:bg-taskplanner/15 focus:bg-taskplanner/15'
                      : 'hover:bg-gray-50 focus:bg-gray-50'
                  )}
                >
                  {/* Rounded Icon Box with optional Unread Dot */}
                  <div className="relative mt-0.5 shrink-0">
                    {!notification.isRead && (
                      <span className="absolute -left-1 -top-1 z-10 h-2.5 w-2.5 rounded-full border-2 border-white bg-taskplanner" />
                    )}
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                        !notification.isRead
                          ? 'border-blue-100 bg-blue-50/50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      {getNotificationIcon(
                        notification.type,
                        notification.isRead
                      )}
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 space-y-1">
                    <p
                      className={`text-[13px] leading-snug ${
                        !notification.isRead
                          ? 'font-medium text-gray-900'
                          : 'text-gray-700'
                      }`}
                    >
                      {notification.message}
                    </p>
                    <p className="text-[12px] text-black">
                      {calculateDuration(notification.createdAt)}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuGroup>

          {/* Footer */}
          {/* Footer */}
          <div className="bg-white p-3">
            <Button
              variant="outline"
              className="h-9 w-full justify-center rounded-lg border-taskplanner/60 bg-white text-[13px] font-medium text-gray-800 hover:bg-taskplanner"
              asChild
            >
              <Link
                to={
                  user?.role === 'user' || user?.role === 'creator'
                    ? `/company/${userId}/user/${uid}/notifications`
                    : `/company/${userId}/notifications`
                }
              >
                Show all
              </Link>
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Detail Modal (Kept clean and matching) */}
      <Dialog
        open={selectedNotification !== null}
        onOpenChange={(open) => !open && setSelectedNotification(null)}
      >
        <DialogContent className="rounded-xl border border-gray-100 bg-white p-6 shadow-2xl sm:max-w-md">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-bold text-gray-900">
              Notification Details
            </DialogTitle>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-100 bg-gray-50">
                  {selectedNotification.senderId?.image ? (
                    <img
                      src={selectedNotification.senderId.image}
                      alt="avatar"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <CircleUser className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900">
                    {selectedNotification.senderId?.name || 'System User'}
                  </h4>
                  <p className="text-sm font-medium text-black">
                    {moment(selectedNotification.updatedAt).format(
                      'MMM Do YYYY, h:mm A'
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <p className="text-[14px] leading-relaxed text-gray-700">
                  {selectedNotification.message}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
