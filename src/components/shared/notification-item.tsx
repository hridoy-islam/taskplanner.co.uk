// import { formatDistanceToNow } from 'date-fns';
// import {
//   type LucideIcon,
//   MessageSquare,
//   Heart,
//   UserPlus,
//   Bell
// } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

// export type NotificationType =
//   | 'message'
//   | 'like'
//   | 'friend_request'
//   | 'reminder';

// export interface Notification {
//   id: string;
//   message: string;
//   read: boolean;
//   icon: LucideIcon;
// }

// export const notificationIcons: Record<NotificationType, LucideIcon> = {
//   message: MessageSquare,
//   like: Heart,
//   friend_request: UserPlus,
//   reminder: Bell
// };

export function NotificationItem({ notification, userImage, duration }) {
  return (
    <div
      className={`flex w-full cursor-pointer items-start space-x-6 rounded-lg px-2 py-1  ${notification.isRead ? 'bg-primary' : 'bg-blue-200'}`}
    >
      {/* <Icon className="mt-1 h-5 w-5 text-background" /> */}
      <div className="flex items-center  space-x-2">
        {userImage ? (
          <Avatar className="h-8 w-8 bg-black p-5 ">
            <AvatarImage src={userImage.image} alt="Profile picture" />
            <AvatarFallback>
              {userImage.name
                ?.split(' ')
                .map((n) => n[0])
                .join('') || 'U'}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-700 p-4" />
        )}
        <p className="text-sm font-medium leading-none text-black">
          {notification.message.length > 60
            ? `${notification.message.substring(0, 60)}...`
            : notification.message}
        </p>
        <p className="-mt-6 text-xs text-gray-500">{duration}</p>
      </div>
    </div>
  );
}
