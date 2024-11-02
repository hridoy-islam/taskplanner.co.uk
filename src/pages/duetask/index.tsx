import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import PageHead from '@/components/shared/page-head.jsx';
import { useSelector } from 'react-redux';

export default function DueTaskPage() {
  const { user } = useSelector((state: any) => state.auth);
  return (
    <div className="p-4 md:p-8">
      <PageHead title="Due Task" />
      <Breadcrumbs
        items={[
          { title: 'Dashboard', link: '/dashboard' },
          { title: 'Due Task', link: '/duetask' }
        ]}
      />
      {user._id}
    </div>
  );
}
