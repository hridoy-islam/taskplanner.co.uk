import { NotificationItem } from '@/components/shared/notification-item';
import { demoNotifications } from '@/lib/notifications';

export default function NotificationsPage() {
  return (
    <div className="container mx-auto mt-2">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Notifications</h1>
      </div>
      <div className="space-y-4">
        {demoNotifications.map((notification) => (
          <div key={notification.id} className="overflow-hidden rounded-lg">
            <NotificationItem notification={notification} />
          </div>
        ))}
      </div>
    </div>
  );
}
