import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import PageHead from '@/components/shared/page-head';
import { useState } from 'react';
import CreateDirector from './components/CreateDirector';
import DirectorTableList from './components/DirectorTableList';

export default function DirectorPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUserCreated = () => {
    setRefreshKey((prev) => prev + 1); // Update the key to trigger re-fetch
  };
  return (
    <div className="space-y-4 p-4 md:p-8">
      <Breadcrumbs
        items={[
          { title: 'Dashboard', link: '/dashboard' },
          { title: 'Director', link: '/director' }
        ]}
      />
      <CreateDirector onUserCreated={handleUserCreated} />
      <DirectorTableList refreshKey={refreshKey} />
    </div>
  );
}
