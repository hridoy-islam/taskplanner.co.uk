import { useState } from 'react';
import AutoLogout from '../shared/auto-logout';
import Header from '../shared/AppHeader';
import MobileSidebar from '../shared/mobile-nav';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <AutoLogout inactivityLimit={30 * 60 * 1000} />

      <Header onMenuClick={() => setSidebarOpen(true)} />
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="p-5">{children}</main>
    </div>
  );
}
