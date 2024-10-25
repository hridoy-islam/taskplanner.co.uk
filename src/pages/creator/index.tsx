import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import PageHead from '@/components/shared/page-head';
import { useState } from 'react';
import CreateCreator from './components/CreateCreator';
import CreatorTableList from './components/CreatorTableList';

export default function CreatorPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUserCreated = () => {
    setRefreshKey((prev) => prev + 1); // Update the key to trigger re-fetch
  };
  return (
    <div className="space-y-4 p-4 md:p-8">
      <PageHead title="Creator Page" />
      <Breadcrumbs
        items={[
          { title: 'Dashboard', link: '/dashboard' },
          { title: 'Creator', link: '/creator' }
        ]}
      />
      <CreateCreator onUserCreated={handleUserCreated} />
      <CreatorTableList refreshKey={refreshKey} />
    </div>
  );
}
