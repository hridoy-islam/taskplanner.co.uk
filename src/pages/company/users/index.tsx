import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import PageHead from '@/components/shared/page-head';
import { useState } from 'react';
import CreateUser from './components/CreateUser';
import UserTableList from './components/UserTableList';

export default function UserPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUserCreated = () => {
    setRefreshKey((prev) => prev + 1); // Update the key to trigger re-fetch
  };
  return (
    <div className="space-y-4 p-4 md:p-8 ">
      <PageHead title="Profile Page" />
      
      <CreateUser onUserCreated={handleUserCreated} />
      <UserTableList  />
    </div>
  );
}
