'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { GigAPI } from '@/lib/gig-api';
import { useRouter } from 'next/navigation';
import {
  Submission,
  SubmissionStatus,
  EnhancedDeliverable,
} from '@/types/gig.types';

// Extended submission interface for API response
interface SubmissionResponse extends Omit<Submission, 'deliverables'> {
  deliverables: EnhancedDeliverable[];
}
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function MySubmissionsPage() {
  const { user, isAuthenticated } = useAuth();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<SubmissionResponse[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | 'ALL'>(
    'ALL'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubmissions, setTotalSubmissions] = useState(0);

  const userType = getUserTypeForRole(currentRole);
  const itemsPerPage = 20;
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSubmissions();
    }
  }, [isAuthenticated, user]);

  // Handle filtering and pagination when filter or page changes
  useEffect(() => {
    if (allSubmissions.length > 0) {
      // Apply client-side filtering
      const filteredSubmissions =
        filterStatus === 'ALL'
          ? allSubmissions
          : allSubmissions.filter((sub) => sub.status === filterStatus);

      // Apply pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const paginatedSubmissions = filteredSubmissions.slice(
        startIndex,
        startIndex + itemsPerPage
      );

      setSubmissions(paginatedSubmissions);
      setTotalSubmissions(filteredSubmissions.length);
      setTotalPages(Math.ceil(filteredSubmissions.length / itemsPerPage));
    }
  }, [allSubmissions, filterStatus, currentPage]);

  const loadSubmissions = async () => {
    try {
      setIsLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (filterStatus !== 'ALL') {
        params.append('status', filterStatus);
      }

      const response = await apiClient.get('/api/my/submissions');
      console.log('Submissions:', response);

      if (response.success && response.data && Array.isArray(response.data)) {
        // Parse deliverables JSON strings and process submissions
        const processedSubmissions = (response.data as any[]).map(
          (submission: any) => ({
            ...submission,
            deliverables: submission.deliverables.map((deliverable: string) => {
              try {
                return JSON.parse(deliverable);
              } catch (error) {
                console.error('Failed to parse deliverable:', deliverable);
                return { type: 'other', description: deliverable };
              }
            }),
          })
        );

        setAllSubmissions(processedSubmissions);

        // Apply client-side filtering
        const filteredSubmissions =
          filterStatus === 'ALL'
            ? processedSubmissions
            : processedSubmissions.filter(
                (sub: any) => sub.status === filterStatus
              );

        // Apply pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedSubmissions = filteredSubmissions.slice(
          startIndex,
          startIndex + itemsPerPage
        );

        setSubmissions(paginatedSubmissions);
        setTotalSubmissions(filteredSubmissions.length);
        setTotalPages(Math.ceil(filteredSubmissions.length / itemsPerPage));
      }
    } catch (error) {
      console.error('Failed to load submissions:', error);
      toast.error('Failed to load submissions');
      setSubmissions([]);
      setAllSubmissions([]);
      setTotalSubmissions(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: SubmissionStatus) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'APPROVED':
        return 'text-green-600 bg-green-100';
      case 'REJECTED':
        return 'text-red-600 bg-red-100';
      case 'REVISION':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: SubmissionStatus) => {
    switch (status) {
      case 'PENDING':
        return '⏳';
      case 'APPROVED':
        return '✅';
      case 'REJECTED':
        return '❌';
      case 'REVISION':
        return '🔄';
      default:
        return '❓';
    }
  };

  const handleStatusFilter = (status: SubmissionStatus | 'ALL') => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2">
        <div className="mx-auto max-w-4xl">
          <div className="py-12 text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              Authentication Required
            </h1>
            <p className="text-gray-600">
              Please log in to view your submissions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-1">
            <Link href="/dashboard" className="btn-secondary">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              My Work Submissions
            </h1>
          </div>
          <p className="text-gray-600">
            Track all your submitted work and their review status
          </p>
        </div>

        {/* Stats */}
        <div className="mb-2 grid grid-cols-1 gap-1 md:grid-cols-4">
          <div className="rounded-sm bg-white p-2 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {allSubmissions.length}
            </div>
            <div className="text-sm text-gray-600">Total Submissions</div>
          </div>
          <div className="rounded-sm bg-white p-2 shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">
              {allSubmissions.filter((s) => s.status === 'PENDING').length}
            </div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="rounded-sm bg-white p-2 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {allSubmissions.filter((s) => s.status === 'APPROVED').length}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="rounded-sm bg-white p-2 shadow-sm">
            <div className="text-2xl font-bold text-red-600">
              {allSubmissions.filter((s) => s.status === 'REJECTED').length}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-2 rounded-sm bg-white p-2 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusFilter('ALL')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                filterStatus === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({allSubmissions.length})
            </button>
            <button
              onClick={() => handleStatusFilter(SubmissionStatus.PENDING)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                filterStatus === SubmissionStatus.PENDING
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending (
              {
                allSubmissions.filter(
                  (s) => s.status === SubmissionStatus.PENDING
                ).length
              }
              )
            </button>
            <button
              onClick={() => handleStatusFilter(SubmissionStatus.APPROVED)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                filterStatus === SubmissionStatus.APPROVED
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved (
              {
                allSubmissions.filter(
                  (s) => s.status === SubmissionStatus.APPROVED
                ).length
              }
              )
            </button>
            <button
              onClick={() => handleStatusFilter(SubmissionStatus.REJECTED)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                filterStatus === SubmissionStatus.REJECTED
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected (
              {
                allSubmissions.filter(
                  (s) => s.status === SubmissionStatus.REJECTED
                ).length
              }
              )
            </button>
            <button
              onClick={() => handleStatusFilter(SubmissionStatus.REVISION)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                filterStatus === SubmissionStatus.REVISION
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Revision (
              {
                allSubmissions.filter(
                  (s) => s.status === SubmissionStatus.REVISION
                ).length
              }
              )
            </button>
          </div>
        </div>

        {/* Submissions List */}
        <div className="overflow-hidden rounded-sm space-y-2 gap-2 bg-white shadow-lg">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              <p className="text-gray-600">Loading your submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mb-4 text-4xl">📝</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No Submissions Yet
              </h3>
              <p className="mb-4 text-gray-600">
                {filterStatus === 'ALL'
                  ? "You haven't submitted any work yet. Start by applying to gigs and submitting completed work."
                  : `No ${filterStatus.toLowerCase()} submissions found.`}
              </p>
              {filterStatus === 'ALL' && (
                <Link href="/marketplace" className="btn-primary">
                  Browse Available Gigs
                </Link>
              )}
            </div>
          ) : (
            <div className='space-y-2 gap-2 mb-2'>
            <div className="divide-y mb-2 divide-gray-200">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="p-2 transition-colors hover:bg-gray-50"
                >
                  <div
                    className="flex items-start justify-between"
                    onClick={() => router.push(`/gig/${submission.gigId}`)}
                  >
                    <div className="flex-1">
                      <div className="mb-3 flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {submission.title}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(submission.status)}`}
                        >
                          {getStatusIcon(submission.status)} {submission.status}
                        </span>
                      </div>

                      {submission.gig && (
                        <div className="mb-3">
                          <h4 className="mb-1 text-sm font-medium text-gray-900">
                            Gig:
                          </h4>
                          <Link
                            href={`/gig/${submission.gig.id}`}
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            {submission.gig.title}
                          </Link>
                        </div>
                      )}

                      {submission.description && (
                        <p className="mb-3 text-gray-600">
                          {submission.description}
                        </p>
                      )}

                      <div className="mb-3">
                        <h4 className="mb-2 text-sm font-medium text-gray-900">
                          Deliverables:
                        </h4>
                        <div className="flex flex-col gap-2">
                          {submission.deliverables.map((deliverable, index) => (
                            <div
                              key={index}
                              className="rounded border bg-gray-50 p-2"
                            >
                              <div className="mb-1 flex items-center gap-2">
                                <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                  {deliverable.type
                                    ?.replace('_', ' ')
                                    .toUpperCase() || 'OTHER'}
                                </span>
                                {deliverable.platform && (
                                  <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                                    {deliverable.platform.toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <p className="mb-1 text-sm text-gray-700">
                                {deliverable.description}
                              </p>
                              {deliverable.url && (
                                <a
                                  href={deliverable.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 underline hover:text-blue-800"
                                >
                                  View Deliverable →
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {submission.notes && (
                        <div className="mb-3">
                          <h4 className="mb-1 text-sm font-medium text-gray-900">
                            Notes:
                          </h4>
                          <p className="text-sm text-gray-600">
                            {submission.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>
                          Submitted:{' '}
                          {new Date(
                            submission.submittedAt
                          ).toLocaleDateString()}
                        </span>
                        {submission.reviewedAt && (
                          <span>
                            Reviewed:{' '}
                            {new Date(
                              submission.reviewedAt
                            ).toLocaleDateString()}
                          </span>
                        )}
                        {submission.rating && (
                          <span className="flex items-center gap-1">
                            Rating: {submission.rating}/5 ⭐
                          </span>
                        )}
                      </div>

                      {submission.feedback && (
                        <div className="mt-3 rounded bg-gray-50 p-3">
                          <h4 className="mb-1 text-sm font-medium text-gray-900">
                            Feedback:
                          </h4>
                          <p className="text-sm text-gray-600">
                            {submission.feedback}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      {submission.status === 'REVISION' && (
                        <button className="btn-primary px-4 py-2 text-sm">
                          Submit Revision
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-md border px-3 py-2 ${
                      currentPage === page
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded-md border border-gray-300 px-3 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
