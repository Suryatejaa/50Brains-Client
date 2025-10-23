'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Application {
  id: string;
  gigId: string;
  applicantId: string;
  applicantType: 'user' | 'clan';
  proposal: string;
  quotedPrice: number;
  estimatedTime: string;
  portfolio: string[];
  status:
    | 'PENDING'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'WITHDRAWN'
    | 'APPROVED'
    | 'CLOSED';
  appliedAt: string;
  respondedAt?: string;
  rejectionReason?: string;
  submissionsCount: number;
  // Clan-specific fields
  teamPlan?: Array<{
    role: string;
    memberId: string;
    hours?: number;
    deliverables?: string[];
  }>;
  milestonePlan?: Array<{
    title: string;
    dueAt: string;
    amount: number;
    deliverables?: string[];
  }>;
  payoutSplit?: Array<{
    memberId: string;
    percentage?: number;
    fixedAmount?: number;
  }>;
  gig: {
    id: string;
    title: string;
    description: string;
    budgetMin: number;
    budgetMax: number;
    budgetType: string;
    category: string;
    status: string;
    deadline: string;
    createdAt: string;
    daysOld: number;
    daysUntilDeadline: number;
  };
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  CLOSED: 'bg-purple-100 text-purple-700',
};

export default function ApplicationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
  >('ALL');

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveApplication, setApproveApplication] =
    useState<Application | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectApplicationId, setRejectApplicationId] = useState<string | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingApplicationId, setProcessingApplicationId] = useState<
    string | null
  >(null);

  const userType = getUserTypeForRole(currentRole);

  // Redirect if not authenticated or not a brand
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || userType !== 'brand')) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, userType, router]);

  // Load applications
  useEffect(() => {
    if (isAuthenticated && userType === 'brand') {
      loadApplications();
    }
  }, [isAuthenticated, userType]);

  const loadApplications = async () => {
    try {
      // console.log('Loading applications...');
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api/applications/received');

      if (response.success) {
        // Handle the nested structure: response.data.applications
        const applicationsData = response.data as any;
        // console.log(
        //   'Applications loaded successfully:',
        //   applicationsData?.applications || 0,
        //   'applications'
        // );
        setApplications(applicationsData?.applications || []);
      } else {
        console.error('Failed to load applications:', response);
        setError('Failed to load applications');
      }
    } catch (error: any) {
      console.error('Error loading applications:', error);
      setError(error.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to accept this application?')) return;

    try {
      // console.log('Accepting application:', applicationId);
      setProcessingApplicationId(applicationId);

      const response = await apiClient.post(
        `/api/gig/applications/${applicationId}/approve`,
        {
          notes: 'Application approved',
        }
      );

      if (response.success) {
        // console.log('Application accepted successfully, updating UI...');

        // Immediately update the application status in the local state
        setApplications((prevApplications) =>
          prevApplications.map((app) =>
            app.id === applicationId
              ? { ...app, status: 'APPROVED' as const }
              : app
          )
        );

        // Show success message
        alert('Application accepted successfully!');

        // Reload the page to get fresh data
        window.location.reload();
      } else {
        console.error('Failed to accept application:', response);
        alert('Failed to accept application. Please try again.');
      }
    } catch (error: any) {
      console.error('Error accepting application:', error);

      // Check if it's already approved
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message;
        if (errorMessage && errorMessage.includes('already approved')) {
          alert('This application has already been approved.');
          // Refresh data to get current status
          await loadApplications();
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
      // console.log('Rejecting application:', rejectApplicationId);
      setProcessingApplicationId(rejectApplicationId);

      const response = await apiClient.post(
        `/api/gig/applications/${rejectApplicationId}/reject`,
        {
          reason: rejectionReason,
          feedback: rejectionReason,
        }
      );

      if (response.success) {
        // console.log('Application rejected successfully, updating UI...');

        // Immediately update the application status in the local state
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

        // Close modal and reset form
        setShowRejectModal(false);
        setRejectApplicationId(null);
        setRejectionReason('');

        // Show success message
        alert('Application rejected successfully.');

        // Reload the page to get fresh data
        window.location.reload();
      } else {
        console.error('Failed to reject application:', response);
        alert('Failed to reject application. Please try again.');
      }
    } catch (error: any) {
      console.error('Error rejecting application:', error);

      // Check if it's already rejected
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message;
        if (errorMessage && errorMessage.includes('already rejected')) {
          alert('This application has already been rejected.');
          // Refresh data to get current status
          await loadApplications();
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
    // console.log('Opening approve modal for application:', app);
    setApproveApplication(app);
    setShowApproveModal(true);
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === 'ALL') return true;
    return app.status === filter;
  });

  const formatBudget = (app: Application) => {
    return `₹${app.quotedPrice}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getApplicantName = (applicantId: string) => {
    return `Applicant ${applicantId.slice(-8)}`;
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (userType !== 'brand') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="card-glass p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Access Denied</h1>
          <p className="mb-6 text-gray-600">
            This page is only available for brand accounts.
          </p>
          <Link href="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="card-glass p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Error</h1>
          <p className="mb-6 text-gray-600">{error}</p>
          <button onClick={loadApplications} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2">
      <div className="mx-auto max-w-7xl px-2 sm:px-2 lg:px-2">
        {/* Header */}
        <div className="mb-2">
          <div className="items-left flex flex-col justify-between gap-1 md:flex-row lg:flex-row">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Applications Received
              </h1>
              <p className="text-gray-600">Manage applications for your gigs</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadApplications}
                className="btn-secondary"
                disabled={loading}
              >
                {loading ? 'Refreshing...' : '↻ Refresh'}
              </button>
              <Link href="/my-gigs" className="btn-primary">
                View My Gigs
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-glass mb-2 p-2">
          <div className="items-left flex flex-col justify-between gap-1 md:flex-row lg:flex-row">
            <div className="flex items-center space-x-2">
              <h3 className="flex text-lg font-semibold">
                Filter Applications
              </h3>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="rounded-none border border-gray-300 px-1 py-0 pr-8 focus:border-transparent focus:ring-2 focus:ring-blue-500"
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
                <div className="h-3 w-3 rounded-none bg-yellow-100"></div>
                <span>
                  Pending:{' '}
                  {applications.filter((a) => a.status === 'PENDING').length}
                </span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-none bg-green-100"></div>
                <span>
                  Approved:{' '}
                  {applications.filter((a) => a.status === 'APPROVED').length}
                </span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-none bg-red-100"></div>
                <span>
                  Rejected:{' '}
                  {applications.filter((a) => a.status === 'REJECTED').length}
                </span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-none bg-gray-300"></div>
                <span>
                  Closed:{' '}
                  {applications.filter((a) => a.status === 'CLOSED').length}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-2">
            {filteredApplications.map((application) => (
              <div key={application.id} className="card-glass p-2">
                <div className="mb-2 flex items-start justify-between">
                  <div
                    className="flex items-start space-x-2"
                    onClick={() =>
                      router.push(`/profile/${application.applicantId}`)
                    }
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-none bg-gray-200">
                      <span className="font-medium text-gray-500">
                        {getApplicantName(
                          application.applicantId
                        )[0]?.toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div>
                      <h3 className="cursor-pointer text-lg font-semibold hover:underline">
                        {getApplicantName(application.applicantId)}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Type: {application.applicantType}</span>
                        <span>Estimated Time: {application.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`rounded-none px-2 py-0 text-sm font-medium ${statusColors[application.status]}`}
                    >
                      {application.status}
                    </span>
                    <p className="mt-1 text-sm text-gray-500">
                      Applied {formatDate(application.appliedAt)}
                    </p>
                  </div>
                </div>

                {/* Gig Details */}
                <div className="mb-2 rounded-none bg-gray-50 p-2">
                  <h4 className="mb-2 font-semibold">
                    Gig: {application.gig.title}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 lg:grid-cols-4">
                    <span>Category: {application.gig.category}</span>
                    <span>
                      Budget: ₹{application.gig.budgetMin} - ₹
                      {application.gig.budgetMax}
                    </span>
                    <span>Type: {application.gig.budgetType}</span>
                    <span>
                      Deadline: {formatDate(application.gig.deadline)}
                    </span>
                  </div>
                </div>

                {/* Application Details */}
                <div className="mb-2 grid grid-cols-1 gap-2 lg:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-semibold">Proposal</h4>
                    <p className="whitespace-pre-wrap rounded-none bg-gray-50 p-2 text-gray-700">
                      {application.proposal}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h4 className="mb-2 font-semibold">
                        Application Details
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quoted Price:</span>
                          <span className="font-medium">
                            ₹{application.quotedPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estimated Time:</span>
                          <span className="font-medium">
                            {application.estimatedTime}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Submissions:</span>
                          <span className="font-medium">
                            {application.submissionsCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Plan - Only for Clan Applications */}
                {application.applicantType === 'clan' &&
                  application.teamPlan &&
                  application.teamPlan.length > 0 && (
                    <div className="mb-2">
                      <h4 className="mb-2 font-semibold">Team Plan</h4>
                      <div className="space-y-1 text-sm">
                        {application.teamPlan.map((m, i) => (
                          <div
                            key={i}
                            className="flex justify-between rounded-none bg-gray-50 p-2"
                          >
                            <span className="text-gray-600">{m.role}</span>
                            <span className="text-gray-600">
                              ID: {m.memberId?.slice(0, 8)}… • {m.hours || 0}h
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Milestones - Only for Clan Applications */}
                {application.applicantType === 'clan' &&
                  application.milestonePlan &&
                  application.milestonePlan.length > 0 && (
                    <div className="mb-2">
                      <h4 className="mb-2 font-semibold">Milestones</h4>
                      <div className="space-y-1 text-sm">
                        {application.milestonePlan.map((m, i) => (
                          <div
                            key={i}
                            className="flex justify-between rounded-none bg-gray-50 p-2"
                          >
                            <span className="text-gray-600">
                              {m.title} —{' '}
                              {new Date(m.dueAt).toLocaleDateString()}
                            </span>
                            <span className="font-medium">
                              ₹{(m.amount || 0).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Payout Split - Only for Clan Applications */}
                {application.applicantType === 'clan' &&
                  application.payoutSplit &&
                  application.payoutSplit.length > 0 && (
                    <div className="mb-2">
                      <h4 className="mb-2 font-semibold">Payout Split</h4>
                      <div className="space-y-1 text-sm">
                        {application.payoutSplit.map((p, i) => (
                          <div
                            key={i}
                            className="flex justify-between rounded-none bg-gray-50 p-2"
                          >
                            <span className="text-gray-600">
                              Member ID: {p.memberId?.slice(0, 8)}…
                            </span>
                            <span className="font-medium">
                              {p.percentage
                                ? `${p.percentage}%`
                                : `₹${(p.fixedAmount || 0).toLocaleString()}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Portfolio */}
                {application.portfolio && application.portfolio.length > 0 && (
                  <div className="mb-2">
                    <h4 className="mb-2 font-semibold">Portfolio</h4>
                    <div className="space-y-2">
                      {application.portfolio.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-600 hover:underline"
                        >
                          Portfolio Item {index + 1}: {url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejection Reason */}
                {application.status === 'REJECTED' &&
                  application.rejectionReason && (
                    <div className="mb-2">
                      <h4 className="mb-2 font-semibold text-red-600">
                        Rejection Reason
                      </h4>
                      <p className="rounded-none bg-red-50 p-2 text-gray-700">
                        {application.rejectionReason}
                      </p>
                    </div>
                  )}

                {/* Actions */}
                {application.status === 'PENDING' && (
                  <div className="flex items-center justify-end space-x-2">
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

                {/* Status Display for Processed Applications */}
                {application.status !== 'PENDING' && (
                  <div className="flex items-center justify-end space-x-2">
                    <div className="text-sm text-gray-600">
                      {application.status === 'APPROVED' &&
                        '✅ Application Approved'}
                      {application.status === 'REJECTED' &&
                        '❌ Application Rejected'}
                      {application.status === 'WITHDRAWN' &&
                        '↩️ Application Withdrawn'}
                    </div>
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-2">
                  <Link
                    href={`/gig/${application.gigId}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Gig Details →
                  </Link>
                  <Link
                    href={`/gig/${application.gigId}/applications`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Manage All Applications →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-glass p-2 text-center">
            <div className="mb-2 text-6xl">📨</div>
            <h3 className="mb-2 text-xl font-semibold">No Applications</h3>
            <p className="mb-2 text-gray-600">
              {filter === 'ALL'
                ? 'No applications received yet.'
                : `No ${String(filter || '').toLowerCase()} applications found.`}
            </p>
            <Link href="/my-gigs" className="btn-primary">
              View My Gigs
            </Link>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-md rounded-none bg-white p-2">
              <h2 className="mb-2 text-xl font-bold">Reject Application</h2>
              <p className="mb-2 text-gray-600">
                Please provide a reason for rejecting this application:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
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
            <div className="w-full max-w-2xl rounded-none bg-white p-3">
              <h2 className="mb-2 text-xl font-bold">Review Application</h2>
              <p className="mb-2 text-sm text-gray-600">
                Please review the plan before approving.
              </p>

              <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                <div>
                  <h3 className="mb-1 font-semibold">Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quoted Price</span>
                      <span className="font-medium">
                        ₹{approveApplication.quotedPrice.toLocaleString()}
                      </span>
                    </div>
                    {approveApplication.estimatedTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Timeline</span>
                        <span className="font-medium">
                          {approveApplication.estimatedTime}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type</span>
                      <span className="font-medium capitalize">
                        {approveApplication.applicantType}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">Quick Checks</h3>
                  {(() => {
                    const msTotal =
                      approveApplication.milestonePlan?.reduce(
                        (s: number, m: any) => s + (m.amount || 0),
                        0
                      ) || 0;
                    const pctTotal =
                      approveApplication.payoutSplit?.reduce(
                        (s: number, p: any) => s + (p.percentage || 0),
                        0
                      ) || 0;
                    return (
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Milestone Total</span>
                          <span className="font-medium">
                            ₹{msTotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payout % Total</span>
                          <span className="font-medium">{pctTotal}%</span>
                        </div>
                        {msTotal > approveApplication.quotedPrice && (
                          <div className="text-xs text-red-600">
                            Warning: milestones exceed quoted price
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Proposal */}
              <div className="mb-2">
                <h3 className="mb-1 font-semibold">Proposal</h3>
                <p className="whitespace-pre-wrap rounded-none bg-gray-50 p-2 text-sm text-gray-700">
                  {approveApplication.proposal}
                </p>
              </div>

              {/* Portfolio */}
              {approveApplication.portfolio &&
                approveApplication.portfolio.length > 0 && (
                  <div className="mb-2">
                    <h3 className="mb-1 font-semibold">Portfolio</h3>
                    <div className="space-y-1 text-sm">
                      {approveApplication.portfolio.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-600 hover:underline"
                        >
                          Portfolio Item {index + 1}: {url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              {/* Team Plan */}
              {approveApplication.teamPlan &&
                approveApplication.teamPlan.length > 0 && (
                  <div className="mb-2">
                    <h3 className="mb-1 font-semibold">Team Plan</h3>
                    <div className="space-y-1 text-sm">
                      {approveApplication.teamPlan.map((m, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-gray-600">{m.role}</span>
                          <span
                            className="cursor-pointer text-gray-600"
                            onClick={() => {
                              router.push(`/profile/${m.memberId}`);
                            }}
                          >
                            ID: {m.memberId?.slice(0, 8)}… • {m.hours || 0}h
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Milestones */}
              {approveApplication.milestonePlan &&
                approveApplication.milestonePlan.length > 0 && (
                  <div className="mb-2">
                    <h3 className="mb-1 font-semibold">Milestones</h3>
                    <div className="space-y-1 text-sm">
                      {approveApplication.milestonePlan.map((m, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-gray-600">
                            {m.title} — {new Date(m.dueAt).toLocaleDateString()}
                          </span>
                          <span className="font-medium">
                            ₹{(m.amount || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Payout Split */}
              {approveApplication.payoutSplit &&
                approveApplication.payoutSplit.length > 0 && (
                  <div className="mb-2">
                    <h3 className="mb-1 font-semibold">Payout Split</h3>
                    <div className="space-y-1 text-sm">
                      {approveApplication.payoutSplit.map((p, i) => (
                        <div key={i} className="flex justify-between">
                          <span
                            className="cursor-pointer text-gray-600"
                            onClick={() => {
                              router.push(`/profile/${p.memberId}`);
                            }}
                          >
                            Member ID: {p.memberId?.slice(0, 8)}…
                          </span>
                          <span className="font-medium">
                            {p.percentage
                              ? `${p.percentage}%`
                              : `₹${(p.fixedAmount || 0).toLocaleString()}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setApproveApplication(null);
                  }}
                  className="btn-secondary flex-1 px-1 py-1"
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
                  className="btn-primary flex-1 px-1 py-1"
                >
                  {processingApplicationId === approveApplication?.id
                    ? 'Approving…'
                    : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
