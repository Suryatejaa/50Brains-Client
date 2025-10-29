'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { useRouter } from 'next/navigation';
import { GigAPI } from '@/lib/gig-api';
import { Submission, SubmissionStatus } from '@/types/gig.types';

interface GigSubmissionsClientProps {
  gigId: string;
  initialSubmissions: any[];
}

export const GigSubmissionsClient: React.FC<GigSubmissionsClientProps> = ({
  gigId,
  initialSubmissions,
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();

  const [submissions, setSubmissions] = useState<Submission[]>(
    initialSubmissions as Submission[]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: SubmissionStatus.APPROVED,
    rating: 5,
    feedback: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userType = getUserTypeForRole(currentRole);

  // Progressive enhancement - load fresh data after SSR
  useEffect(() => {
    if (isAuthenticated && user) {
      loadFreshSubmissions();
    }
  }, [isAuthenticated, user, gigId]);

  const loadFreshSubmissions = async () => {
    try {
      setIsLoading(true);
      const data = await GigAPI.getGigSubmissions(gigId);
      setSubmissions(data);
    } catch (error) {
      console.error('Failed to load fresh submissions:', error);
      // Don't show error - SSR data is already displayed
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
        showToast('Work approved successfully!', 'success');
      } else if (reviewData.status === 'REJECTED') {
        await GigAPI.rejectSubmission(
          selectedSubmission.id,
          reviewData.feedback
        );
        showToast('Work rejected', 'success');
      } else if (reviewData.status === 'REVISION') {
        await GigAPI.requestRevision(
          selectedSubmission.id,
          reviewData.feedback
        );
        showToast('Revision requested', 'success');
      }

      // Reload submissions
      await loadFreshSubmissions();
      setShowReviewModal(false);
      setSelectedSubmission(null);
      setReviewData({
        status: SubmissionStatus.APPROVED,
        rating: 5,
        feedback: '',
      });

      // Update the specific submission card without full page reload
      const submissionCard = document.querySelector(
        `[data-submission-id="${selectedSubmission.id}"]`
      );
      if (submissionCard) {
        const statusSpan = submissionCard.querySelector(
          'span[class*="rounded-full"]'
        );
        if (statusSpan && reviewData.status) {
          statusSpan.textContent = `${getStatusIcon(reviewData.status)} ${reviewData.status}`;
          statusSpan.className = `rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(reviewData.status)}`;
        }
      }
    } catch (error) {
      console.error('Failed to review submission:', error);
      showToast('Failed to review submission', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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

  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded shadow-lg ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  return (
    <>
      {/* Enhanced Review Buttons - Progressive Enhancement */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('load', function() {
              setTimeout(function() {
                // Replace static review buttons with interactive ones
                const reviewButtons = document.querySelectorAll('.review-btn');
                reviewButtons.forEach((button, index) => {
                  const submissionCard = button.closest('[data-submission-id]');
                  const submissionId = submissionCard?.getAttribute('data-submission-id');
                  const status = submissionCard?.getAttribute('data-status');
                  
                  if (status === 'PENDING') {
                    button.onclick = function() {
                      // Trigger review modal
                      const event = new CustomEvent('openReviewModal', { 
                        detail: { submissionId } 
                      });
                      window.dispatchEvent(event);
                    };
                  } else {
                    button.style.display = 'none';
                  }
                });
              }, 150);
            });
          `,
        }}
      />

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

      {/* Event listeners for progressive enhancement */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('openReviewModal', function(event) {
              const submissionId = event.detail.submissionId;
              // Find the submission data and trigger modal
              const submissionData = ${JSON.stringify(initialSubmissions)}.find(s => s.id === submissionId);
              if (submissionData) {
                // Trigger React state update through DOM event
                const reactEvent = new CustomEvent('reactOpenModal', { 
                  detail: { submission: submissionData }
                });
                document.dispatchEvent(reactEvent);
              }
            });
          `,
        }}
      />

      {/* React event listener */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('reactOpenModal', function(event) {
              // This will be handled by the React component
            });
          `,
        }}
      />

      {/* Set up event listener effect */}
      {typeof window !== 'undefined' && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('reactOpenModal', function(event) {
                // Find and click the appropriate submission for React handling
                const submissions = document.querySelectorAll('[data-submission-id]');
                submissions.forEach(sub => {
                  if (sub.getAttribute('data-submission-id') === event.detail.submission.id) {
                    // Simulate a click to trigger React modal
                    sub.click();
                  }
                });
              });
            `,
          }}
        />
      )}
    </>
  );
};

// Add click handlers for submissions after component mounts
export const useSubmissionHandlers = (
  submissions: any[],
  setSelectedSubmission: (sub: any) => void,
  setShowReviewModal: (show: boolean) => void
) => {
  useEffect(() => {
    const handleSubmissionClick = (submissionId: string) => {
      const submission = submissions.find((s) => s.id === submissionId);
      if (submission && submission.status === 'PENDING') {
        setSelectedSubmission(submission);
        setShowReviewModal(true);
      }
    };

    // Set up click handlers for review buttons
    const reviewButtons = document.querySelectorAll('.review-btn');
    reviewButtons.forEach((button) => {
      const submissionCard = button.closest('[data-submission-id]');
      const submissionId = submissionCard?.getAttribute('data-submission-id');

      if (submissionId) {
        button.addEventListener('click', () =>
          handleSubmissionClick(submissionId)
        );
      }
    });

    return () => {
      // Cleanup event listeners
      reviewButtons.forEach((button) => {
        button.removeEventListener('click', () => {});
      });
    };
  }, [submissions, setSelectedSubmission, setShowReviewModal]);
};

export default GigSubmissionsClient;
