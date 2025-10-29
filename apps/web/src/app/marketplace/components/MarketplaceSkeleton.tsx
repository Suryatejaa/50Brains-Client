// app/marketplace/components/MarketplaceSkeleton.tsx
export function MarketplaceSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Gigs Grid Skeleton */}
      <div className="grid gap-1 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="card-glass p-2">
            {/* Header skeleton */}
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-5 w-16 rounded bg-gray-200"></div>
                <div className="h-5 w-12 rounded bg-gray-200"></div>
              </div>
              <div className="h-4 w-20 rounded bg-gray-200"></div>
            </div>

            {/* Brand info skeleton */}
            <div className="mb-2 flex items-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-gray-200"></div>
              <div className="h-4 w-24 rounded bg-gray-200"></div>
            </div>

            {/* Title skeleton */}
            <div className="mb-2 h-6 w-3/4 rounded bg-gray-200"></div>

            {/* Description skeleton */}
            <div className="mb-4 space-y-2">
              <div className="h-4 w-full rounded bg-gray-200"></div>
              <div className="h-4 w-2/3 rounded bg-gray-200"></div>
            </div>

            {/* Skills skeleton */}
            <div className="mb-4 flex gap-1">
              <div className="h-5 w-16 rounded bg-gray-200"></div>
              <div className="h-5 w-20 rounded bg-gray-200"></div>
              <div className="h-5 w-14 rounded bg-gray-200"></div>
            </div>

            {/* Footer skeleton */}
            <div className="flex items-center justify-between">
              <div className="h-6 w-24 rounded bg-gray-200"></div>
              <div className="h-8 w-20 rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
