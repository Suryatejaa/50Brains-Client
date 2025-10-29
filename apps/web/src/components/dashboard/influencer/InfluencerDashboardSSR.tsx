// components/dashboard/influencer/InfluencerDashboardSSR.tsx
import { Suspense } from 'react';
import SSRDashboardWrapper from '../ssr/SSRDashboardWrapper';
import { InfluencerDashboardClient } from './InfluencerDashboardClient';
import { MegaphoneIcon, FileTextIcon } from 'lucide-react';

// SERVER-SIDE RENDERED INFLUENCER DASHBOARD
export default function InfluencerDashboardSSR() {
  const quickActions = [
    {
      href: '/marketplace',
      icon: <MegaphoneIcon className="h-5 w-5" />,
      label: 'Browse Gigs',
      description: 'Find opportunities',
    },
    {
      href: '/my/submissions',
      icon: <FileTextIcon className="h-5 w-5" />,
      label: 'View Submissions',
      description: 'Check applications',
    },
  ];

  return (
    <SSRDashboardWrapper
      variant="influencer"
      title="Influencer Dashboard"
      subtitle="Welcome back! Grow your influence and find amazing opportunities"
      quickActions={quickActions}
    >
      <Suspense
        fallback={
          <div className="h-64 animate-pulse rounded bg-gray-100"></div>
        }
      >
        <InfluencerDashboardClient />
      </Suspense>
    </SSRDashboardWrapper>
  );
}
