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
  files: string[]; // Array of file URLs
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
}

interface DeliveriesResponse {
  deliveries: Delivery[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface SignedUrlResponse {
  signedUrl: string;
}

interface Gig {
  id: string;
  title: string;
  description: string;
  brand?: {
    id: string;
    name: string;
    logo?: string;
  };
}

interface Application {
  id: string;
  status: string;
  gigId: string;
  applicantType: string;
}

export default function DeliveryHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();
  const userType = getUserTypeForRole(currentRole);

  const [gig, setGig] = useState<Gig | null>(null);
  const [myApplications, setMyApplications] = useState<Application | null>(
    null
  );
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  const gigId = params.id as string;

  // File Preview Component
  const FilePreview: React.FC<{ file: any; index: number }> = ({
    file,
    index,
  }) => {
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fileName = file.name || `File ${index + 1}`;
    const fileSize = file.size || 0;
    const fileUrl = file.url;
    const mimeType = file.mimeType;
    const isVideo = mimeType.startsWith('video/');
    const isImage = mimeType.startsWith('image/');

    useEffect(() => {
      const fetchSignedUrl = async () => {
        try {
          setLoading(true);
          const url = await getOrFetchSignedUrl(fileUrl);
          setSignedUrl(url);
        } catch (error) {
          console.error('Failed to get signed URL for file:', error);
          setSignedUrl(fileUrl); // Fallback
        } finally {
          setLoading(false);
        }
      };

      fetchSignedUrl();
    }, [fileUrl]);

    return (
      <div className="rounded border border-gray-200 p-3">
        <div className="mb-2 flex items-center space-x-2">
          <div className="flex-shrink-0">
            <span className="text-lg">
              {isVideo ? '🎥' : isImage ? '🖼️' : '📄'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {fileName}
            </p>
            <p className="text-xs text-gray-500">
              {file.formattedSize || formatFileSize(fileSize)}
            </p>
            <p className="text-xs text-gray-400">{mimeType}</p>
          </div>
        </div>

        {loading ? (
          <div className="mb-2 flex h-32 items-center justify-center rounded bg-gray-100">
            <span className="text-sm text-gray-500">Loading preview...</span>
          </div>
        ) : (
          <>
            {/* Video Preview */}
            {isVideo && signedUrl && (
              <div className="mb-2">
                <video
                  src={signedUrl}
                  className="w-full rounded"
                  controls
                  preload="metadata"
                  style={{ maxHeight: '200px' }}
                />
              </div>
            )}

            {/* Image Preview */}
            {isImage && signedUrl && (
              <div className="mb-2">
                <img
                  src={signedUrl}
                  alt={fileName}
                  className="w-full rounded object-cover"
                  style={{ maxHeight: '200px' }}
                />
              </div>
            )}

            {/* Download Link */}
            {signedUrl && (
              <a
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Open in new tab</span>
              </a>
            )}
          </>
        )}
      </div>
    );
  };

  // Show toast notification
  const showToast = (
    type: 'success' | 'error' | 'warning',
    message: string
  ) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Load deliveries for the current application
  const loadDeliveries = async (gigId: string) => {
    try {
      setDeliveriesLoading(true);
      const response = await apiClient.get<DeliveriesResponse>(
        `/api/gig/${gigId}/deliveries`
      );

      console.log('Fetched deliveries response:', response);
      console.log('Deliveries data:', response.data?.deliveries);

      if (response.success && response.data && response.data.deliveries) {
        // Log individual delivery structure
        response.data.deliveries.forEach((delivery, index) => {
          console.log(`Delivery ${index}:`, delivery);
          console.log(`Delivery ${index} files:`, delivery.files);
        });
        setDeliveries(response.data.deliveries);
      }
    } catch (error) {
      console.error('Failed to load deliveries:', error);
      showToast('error', 'Failed to load deliveries');
    } finally {
      setDeliveriesLoading(false);
    }
  };

  // Load gig and application data
  useEffect(() => {
    if (!isAuthenticated || !gigId) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load gig details
        const gigResponse = await apiClient.get(`/api/gig/${gigId}`);
        if (!gigResponse.success || !gigResponse.data) {
          showToast('error', 'Gig not found');
          router.push('/my/applications');
          return;
        }
        setGig(gigResponse.data as Gig);

        // Load my applications
        const appResponse = await apiClient.get(
          `/api/my/${gigId}/applications`
        );
        if (appResponse.success && appResponse.data) {
          const applicationData = (appResponse.data as any).application;
          setMyApplications(applicationData);

          // Load deliveries if application exists
          if (applicationData?.id) {
            await loadDeliveries(gigId);
          }
        } else {
          showToast('error', 'Application not found');
          router.push(`/gig/${gigId}`);
          return;
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        showToast('error', 'Failed to load data');
        router.push('/my/applications');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, gigId, router]);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
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

  // Get signed URL for file viewing/download
  const getSignedUrl = async (fileUrl: string) => {
    try {
      const response = await apiClient.post<SignedUrlResponse>(
        '/api/files/signed-url',
        {
          fileUrl: fileUrl,
          action: 'view',
        }
      );

      if (response.success && response.data?.signedUrl) {
        return response.data.signedUrl;
      }
      return fileUrl; // Fallback to original URL
    } catch (error) {
      console.error('Failed to get signed URL:', error);
      return fileUrl; // Fallback to original URL
    }
  };

  // Get or fetch signed URL with caching
  const getOrFetchSignedUrl = async (fileUrl: string) => {
    if (signedUrls[fileUrl]) {
      return signedUrls[fileUrl];
    }

    const signedUrl = await getSignedUrl(fileUrl);
    setSignedUrls((prev) => ({ ...prev, [fileUrl]: signedUrl }));
    return signedUrl;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!gig || !myApplications) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="py-12 text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              Access Denied
            </h1>
            <p className="mb-6 text-gray-600">
              You don't have permission to view deliveries for this gig.
            </p>
            <button
              onClick={() => router.push(`/gig/${gigId}`)}
              className="btn-primary"
            >
              Go Back to Gig
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed right-4 top-4 z-50 rounded-md p-4 ${
              toast.type === 'success'
                ? 'bg-green-100 text-green-800'
                : toast.type === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => router.push(`/gig/${gigId}`)}
              className="btn-secondary"
            >
              ← Back to Gig
            </button>

            <button
              onClick={() => router.push(`/gig/${gigId}/upload`)}
              className="btn-primary"
            >
              Upload New Work
            </button>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Delivery History
            </h1>
            <div className="flex items-center space-x-4">
              {gig.brand?.logo && (
                <img
                  src={gig.brand.logo}
                  alt={gig.brand.name}
                  className="h-8 w-8 rounded"
                />
              )}
              <div>
                <p className="font-medium text-gray-700">{gig.brand?.name}</p>
                <p className="text-sm text-gray-600">{gig.title}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Deliveries List */}
        <div className="rounded-lg bg-white shadow-sm">
          {deliveriesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-4 text-6xl">📁</div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No Deliveries Yet
              </h3>
              <p className="mb-6 text-gray-600">
                You haven't uploaded any work for review yet.
              </p>
              <button
                onClick={() => router.push(`/gig/${gigId}/upload`)}
                className="btn-primary"
              >
                Upload Your First Delivery
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {delivery.title}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                            delivery.status
                          )}`}
                        >
                          {delivery.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          v{delivery.version}
                        </span>
                      </div>
                      <p className="mb-3 text-gray-600">
                        {delivery.description}
                      </p>

                      {delivery.notes && (
                        <div className="mb-3">
                          <p className="mb-1 text-sm font-medium text-gray-700">
                            Your Notes:
                          </p>
                          <p className="rounded bg-gray-50 p-2 text-sm text-gray-600">
                            {delivery.notes}
                          </p>
                        </div>
                      )}

                      {/* Files */}
                      {delivery.fileDetails &&
                        delivery.fileDetails.length > 0 && (
                          <div className="mb-3">
                            <p className="mb-2 text-sm font-medium text-gray-700">
                              Files ({delivery.fileDetails.length}):
                            </p>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              {delivery.fileDetails.map((file, fileIndex) => (
                                <FilePreview
                                  key={`file-${fileIndex}`}
                                  file={file}
                                  index={fileIndex}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Brand Feedback */}
                      {delivery.feedback && (
                        <div className="mb-3">
                          <p className="mb-1 text-sm font-medium text-gray-700">
                            Brand Feedback:
                          </p>
                          <div
                            className={`rounded p-3 ${
                              delivery.status === 'APPROVED'
                                ? 'border border-green-200 bg-green-50'
                                : 'border border-red-200 bg-red-50'
                            }`}
                          >
                            <p className="text-sm text-gray-700">
                              {delivery.feedback}
                            </p>
                          </div>
                        </div>
                      )}

                      {delivery.reviewNotes && (
                        <div className="mb-3">
                          <p className="mb-1 text-sm font-medium text-gray-700">
                            Review Notes:
                          </p>
                          <p className="rounded bg-gray-50 p-2 text-sm text-gray-600">
                            {delivery.reviewNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>
                      Uploaded:{' '}
                      {new Date(delivery.submittedAt).toLocaleString()}
                    </span>
                    {delivery.reviewedAt && (
                      <span>
                        Reviewed:{' '}
                        {new Date(delivery.reviewedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        {deliveries.length > 0 && (
          <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Summary</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {deliveries.length}
                </div>
                <div className="text-sm text-gray-600">Total Uploads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {deliveries.filter((d) => d.status === 'APPROVED').length}
                </div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {deliveries.filter((d) => d.status === 'PENDING').length}
                </div>
                <div className="text-sm text-gray-600">Pending Review</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
