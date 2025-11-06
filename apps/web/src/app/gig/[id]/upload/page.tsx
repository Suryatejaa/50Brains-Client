'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { apiClient } from '@/lib/api-client';

interface DeliverySubmission {
  title: string;
  description: string;
  files: File[];
  notes?: string;
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

interface DeliveriesResponse {
  deliveries: Array<{
    id: string;
    version: number;
    status: string;
  }>;
}

export default function UploadDeliveryPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();
  const userType = getUserTypeForRole(currentRole);

  const [gig, setGig] = useState<Gig | null>(null);
  const [myApplications, setMyApplications] = useState<Application | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliverySubmission, setDeliverySubmission] =
    useState<DeliverySubmission>({
      title: '',
      description: '',
      files: [],
      notes: '',
    });
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    description?: string;
    files?: string;
  }>({});
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  const gigId = params.id as string;

  // Show toast notification
  const showToast = (
    type: 'success' | 'error' | 'warning',
    message: string
  ) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
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
        setGig(gigResponse.data as any);

        // Load my applications
        const appResponse = await apiClient.get(
          `/api/my/${gigId}/applications`
        );
        if (appResponse.success && appResponse.data) {
          const applicationData = (appResponse.data as any).application;
          setMyApplications(applicationData);

          // Check if user is authorized to upload (application must be APPROVED)
          if (
            (appResponse.data as any).applicationStatus?.status !== 'APPROVED'
          ) {
            showToast(
              'error',
              'You can only upload when your application is approved'
            );
            router.push(`/gig/${gigId}`);
            return;
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

  // components/DeliverySubmit.tsx
  const [canUpload, setCanUpload] = useState(true);
  const [uploadBlockReason, setUploadBlockReason] = useState('');
  const [nextVersion, setNextVersion] = useState(1);

  // Check status BEFORE showing file picker
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await apiClient.get(
          `/api/gig/applications/${(myApplications as any).id}/status`
        );

        if (response.success) {
          const { data }: { data: any } = response;
          setCanUpload(data.canUpload);
          setUploadBlockReason(data.reason);
          setNextVersion(data.nextVersionNumber || 1);

          if (!data.canUpload) {
            showToast('warning', data.message);
          }
        }
      } catch (error) {
        console.error('Error checking delivery status:', error);
      }
    };

    if (myApplications?.id) {
      checkStatus();
    }
  }, [myApplications?.id]);

  function getBlockMessage(reason: string): string {
    switch (reason) {
      case 'PENDING_DELIVERY':
        return 'You have a pending delivery. Wait for brand review before uploading.';
      case 'LIMIT_REACHED':
        return 'Maximum 2 approved deliveries reached. You cannot upload more.';
      default:
        return 'You cannot upload at this time.';
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!myApplications?.id) {
      showToast('error', 'Application data not found');
      return;
    }

    if (!canUpload) {
      showToast('error', getBlockMessage(uploadBlockReason));
      return;
    }

    // Validation
    setValidationErrors({});
    let hasErrors = false;
    const errors: {
      title?: string;
      description?: string;
      files?: string;
    } = {};

    if (!deliverySubmission.title.trim()) {
      errors.title = 'Title is required';
      hasErrors = true;
    }
    if (!deliverySubmission.description.trim()) {
      errors.description = 'Description is required';
      hasErrors = true;
    }
    if (!deliverySubmission.files.length) {
      errors.files = 'At least one file is required';
      hasErrors = true;
    }

    if (hasErrors) {
      setValidationErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);

      console.log('Starting 3-step upload process for gig:', gigId);
      console.log('Files to upload:', deliverySubmission.files);

      // Step 1 & 2: Get signed URLs and upload all files to R2
      const uploadPromises = deliverySubmission.files.map(async (file) => {
        console.log(`Getting signed URL for: ${file.name}`);

        // Get signed URL from server (using delivery-specific endpoint)
        const urlResponse = await apiClient.post(
          '/api/submissions/delivery-upload-url',
          {
            applicationId: myApplications.id,
            fileName: file.name,
          }
        );

        if (!urlResponse.success) {
          throw new Error(`Failed to get upload URL for ${file.name}`);
        }

        const { uploadUrl, key } = urlResponse.data as {
          uploadUrl: string;
          key: string;
        };

        console.log(`Uploading ${file.name} to R2...`);
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        console.log(`Successfully uploaded ${file.name}`);

        return {
          name: file.name,
          key, // ← Store KEY for future deletion
          size: file.size,
          type: file.type,
        };
      });

      // Wait for all files to upload
      const uploadedFiles = await Promise.all(uploadPromises);
      console.log('All files uploaded:', uploadedFiles);

      // Step 3: Submit metadata to server
      // Your backend expects this format
      console.log('Saving deliverable to database...');
      const response = await apiClient.post(
        `/api/gig/${gigId}/submit-delivery`,
        {
          title: deliverySubmission.title.trim(),
          description: deliverySubmission.description.trim(),
          fileUrl: uploadedFiles[0].key, // ← Send KEY, not publicUrl
          fileName: uploadedFiles[0].name,
          fileSize: uploadedFiles[0].size,
          mimeType: uploadedFiles[0].type,
          notes: deliverySubmission.notes?.trim() || '',
        }
      );

      if (response.success) {
        showToast(
          'success',
          `Delivery submitted successfully! (${(response.data as any).version}/3)\nThe brand will review your work privately.`
        );

        // Clear form and redirect
        setDeliverySubmission({
          title: '',
          description: '',
          notes: '',
          files: [],
        });

        setTimeout(() => {
          router.push(`/gig/${gigId}`);
        }, 2000);
      } else {
        showToast('error', response.message || 'Failed to submit delivery');
      }
    } catch (error: any) {
      console.error('Error submitting delivery:', error);
      showToast('error', error.message || 'Failed to submit delivery');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 3) {
      showToast('warning', 'Maximum 3 files allowed');
      return;
    }
    setDeliverySubmission((prev) => ({
      ...prev,
      files: files,
    }));
  };

  // Check if this will be the 4th upload (which deletes v1)
  const [showVersionWarning, setShowVersionWarning] = useState(false);

  useEffect(() => {
    // Show warning when user has files selected and this would be 4th+ version
    if (deliverySubmission.files.length > 0) {
      // You can get the current version count from the deliveries API if needed
      // For now, we'll show the warning on the 4th upload attempt
      const checkVersionWarning = async () => {
        try {
          const response = await apiClient.get<DeliveriesResponse>(
            `/api/gig/${gigId}/deliveries`
          );
          if (response.success && response.data?.deliveries) {
            const currentVersionCount = response.data.deliveries.length;
            setShowVersionWarning(currentVersionCount >= 3);
          }
        } catch (error) {
          console.error('Failed to check version count:', error);
        }
      };

      checkVersionWarning();
    } else {
      setShowVersionWarning(false);
    }
  }, [deliverySubmission.files, gigId]);

  // Remove file
  const removeFile = (index: number) => {
    setDeliverySubmission((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4">
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
        <div className="mx-auto max-w-4xl px-4">
          <div className="py-12 text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              Access Denied
            </h1>
            <p className="mb-6 text-gray-600">
              You don't have permission to upload deliveries for this gig.
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
      <div className="mx-auto max-w-4xl px-4">
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
          <div className="mb-4 flex items-center space-x-4">
            <button
              onClick={() => router.push(`/gig/${gigId}`)}
              className="btn-secondary"
            >
              ← Back to Gig
            </button>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Upload Work for Review
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

        {/* Upload Form */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                type="text"
                value={deliverySubmission.title}
                onChange={(e) =>
                  setDeliverySubmission((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Brief title for your work"
                required
              />
              {validationErrors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                value={deliverySubmission.description}
                onChange={(e) =>
                  setDeliverySubmission((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={4}
                placeholder="Describe your work and any specific details for the brand to review"
                required
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.description}
                </p>
              )}
            </div>

            {/* Files */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Files * (Max 3 files)
              </label>
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required={deliverySubmission.files.length === 0}
              />

              {/* File List */}
              {deliverySubmission.files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {deliverySubmission.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded bg-gray-50 p-3"
                    >
                      <div>
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {validationErrors.files && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.files}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <textarea
                value={deliverySubmission.notes}
                onChange={(e) =>
                  setDeliverySubmission((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={2}
                placeholder="Any additional notes for the brand"
              />
            </div>

            {/* Version Warning */}
            {showVersionWarning && (
              <div className="rounded-md bg-amber-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-amber-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-amber-800">
                      <strong>Warning:</strong> You already have 3 versions
                      uploaded. Uploading a 4th version will automatically
                      delete your v1 submission. Only the 3 most recent versions
                      are kept.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This upload is for private brand
                    review only. Once approved, you'll be able to post publicly
                    and submit the final URL.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push(`/gig/${gigId}`)}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Uploading...' : 'Upload for Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
