import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import PageHead from '@/components/shared/page-head';
import { useState } from 'react';
import CreateCompany from './components/CreateCompany';
import CompanyTableList from './components/CompanyTableList';

export default function CompanyPage() {
  
  return (
    <div className="space-y-4 ">
      
      <CompanyTableList  />
    </div>
  );
}
