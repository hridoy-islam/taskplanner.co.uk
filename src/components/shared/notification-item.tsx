import { formatDistanceToNow } from 'date-fns';

import {
  type LucideIcon,
  MessageSquare,
  Heart,
  UserPlus,
  Bell
} from 'lucide-react';

export type NotificationType =
  | 'message'
  | 'like'
  | 'friend_request'
  | 'reminder';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: Date;
  read: boolean;
  icon: LucideIcon;
}

export const notificationIcons: Record<NotificationType, LucideIcon> = {
  message: MessageSquare,
  like: Heart,
  friend_request: UserPlus,
  reminder: Bell
};

export const demoNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    message: 'John Doe sent you a message',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    read: false,
    icon: notificationIcons.message
  },
  {
    id: '2',
    type: 'like',
    message: 'Jane Smith liked your post',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: true,
    icon: notificationIcons.like
  },
  {
    id: '3',
    type: 'friend_request',
    message: 'Mike Johnson sent you a friend request',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    icon: notificationIcons.friend_request
  },
  {
    id: '4',
    type: 'reminder',
    message: "Don't forget to complete your profile",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    icon: notificationIcons.reminder
  }
];

export function NotificationItem({
  notification
}: {
  notification: Notification;
}) {
  const Icon = notification.icon;
  return (
    <div
      className={`flex w-full cursor-pointer items-start space-x-4 p-4 ${notification.read ? 'bg-primary' : 'bg-blue-200'}`}
    >
      <Icon className="mt-1 h-5 w-5 text-background" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none text-black">
          {notification.message}
        </p>
        <p className="text-xs text-black">
          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
