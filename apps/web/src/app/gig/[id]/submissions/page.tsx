'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { useParams, useRouter } from 'next/navigation';
import { GigAPI } from '@/lib/gig-api';
import { Submission, SubmissionStatus } from '@/types/gig.types';
import { toast } from 'react-hot-toast';
import { GigChat } from '@/components/chat/GigChat';

export default function GigSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: SubmissionStatus.APPROVED,
    rating: 5,
    feedback: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gigId = params.id as string;
  const userType = getUserTypeForRole(currentRole);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSubmissions();
    }
  }, [isAuthenticated, user, gigId]);

  const loadSubmissions = async () => {
    try {
      setIsLoading(true);
      const data = await GigAPI.getGigSubmissions(gigId);
      // console.log('Loaded submissions:', data);
      setSubmissions(data);
    } catch (error) {
      console.error('Failed to load submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedSubmission) return;

    try {
      setIsSubmitting(true);

      if (reviewData.status === 'APPROVED') {
        await GigAPI.approveSubmission(
          selectedSubmission.id,
          reviewData.rating,
          reviewData.feedback
        );
        toast.success('Work approved successfully!');
      } else if (reviewData.status === 'REJECTED') {
        await GigAPI.rejectSubmission(
          selectedSubmission.id,
          reviewData.feedback
        );
        toast.success('Work rejected');
      } else if (reviewData.status === 'REVISION') {
        await GigAPI.requestRevision(
          selectedSubmission.id,
          reviewData.feedback
        );
        toast.success('Revision requested');
      }

      // Reload submissions
      await loadSubmissions();
      setShowReviewModal(false);
      setSelectedSubmission(null);
      setReviewData({
        status: SubmissionStatus.APPROVED,
        rating: 5,
        feedback: '',
      });
      window.location.reload();
      //reload the page to reflect changes
    } catch (error) {
      console.error('Failed to review submission:', error);
      toast.error('Failed to review submission');
    } finally {
      setIsSubmitting(false);
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="mx-auto max-w-4xl">
          <div className="py-12 text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              Authentication Required
            </h1>
            <p className="text-gray-600">
              Please log in to view gig submissions.
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
          <button onClick={() => router.back()} className="btn-secondary mb-4">
            ← Back to Gig
          </button>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Gig Submissions
          </h1>
          <p className="text-gray-600">
            Review and manage submitted work for this gig
          </p>
        </div>

        {/* Submissions List */}
        <div className="overflow-hidden rounded-lg bg-none shadow-none">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              <p className="text-gray-600">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mb-4 text-4xl">📝</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No Submissions Yet
              </h3>
              <p className="text-gray-600">
                Work submissions will appear here once creators submit their
                completed work.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="rounded-lg border border-gray-200 bg-white p-2 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex flex-col items-start justify-start sm:gap-4 md:flex-row">
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

                      {submission.description && (
                        <p className="mb-3 text-gray-600">
                          {submission.description}
                        </p>
                      )}

                      <div className="mb-3">
                        <h4 className="mb-2 text-sm font-medium text-gray-900">
                          Deliverables:
                        </h4>
                        <div className="space-y-2">
                          {submission.deliverables.map((deliverable, index) => {
                            // Parse JSON string if it's a string
                            let item: any;
                            if (typeof deliverable === 'string') {
                              try {
                                item = JSON.parse(deliverable);
                              } catch (e) {
                                // If parsing fails, treat as plain string
                                return (
                                  <div
                                    key={index}
                                    className="rounded-lg border border-blue-200 bg-blue-50 p-3"
                                  >
                                    <span className="text-sm text-blue-800">
                                      {deliverable}
                                    </span>
                                  </div>
                                );
                              }
                            } else {
                              item = deliverable;
                            }

                            return (
                              <div
                                key={index}
                                className="rounded-lg border border-blue-200 bg-blue-50 p-3"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    {item.type && (
                                      <span className="mb-2 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                        {item.type
                                          .replace('_', ' ')
                                          .toUpperCase()}
                                      </span>
                                    )}
                                    {item.platform && (
                                      <span className="mb-2 ml-2 inline-block rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                                        {item.platform.charAt(0).toUpperCase() +
                                          item.platform.slice(1)}
                                      </span>
                                    )}
                                    {item.description && (
                                      <p className="mb-2 text-sm text-gray-700">
                                        {item.description}
                                      </p>
                                    )}
                                    {item.url && (
                                      <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="break-all text-sm text-blue-600 underline hover:text-blue-800"
                                      >
                                        {item.url}
                                      </a>
                                    )}
                                    {item.name && (
                                      <p className="text-sm font-medium text-gray-700">
                                        {item.name}
                                      </p>
                                    )}
                                    {item.title && (
                                      <p className="text-sm font-medium text-gray-700">
                                        {item.title}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-1 text-sm font-medium text-gray-900">
                          UPI ID: {submission.upiId}
                        </h4>
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

                      <div className="flex items-center gap-4 text-sm text-gray-500">
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

                    <div className="mt-2 flex flex-shrink-0 flex-col gap-2 md:mt-0">
                      {submission.status === 'PENDING' && (
                        <button
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setShowReviewModal(true);
                          }}
                          className="btn-primary px-4 py-2 text-sm"
                        >
                          Review Work
                        </button>
                      )}

                      {/* Chat button for all submissions */}
                      <button
                        onClick={() => {
                          const applicationId =
                            submission.applicationId || submission.id;
                          const params = new URLSearchParams({
                            gigTitle: `Work Submission - ${submission.title}`,
                            applicantName: 'Creator',
                            brandName: 'Brand',
                          });
                          router.push(
                            `/chat/${applicationId}?${params.toString()}`
                          );
                        }}
                        className="btn-secondary px-4 py-2 text-sm"
                      >
                        💬 Chat with Creator
                      </button>

                      {/* <button
                        onClick={() => {
                          setSelectedSubmission(submission);
                        }}
                        className="btn-secondary px-4 py-2 text-sm"
                      >
                        View Details
                      </button> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Review Submission</h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <h3 className="mb-2 font-semibold">
                  {selectedSubmission.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedSubmission.description}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={reviewData.status}
                    onChange={(e) =>
                      setReviewData({
                        ...reviewData,
                        status: e.target.value as SubmissionStatus,
                      })
                    }
                    className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="APPROVED">Approve</option>
                    <option value="REJECTED">Reject</option>
                    <option value="REVISION">Request Revision</option>
                  </select>
                </div>

                {reviewData.status === 'APPROVED' && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Rating (1-5 stars)
                    </label>
                    <select
                      value={reviewData.rating}
                      onChange={(e) =>
                        setReviewData({
                          ...reviewData,
                          rating: parseInt(e.target.value),
                        })
                      }
                      className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <option key={rating} value={rating}>
                          {rating} {rating === 1 ? 'star' : 'stars'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Feedback
                  </label>
                  <textarea
                    value={reviewData.feedback}
                    onChange={(e) =>
                      setReviewData({ ...reviewData, feedback: e.target.value })
                    }
                    rows={4}
                    required
                    className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide feedback on the submitted work..."
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="btn-secondary flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReview}
                  className="btn-primary flex-1"
                  disabled={
                    isSubmitting ||
                    (reviewData.status === 'REJECTED' &&
                      !reviewData.feedback.trim())
                  }
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
