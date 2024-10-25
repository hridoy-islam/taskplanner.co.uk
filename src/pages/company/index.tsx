import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import PageHead from '@/components/shared/page-head';
import { useState } from 'react';
import CreateCompany from './components/CreateCompany';
import CompanyTableList from './components/CompanyTableList';

export default function CompanyPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUserCreated = () => {
    setRefreshKey((prev) => prev + 1); // Update the key to trigger re-fetch
  };
  return (
    <div className="space-y-4 p-4 md:p-8">
      <PageHead title="Company Page" />
      <Breadcrumbs
        items={[
          { title: 'Dashboard', link: '/dashboard' },
          { title: 'Company', link: '/company' }
        ]}
      />
      <CreateCompany onUserCreated={handleUserCreated} />
      <CompanyTableList refreshKey={refreshKey} />
    </div>
  );
}
