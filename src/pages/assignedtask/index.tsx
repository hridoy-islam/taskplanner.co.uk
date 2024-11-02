import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import PageHead from '@/components/shared/page-head.jsx';
import { useSelector } from 'react-redux';

export default function AssignedTaskPage() {
  const { user } = useSelector((state: any) => state.auth);
  return (
    <div className="p-4 md:p-8">
      <PageHead title="Assigned Task" />
      <Breadcrumbs
        items={[
          { title: 'Dashboard', link: '/dashboard' },
          { title: 'Assigned Task', link: '/assignedtask' }
        ]}
      />
      {user._id}
    </div>
  );
}
