import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GigApplicationsClient } from './GigApplicationsClient';
import { RefreshCcw, ArrowLeft } from 'lucide-react';

// Real SSR data fetching from backend API
async function getGigApplicationsData(gigId: string) {
  try {
    // Create API client for server-side use
    const { createAPIClient } = await import('@50brains/api-client');
    const apiClient = createAPIClient({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
      timeout: 10000,
    });

    // Fetch both gig data and applications in parallel
    const [gigResponse, applicationsResponse] = await Promise.allSettled([
      apiClient.gigs.getGigById(gigId),
      apiClient.get(`/api/gig/${gigId}/applications`),
    ]);

    // Handle gig data
    let gig = null;
    if (gigResponse.status === 'fulfilled') {
      gig = gigResponse.value;
    } else {
      console.error('Failed to fetch gig data:', gigResponse.reason);
      return null; // This will trigger 404
    }

    // Handle applications data
    let applications: any[] = [];
    if (applicationsResponse.status === 'fulfilled') {
      const appData = applicationsResponse.value.data as any;
      applications = Array.isArray(appData)
        ? appData
        : appData?.applications || [];
    } else {
      console.error(
        'Failed to fetch applications:',
        applicationsResponse.reason
      );
      // Continue with empty applications - gig exists but no applications yet
    }

    return {
      gig,
      applications,
    };
  } catch (error) {
    console.error('Failed to fetch applications data:', error);
    return null;
  }
}

// Check user authorization - real implementation
async function checkUserAuthorization(gigId: string) {
  try {
    // Get current user and check if they own this gig
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    const accessToken = cookieStore.get('access_token');
    if (!accessToken) {
      return { authorized: false, userRole: null };
    }

    const { createAPIClient } = await import('@50brains/api-client');
    const apiClient = createAPIClient({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
      timeout: 10000,
    });

    try {
      // Get both user and gig data to verify ownership
      const [user, gig] = await Promise.all([
        apiClient.auth.getCurrentUser(),
        apiClient.gigs.getGigById(gigId),
      ]);

      // Check if user owns this gig (brand role and is the poster)
      const isOwner =
        user.id === (gig as any).postedById ||
        user.id === (gig as any).posterId ||
        user.id === (gig as any).brand?.id;

      const hasAccess =
        isOwner &&
        (user.roles?.includes('BRAND' as any) ||
          user.roles?.includes('CREW' as any));

      return {
        authorized: hasAccess,
        userRole: user.roles?.includes('BRAND' as any) ? 'brand' : 'crew',
      };
    } catch (error) {
      console.error('Failed to verify authorization:', error);
      return { authorized: false, userRole: null };
    }
  } catch (error) {
    console.error('Failed to check authorization:', error);
    return { authorized: false, userRole: null };
  }
}

interface PageProps {
  params: {
    id: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getGigApplicationsData(id);

  if (!data?.gig) {
    return {
      title: 'Applications Not Found | 50Brains',
      description: 'The requested gig applications could not be found.',
    };
  }

  return {
    title: `Applications for ${data.gig.title} | 50Brains`,
    description: `Manage applications for your gig: ${data.gig.title}`,
    robots: 'noindex', // Private page for gig owners only
  };
}

// Main SSR Page Component
export default async function GigApplicationsPageSSR({ params }: PageProps) {
  const { id: gigId } = await params;

  // Check authorization first
  const auth = await checkUserAuthorization(gigId);

  if (!auth.authorized) {
    notFound();
  }

  // Fetch data server-side
  const data = await getGigApplicationsData(gigId);

  if (!data) {
    notFound();
  }

  const { gig, applications } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-1">
      <div className="mx-auto max-w-7xl px-2 sm:px-2 lg:px-2">
        {/* SSR Header - Instantly Rendered */}
        <div className="mb-2">
          <div className="items-left flex flex-col justify-between gap-1 md:flex-row lg:flex-row">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gig Applications
              </h1>
              <p className="text-gray-600">Manage applications for your gig</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="btn-secondary px-2 py-2" title="Refresh">
                <RefreshCcw className="h-4 w-4" />
              </button>
              <a
                href="/my-gigs"
                className="btn-secondary flex items-center space-x-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to My Gigs</span>
              </a>
              <a href={`/gig/${gigId}`} className="btn-secondary">
                View Gig Details
              </a>
            </div>
          </div>
        </div>

        {/* SSR Gig Info Card */}
        <div className="card-glass mb-2 p-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="mb-2 text-xl font-semibold">{gig.title}</h2>
              <span
                className={`w-fit rounded px-2 py-0 text-sm font-medium ${
                  gig.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : gig.status === 'PAUSED'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {gig.status}
              </span>
              <p className="mb-2 line-clamp-2 text-gray-600">
                {gig.description}
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Category: {gig.category}</span>
                <span>
                  Budget: ₹{gig.budgetMin?.toLocaleString()} - ₹
                  {gig.budgetMax?.toLocaleString()}
                </span>
                <span>Applications: {gig.applicationCount}</span>
                {gig.deadline && (
                  <span>
                    Deadline: {new Date(gig.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SSR Filters and Stats */}
        <div className="card-glass mb-2 p-2">
          <div className="items-left flex flex-col justify-between gap-1 md:flex-row lg:flex-row">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold">
                Applications ({applications.length})
              </h3>
              <select className="rounded border border-gray-300 py-0 pl-1 pr-8 focus:border-transparent focus:ring-2 focus:ring-blue-500">
                <option value="ALL">All Applications</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <span className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded bg-yellow-100"></div>
                <span>
                  Pending:{' '}
                  {applications.filter((a) => a.status === 'PENDING').length}
                </span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded bg-green-100"></div>
                <span>
                  Approved:{' '}
                  {applications.filter((a) => a.status === 'APPROVED').length}
                </span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded bg-red-100"></div>
                <span>
                  Rejected:{' '}
                  {applications.filter((a) => a.status === 'REJECTED').length}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* SSR Applications List */}
        <div className="space-y-2">
          {applications.map((application) => (
            <div key={application.id} className="card-glass p-2">
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-200">
                    <span className="font-medium text-gray-500">
                      {application.applicantId.slice(-2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      Applicant {application.applicantId.slice(-8)}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Type: {application.applicantType}</span>
                      {application.estimatedTime && (
                        <span>Timeline: {application.estimatedTime}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`rounded px-2 py-1 text-sm font-medium ${
                      application.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : application.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : application.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {application.status}
                  </span>
                  <p className="mt-1 text-sm text-gray-500">
                    Applied{' '}
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Application Details - SSR */}
              <div className="mb-2 grid grid-cols-1 gap-2 lg:grid-cols-2">
                <div>
                  <h6>
                    <b>UPI ID:</b> {application.upiId}
                  </h6>
                  <h4 className="mb-2 font-semibold">Proposal</h4>
                  <p className="whitespace-pre-wrap rounded bg-gray-50 p-2 text-gray-700">
                    {application.proposal}
                  </p>
                </div>
                <div className="space-y-2">
                  <div>
                    <h4 className="mb-2 font-semibold">Application Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quoted Price:</span>
                        <span className="font-medium">
                          ₹{application.quotedPrice?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimated Time:</span>
                        <span className="font-medium">
                          {application.estimatedTime}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Application Type:</span>
                        <span className="font-medium capitalize">
                          {application.applicantType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                        <span className="font-medium">
                          {application.address || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Portfolio - SSR */}
              {application.portfolio && application.portfolio.length > 0 && (
                <div className="mb-2">
                  <h4 className="mb-2 font-semibold">Portfolio</h4>
                  <div className="space-y-2">
                    {(application.portfolio as string[]).map(
                      (url: string, index: number) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-600 hover:underline"
                        >
                          Portfolio Item {index + 1}: {url}
                        </a>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons Placeholder */}
              {application.status === 'PENDING' && (
                <div className="flex items-center justify-end space-x-3">
                  <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-8 w-24 animate-pulse rounded bg-gray-200"></div>
                </div>
              )}

              {/* Status Display for Processed Applications */}
              {application.status !== 'PENDING' && (
                <div className="flex items-center justify-end space-x-3">
                  <div className="text-sm text-gray-600">
                    {application.status === 'APPROVED' &&
                      '✅ Application Approved'}
                    {application.status === 'REJECTED' &&
                      '❌ Application Rejected'}
                    {application.status === 'WITHDRAWN' &&
                      '↩️ Application Withdrawn'}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Empty State */}
          {applications.length === 0 && (
            <div className="card-glass p-2 text-center">
              <div className="mb-2 text-6xl">📨</div>
              <h3 className="mb-2 text-xl font-semibold">
                No Applications Yet
              </h3>
              <p className="mb-2 text-gray-600">
                No one has applied to this gig yet.
              </p>
              <a href="/marketplace" className="btn-primary inline-block">
                Promote Your Gig
              </a>
            </div>
          )}
        </div>

        {/* Progressive Enhancement Container */}
        <div id="client-enhancements" className="hidden">
          <GigApplicationsClient
            gigId={gigId}
            initialGigData={gig}
            initialApplications={applications}
          />
        </div>

        {/* Load client enhancements after SSR */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function() {
                setTimeout(function() {
                  const clientContainer = document.getElementById('client-enhancements');
                  if (clientContainer) {
                    clientContainer.classList.remove('hidden');
                  }
                }, 100);
              });
            `,
          }}
        />
      </div>
    </div>
  );
}

// Revalidate strategy
export const revalidate = 30; // Revalidate every 30 seconds
