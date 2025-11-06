'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  brand: {
    id: string;
    name: string;
    logo?: string;
    verified: boolean;
  };
}

interface SignedUrlResponse {
  signedUrl: string;
}

interface ApplicationDeliveriesClientProps {
  gig: Gig;
  application: Application;
  initialDeliveries: Delivery[];
  user: any;
}

export default function ApplicationDeliveriesClient({
  gig,
  application,
  initialDeliveries,
  user,
}: ApplicationDeliveriesClientProps) {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [reviewingDeliveryId, setReviewingDeliveryId] = useState<string | null>(
    null
  );
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(
    null
  );
  const [reviewNotes, setReviewNotes] = useState('');
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loadingSignedUrl, setLoadingSignedUrl] = useState<
    Record<string, boolean>
  >({});
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

  // Get signed URL for file viewing
  const getSignedUrl = async (fileUrl: string) => {
    if (signedUrls[fileUrl]) {
      return signedUrls[fileUrl];
    }

    if (loadingSignedUrl[fileUrl]) {
      return null;
    }

    try {
      setLoadingSignedUrl((prev) => ({ ...prev, [fileUrl]: true }));

      const response = await apiClient.post<SignedUrlResponse>(
        '/api/files/signed-url',
        {
          fileUrl: fileUrl,
          action: 'view',
        }
      );

      if (response.success && response.data?.signedUrl) {
        const newSignedUrl = response.data.signedUrl;
        setSignedUrls((prev) => ({ ...prev, [fileUrl]: newSignedUrl }));
        return newSignedUrl;
      }
    } catch (error) {
      console.error('Failed to get signed URL:', error);
    } finally {
      setLoadingSignedUrl((prev) => ({ ...prev, [fileUrl]: false }));
    }

    return null;
  };

  // File Preview Component
  const FilePreview: React.FC<{ file: any; delivery: Delivery }> = ({
    file,
    delivery,
  }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handlePreview = async () => {
      if (previewUrl) {
        window.open(previewUrl, '_blank');
        return;
      }

      setLoading(true);
      const signedUrl = await getSignedUrl(file.url);
      if (signedUrl) {
        setPreviewUrl(signedUrl);
        window.open(signedUrl, '_blank');
      } else {
        showToast('error', 'Failed to load file preview');
      }
      setLoading(false);
    };

    const isVideo = file.mimeType?.startsWith('video/');
    const isImage = file.mimeType?.startsWith('image/');

    return (
      <div className="rounded-lg border bg-gray-50 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-100">
            {isVideo ? (
              <svg
                className="h-4 w-4 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM8 9a1 1 0 000 2h4a1 1 0 100-2H8z" />
              </svg>
            ) : isImage ? (
              <svg
                className="h-4 w-4 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{file.name}</h4>
            <p className="text-sm text-gray-500">
              {file.formattedSize} • {file.mimeType}
            </p>
          </div>
        </div>

        {/* Preview for videos and images */}
        {(isVideo || isImage) && (
          <div className="mb-3">
            {isVideo ? (
              <video
                className="max-h-64 w-full rounded"
                controls
                preload="metadata"
                onError={() => showToast('error', 'Failed to load video')}
              >
                <source src={file.url} type={file.mimeType} />
                Your browser does not support the video tag.
              </video>
            ) : isImage ? (
              <img
                src={file.url}
                alt={file.name}
                className="max-h-64 w-full rounded object-contain"
                onError={() => showToast('error', 'Failed to load image')}
              />
            ) : null}
          </div>
        )}

        <button
          onClick={handlePreview}
          disabled={loading}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          {loading ? 'Loading...' : '🔗 Open in new tab'}
        </button>
      </div>
    );
  };

  // Handle delivery review
  const handleReview = async () => {
    if (!reviewingDeliveryId || !reviewAction) return;

    try {
      const response = await apiClient.post(
        `/api/deliveries/${reviewingDeliveryId}/review`,
        {
          action: reviewAction,
          reviewNotes: reviewNotes.trim() || undefined,
        }
      );

      if (response.success) {
        // Update the delivery in state
        setDeliveries((prev) =>
          prev.map((delivery) =>
            delivery.id === reviewingDeliveryId
              ? {
                  ...delivery,
                  status: reviewAction === 'approve' ? 'APPROVED' : 'REJECTED',
                  reviewNotes: reviewNotes.trim() || undefined,
                  reviewedAt: new Date().toISOString(),
                }
              : delivery
          )
        );

        showToast('success', `Delivery ${reviewAction}d successfully`);
        setReviewingDeliveryId(null);
        setReviewAction(null);
        setReviewNotes('');
      } else {
        showToast('error', 'Failed to review delivery');
      }
    } catch (error) {
      console.error('Error reviewing delivery:', error);
      showToast('error', 'Failed to review delivery');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 rounded-md p-2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-5 w-5"
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
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Application Deliveries
                </h1>
                <p className="text-sm text-gray-500">
                  Review work submissions for this application
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Gig and Application Info */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h2 className="mb-2 text-lg font-semibold text-gray-900">
                {gig.title}
              </h2>
              <p className="mb-4 text-gray-600">{gig.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Budget:
                </span>
                <span className="text-sm text-gray-600">
                  ₹{gig.budgetMin} - ₹{gig.budgetMax} ({gig.budgetType})
                </span>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Application Details
              </h3>
              {application.applicant && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">
                    {application.applicant.firstName}{' '}
                    {application.applicant.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    @{application.applicant.username}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Quoted Price:
                  </span>
                  <span className="text-sm text-gray-600">
                    ₹{application.quotedPrice}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Estimated Time:
                  </span>
                  <span className="text-sm text-gray-600">
                    {application.estimatedTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Applied:
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatDate(application.appliedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deliveries */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Deliveries ({deliveries.length})
            </h2>
          </div>

          {deliveries.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No deliveries yet
              </h3>
              <p className="text-gray-600">
                This application hasn't submitted any work yet.
              </p>
            </div>
          ) : (
            deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {delivery.title}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(delivery.status)}`}
                      >
                        {delivery.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        v{delivery.version}
                      </span>
                    </div>
                    <p className="mb-2 text-gray-600">{delivery.description}</p>
                    {delivery.notes && (
                      <p className="mb-2 text-sm text-gray-500">
                        <strong>Notes:</strong> {delivery.notes}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Submitted: {formatDate(delivery.submittedAt)}
                    </p>
                    {delivery.reviewedAt && (
                      <p className="text-sm text-gray-500">
                        Reviewed: {formatDate(delivery.reviewedAt)}
                      </p>
                    )}
                  </div>

                  {delivery.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setReviewingDeliveryId(delivery.id);
                          setReviewAction('approve');
                        }}
                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setReviewingDeliveryId(delivery.id);
                          setReviewAction('reject');
                        }}
                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>

                {/* Files */}
                {delivery.fileDetails && delivery.fileDetails.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">
                      Files ({delivery.fileDetails.length}):
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {delivery.fileDetails.map((file, index) => (
                        <FilePreview
                          key={index}
                          file={file}
                          delivery={delivery}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Notes */}
                {delivery.reviewNotes && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-2 font-medium text-gray-900">
                      Review Notes:
                    </h4>
                    <p className="text-gray-700">{delivery.reviewNotes}</p>
                  </div>
                )}

                {delivery.feedback && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-2 font-medium text-gray-900">
                      Feedback:
                    </h4>
                    <p className="text-gray-700">{delivery.feedback}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewingDeliveryId && reviewAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Delivery
            </h3>
            <p className="mb-4 text-gray-600">
              Are you sure you want to {reviewAction} this delivery?
              {reviewAction === 'reject' && ' Please provide feedback below.'}
            </p>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {reviewAction === 'approve'
                  ? 'Review Notes (Optional)'
                  : 'Rejection Reason'}
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={
                  reviewAction === 'approve'
                    ? 'Add any additional comments...'
                    : 'Please explain why this delivery is being rejected...'
                }
                required={reviewAction === 'reject'}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setReviewingDeliveryId(null);
                  setReviewAction(null);
                  setReviewNotes('');
                }}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                disabled={reviewAction === 'reject' && !reviewNotes.trim()}
                className={`flex-1 rounded-md px-4 py-2 font-medium text-white disabled:opacity-50 ${
                  reviewAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {reviewAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 rounded-md p-4 shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-100 text-green-800'
              : toast.type === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          <div className="flex items-center">
            <span className="mr-2">
              {toast.type === 'success'
                ? '✅'
                : toast.type === 'error'
                  ? '❌'
                  : '⚠️'}
            </span>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
