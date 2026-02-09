import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import PageHead from '@/components/shared/page-head';
import { useState } from 'react';
import CreateCreator from './components/CreateManager';
import ManagerTableList from './components/ManagerTableList';

export default function ManagerPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUserCreated = () => {
    setRefreshKey((prev) => prev + 1); // Update the key to trigger re-fetch
  };
  return (
    <div className="space-y-4 ">
      
      <ManagerTableList />
    </div>
  );
}
