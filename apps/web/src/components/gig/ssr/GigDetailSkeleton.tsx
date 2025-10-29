import React from 'react';
import {
  Clock,
  MapPin,
  Users,
  DollarSign,
  Calendar,
  Target,
  Award,
  FileText,
} from 'lucide-react';

interface GigDetailSkeletonProps {
  showApplicationForm?: boolean;
  showOwnerActions?: boolean;
  showApplicationStatus?: boolean;
}

export const GigDetailSkeleton: React.FC<GigDetailSkeletonProps> = ({
  showApplicationForm = false,
  showOwnerActions = false,
  showApplicationStatus = false,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 py-2">
      <div className="mx-auto max-w-6xl px-1 sm:px-1 lg:px-1">
        {/* Header Skeleton */}
        <div className="mb-2">
          <div className="items-left flex flex-row justify-between">
            <div className="flex items-center space-x-1">
              <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
              <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
            </div>
            <div className="flex items-center space-x-1">
              {showOwnerActions && (
                <>
                  <div className="h-6 w-24 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-6 w-16 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-6 w-20 animate-pulse rounded bg-gray-200"></div>
                </>
              )}
              <div className="h-6 w-16 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="mt-1">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>

        {/* Application Status Banner Skeleton */}
        {showApplicationStatus && (
          <div className="mb-2 lg:col-span-3">
            <div className="flex items-center justify-between rounded border bg-blue-50 p-2">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
                <div>
                  <div className="mb-1 h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-3 w-48 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
              <div className="h-6 w-16 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {/* Main Content Skeleton */}
          <div className="space-y-2 lg:col-span-2">
            {/* Gig Header Card */}
            <div className="card-glass p-2">
              <div className="mb-2">
                <div className="mb-2 h-8 w-3/4 animate-pulse rounded bg-gray-200"></div>
                <div className="mb-2 flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
                  </div>
                  <div className="h-6 w-20 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="text-left">
                  <div className="mb-1 h-8 w-32 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>

              {/* Grid Metrics */}
              <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <div className="mb-1 h-3 w-16 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-5 w-20 animate-pulse rounded bg-gray-200"></div>
                  </div>
                ))}
              </div>

              {/* Tags Skeleton */}
              <div className="flex flex-wrap gap-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-6 w-16 animate-pulse rounded bg-gray-200"
                  ></div>
                ))}
              </div>
            </div>

            {/* Description Card */}
            <div className="card-glass p-2">
              <div className="mb-4 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-gray-400" />
                <div className="h-6 w-24 animate-pulse rounded bg-gray-200"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>

            {/* Requirements Card */}
            <div className="card-glass p-2">
              <div className="mb-4 flex items-center space-x-2">
                <Target className="h-5 w-5 text-gray-400" />
                <div className="h-6 w-28 animate-pulse rounded bg-gray-200"></div>
              </div>

              <div className="space-y-4">
                {/* Skills */}
                <div>
                  <div className="mb-2 h-5 w-32 animate-pulse rounded bg-gray-200"></div>
                  <div className="flex flex-wrap gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-6 w-20 animate-pulse rounded bg-gray-200"
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Role */}
                <div>
                  <div className="mb-2 h-5 w-28 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-6 w-24 animate-pulse rounded bg-gray-200"></div>
                </div>

                {/* Experience */}
                <div>
                  <div className="mb-2 h-5 w-32 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-6 w-20 animate-pulse rounded bg-gray-200"></div>
                </div>

                {/* Location */}
                <div>
                  <div className="mb-2 h-5 w-20 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            </div>

            {/* Deliverables Card */}
            <div className="card-glass p-2">
              <div className="mb-4 flex items-center space-x-2">
                <Award className="h-5 w-5 text-gray-400" />
                <div className="h-6 w-28 animate-pulse rounded bg-gray-200"></div>
              </div>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <div className="mt-0.5 h-4 w-4 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-4 flex-1 animate-pulse rounded bg-gray-200"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-2">
            <div className="card-glass p-3">
              <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200"></div>

              {showApplicationForm ? (
                <div className="space-y-4">
                  <div className="h-10 w-full animate-pulse rounded bg-gray-200"></div>
                  <div className="h-24 w-full animate-pulse rounded bg-gray-200"></div>
                  <div className="h-10 w-full animate-pulse rounded bg-gray-200"></div>
                  <div className="h-10 w-full animate-pulse rounded bg-gray-200"></div>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="mx-auto h-12 w-12 animate-pulse rounded bg-gray-200"></div>
                  <div className="mx-auto h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-10 w-full animate-pulse rounded bg-gray-200"></div>
                </div>
              )}
            </div>

            {/* Quick Stats Card */}
            <div className="card-glass p-3">
              <div className="mb-4 h-6 w-24 animate-pulse rounded bg-gray-200"></div>
              <div className="space-y-3">
                {[
                  { icon: DollarSign, label: 'Budget' },
                  { icon: Clock, label: 'Timeline' },
                  { icon: Users, label: 'Applications' },
                  { icon: Calendar, label: 'Deadline' },
                  { icon: MapPin, label: 'Location' },
                ].map(({ icon: Icon, label }, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-gray-400" />
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                    </div>
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand Info Card */}
            <div className="card-glass p-3">
              <div className="mb-4 h-6 w-20 animate-pulse rounded bg-gray-200"></div>
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 animate-pulse rounded bg-gray-200"></div>
                <div className="flex-1">
                  <div className="mb-1 h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-8 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-8 w-full animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading states for specific contexts
export const GigDetailLoadingSkeleton: React.FC = () => (
  <GigDetailSkeleton
    showApplicationForm={false}
    showOwnerActions={false}
    showApplicationStatus={false}
  />
);

export const GigDetailWithApplicationSkeleton: React.FC = () => (
  <GigDetailSkeleton
    showApplicationForm={true}
    showOwnerActions={false}
    showApplicationStatus={true}
  />
);

export const GigDetailOwnerSkeleton: React.FC = () => (
  <GigDetailSkeleton
    showApplicationForm={false}
    showOwnerActions={true}
    showApplicationStatus={false}
  />
);

export default GigDetailSkeleton;
