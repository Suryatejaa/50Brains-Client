import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GigSubmissionsClient } from './GigSubmissionsClient';

// Submission data types
interface Submission {
  id: string;
  gigId: string;
  title: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION';
  submittedAt: string;
  reviewedAt?: string;
  rating?: number;
  feedback?: string;
  notes?: string;
  upiId?: string;
  deliverables: any[];
}

// Real SSR data fetching from backend API
async function getGigSubmissionsData(gigId: string) {
  try {
    // Create API client for server-side use
    const { createAPIClient } = await import('@50brains/api-client');
    const apiClient = createAPIClient({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
      timeout: 10000,
    });

    // Fetch both gig data and submissions in parallel
    const [gigResponse, submissionsResponse] = await Promise.allSettled([
      apiClient.gigs.getGigById(gigId),
      apiClient.get(`/api/gig/${gigId}/submissions`),
    ]);

    // Handle gig data
    let gig = null;
    if (gigResponse.status === 'fulfilled') {
      gig = gigResponse.value;
    } else {
      console.error('Failed to fetch gig data:', gigResponse.reason);
      return null; // This will trigger 404
    }

    // Handle submissions data
    let submissions: Submission[] = [];
    if (submissionsResponse.status === 'fulfilled') {
      const subData = submissionsResponse.value.data as any;
      submissions = Array.isArray(subData)
        ? subData
        : subData?.submissions || [];
    } else {
      console.error('Failed to fetch submissions:', submissionsResponse.reason);
      // Continue with empty submissions - gig exists but no submissions yet
    }

    return {
      gig,
      submissions,
    };
  } catch (error) {
    console.error('Failed to fetch submissions data:', error);
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
  const data = await getGigSubmissionsData(params.id);

  if (!data?.gig) {
    return {
      title: 'Submissions Not Found | 50Brains',
      description: 'The requested gig submissions could not be found.',
    };
  }

  return {
    title: `Submissions for ${(data.gig as any).title} | 50Brains`,
    description: `Review work submissions for your gig: ${(data.gig as any).title}`,
    robots: 'noindex', // Private page for gig owners only
  };
}

// Main SSR Page Component
export default async function GigSubmissionsPageSSR({ params }: PageProps) {
  const gigId = params.id;

  // Check authorization first
  const auth = await checkUserAuthorization(gigId);

  if (!auth.authorized) {
    notFound();
  }

  // Fetch data server-side
  const data = await getGigSubmissionsData(gigId);

  if (!data) {
    notFound();
  }

  const { gig, submissions } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-1">
      <div className="mx-auto max-w-7xl px-2 sm:px-2 lg:px-2">
        {/* SSR Header - Instantly Rendered */}
        <div className="mb-2">
          <div className="items-left flex flex-col justify-between gap-1 md:flex-row lg:flex-row">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Work Submissions
              </h1>
              <p className="text-gray-600">
                Review submitted work for your gig
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="btn-secondary px-2 py-2" title="Refresh">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <a
                href="/my-gigs"
                className="btn-secondary flex items-center space-x-1"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>My Gigs</span>
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
              <h2 className="mb-2 text-xl font-semibold">
                {(gig as any).title}
              </h2>
              <span
                className={`w-fit rounded px-2 py-0 text-sm font-medium ${
                  (gig as any).status === 'IN_PROGRESS'
                    ? 'bg-blue-100 text-blue-800'
                    : (gig as any).status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {(gig as any).status}
              </span>
              <p className="mb-2 line-clamp-2 text-gray-600">
                {(gig as any).description}
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>📝 {submissions.length} Submissions</span>
                <span>•</span>
                <span>
                  👀{' '}
                  {
                    submissions.filter((s: any) => s.status === 'PENDING')
                      .length
                  }{' '}
                  Pending Review
                </span>
                <span>•</span>
                <span>
                  ✅{' '}
                  {
                    submissions.filter((s: any) => s.status === 'APPROVED')
                      .length
                  }{' '}
                  Approved
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SSR Submissions List */}
        <div className="space-y-2">
          {submissions.map((submission) => (
            <div key={submission.id} className="card-glass p-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">
                      {submission.title}
                    </h3>
                    <span
                      className={`rounded px-2 py-1 text-sm font-medium ${
                        submission.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : submission.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : submission.status === 'REVISION'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {submission.status}
                    </span>
                  </div>

                  <p className="mt-2 text-gray-600">{submission.description}</p>

                  {submission.notes && (
                    <div className="mt-2 rounded bg-gray-50 p-2">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {submission.notes}
                      </p>
                    </div>
                  )}

                  {/* Deliverables */}
                  <div className="mt-3">
                    <h4 className="mb-2 font-medium text-gray-900">
                      Deliverables ({submission.deliverables.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {submission.deliverables.map(
                        (deliverable: any, index: number) => (
                          <div
                            key={index}
                            className="rounded border border-gray-200 bg-white p-2"
                          >
                            <div className="flex items-center space-x-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-100">
                                <span className="text-xs font-medium text-blue-800">
                                  {deliverable.type === 'video'
                                    ? '🎥'
                                    : deliverable.type === 'image'
                                      ? '🖼️'
                                      : deliverable.type === 'document'
                                        ? '📄'
                                        : '📎'}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">
                                  {deliverable.title || 'Deliverable'}
                                </p>
                                <p className="truncate text-xs text-gray-500">
                                  {deliverable.format || 'File'} •{' '}
                                  {deliverable.fileSize || 'Unknown size'}
                                </p>
                              </div>
                              <a
                                href={deliverable.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary px-2 py-1 text-xs"
                              >
                                View
                              </a>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Submission Metadata */}
                  <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                    <span>
                      📅 Submitted:{' '}
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </span>
                    {submission.reviewedAt && (
                      <span>
                        ✅ Reviewed:{' '}
                        {new Date(submission.reviewedAt).toLocaleDateString()}
                      </span>
                    )}
                    {submission.rating && (
                      <span>⭐ Rating: {submission.rating}/5</span>
                    )}
                  </div>

                  {/* Feedback */}
                  {submission.feedback && (
                    <div className="mt-3 rounded border border-gray-200 bg-gray-50 p-2">
                      <p className="text-sm text-gray-700">
                        <strong>Feedback:</strong> {submission.feedback}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="ml-4 flex flex-col space-y-2">
                  {submission.status === 'PENDING' && (
                    <>
                      <button className="btn-primary px-3 py-1 text-sm">
                        Approve
                      </button>
                      <button className="btn-secondary px-3 py-1 text-sm">
                        Request Revision
                      </button>
                      <button className="btn-danger px-3 py-1 text-sm">
                        Reject
                      </button>
                    </>
                  )}
                  {submission.status === 'APPROVED' && (
                    <button className="btn-secondary px-3 py-1 text-sm">
                      Download All
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {submissions.length === 0 && (
            <div className="card-glass p-8 text-center">
              <div className="mb-4 text-6xl">📝</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No Submissions Yet
              </h3>
              <p className="mb-4 text-gray-600">
                Work submissions will appear here once your assigned team
                members start delivering.
              </p>
              <div className="space-x-2">
                <a href={`/gig/${gigId}`} className="btn-primary">
                  View Gig Details
                </a>
                <a
                  href={`/gig/${gigId}/applications`}
                  className="btn-secondary"
                >
                  Manage Applications
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Progressive Enhancement Container */}
        <div id="client-enhancements" className="hidden">
          <GigSubmissionsClient
            gigId={gigId}
            initialSubmissions={submissions}
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
