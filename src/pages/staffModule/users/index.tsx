import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import PageHead from '@/components/shared/page-head';
import { useState } from 'react';
import CreateUser from './components/CreateUser';
import UserTableList from './components/UserTableList';

export default function ManageUserPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUserCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };
  return (
    <div className="space-y-4  ">
      
      <UserTableList  />
    </div>
  );
}
