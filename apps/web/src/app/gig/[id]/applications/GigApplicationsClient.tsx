'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface Application {
  id: string;
  gigId: string;
  applicantId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'APPROVED';
  proposal: string;
  quotedPrice: number;
  estimatedTime: string;
  applicantType: 'user' | 'clan' | 'owner';
  portfolio: string[];
  appliedAt: string;
  address?: string;
  acceptedAt?: string;
  upiId?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  respondedAt?: string;
  _count?: {
    submissions: number;
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
  applications?: Application[];
}

interface GigApplicationsClientProps {
  gigId: string;
  initialGigData: any;
  initialApplications: Application[];
}

export const GigApplicationsClient: React.FC<GigApplicationsClientProps> = ({
  gigId,
  initialGigData,
  initialApplications,
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();

  const [gig, setGig] = useState<Gig>(initialGigData);
  const [applications, setApplications] =
    useState<Application[]>(initialApplications);
  const [isLoading, setIsLoading] = useState(false);
  const [processingApplicationId, setProcessingApplicationId] = useState<
    string | null
  >(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectApplicationId, setRejectApplicationId] = useState<string | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveApplication, setApproveApplication] =
    useState<Application | null>(null);

  const userType = getUserTypeForRole(currentRole);

  // Progressive enhancement - load fresh data after SSR
  useEffect(() => {
    if (isAuthenticated && userType === 'brand') {
      loadFreshData();
    }
  }, [isAuthenticated, userType, gigId]);

  const loadFreshData = async () => {
    try {
      setIsLoading(true);

      const [gigResponse, applicationsResponse] = await Promise.allSettled([
        apiClient.get(`/api/gig/${gigId}`),
        apiClient.get(`/api/gig/${gigId}/applications`),
      ]);

      if (gigResponse.status === 'fulfilled' && gigResponse.value.success) {
        setGig(gigResponse.value.data as Gig);
      }

      if (
        applicationsResponse.status === 'fulfilled' &&
        applicationsResponse.value.success
      ) {
        const applicationsData = applicationsResponse.value.data as any;
        let extractedApplications = [];
        if (applicationsData?.applications) {
          extractedApplications = applicationsData.applications;
        } else if (Array.isArray(applicationsData)) {
          extractedApplications = applicationsData;
        }
        setApplications(extractedApplications);
      }
    } catch (error) {
      console.error('Failed to load fresh data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to accept this application?')) return;

    try {
      setProcessingApplicationId(applicationId);

      const response = await apiClient.post(
        `/api/gig/applications/${applicationId}/approve`,
        { notes: 'Application approved' }
      );

      if (response.success) {
        setApplications((prevApplications) =>
          prevApplications.map((app) =>
            app.id === applicationId
              ? { ...app, status: 'APPROVED' as const }
              : app
          )
        );
        alert('Application accepted successfully!');
        setTimeout(() => loadFreshData(), 1000);
      } else {
        alert('Failed to accept application. Please try again.');
      }
    } catch (error: any) {
      console.error('Error accepting application:', error);

      if (error?.message?.includes('already approved')) {
        alert('This application has already been approved.');
        await loadFreshData();
      } else {
        alert('Failed to accept application. Please try again.');
      }
    } finally {
      setProcessingApplicationId(null);
    }
  };

  const handleRejectApplication = async () => {
    if (!rejectApplicationId || !rejectionReason.trim()) return;

    try {
      setProcessingApplicationId(rejectApplicationId);

      const response = await apiClient.post(
        `/api/gig/applications/${rejectApplicationId}/reject`,
        {
          reason: rejectionReason,
          feedback: rejectionReason,
        }
      );

      if (response.success) {
        setApplications((prevApplications) =>
          prevApplications.map((app) =>
            app.id === rejectApplicationId
              ? {
                  ...app,
                  status: 'REJECTED' as const,
                  rejectionReason: rejectionReason,
                }
              : app
          )
        );

        setShowRejectModal(false);
        setRejectApplicationId(null);
        setRejectionReason('');
        alert('Application rejected successfully.');
        setTimeout(() => loadFreshData(), 1000);
      } else {
        alert('Failed to reject application. Please try again.');
      }
    } catch (error: any) {
      console.error('Error rejecting application:', error);

      if (error?.message?.includes('already rejected')) {
        alert('This application has already been rejected.');
        await loadFreshData();
      } else {
        alert('Failed to reject application. Please try again.');
      }
    } finally {
      setProcessingApplicationId(null);
    }
  };

  const openRejectModal = (applicationId: string) => {
    setRejectApplicationId(applicationId);
    setShowRejectModal(true);
  };

  const openApproveModal = (app: Application) => {
    setApproveApplication(app);
    setShowApproveModal(true);
  };

  const filteredApplications = applications.filter((app) => {
    if (selectedStatus === 'all') return true;
    return (
      String(app.status || '').toLowerCase() ===
      String(selectedStatus || '').toLowerCase()
    );
  });

  return (
    <>
      {/* Enhanced Action Buttons - Progressive Enhancement */}
      <style jsx>{`
        .enhanced-actions {
          opacity: 0;
          animation: fadeIn 0.3s ease-in-out forwards;
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>

      {/* Enhanced Refresh Button */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Replace static refresh button with dynamic one
            window.addEventListener('load', function() {
              const refreshBtn = document.querySelector('button[title="Refresh"]');
              if (refreshBtn) {
                refreshBtn.onclick = function() {
                  window.location.reload();
                };
              }
            });
          `,
        }}
      />

      {/* Enhanced Filter */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('load', function() {
              const filterSelect = document.querySelector('select');
              if (filterSelect) {
                filterSelect.addEventListener('change', function(e) {
                  const selectedValue = e.target.value;
                  const applications = document.querySelectorAll('[data-application-id]');
                  
                  applications.forEach(app => {
                    const status = app.getAttribute('data-status');
                    if (selectedValue === 'ALL' || status === selectedValue) {
                      app.style.display = 'block';
                    } else {
                      app.style.display = 'none';
                    }
                  });
                });
              }
            });
          `,
        }}
      />

      {/* Dynamic Action Buttons */}
      {applications.map((application) => (
        <div
          key={`enhanced-${application.id}`}
          className="enhanced-actions hidden"
        >
          {application.status === 'PENDING' &&
            application.applicantType !== 'owner' && (
              <div className="application-actions flex items-center justify-end space-x-3">
                <button
                  onClick={() => openRejectModal(application.id)}
                  disabled={processingApplicationId === application.id}
                  className="btn-secondary text-red-600 hover:bg-red-50"
                >
                  {processingApplicationId === application.id
                    ? 'Processing...'
                    : 'Reject'}
                </button>
                <button
                  onClick={() => openApproveModal(application)}
                  disabled={processingApplicationId === application.id}
                  className="btn-primary"
                >
                  {processingApplicationId === application.id
                    ? 'Processing...'
                    : 'Review & Approve'}
                </button>
              </div>
            )}
        </div>
      ))}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded bg-white p-4">
            <h2 className="mb-4 text-xl font-bold">Reject Application</h2>
            <p className="mb-4 text-gray-600">
              Please provide a reason for rejecting this application:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Reason for rejection..."
            />
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectApplicationId(null);
                  setRejectionReason('');
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectApplication}
                disabled={
                  !rejectionReason.trim() ||
                  processingApplicationId === rejectApplicationId
                }
                className="btn-primary flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {processingApplicationId === rejectApplicationId
                  ? 'Rejecting...'
                  : 'Reject Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && approveApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-2xl rounded bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">Review Application</h2>
            <p className="mb-4 text-sm text-gray-600">
              Please review the application details before approving.
            </p>

            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold">Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quoted Price</span>
                    <span className="font-medium">
                      ₹{approveApplication.quotedPrice?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timeline</span>
                    <span className="font-medium">
                      {approveApplication.estimatedTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium capitalize">
                      {approveApplication.applicantType}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setApproveApplication(null);
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (approveApplication)
                    handleAcceptApplication(approveApplication.id);
                  setShowApproveModal(false);
                }}
                disabled={processingApplicationId === approveApplication?.id}
                className="btn-primary flex-1"
              >
                {processingApplicationId === approveApplication?.id
                  ? 'Approving...'
                  : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progressive Enhancement Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Enhance action buttons after page load
            window.addEventListener('load', function() {
              setTimeout(function() {
                // Show enhanced action buttons
                const enhancedActions = document.querySelectorAll('.enhanced-actions');
                enhancedActions.forEach(action => {
                  action.classList.remove('hidden');
                });
                
                // Add status attributes for filtering
                const applications = document.querySelectorAll('.card-glass');
                applications.forEach((app, index) => {
                  if (index > 2) { // Skip header cards
                    const statusSpan = app.querySelector('span[class*="bg-"]');
                    if (statusSpan) {
                      const status = statusSpan.textContent.trim();
                      app.setAttribute('data-application-id', 'app-' + index);
                      app.setAttribute('data-status', status.toUpperCase());
                    }
                  }
                });
              }, 100);
            });
          `,
        }}
      />
    </>
  );
};

export default GigApplicationsClient;
