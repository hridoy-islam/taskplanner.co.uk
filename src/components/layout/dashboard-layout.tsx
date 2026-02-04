import { useState } from 'react';
import MobileSidebar from '../shared/mobile-sidebar';
import AutoLogout from '../shared/auto-logout';
import Header from '../shared/AppHeader';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  return (
    <div className="bg-gray-100 min-h-screen">
      <AutoLogout inactivityLimit={30 * 60 * 1000} />
      <MobileSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

    
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <main className="p-5">
        {children}
      </main>
      
    </div>
  );
}