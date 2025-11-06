'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

interface Delivery {
  id: string;
  title: string;
  description: string;
  files: Array<{
    id: string;
    filename: string;
    url: string;
    size: number;
  }>;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  feedback?: string;
  reviewNotes?: string;
  createdAt: string;
  reviewedAt?: string;
  version: number;
  applicationId: string;
}

interface Application {
  id: string;
  applicantName: string;
  applicantType: 'user' | 'clan';
  applicantId: string;
  status: string;
  createdAt: string;
  quotedPrice?: number;
  estimatedTime?: string;
  deliveries: Delivery[];
  applicant?: {
    id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    profilePicture?: string;
  };
  clan?: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
}

interface Gig {
  id: string;
  title: string;
  description: string;
  status: string;
  brand?: {
    id: string;
    name: string;
    logo?: string;
  };
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  currentRole?: string;
}

interface Props {
  gigId: string;
  initialGig: Gig;
  initialApplications: Application[];
  user: User;
}

export default function GigDeliveriesClient({
  gigId,
  initialGig,
  initialApplications,
  user,
}: Props) {
  const router = useRouter();
  const [applications, setApplications] =
    useState<Application[]>(initialApplications);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null
  );
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    status: 'APPROVED' as 'APPROVED' | 'REJECTED',
    feedback: '',
    notes: '',
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  // Show toast notification
  const showToast = (
    type: 'success' | 'error' | 'warning',
    message: string
  ) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Load applications with deliveries
  const loadApplicationsWithDeliveries = async () => {
    try {
      const response = await apiClient.get(
        `/api/gig/${gigId}/applications-with-deliveries`
      );
      if (response.success && response.data) {
        setApplications(response.data as Application[]);
      }
    } catch (error) {
      console.error('Failed to load applications with deliveries:', error);
      showToast('error', 'Failed to load deliveries');
    }
  };

  // Handle delivery review
  const handleReviewDelivery = async () => {
    if (!selectedDelivery) return;

    try {
      setIsSubmittingReview(true);
      const response = await apiClient.post(
        `/api/deliveries/${selectedDelivery.id}/review`,
        {
          status: reviewForm.status,
          feedback: reviewForm.feedback.trim() || undefined,
          reviewNotes: reviewForm.notes.trim() || undefined,
        }
      );

      if (response.success) {
        showToast(
          'success',
          `Delivery ${reviewForm.status.toLowerCase()} successfully`
        );
        setReviewModalOpen(false);
        setSelectedDelivery(null);
        setReviewForm({ status: 'APPROVED', feedback: '', notes: '' });
        // Reload deliveries
        await loadApplicationsWithDeliveries();
      } else {
        showToast('error', response.message || 'Failed to review delivery');
      }
    } catch (error: any) {
      console.error('Error reviewing delivery:', error);
      showToast('error', error.message || 'Failed to review delivery');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Open review modal
  const openReviewModal = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setReviewForm({
      status: 'APPROVED',
      feedback: '',
      notes: '',
    });
    setReviewModalOpen(true);
  };

  return (
    <>
      {/* Navigation Button */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push(`/gig/${gigId}`)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <span>←</span>
              <span>Back to Gig</span>
            </button>
          </div>
        </div>
      </div>

      {/* Applications with Deliveries - Interactive Parts */}
      <div className="space-y-6">
        {applications.map((application) => (
          <div key={application.id} className="rounded-lg bg-white shadow">
            {/* Application Header - Static content rendered by server */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {application.applicant?.profilePicture ? (
                    <img
                      src={application.applicant.profilePicture}
                      alt={application.applicantName}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300">
                      <span className="text-lg font-medium text-gray-600">
                        {application.applicantName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.applicantName}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>
                        Applied:{' '}
                        {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                      {application.quotedPrice && (
                        <span>
                          Quote: ₹{application.quotedPrice.toLocaleString()}
                        </span>
                      )}
                      {application.estimatedTime && (
                        <span>Est. Time: {application.estimatedTime}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      application.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : application.status === 'DELIVERED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {application.status}
                  </span>
                  <div className="mt-1 text-sm text-gray-600">
                    {application.deliveries.length} delivery
                    {application.deliveries.length !== 1 ? 'ies' : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Deliveries with Interactive Buttons */}
            <div className="p-6">
              {application.deliveries.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  No deliveries submitted yet
                </div>
              ) : (
                <div className="space-y-4">
                  {application.deliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className={`rounded-lg border p-4 ${
                        delivery.status === 'PENDING'
                          ? 'border-orange-200 bg-orange-50'
                          : delivery.status === 'APPROVED'
                            ? 'border-green-200 bg-green-50'
                            : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center space-x-3">
                            <h4 className="font-semibold text-gray-900">
                              {delivery.title}
                            </h4>
                            <span
                              className={`rounded px-2 py-1 text-xs font-medium ${
                                delivery.status === 'PENDING'
                                  ? 'bg-orange-100 text-orange-800'
                                  : delivery.status === 'APPROVED'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {delivery.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              v{delivery.version}
                            </span>
                          </div>

                          <p className="mb-3 text-gray-700">
                            {delivery.description}
                          </p>

                          {delivery.notes && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700">
                                Notes:
                              </p>
                              <p className="text-sm text-gray-600">
                                {delivery.notes}
                              </p>
                            </div>
                          )}

                          {/* Files */}
                          {delivery.files.length > 0 && (
                            <div className="mb-3">
                              <p className="mb-2 text-sm font-medium text-gray-700">
                                Files:
                              </p>
                              <div className="space-y-1">
                                {delivery.files.map((file) => (
                                  <a
                                    key={file.id}
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
                                  >
                                    <span>📎</span>
                                    <span>{file.filename}</span>
                                    <span className="text-gray-500">
                                      ({(file.size / 1024 / 1024).toFixed(1)}{' '}
                                      MB)
                                    </span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Review Feedback */}
                          {delivery.feedback && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700">
                                Your Feedback:
                              </p>
                              <p className="text-sm text-gray-600">
                                {delivery.feedback}
                              </p>
                            </div>
                          )}

                          <div className="text-xs text-gray-500">
                            Submitted:{' '}
                            {new Date(delivery.createdAt).toLocaleString()}
                            {delivery.reviewedAt && (
                              <>
                                {' • '}
                                Reviewed:{' '}
                                {new Date(delivery.reviewedAt).toLocaleString()}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Interactive Action Button */}
                        <div className="ml-4">
                          {delivery.status === 'PENDING' ? (
                            <button
                              onClick={() => openReviewModal(delivery)}
                              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                              Review
                            </button>
                          ) : (
                            <button
                              onClick={() => openReviewModal(delivery)}
                              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                            >
                              View Review
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {selectedDelivery.status === 'PENDING'
                    ? 'Review Delivery'
                    : 'View Review'}
                </h2>
                <button
                  onClick={() => setReviewModalOpen(false)}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              {/* Delivery Details */}
              <div className="mb-6 rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 font-semibold">{selectedDelivery.title}</h3>
                <p className="mb-2 text-gray-700">
                  {selectedDelivery.description}
                </p>
                {selectedDelivery.notes && (
                  <div className="mb-2">
                    <span className="font-medium">Notes: </span>
                    <span className="text-gray-600">
                      {selectedDelivery.notes}
                    </span>
                  </div>
                )}
                {selectedDelivery.files.length > 0 && (
                  <div>
                    <p className="mb-1 font-medium">Files:</p>
                    <div className="space-y-1">
                      {selectedDelivery.files.map((file) => (
                        <a
                          key={file.id}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                        >
                          <span>📎</span>
                          <span>{file.filename}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Review Form */}
              {selectedDelivery.status === 'PENDING' ? (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Review Decision *
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="APPROVED"
                          checked={reviewForm.status === 'APPROVED'}
                          onChange={(e) =>
                            setReviewForm((prev) => ({
                              ...prev,
                              status: e.target.value as 'APPROVED' | 'REJECTED',
                            }))
                          }
                          className="mr-2"
                        />
                        <span className="text-green-700">Approve</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="REJECTED"
                          checked={reviewForm.status === 'REJECTED'}
                          onChange={(e) =>
                            setReviewForm((prev) => ({
                              ...prev,
                              status: e.target.value as 'APPROVED' | 'REJECTED',
                            }))
                          }
                          className="mr-2"
                        />
                        <span className="text-red-700">Request Changes</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Feedback for Creator
                    </label>
                    <textarea
                      value={reviewForm.feedback}
                      onChange={(e) =>
                        setReviewForm((prev) => ({
                          ...prev,
                          feedback: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      rows={3}
                      placeholder="Provide feedback to the creator..."
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Internal Notes (Optional)
                    </label>
                    <textarea
                      value={reviewForm.notes}
                      onChange={(e) =>
                        setReviewForm((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      rows={2}
                      placeholder="Internal notes (not visible to creator)..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setReviewModalOpen(false)}
                      className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReviewDelivery}
                      disabled={isSubmittingReview}
                      className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmittingReview
                        ? 'Submitting...'
                        : `${reviewForm.status === 'APPROVED' ? 'Approve' : 'Request Changes'}`}
                    </button>
                  </div>
                </div>
              ) : (
                /* View existing review */
                <div className="space-y-4">
                  <div>
                    <span className="mb-2 block text-sm font-medium text-gray-700">
                      Status:
                    </span>
                    <span
                      className={`rounded px-2 py-1 text-sm font-medium ${
                        selectedDelivery.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedDelivery.status}
                    </span>
                  </div>

                  {selectedDelivery.feedback && (
                    <div>
                      <span className="mb-2 block text-sm font-medium text-gray-700">
                        Feedback:
                      </span>
                      <p className="rounded bg-gray-50 p-3 text-gray-700">
                        {selectedDelivery.feedback}
                      </p>
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    Reviewed:{' '}
                    {selectedDelivery.reviewedAt
                      ? new Date(selectedDelivery.reviewedAt).toLocaleString()
                      : 'N/A'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed right-4 top-4 z-50 max-w-md">
          <div
            className={`rounded-lg border-l-4 p-4 shadow-lg ${
              toast.type === 'success'
                ? 'border-green-500 bg-green-50 text-green-800'
                : toast.type === 'warning'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-800'
                  : 'border-red-500 bg-red-50 text-red-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2">
                <span className="text-lg">
                  {toast.type === 'success'
                    ? '✅'
                    : toast.type === 'warning'
                      ? '⚠️'
                      : '❌'}
                </span>
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => setToast(null)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
