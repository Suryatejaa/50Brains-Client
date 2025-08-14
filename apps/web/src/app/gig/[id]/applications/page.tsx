'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { RefreshCcw } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';

interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  primaryPlatform?: string;
  primaryNiche?: string;
  location?: string;
  experienceLevel?: string;
  followers?: number;
  avgEngagement?: number;
}

interface Application {
  id: string;
  gigId: string;
  applicantId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'APPROVED';
  proposal: string;
  quotedPrice: number;
  estimatedTime: string;
  applicantType: 'user' | 'clan';
  portfolio: string[];
  appliedAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  respondedAt?: string;
  _count?: {
    submissions: number;
  };
  // Note: applicant data is not included in the API response
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

export default function GigApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();
  const [gig, setGig] = useState<Gig | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingApplicationId, setProcessingApplicationId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectApplicationId, setRejectApplicationId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveApplication, setApproveApplication] = useState<Application | null>(null);

  const gigId = params.id as string;
  const userType = getUserTypeForRole(currentRole);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (userType !== 'brand') {
        console.log('User is not a brand, redirecting to dashboard');
        router.push('/dashboard');
        return;
      }
      console.log('Loading gig and applications for gigId:', gigId);
      loadGigAndApplications();
    } else if (isAuthenticated === false) {
      console.log('User not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [isAuthenticated, user, userType, gigId]);

  const loadGigAndApplications = async () => {
    try {
      console.log('🔄 Starting loadGigAndApplications for gigId:', gigId);
      setIsLoading(true);

      // Load gig details and applications in parallel
      const [gigResponse, applicationsResponse] = await Promise.allSettled([
        apiClient.get(`/api/gig/${gigId}`),
        apiClient.get(`/api/gig/${gigId}/applications`)
      ]);

      console.log('📡 API responses received - Gig:', gigResponse.status, 'Applications:', applicationsResponse);

      // Handle gig response
      if (gigResponse.status === 'fulfilled' && gigResponse.value.success) {
        const gigData = gigResponse.value.data;
        console.log('✅ Gig data received successfully');

        // Check if user owns this gig
        const gigDetails = gigData as any;
        const gigOwnerId = gigDetails.brand?.id || gigDetails.postedById;

        if (gigOwnerId !== user?.id) {
          console.log('❌ Ownership check failed - Redirecting to my-gigs');
          router.push('/my-gigs');
          return;
        }

        console.log('✅ Ownership check passed - Setting gig data');
        setGig(gigData as Gig);
      } else {
        console.error('❌ Failed to load gig:', gigResponse.status === 'fulfilled' ? gigResponse.value : gigResponse.reason);
        router.push('/my-gigs');
        return;
      }

      // Handle applications response
      if (applicationsResponse.status === 'fulfilled' && applicationsResponse.value.success) {
        const applicationsData = applicationsResponse.value.data as any;
        console.log('📊 Applications data structure:', Object.keys(applicationsData || {}));

        // Try different possible structures
        let extractedApplications = [];
        if (applicationsData?.applications) {
          extractedApplications = applicationsData.applications;
        } else if (Array.isArray(applicationsData)) {
          extractedApplications = applicationsData;
        }

        console.log('✅ Setting', extractedApplications.length, 'applications');
        setApplications(extractedApplications);
      } else {
        console.error('❌ Failed to load applications:', applicationsResponse.status === 'fulfilled' ? applicationsResponse.value : applicationsResponse.reason);
        // Still allow page to load even if applications fail
        setApplications([]);
      }

      console.log('🎉 loadGigAndApplications completed successfully');

    } catch (error) {
      console.error('💥 Exception in loadGigAndApplications:', error);
      // Don't redirect on refresh errors, just log them
      setApplications([]);
    } finally {
      console.log('🏁 Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const handleAcceptApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to accept this application?')) return;

    try {
      console.log('Accepting application:', applicationId);
      setProcessingApplicationId(applicationId);

      const response = await apiClient.post(`/api/gig/applications/${applicationId}/approve`, {
        notes: 'Application approved'
      });

      if (response.success) {
        console.log('Application accepted successfully, updating UI...');

        // Immediately update the application status in the local state
        setApplications(prevApplications =>
          prevApplications.map(app =>
            app.id === applicationId
              ? { ...app, status: 'APPROVED' as const }
              : app
          )
        );

        // Show success message
        alert('Application accepted successfully!');

        // Optionally refresh data in background to ensure consistency
        setTimeout(() => {
          loadGigAndApplications().catch(error => {
            console.warn('Background refresh failed:', error);
          });
        }, 1000);

      } else {
        console.error('Failed to accept application:', response);
        alert('Failed to accept application. Please try again.');
      }
    } catch (error) {
      console.error('Error accepting application:', error);

      // Check if it's already approved
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message;
        if (errorMessage && errorMessage.includes('already approved')) {
          alert('This application has already been approved.');
          // Refresh data to get current status
          await loadGigAndApplications();
        } else {
          alert('Failed to accept application. Please try again.');
        }
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
      console.log('Rejecting application:', rejectApplicationId);
      setProcessingApplicationId(rejectApplicationId);

      const response = await apiClient.post(`/api/gig/applications/${rejectApplicationId}/reject`, {
        reason: rejectionReason,
        feedback: rejectionReason
      });

      if (response.success) {
        console.log('Application rejected successfully, updating UI...');

        // Immediately update the application status in the local state
        setApplications(prevApplications =>
          prevApplications.map(app =>
            app.id === rejectApplicationId
              ? { ...app, status: 'REJECTED' as const, rejectionReason: rejectionReason }
              : app
          )
        );

        // Close modal and reset form
        setShowRejectModal(false);
        setRejectApplicationId(null);
        setRejectionReason('');

        // Show success message
        alert('Application rejected successfully.');

        // Optionally refresh data in background to ensure consistency
        setTimeout(() => {
          loadGigAndApplications().catch(error => {
            console.warn('Background refresh failed:', error);
          });
        }, 1000);

      } else {
        console.error('Failed to reject application:', response);
        alert('Failed to reject application. Please try again.');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);

      // Check if it's already rejected
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message;
        if (errorMessage && errorMessage.includes('already rejected')) {
          alert('This application has already been rejected.');
          // Refresh data to get current status
          await loadGigAndApplications();
        } else {
          alert('Failed to reject application. Please try again.');
        }
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

  const filteredApplications = applications.filter(app => {
    if (selectedStatus === 'all') return true;
    return app.status.toLowerCase() === selectedStatus.toLowerCase();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'WITHDRAWN': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view applications.</p>
          <Link href="/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (userType !== 'brand') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">This page is only available for brand accounts.</p>
          <Link href="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4">Gig Not Found</h1>
          <p className="text-gray-600 mb-6">The gig you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/my-gigs" className="btn-primary">
            Back to My Gigs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-1">
      <div className="mx-auto max-w-7xl px-2 sm:px-2 lg:px-2">
        {/* Header */}
        <div className="mb-2">
          <div className="flex flex-col lg:flex-row md:flex-row gap-1 items-left justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gig Applications</h1>
              <p className="text-gray-600">Manage applications for your gig</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadGigAndApplications}
                className="btn-secondary px-2 py-2"
                disabled={isLoading}
              >
                {isLoading ? <RefreshCcw className="w-4 h-4" /> : <RefreshCcw className="w-4 h-4" />}
              </button>
              <Link href="/my-gigs" className="btn-secondary">
                <ArrowLeft className="w-4 h-4" /> {isLoading ? <RefreshCcw className="w-4 h-4" /> : 'Back to My Gigs'}
              </Link>
              <Link href={`/gig/${gigId}`} className="btn-secondary">
                {isLoading ? <RefreshCcw className="w-4 h-4" /> : 'View Gig Details'}
              </Link>
            </div>
          </div>
        </div>

        {/* Gig Info */}
        <div className="card-glass p-2 mb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">{gig.title}</h2>
              <p className="text-gray-600 mb-2 line-clamp-2">{gig.description}</p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Category: {gig.category}</span>
                <span>Budget: ₹{gig.budgetMin.toLocaleString()} - ₹{gig.budgetMax.toLocaleString()}</span>
                <span>Applications: {gig.applicationCount}</span>
                {gig.deadline && <span>Deadline: {new Date(gig.deadline).toLocaleDateString()}</span>}
              </div>
            </div>
            <span className={`px-2 py-0 rounded-none text-sm font-medium ${gig.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
              gig.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
              {gig.status}
            </span>
          </div>
        </div>

        {/* Filters and Stats */}
        <div className="card-glass p-2 mb-2">
          <div className="flex flex-col lg:flex-row md:flex-row gap-1 items-left justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold">Applications ({filteredApplications.length})</h3>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pr-8 pl-1 py-0 border border-gray-300 rounded-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Applications</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>


            <div className="flex items-center space-x-2 text-sm">
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-100 rounded-none"></div>
                <span>Pending: {applications.filter(a => a.status === 'PENDING').length}</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-100 rounded-none"></div>
                <span>Approved: {applications.filter(a => a.status === 'APPROVED').length}</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-100 rounded-none"></div>
                <span>Rejected: {applications.filter(a => a.status === 'REJECTED').length}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-2">
            {filteredApplications.map((application) => (
              <div key={application.id} className="card-glass p-2">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-12 h-12 bg-gray-200 rounded-none flex items-center justify-center">
                      <span className="text-gray-500 font-medium">
                        {application.applicantId.slice(-2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        Applicant {application.applicantId.slice(-8)}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Type: {application.applicantType}</span>
                        {application.estimatedTime && (
                          <span>Timeline: {application.estimatedTime}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-none text-sm font-medium ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      Applied {new Date(application.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Application Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
                  <div>
                    <h4 className="font-semibold mb-2">Proposal</h4>
                    <p className="text-gray-700 bg-gray-50 p-2 rounded-none whitespace-pre-wrap">
                      {application.proposal}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-semibold mb-2">Application Details</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quoted Price:</span>
                          <span className="font-medium">₹{application.quotedPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estimated Time:</span>
                          <span className="font-medium">{application.estimatedTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Application Type:</span>
                          <span className="font-medium capitalize">{application.applicantType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Portfolio */}
                {application.portfolio && application.portfolio.length > 0 && (
                  <div className="mb-2">
                    <h4 className="font-semibold mb-2">Portfolio</h4>
                    <div className="space-y-2">
                      {application.portfolio.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:underline text-sm"
                        >
                          Portfolio Item {index + 1}: {url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejection Reason */}
                {application.status === 'REJECTED' && application.rejectionReason && (
                  <div className="mb-2">
                    <h4 className="font-semibold mb-2 text-red-600">Rejection Reason</h4>
                    <p className="text-gray-700 bg-red-50 p-2 rounded-none">
                      {application.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {application.status === 'PENDING' && (
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={() => openRejectModal(application.id)}
                      disabled={processingApplicationId === application.id}
                      className="btn-secondary text-red-600 hover:bg-red-50"
                    >
                      {processingApplicationId === application.id ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                      onClick={() => openApproveModal(application)}
                      disabled={processingApplicationId === application.id}
                      className="btn-primary"
                    >
                      {processingApplicationId === application.id ? 'Processing...' : 'Review & Approve'}
                    </button>
                  </div>
                )}

                {/* Status Display for Processed Applications */}
                {application.status !== 'PENDING' && (
                  <div className="flex items-center justify-end space-x-3">
                    <div className="text-sm text-gray-600">
                      {application.status === 'APPROVED' && '✅ Application Approved'}
                      {application.status === 'REJECTED' && '❌ Application Rejected'}
                      {application.status === 'WITHDRAWN' && '↩️ Application Withdrawn'}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card-glass p-2 text-center">
            <div className="text-6xl mb-2">📨</div>
            <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-2">
              {selectedStatus === 'all'
                ? 'No one has applied to this gig yet.'
                : `No ${selectedStatus} applications found.`}
            </p>
            <Link href="/marketplace" className="btn-primary">
              Promote Your Gig
            </Link>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-none max-w-md w-full p-2">
              <h2 className="text-xl font-bold mb-2">Reject Application</h2>
              <p className="text-gray-600 mb-2">
                Please provide a reason for rejecting this application:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-none px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Reason for rejection..."
              />
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectApplicationId(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectApplication}
                  disabled={!rejectionReason.trim() || processingApplicationId === rejectApplicationId}
                  className="flex-1 btn-primary bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {processingApplicationId === rejectApplicationId ? 'Rejecting...' : 'Reject Application'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Approve Modal */}
        {showApproveModal && approveApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-none max-w-2xl w-full p-3">
              <h2 className="text-xl font-bold mb-2">Review Application</h2>
              <p className="text-sm text-gray-600 mb-2">Please review the plan before approving.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <div>
                  <h3 className="font-semibold mb-1">Summary</h3>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between"><span className="text-gray-600">Quoted Price</span><span className="font-medium">₹{approveApplication.quotedPrice.toLocaleString()}</span></div>
                    {approveApplication.estimatedTime && (
                      <div className="flex justify-between"><span className="text-gray-600">Timeline</span><span className="font-medium">{approveApplication.estimatedTime}</span></div>
                    )}
                    <div className="flex justify-between"><span className="text-gray-600">Type</span><span className="font-medium capitalize">{approveApplication.applicantType}</span></div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Quick Checks</h3>
                  {(() => {
                    const msTotal = (approveApplication as any).milestonePlan?.reduce((s: number, m: any) => s + (m.amount || 0), 0) || 0;
                    const pctTotal = (approveApplication as any).payoutSplit?.reduce((s: number, p: any) => s + (p.percentage || 0), 0) || 0;
                    return (
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between"><span className="text-gray-600">Milestone Total</span><span className="font-medium">₹{msTotal.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Payout % Total</span><span className="font-medium">{pctTotal}%</span></div>
                        {msTotal > approveApplication.quotedPrice && (
                          <div className="text-xs text-red-600">Warning: milestones exceed quoted price</div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Team Plan */}
              {(approveApplication as any).teamPlan?.length > 0 && (
                <div className="mb-2">
                  <h3 className="font-semibold mb-1">Team Plan</h3>
                  <div className="space-y-1 text-sm">
                    {(approveApplication as any).teamPlan.map((m: any, i: number) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-gray-600">{m.role}</span>
                        <span className="text-gray-600 cursor-pointer" onClick={() => {
                          router.push(`/profile/${m.memberId}`);
                        }}>ID: {m.memberId?.slice(0, 8)}… • {m.hours}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestones */}
              {(approveApplication as any).milestonePlan?.length > 0 && (
                <div className="mb-2">
                  <h3 className="font-semibold mb-1">Milestones</h3>
                  <div className="space-y-1 text-sm">
                    {(approveApplication as any).milestonePlan.map((m: any, i: number) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-gray-600">{m.title} — {new Date(m.dueAt).toLocaleDateString()}</span>
                        <span className="font-medium">₹{(m.amount || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payout Split */}
              {(approveApplication as any).payoutSplit?.length > 0 && (
                <div className="mb-2">
                  <h3 className="font-semibold mb-1">Payout Split</h3>
                  <div className="space-y-1 text-sm">
                    {(approveApplication as any).payoutSplit.map((p: any, i: number) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-gray-600 cursor-pointer" onClick={() => {
                          router.push(`/profile/${p.memberId}`);
                        }}>Member ID: {p.memberId?.slice(0, 8)}…</span>
                        <span className="font-medium">{p.percentage ? `${p.percentage}%` : `₹${(p.fixedAmount || 0).toLocaleString()}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => { setShowApproveModal(false); setApproveApplication(null); }}
                  className="flex-1 btn-secondary py-1 px-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { if (approveApplication) handleAcceptApplication(approveApplication.id); setShowApproveModal(false); }}
                  disabled={processingApplicationId === approveApplication?.id}
                  className="flex-1 btn-primary py-1 px-1"
                >
                  {processingApplicationId === approveApplication?.id ? 'Approving…' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
