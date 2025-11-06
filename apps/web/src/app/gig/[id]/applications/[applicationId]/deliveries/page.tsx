'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { apiClient } from '@/lib/api-client';

interface Delivery {
  id: string;
  title: string;
  description: string;
  files: string[];
  fileNames: string[];
  fileSizes: number[];
  mimeTypes: string[];
  fileDetails: Array<{
    url: string;
    name: string;
    size: number;
    mimeType: string;
    formattedSize: string;
  }>;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  feedback?: string;
  reviewNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  version: number;
  applicationId: string;
  submittedById: string;
  submittedByType: string;
  expiresAt: string;
}

interface Application {
  id: string;
  gigId: string;
  applicantId: string;
  status: string;
  proposal: string;
  quotedPrice: number;
  estimatedTime: string;
  applicantType: 'user' | 'clan' | 'owner';
  portfolio: string[];
  appliedAt: string;
  applicant?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  };
}

interface Gig {
  id: string;
  title: string;
  description: string;
  status: string;
  budgetMin: number;
  budgetMax: number;
  budgetType: string;
  category: string;
  deadline?: string;
  maxApplications?: number;
  brand: {
    id: string;
    name: string;
    logo?: string;
    verified: boolean;
  };
  applicationCount: number;
}

interface Toast {
  type: 'success' | 'error' | 'warning';
  message: string;
}

export default function ApplicationDeliveriesPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();
  const userType = getUserTypeForRole(currentRole);

  const [gig, setGig] = useState<Gig | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingDeliveryId, setReviewingDeliveryId] = useState<string | null>(
    null
  );
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(
    null
  );
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const gigId = params.id as string;
  const applicationId = params.applicationId as string;

  // Show toast notification
  const showToast = (
    type: 'success' | 'error' | 'warning',
    message: string
  ) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Check authorization
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (userType !== 'brand') {
      router.push('/');
      return;
    }
  }, [isAuthenticated, userType, router]);

  // Load data
  useEffect(() => {
    if (!isAuthenticated || userType !== 'brand') return;

    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load gig data
        const gigResponse = await apiClient.get(`/api/gig/${gigId}`);
        if (gigResponse.success) {
          setGig(gigResponse.data as Gig);
        }

        // Load application data
        const appResponse = await apiClient.get(
          `/api/gig/${gigId}/applications/${applicationId}`
        );
        if (appResponse.success) {
          setApplication(appResponse.data as Application);
        }

        // Load deliveries data
        const deliveriesResponse = await apiClient.get(
          `/api/gig/applications/${applicationId}/deliveries`
        );
        console.log('Deliveries response:', deliveriesResponse);
        if (
          deliveriesResponse.success &&
          (deliveriesResponse.data as any)?.deliveries
        ) {
          setDeliveries((deliveriesResponse.data as any).deliveries);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        showToast('error', 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, userType, gigId, applicationId]);

  // Handle review submission
  const handleReviewSubmit = async () => {
    if (!reviewingDeliveryId || !reviewAction) return;

    try {
      const requestBody: any = {
        status: reviewAction === 'approve' ? 'APPROVED' : 'REJECTED',
        feedback: reviewFeedback,
      };

      // Add selectedDeliveryId when approving
      if (reviewAction === 'approve') {
        requestBody.selectedDeliveryId = reviewingDeliveryId;
      }

      const response = await apiClient.post(
        `/api/gig/deliveries/${reviewingDeliveryId}/review`,
        requestBody
      );

      if (response.success) {
        showToast('success', `Delivery ${reviewAction}d successfully`);

        // Update the delivery status in local state
        setDeliveries((prev) =>
          prev.map((delivery) =>
            delivery.id === reviewingDeliveryId
              ? {
                  ...delivery,
                  status: reviewAction === 'approve' ? 'APPROVED' : 'REJECTED',
                  feedback: reviewFeedback,
                  reviewedAt: new Date().toISOString(),
                }
              : delivery
          )
        );

        // Close modal
        setShowReviewModal(false);
        setReviewingDeliveryId(null);
        setReviewAction(null);
        setReviewFeedback('');
      } else {
        showToast('error', 'Failed to submit review');
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      showToast('error', 'Failed to submit review');
    }
  };

  // Open review modal
  const openReviewModal = (
    deliveryId: string,
    action: 'approve' | 'reject'
  ) => {
    setReviewingDeliveryId(deliveryId);
    setReviewAction(action);
    setShowReviewModal(true);
  };

  if (!isAuthenticated || userType !== 'brand') {
    return <div>Redirecting...</div>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 rounded-md p-4 ${
            toast.type === 'success'
              ? 'bg-green-500'
              : toast.type === 'error'
                ? 'bg-red-500'
                : 'bg-yellow-500'
          } text-white`}
        >
          {toast.message}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-2 py-2 sm:px-2 lg:px-2">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg
              className="mr-2 h-5 w-5"
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
            Back
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            Application Deliveries
          </h1>

          {gig && application && (
            <div className="mt-4 rounded-lg bg-white p-4 shadow sm:p-6">
              <h2 className="mb-3 text-lg font-semibold leading-tight text-gray-900 sm:mb-2 sm:text-xl">
                {gig.title}
              </h2>
              <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 sm:grid-cols-2 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="mb-1 font-medium sm:mb-0 sm:mr-2">
                    Applicant:
                  </span>
                  <span className="text-gray-900">
                    {application.applicant?.firstName}{' '}
                    {application.applicant?.lastName}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="mb-1 font-medium sm:mb-0 sm:mr-2">
                    Status:
                  </span>
                  <span
                    className={`inline-block w-fit rounded px-2 py-1 text-xs ${
                      application.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : application.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {application.status}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="mb-1 font-medium sm:mb-0 sm:mr-2">
                    Quoted Price:
                  </span>
                  <span className="font-semibold text-gray-900">
                    ₹{application.quotedPrice}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="mb-1 font-medium sm:mb-0 sm:mr-2">
                    Estimated Time:
                  </span>
                  <span className="text-gray-900">
                    {application.estimatedTime}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Deliveries List */}
        <div className="space-y-2">
          {deliveries.length === 0 ? (
            <div className="rounded-lg bg-white py-2 text-center shadow">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No deliveries yet
              </h3>
              <p className="mt-1 text-gray-500">
                The applicant hasn't submitted any deliveries for this gig.
              </p>
            </div>
          ) : (
            deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="rounded-lg bg-white p-4 shadow-md sm:p-6"
              >
                {/* Delivery Header */}
                <div className="mb-4 flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold leading-tight text-gray-900 sm:text-lg">
                      {delivery.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Version {delivery.version}
                    </p>
                  </div>
                  <div className="flex flex-row items-start justify-between sm:flex-col sm:items-end sm:justify-start">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium sm:px-3 sm:text-sm ${
                        delivery.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : delivery.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {delivery.status}
                    </span>
                    <p className="text-xs text-gray-500 sm:mt-2">
                      {new Date(delivery.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <p className="text-gray-700">{delivery.description}</p>
                  {delivery.notes && (
                    <div className="mt-2 rounded bg-gray-50 p-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Notes:</span>{' '}
                        {delivery.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Files */}
                {delivery.fileDetails && delivery.fileDetails.length > 0 && (
                  <div className="mb-4">
                    <h4 className="mb-3 text-sm font-medium text-gray-900">
                      Files ({delivery.fileDetails.length}):
                    </h4>
                    <div className="space-y-3">
                      {delivery.fileDetails.map((file, index) => (
                        <div key={index} className="rounded-lg border p-3">
                          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div className="flex min-w-0 flex-1 items-center space-x-3">
                              {file.mimeType.startsWith('video/') && (
                                <svg
                                  className="h-5 w-5 flex-shrink-0 text-purple-500 sm:h-6 sm:w-6"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM8 9a1 1 0 100 2 1 1 0 000-2z" />
                                </svg>
                              )}
                              {file.mimeType.startsWith('image/') && (
                                <svg
                                  className="h-5 w-5 flex-shrink-0 text-green-500 sm:h-6 sm:w-6"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {file.formattedSize} • {file.mimeType}
                                </p>
                              </div>
                            </div>
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 self-start text-xs font-medium text-blue-600 hover:text-blue-800 sm:self-auto sm:text-sm"
                            >
                              Open in new tab
                            </a>
                          </div>

                          {/* Preview for videos and images */}
                          {file.mimeType.startsWith('video/') && (
                            <div className="mt-3">
                              <video
                                controls
                                className="max-h-48 w-full rounded sm:max-h-64"
                                src={file.url}
                                playsInline
                              >
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          )}

                          {file.mimeType.startsWith('image/') && (
                            <div className="mt-3">
                              <img
                                src={file.url}
                                alt={file.name}
                                className="max-h-48 max-w-full rounded sm:max-h-64"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Previous Feedback */}
                {delivery.feedback && (
                  <div className="mb-4 rounded bg-gray-50 p-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Previous Feedback:</span>{' '}
                      {delivery.feedback}
                    </p>
                    {delivery.reviewedAt && (
                      <p className="mt-1 text-xs text-gray-500">
                        Reviewed:{' '}
                        {new Date(delivery.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                {delivery.status === 'PENDING' && (
                  <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-3 sm:space-y-0">
                    <button
                      onClick={() => openReviewModal(delivery.id, 'approve')}
                      className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => openReviewModal(delivery.id, 'reject')}
                      className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600 bg-opacity-50 p-4">
          <div className="relative top-4 mx-auto w-full max-w-md rounded-md border bg-white p-4 shadow-lg sm:top-20 sm:p-5">
            <h3 className="mb-4 text-base font-bold text-gray-900 sm:text-lg">
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Delivery
            </h3>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Feedback (Required)
              </label>
              <textarea
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                placeholder={`Provide feedback for ${reviewAction === 'approve' ? 'approval' : 'rejection'}...`}
                className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
              />
            </div>

            <div className="flex flex-col-reverse space-y-2 space-y-reverse sm:flex-row sm:justify-end sm:space-x-3 sm:space-y-0">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewingDeliveryId(null);
                  setReviewAction(null);
                  setReviewFeedback('');
                }}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={!reviewFeedback.trim()}
                className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white sm:w-auto ${
                  reviewAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:cursor-not-allowed disabled:bg-gray-400`}
              >
                {reviewAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
