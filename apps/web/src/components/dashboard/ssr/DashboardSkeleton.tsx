// components/dashboard/ssr/DashboardSkeleton.tsx
export interface DashboardSkeletonProps {
  variant: 'crew' | 'brand' | 'influencer';
  className?: string;
}

export function DashboardSkeleton({
  variant,
  className = '',
}: DashboardSkeletonProps) {
  return (
    <div className={`min-h-screen bg-gray-50 px-1 py-0 md:p-3 ${className}`}>
      <div className="mx-auto max-w-7xl">
        {/* Header Skeleton */}
        <div className="mb-1 md:mb-1">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 h-8 w-48 animate-pulse rounded bg-gray-200"></div>
              <div className="h-5 w-64 animate-pulse rounded bg-gray-200"></div>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-24 animate-pulse rounded bg-gray-200"
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics Row Skeleton */}
        <div className="mb-1 grid grid-cols-1 gap-1 md:mb-1 md:grid-cols-3 md:gap-1 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-glass p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="mb-2 h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                  <div className="mb-1 h-6 w-16 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="h-6 w-6 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 gap-1 md:gap-1 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-1 md:space-y-1 lg:col-span-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="card-glass p-3 md:p-4">
                <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200"></div>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-1 md:space-y-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card-glass p-3 md:p-4">
                <div className="mb-3 h-5 w-24 animate-pulse rounded bg-gray-200"></div>
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div
                      key={j}
                      className="h-4 w-full animate-pulse rounded bg-gray-200"
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
