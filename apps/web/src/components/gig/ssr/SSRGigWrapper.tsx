import React from 'react';
import { Metadata } from 'next';
import {
  Clock,
  MapPin,
  Users,
  DollarSign,
  Calendar,
  Target,
  FileText,
  Award,
} from 'lucide-react';

interface SSRGigWrapperProps {
  gigId: string;
  children: React.ReactNode;
  gigData?: {
    title?: string;
    description?: string;
    budgetMin?: number;
    budgetMax?: number;
    budgetType?: string;
    category?: string;
    status?: string;
    deadline?: string;
    createdAt?: string;
    brand?: {
      name?: string;
      verified?: boolean;
    };
    applicationCount?: number;
    _count?: {
      applications?: number;
      submissions?: number;
    };
    skillsRequired?: string[];
    deliverables?: string[];
    tags?: string[];
    roleRequired?: string;
    experienceLevel?: string;
    location?: string;
    urgency?: string;
    duration?: string;
    isClanAllowed?: boolean;
  };
  userRole?: 'brand' | 'influencer' | 'crew' | null;
  isOwner?: boolean;
}

export const SSRGigWrapper: React.FC<SSRGigWrapperProps> = ({
  gigId,
  children,
  gigData,
  userRole,
  isOwner = false,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 py-2">
      <div className="mx-auto max-w-6xl px-1 sm:px-1 lg:px-1">
        {/* SSR Header - Instantly Rendered */}
        <div className="mb-2">
          <div className="items-left flex flex-row justify-between">
            <div className="flex items-center space-x-1">
              <button className="btn-secondary">←</button>
              <button
                className="btn-secondary text-sm"
                title="Refresh gig data"
              >
                ↻
              </button>
            </div>
            <div className="flex items-center space-x-1">
              {isOwner && (
                <div className="flex items-center space-x-1">
                  {gigData?.status === 'DRAFT' && (
                    <span className="cursor-pointer text-sm text-blue-600 hover:underline">
                      Complete & Publish
                    </span>
                  )}
                  <span className="text-gray-400">|</span>
                  <span className="cursor-pointer text-sm text-blue-600 hover:underline">
                    Edit
                  </span>
                  {gigData?.status !== 'DRAFT' && (
                    <>
                      <span className="text-gray-400">|</span>
                      <span className="cursor-pointer text-sm text-blue-600 hover:underline">
                        Applications ({gigData?.applicationCount || 0})
                      </span>
                      <span className="text-gray-400">|</span>
                      <span className="cursor-pointer text-sm text-yellow-600 hover:underline">
                        Pause
                      </span>
                      <span className="text-gray-400">|</span>
                      <span className="cursor-pointer text-sm text-blue-600 hover:underline">
                        Make{' '}
                        {gigData?.status === 'PUBLIC' ? 'Private' : 'Public'}
                      </span>
                    </>
                  )}
                </div>
              )}
              <span className="text-gray-400">|</span>
              {gigData?.status &&
                gigData.status !== 'OPEN' &&
                gigData.status !== 'ASSIGNED' && (
                  <span
                    className={`rounded px-1 py-1 text-sm font-medium ${
                      gigData.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : gigData.status === 'PAUSED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : gigData.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : gigData.status === 'DRAFT'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {gigData.status}
                  </span>
                )}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">
              Posted{' '}
              {gigData?.createdAt
                ? new Date(gigData.createdAt).toLocaleDateString()
                : 'Recently'}
            </div>
          </div>
        </div>

        {/* Draft Notice - SSR */}
        {gigData?.status === 'DRAFT' && (
          <div className="mb-2">
            <div className="flex items-center justify-between rounded border border-yellow-200 bg-yellow-50 p-1">
              <div className="flex items-center space-x-1">
                <div>
                  <p className="font-semibold text-yellow-800">Draft Gig</p>
                  <p className="text-sm text-yellow-600">
                    {isOwner
                      ? 'This gig is still in draft mode. Complete and publish it to make it live and start accepting applications.'
                      : 'This gig is currently in draft mode and not accepting applications.'}
                  </p>
                </div>
              </div>
              {isOwner && (
                <button className="cursor-pointer p-2 text-sm text-blue-600 hover:underline">
                  Complete...
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {/* SSR Main Content */}
          <div className="space-y-2 lg:col-span-2">
            {/* Gig Header - SSR */}
            <div className="card-glass p-2">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h1 className="mb-2 text-3xl font-bold text-gray-900">
                    {gigData?.title || 'Loading Gig Details...'}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-200">
                        <span className="text-xs font-medium text-gray-500">
                          {gigData?.brand?.name?.charAt(0) || 'B'}
                        </span>
                      </div>
                      <span className="font-medium">
                        {gigData?.brand?.name || 'Brand'}
                      </span>
                      {gigData?.brand?.verified && (
                        <span className="text-blue-500">✓</span>
                      )}
                    </div>
                    <div className="rounded bg-blue-100 px-1 py-1 text-sm text-blue-800">
                      {gigData?.category || 'Category'}
                    </div>
                  </div>
                  <div className="mt-2 text-left">
                    <div className="text-3xl font-bold text-green-600">
                      ₹{gigData?.budgetMin?.toLocaleString() || '0'}
                      {gigData?.budgetMax &&
                      gigData.budgetMax !== gigData.budgetMin
                        ? ` - ₹${gigData.budgetMax.toLocaleString()}`
                        : ''}
                    </div>
                    <div className="text-sm text-gray-600">
                      Budget ({gigData?.budgetType || 'fixed'})
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant Metrics Grid - SSR */}
              <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Deadline
                  </label>
                  <div className="text-lg">
                    {gigData?.deadline
                      ? new Date(gigData.deadline).toLocaleDateString()
                      : 'Not specified'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Applications
                  </label>
                  <div className="text-lg">
                    {gigData?._count?.applications ||
                      gigData?.applicationCount ||
                      0}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Submissions
                  </label>
                  <div className="text-lg">
                    {gigData?._count?.submissions || 0}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Duration
                  </label>
                  <div className="text-lg">
                    {gigData?.duration || 'Not specified'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Urgency
                  </label>
                  <div className="text-lg">
                    <span
                      className={`rounded px-2 py-1 text-sm ${
                        gigData?.urgency === 'HIGH'
                          ? 'bg-red-100 text-red-800'
                          : gigData?.urgency === 'MEDIUM'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {gigData?.urgency || 'Normal'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags - SSR */}
              {gigData?.tags && gigData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {gigData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="rounded bg-gray-100 px-1 py-1 text-sm text-gray-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description - SSR */}
            <div className="card-glass p-1">
              <div className="mb-4 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-gray-500" />
                <h2 className="text-xl font-semibold">Description</h2>
              </div>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">
                  {gigData?.description || 'Loading description...'}
                </p>
              </div>
            </div>

            {/* Requirements Preview - SSR */}
            <div className="card-glass p-1">
              <div className="mb-2 flex items-center space-x-2">
                <Target className="h-5 w-5 text-gray-500" />
                <h2 className="text-xl font-semibold">Requirements</h2>
              </div>

              {/* Skills Preview */}
              {gigData?.skillsRequired && gigData.skillsRequired.length > 0 && (
                <div className="mb-2">
                  <h3 className="mb-3 flex items-center space-x-2 font-semibold">
                    <span>💼</span>
                    <span>Skills Required</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {gigData.skillsRequired.slice(0, 5).map((skill, index) => (
                      <span
                        key={index}
                        className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {gigData.skillsRequired.length > 5 && (
                      <span className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-600">
                        +{gigData.skillsRequired.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Role and Experience - SSR */}
              <div className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-3">
                {gigData?.roleRequired && (
                  <div>
                    <h3 className="mb-2 flex items-center space-x-2 font-semibold">
                      <span>👤</span>
                      <span>Role</span>
                    </h3>
                    <span className="rounded bg-green-100 px-3 py-1 text-sm text-green-800">
                      {gigData.roleRequired}
                    </span>
                  </div>
                )}

                {gigData?.experienceLevel && (
                  <div>
                    <h3 className="mb-2 flex items-center space-x-2 font-semibold">
                      <span>📊</span>
                      <span>Experience</span>
                    </h3>
                    <span className="rounded bg-purple-100 px-3 py-1 text-sm text-purple-800">
                      {gigData.experienceLevel}
                    </span>
                  </div>
                )}

                {gigData?.location && (
                  <div>
                    <h3 className="mb-2 flex items-center space-x-2 font-semibold">
                      <MapPin className="h-4 w-4" />
                      <span>Location</span>
                    </h3>
                    <span className="rounded bg-orange-100 px-3 py-1 text-sm text-orange-800">
                      {gigData.location}
                    </span>
                  </div>
                )}
              </div>

              {/* Team Applications */}
              <div className="mb-2">
                <h3 className="mb-2 flex items-center space-x-2 font-semibold">
                  <Users className="h-4 w-4" />
                  <span>Team Applications</span>
                </h3>
                <span
                  className={`rounded px-3 py-1 text-sm ${
                    gigData?.isClanAllowed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {gigData?.isClanAllowed
                    ? 'Clan applications allowed'
                    : 'Individual applications only'}
                </span>
              </div>
            </div>

            {/* Deliverables Preview - SSR */}
            {gigData?.deliverables && gigData.deliverables.length > 0 && (
              <div className="card-glass p-3">
                <div className="mb-2 flex items-center space-x-2">
                  <Award className="h-5 w-5 text-gray-500" />
                  <h2 className="text-xl font-semibold">Deliverables</h2>
                </div>
                <ul className="list-inside list-disc space-y-2 text-gray-700">
                  {gigData.deliverables
                    .slice(0, 3)
                    .map((deliverable, index) => (
                      <li key={index}>{deliverable}</li>
                    ))}
                  {gigData.deliverables.length > 3 && (
                    <li className="text-gray-500">
                      +{gigData.deliverables.length - 3} more deliverables
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* SSR Sidebar */}
          <div className="space-y-2">
            {/* Application Status - SSR with comprehensive logic */}
            <div className="card-glass p-3">
              <h3 className="mb-4 text-lg font-semibold">Application Status</h3>

              {!userRole ? (
                // Not authenticated
                <div className="text-center">
                  <p className="mb-4 text-gray-600">
                    Sign in to apply for this gig
                  </p>
                  <a href="/login" className="btn-primary w-full">
                    Sign In
                  </a>
                </div>
              ) : isOwner ? (
                // Owner view
                <div className="text-center">
                  <div className="mb-2 text-4xl">�</div>
                  <p className="mb-2 font-semibold text-gray-600">
                    Gig is {gigData?.status || 'ACTIVE'}
                  </p>
                  <p className="mb-4 text-sm text-gray-600">
                    This gig is actively accepting applications, current
                    application count is {gigData?.applicationCount || 0}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <a
                      href={`/gig/${gigId}/applications`}
                      className="btn-secondary flex-1"
                    >
                      View Applications
                    </a>
                    <a
                      href={`/gig/${gigId}/submissions`}
                      className="btn-secondary flex-1"
                    >
                      View Submissions
                    </a>
                  </div>
                  <div className="mt-3">
                    <button
                      className="btn-primary w-full"
                      disabled={gigData?.status === 'PRODUCT'}
                    >
                      {gigData?.status === 'PRODUCT'
                        ? 'Assignment not allowed for Product Gigs'
                        : 'Assign User'}
                    </button>
                  </div>
                </div>
              ) : gigData?.status === 'DRAFT' ? (
                // Draft status for non-owners
                <div className="text-center">
                  <div className="mb-2 text-4xl">📝</div>
                  <p className="mb-2 font-semibold text-gray-600">Draft Mode</p>
                  <p className="mb-4 text-sm text-gray-600">
                    This gig is not yet published and not accepting applications
                  </p>
                </div>
              ) : gigData?.status !== 'OPEN' &&
                gigData?.status !== 'ASSIGNED' ? (
                // Gig not accepting applications
                <div className="text-center">
                  <div className="mb-2 text-4xl">⚠️</div>
                  <p className="mb-2 font-semibold text-yellow-600">
                    Cannot Apply
                  </p>
                  <p className="mb-4 text-sm text-gray-600">
                    This gig is no longer active
                  </p>
                </div>
              ) : (
                // Can apply (default SSR state - client will enhance)
                <div className="text-center">
                  <div className="mb-2 text-4xl">�</div>
                  <p className="mb-2 font-semibold text-gray-600">
                    Ready to apply?
                  </p>
                  <p className="mb-4 text-sm text-gray-600">
                    This gig is actively accepting applications
                  </p>
                  <button className="btn-primary w-full" id="ssr-apply-btn">
                    Apply Now
                  </button>
                </div>
              )}

              {/* Owner management options */}
              {isOwner && (
                <div className="mt-4">
                  {(gigData?.status === 'OPEN' ||
                    gigData?.status === 'ASSIGNED') && (
                    <button className="btn-secondary mt-2 w-full">
                      Pause Gig
                    </button>
                  )}
                  {(gigData?.status === 'PAUSED' ||
                    gigData?.status === 'IN_REVIEW') && (
                    <button className="btn-secondary mt-2 w-full">
                      Reopen Gig
                    </button>
                  )}
                  <button className="btn-secondary mt-2 w-full">
                    Make Gig{' '}
                    {gigData?.status === 'PUBLIC' ? 'Private' : 'Public'}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats - SSR */}
            <div className="card-glass p-3">
              <h3 className="mb-4 text-lg font-semibold">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span>Budget</span>
                  </div>
                  <span className="font-medium">
                    ₹{gigData?.budgetMin?.toLocaleString() || '0'}
                    {gigData?.budgetMax &&
                    gigData.budgetMax !== gigData.budgetMin
                      ? `-${gigData.budgetMax.toLocaleString()}`
                      : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>Timeline</span>
                  </div>
                  <span className="font-medium">
                    {gigData?.duration || 'Flexible'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span>Applications</span>
                  </div>
                  <span className="font-medium">
                    {gigData?._count?.applications ||
                      gigData?.applicationCount ||
                      0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <span>Deadline</span>
                  </div>
                  <span className="text-sm font-medium">
                    {gigData?.deadline
                      ? new Date(gigData.deadline).toLocaleDateString()
                      : 'Open'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span>Location</span>
                  </div>
                  <span className="text-sm font-medium">
                    {gigData?.location || 'Remote'}
                  </span>
                </div>
              </div>
            </div>

            {/* Brand Info - SSR */}
            <div className="card-glass p-3">
              <h3 className="mb-4 text-lg font-semibold">About the Brand</h3>
              <div className="mb-4 flex items-center space-x-3">
                {gigData?.brand?.name && (
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-200">
                    <span className="font-medium text-gray-600">
                      {gigData.brand.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-semibold">
                    {gigData?.brand?.name || 'Brand Name'}
                  </div>
                  {gigData?.brand?.verified && (
                    <div className="text-sm text-blue-600">
                      ✓ Verified Brand
                    </div>
                  )}
                </div>
              </div>
              <a
                href={`/profile/${gigData?.brand?.name || 'brand'}`}
                className="btn-secondary w-full"
              >
                View Brand Profile
              </a>
            </div>

            {/* Similar Gigs - SSR */}
            <div className="card-glass p-3">
              <h3 className="mb-4 text-lg font-semibold">Similar Gigs</h3>
              <div className="space-y-3">
                <a
                  href="/marketplace"
                  className="block rounded border p-3 hover:bg-gray-50"
                >
                  <div className="text-sm font-medium">
                    Browse more {gigData?.category || 'similar'} gigs
                  </div>
                  <div className="text-xs text-gray-600">
                    Find similar opportunities
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Progressive Enhancement Container */}
        <div id="progressive-enhancement">{children}</div>
      </div>
    </div>
  );
};

// Utility function to generate static metadata for SSR
export const generateGigMetadata = (gigData: any): Metadata => {
  return {
    title: gigData?.title
      ? `${gigData.title} | 50Brains`
      : 'Gig Details | 50Brains',
    description:
      gigData?.description?.slice(0, 160) ||
      'Explore exciting opportunities and collaborate with top brands and influencers.',
    openGraph: {
      title: gigData?.title || 'Gig Details',
      description:
        gigData?.description?.slice(0, 160) ||
        'Explore exciting opportunities on 50Brains.',
      type: 'article',
    },
    keywords: [
      ...(gigData?.skillsRequired || []),
      ...(gigData?.tags || []),
      gigData?.category,
      gigData?.roleRequired,
      'freelance',
      'gig work',
      'influencer',
      '50brains',
    ].filter(Boolean),
  };
};

export default SSRGigWrapper;
