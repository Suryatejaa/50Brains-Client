// components/skeletons/DashboardSkeleton.tsx
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-gray-50">
      <div className="page-container pt-16">
        <div className="content-container py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="mb-4 h-8 w-1/3 rounded bg-gray-200"></div>
            <div className="h-4 w-1/2 rounded bg-gray-200"></div>
          </div>

          {/* Metrics Skeleton */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card-glass p-6">
                <div className="mb-2 h-4 w-1/2 rounded bg-gray-200"></div>
                <div className="h-8 w-1/3 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="card-glass mb-6 p-6">
                <div className="mb-4 h-6 w-1/4 rounded bg-gray-200"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-4 rounded bg-gray-200"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="card-glass p-6">
                <div className="mb-4 h-6 w-1/3 rounded bg-gray-200"></div>
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-3 rounded bg-gray-200"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GigListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="card-glass animate-pulse p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 h-6 w-3/4 rounded bg-gray-200"></div>
              <div className="h-4 w-1/2 rounded bg-gray-200"></div>
            </div>
            <div className="h-8 w-16 rounded bg-gray-200"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-gray-200"></div>
            <div className="h-3 w-2/3 rounded bg-gray-200"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MarketplaceSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container pt-16">
        <div className="content-container py-8">
          {/* Header */}
          <div className="mb-8 animate-pulse">
            <div className="mb-4 h-8 w-1/3 rounded bg-gray-200"></div>
            <div className="h-4 w-1/2 rounded bg-gray-200"></div>
          </div>

          {/* Search & Filters */}
          <div className="mb-8 animate-pulse">
            <div className="mb-4 h-12 rounded bg-gray-200"></div>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-20 rounded bg-gray-200"></div>
              ))}
            </div>
          </div>

          {/* Gig Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card-glass animate-pulse p-6">
                <div className="mb-4 h-6 w-3/4 rounded bg-gray-200"></div>
                <div className="mb-4 space-y-2">
                  <div className="h-3 w-full rounded bg-gray-200"></div>
                  <div className="h-3 w-2/3 rounded bg-gray-200"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-4 w-1/3 rounded bg-gray-200"></div>
                  <div className="h-8 w-16 rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
