// components/dashboard/ssr/SSRDashboardWrapper.tsx
import { Suspense } from 'react';
import { DashboardSkeleton } from './DashboardSkeleton';

interface SSRDashboardWrapperProps {
  children: React.ReactNode;
  variant: 'crew' | 'brand' | 'influencer';
  title: string;
  subtitle: string;
  quickActions?: Array<{
    href: string;
    icon: React.ReactNode;
    label: string;
    description?: string;
  }>;
}

// SERVER-SIDE RENDERED DASHBOARD WRAPPER
export default function SSRDashboardWrapper({
  children,
  variant,
  title,
  subtitle,
  quickActions = [],
}: SSRDashboardWrapperProps) {
  return (
    <div className="min-h-screen bg-gray-50 px-1 py-0 md:p-3">
      <div className="mx-auto max-w-7xl">
        {/* 🚀 INSTANT SSR HEADER */}
        <div className="mb-1 md:mb-1">
          <div className="flex hidden flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-heading text-xl font-bold md:text-2xl">
                {title} ⚡ SSR
              </h1>
              <p className="text-muted flex items-center gap-1 text-sm md:text-base">
                {subtitle} 😊
              </p>
            </div>

            {/* 🚀 INSTANT SSR QUICK ACTIONS */}
            {quickActions.length > 0 && (
              <div className="flex gap-2">
                {quickActions.slice(0, 2).map((action, index) => (
                  <a
                    key={index}
                    href={action.href}
                    className="btn-primary flex items-center gap-2 px-3 py-2 text-sm"
                  >
                    {action.icon}
                    {action.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 🚀 INSTANT SSR METRICS PLACEHOLDER */}
        <div className="mb-1 grid hidden grid-cols-1 gap-1 md:mb-1 md:grid-cols-3 md:gap-1 lg:grid-cols-3">
          {/* {variant === 'crew' && (
            <>
              <div className="card-glass p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted text-xs md:text-sm">
                      Active Projects
                    </p>
                    <p className="text-heading text-lg font-semibold md:text-xl">
                      ...
                    </p>
                    <p className="text-muted text-xs">Loading...</p>
                  </div>
                  <div className="text-2xl">🎬</div>
                </div>
              </div>
              <div className="card-glass p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted text-xs md:text-sm">
                      Monthly Revenue
                    </p>
                    <p className="text-heading text-lg font-semibold md:text-xl">
                      ₹...
                    </p>
                    <p className="text-muted text-xs">Loading...</p>
                  </div>
                  <div className="text-2xl">💰</div>
                </div>
              </div>
              <div className="card-glass p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted text-xs md:text-sm">
                      Success Rate
                    </p>
                    <p className="text-heading text-lg font-semibold md:text-xl">
                      ...%
                    </p>
                    <p className="text-muted text-xs">Loading...</p>
                  </div>
                  <div className="text-2xl">🎯</div>
                </div>
              </div>
            </>
          )} */}

          {/* {variant === 'brand' && (
            <>
              <div className="card-glass p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted text-xs md:text-sm">Active Gigs</p>
                    <p className="text-heading text-lg font-semibold md:text-xl">
                      ...
                    </p>
                    <p className="text-muted text-xs">Loading...</p>
                  </div>
                  <div className="text-2xl">🚀</div>
                </div>
              </div>
              <div className="card-glass p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted text-xs md:text-sm">
                      Pending Applications
                    </p>
                    <p className="text-heading text-lg font-semibold md:text-xl">
                      ...
                    </p>
                    <p className="text-muted text-xs">Loading...</p>
                  </div>
                  <div className="text-2xl">📧</div>
                </div>
              </div>
              <div className="card-glass p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted text-xs md:text-sm">
                      Total Budget
                    </p>
                    <p className="text-heading text-lg font-semibold md:text-xl">
                      ₹...
                    </p>
                    <p className="text-muted text-xs">Loading...</p>
                  </div>
                  <div className="text-2xl">💳</div>
                </div>
              </div>
            </>
          )}

          {variant === 'influencer' && (
            <>
              <div className="card-glass p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted text-xs md:text-sm">
                      Monthly Earnings
                    </p>
                    <p className="text-heading text-lg font-semibold md:text-xl">
                      ₹...
                    </p>
                    <p className="text-muted text-xs">Loading...</p>
                  </div>
                  <div className="text-2xl">💰</div>
                </div>
              </div>
              <div className="card-glass p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted text-xs md:text-sm">
                      Active Applications
                    </p>
                    <p className="text-heading text-lg font-semibold md:text-xl">
                      ...
                    </p>
                    <p className="text-muted text-xs">Loading...</p>
                  </div>
                  <div className="text-2xl">🎯</div>
                </div>
              </div>
              <div className="card-glass p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted text-xs md:text-sm">
                      Success Rate
                    </p>
                    <p className="text-heading text-lg font-semibold md:text-xl">
                      ...%
                    </p>
                    <p className="text-muted text-xs">Loading...</p>
                  </div>
                  <div className="text-2xl">⭐</div>
                </div>
              </div>
            </>
          )} */}
        </div>

        {/* 🚀 PROGRESSIVE ENHANCEMENT - Load real data */}
        <Suspense fallback={<DashboardSkeleton variant={variant} />}>
          {children}
        </Suspense>
      </div>
    </div>
  );
}
