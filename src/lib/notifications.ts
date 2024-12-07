import {
  type LucideIcon,
  ListChecks,
  UserPlus,
  Bell,
  UsersRound
} from 'lucide-react';

export type NotificationType = 'task' | 'group' | 'friend_request' | 'reminder';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: Date;
  read: boolean;
  icon: LucideIcon;
}

export const notificationIcons: Record<NotificationType, LucideIcon> = {
  task: ListChecks,
  group: UsersRound,
  friend_request: UserPlus,
  reminder: Bell
};

export const demoNotifications: Notification[] = [
  {
    id: '1',
    type: 'task',
    message: 'John Doe assigned you a task',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    read: false,
    icon: notificationIcons.task
  },
  {
    id: '2',
    type: 'group',
    message: 'Jane Smith added you on a group',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: true,
    icon: notificationIcons.group
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
