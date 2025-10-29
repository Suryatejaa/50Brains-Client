// components/dashboard/brand/BrandDashboardSSR.tsx
import { Suspense } from 'react';
import SSRDashboardWrapper from '../ssr/SSRDashboardWrapper';
import { BrandDashboardClient } from './BrandDashboardClient';
import { PlusIcon, SearchIcon, MegaphoneIcon, MailIcon } from 'lucide-react';

// SERVER-SIDE RENDERED BRAND DASHBOARD
export default function BrandDashboardSSR() {
  const quickActions = [
    {
      href: '/create-gig',
      icon: <PlusIcon className="h-5 w-5" />,
      label: 'Create Campaign',
      description: 'Launch new campaign',
    },
    {
      href: '/my-gigs',
      icon: <MegaphoneIcon className="h-5 w-5" />,
      label: 'My Gigs',
      description: 'Manage campaigns',
    },
  ];

  return (
    <SSRDashboardWrapper
      variant="brand"
      title="Brand Dashboard"
      subtitle="Welcome back! Manage your campaigns and connect with top creators"
      quickActions={quickActions}
    >
      <Suspense
        fallback={
          <div className="h-64 animate-pulse rounded bg-gray-100"></div>
        }
      >
        <BrandDashboardClient />
      </Suspense>
    </SSRDashboardWrapper>
  );
}
