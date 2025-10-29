// components/dashboard/crew/CrewDashboardSSR.tsx
import { Suspense } from 'react';
import SSRDashboardWrapper from '../ssr/SSRDashboardWrapper';
import { CrewDashboardClient } from './CrewDashboardClient';
import { VideoIcon, FileTextIcon } from 'lucide-react';

// SERVER-SIDE RENDERED CREW DASHBOARD
export default function CrewDashboardSSR() {
  const quickActions = [
    {
      href: '/marketplace',
      icon: <VideoIcon className="h-5 w-5" />,
      label: 'Browse Projects',
      description: 'Find new opportunities',
    },
    {
      href: '/my/submissions',
      icon: <FileTextIcon className="h-5 w-5" />,
      label: 'View Submissions',
      description: 'Check your work',
    },
  ];

  return (
    <SSRDashboardWrapper
      variant="crew"
      title="Crew Dashboard"
      subtitle="Welcome back! Manage your projects and find new opportunities"
      quickActions={quickActions}
    >
      <Suspense
        fallback={
          <div className="h-64 animate-pulse rounded bg-gray-100"></div>
        }
      >
        <CrewDashboardClient />
      </Suspense>
    </SSRDashboardWrapper>
  );
}
