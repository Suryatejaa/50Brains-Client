'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClanSearch } from '@/hooks/useClanSearch';
import { useMemberSuggest } from '@/hooks/useMemberSuggest';
import { Submission, SubmissionStatus } from '@/types/gig.types';
import { useMyClans, useClanMembers } from '@/hooks/useClans';
import WorkSubmissionForm from '@/components/gig/WorkSubmissionForm';
import AssignModal from '@/components/gig/AssignModal';
import MiniConfirmDialog from '@/frontend-profile/components/common/MiniConfirmDialog';

interface Gig {
  id: string;
  title: string;
  description: string;
  category: string;
  status:
    | 'DRAFT'
    | 'ACTIVE'
    | 'PAUSED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'SUBMITTED'
    | 'CANCELLED'
    | 'OPEN'
    | 'IN_REVIEW'
    | 'ASSIGNED'
    | 'LOADING';
  budgetType: 'fixed' | 'hourly' | 'negotiable';
  budgetMin: number;
  budgetMax: number;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  assignedToId?: string | null;
  assignedToType?: string | null;
  completedAt?: string | null;
  deliverables: string[];
  duration: string;
  experienceLevel: string;
  isClanAllowed: boolean;
  location: string;
  gigType: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  maxApplications?: number | null;
  platformRequirements: any[];
  postedById: string;
  postedByType: string;
  requirements?: string | null;
  roleRequired: string;
  skillsRequired: string[];
  tags: string[];
  urgency: string;
  applicationCount: number;
  _count: {
    applications: number;
    submissions: number;
  };
  brand?: {
    id: string;
    name: string;
    logo?: string;
    verified: boolean;
  };
  isApplied?: boolean;
}

interface Application {
  coverLetter: string;
  portfolio: { title: string; url: string }[];
  proposedRate?: number;
  estimatedTime?: string;
  applicantType: 'user' | 'clan';
  clanId?: string;
  clanSlug?: string;
  address?: string;
  upiId?: string;
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
}

interface GigDetailClientProps {
  gigId: string;
  initialGigData: Gig;
  userRole: 'brand' | 'influencer' | 'crew' | null;
  isOwner: boolean;
}

export const GigDetailClient: React.FC<GigDetailClientProps> = ({
  gigId,
  initialGigData,
  userRole,
  isOwner: initialIsOwner,
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();

  // Progressive enhancement states
  const [gig, setGig] = useState<Gig>(initialGigData);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [alreadyAppliedMessage, setAlreadyAppliedMessage] = useState<
    string | null
  >(null);
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  const [application, setApplication] = useState<Application>({
    coverLetter: '',
    portfolio: [],
    proposedRate: undefined,
    estimatedTime: '',
    applicantType: 'user',
  });

  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [workSubmission, setWorkSubmission] = useState({
    title: '',
    description: '',
    deliverables: [{ content: '', url: '', file: undefined }],
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    description?: string;
    deliverables?: string;
  }>({});

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAssignDetailsModal, setShowAssignDetailsModal] = useState(false);
  const [selectedUserForAssignment, setSelectedUserForAssignment] =
    useState<any>(null);
  const [assignmentDetails, setAssignmentDetails] = useState({
    quotedPrice: '',
    estimatedTime: '',
    proposal: '',
  });

  const [showUpiModal, setShowUpiModal] = useState(false);
  const [pendingBidId, setPendingBidId] = useState<string | null>(null);
  const [upiId, setUpiId] = useState('');
  const [upiValidationError, setUpiValidationError] = useState('');

  const userType = getUserTypeForRole(currentRole);
  const isOwner =
    initialIsOwner ||
    (isAuthenticated &&
      userType === 'brand' &&
      (gig?.brand?.id === user?.id || gig?.postedById === user?.id));

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'pause' | 'visibility' | 're-open' | null;
    loading: boolean;
    error: string | null;
    actionData?: any;
  }>({
    isOpen: false,
    type: null,
    loading: false,
    error: null,
    actionData: null,
  });

  // Progressive enhancement - handle application form
  useEffect(() => {
    const handleOpenForm = () => {
      setShowApplicationForm(true);
    };

    window.addEventListener('openApplicationForm', handleOpenForm);

    // Enhance SSR apply button
    const ssrApplyBtn = document.getElementById('ssr-apply-btn');
    if (ssrApplyBtn) {
      ssrApplyBtn.onclick = handleOpenForm;
    }

    return () => {
      window.removeEventListener('openApplicationForm', handleOpenForm);
    };
  }, []);

  // Load real data on client-side (progressive enhancement)
  useEffect(() => {
    // Check if we have SSR placeholder data or need to fetch fresh data
    const isSSRPlaceholder = (initialGigData as any)?._isSSRPlaceholder;
    const needsRealData =
      isSSRPlaceholder || initialGigData?.status === 'LOADING';

    if (needsRealData) {
      console.log(
        '🔄 Client: Loading real gig data to replace SSR placeholder'
      );
      loadDynamicData();
    } else {
      console.log('✅ Client: Using SSR data, loading user-specific data only');
      // Still load user-specific data even if we have good SSR data
      if (isAuthenticated && !isOwner) {
        loadMyApplications();
      }
    }
  }, [gigId, isAuthenticated]); // Depend on gigId and auth state

  const loadDynamicData = async () => {
    try {
      setIsLoading(true);

      // Load fresh gig data with user-specific information
      const response = await apiClient.get(`/api/gig/${gigId}`);

      if (response.success && response.data) {
        console.log('✅ Client: Successfully loaded real gig data');
        setGig(response.data as Gig);

        // Load user-specific data
        if (!isOwner) {
          await loadMyApplications();
        }
      }
    } catch (error: any) {
      console.error('❌ Client: Failed to load gig data:', error);

      // Handle 404 - redirect to not found
      if (error.statusCode === 404 || error.status === 404) {
        console.log('🚫 Client: Gig not found, redirecting to marketplace');
        router.push('/marketplace');
        showToast(
          'error',
          'Gig not found. You have been redirected to the marketplace.'
        );
        return;
      }

      // For other errors, show error state but don't crash
      showToast('error', 'Failed to load gig data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMyApplications = async () => {
    if (!gigId || !user?.id) return;

    try {
      setApplicationsLoading(true);
      const response = await apiClient.get(`/api/my/${gigId}/applications`);

      if (response.success && response.data) {
        const responseData = response.data as any;
        const formatMyApplications = responseData.applicationStatus;
        const applicantType = responseData.application?.applicantType;
        const applicationId = responseData.application?.id;
        const applicationData = responseData.application;

        const applicationWithType = {
          ...formatMyApplications,
          quotedPrice: applicationData?.quotedPrice,
          estimatedTime: applicationData?.estimatedTime,
          proposal: applicationData?.proposal,
          applicantType: applicantType,
          applicationId: applicationId,
        };

        setMyApplications(applicationWithType);
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const showToast = (
    type: 'success' | 'error' | 'warning',
    message: string
  ) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!user) {
      showToast(
        'error',
        'User information not available. Please refresh and try again.'
      );
      return;
    }

    try {
      setIsApplying(true);

      if (!application.coverLetter.trim()) {
        showToast('warning', 'Please enter a cover letter');
        return;
      }

      if (!application.estimatedTime) {
        showToast('warning', 'Please select an estimated time to complete');
        return;
      }

      if (!gigId || typeof gigId !== 'string' || gigId.length < 10) {
        showToast(
          'error',
          'Invalid gig ID. Please refresh the page and try again.'
        );
        return;
      }

      const portfolioUrls = application.portfolio
        .map((item) => item.url)
        .filter((url) => url.trim());

      let applicationData: any = {
        proposal: application.coverLetter.trim(),
        portfolio: portfolioUrls,
        quotedPrice: application.proposedRate || 0,
        upiId: application.upiId?.trim() || undefined,
        estimatedTime: application.estimatedTime,
        applicantType: application.applicantType,
        address: application.address?.trim() || undefined,
      };

      const response = await apiClient.post(
        `/api/gig/${gigId}/apply`,
        applicationData
      );

      if (response.success) {
        await loadDynamicData();
        setShowApplicationForm(false);
        setApplication({
          coverLetter: '',
          portfolio: [],
          proposedRate: undefined,
          estimatedTime: '',
          applicantType: 'user',
        });

        showToast(
          'success',
          'Application submitted successfully! The brand will review your application soon.'
        );

        if (application.applicantType === 'clan' && application.clanId) {
          router.push(
            `/clan/${application.clanId}/gig-workflow?gigId=${gigId}&tab=tasks`
          );
        } else {
          window.location.reload();
        }
      }
    } catch (error: any) {
      console.error('Failed to apply to gig:', error);

      let userMessage = 'Failed to submit application. Please try again.';

      if (error.error) {
        userMessage = error.error;
      } else if (error.message) {
        userMessage = error.message;
      }

      if (String(userMessage).toLowerCase().includes('already applied')) {
        userMessage =
          'You have already applied to this gig. Check your applications in the "My Applications" section.';
        setAlreadyAppliedMessage('You have already applied to this gig');
        showToast('warning', userMessage);
        await loadDynamicData();
      } else {
        showToast('error', userMessage);
      }
    } finally {
      setIsApplying(false);
    }
  };

  const goBack = () => {
    const sessionReferrer = sessionStorage.getItem(`gig-${gigId}-referrer`);

    if (sessionReferrer && sessionReferrer !== window.location.href) {
      sessionStorage.removeItem(`gig-${gigId}-referrer`);
      window.location.href = sessionReferrer;
      return;
    }

    if (isOwner) {
      router.push('/my-gigs');
    } else if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/marketplace');
    }
  };

  const canApply =
    isAuthenticated &&
    !gig.isApplied &&
    (gig.status === 'OPEN' || gig.status === 'ASSIGNED') &&
    (!gig.maxApplications || gig.applicationCount < gig.maxApplications);

  const myApplicationStatus = (myApplications as any)?.status || null;

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 rounded p-4 shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-yellow-500 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Enhanced Application Status - Progressive (only show if SSR doesn't have good data) */}
      <div className="hidden" id="application-status-enhanced">
        {(gig.isApplied || alreadyAppliedMessage) && !isOwner && (
          <div className="mb-2 lg:col-span-3">
            <div className="flex items-center justify-between rounded border border-green-200 bg-green-50 p-2">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">✅</div>
                <div>
                  <p className="font-semibold text-green-800">
                    Application {myApplicationStatus || 'Submitted'}
                  </p>
                  <p className="text-sm text-green-600">
                    {alreadyAppliedMessage ||
                      'You have already applied to this gig.'}
                  </p>
                </div>
              </div>
              <Link
                href="/my/applications"
                className="cursor-pointer p-2 text-sm text-blue-600 hover:underline"
              >
                View
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Sidebar - Progressive (replaces SSR sidebar when client loads) */}
      <div className="hidden" id="sidebar-enhanced">
        <div className="space-y-2">
          <div className="card-glass p-3">
            <h3 className="mb-4 text-lg font-semibold">Application Status</h3>

            {!isAuthenticated ? (
              <div className="text-center">
                <p className="mb-4 text-gray-600">
                  Sign in to apply for this gig
                </p>
                <Link href="/login" className="btn-primary w-full">
                  Sign In
                </Link>
              </div>
            ) : isOwner ? (
              <div className="text-center">
                <div className="mb-2 text-4xl">📝</div>
                <p className="mb-2 font-semibold text-gray-600">
                  Gig is {gig.status}
                </p>
                <p className="mb-4 text-sm text-gray-600">
                  This gig is actively accepting applications, current{' '}
                  <span
                    className="cursor-pointer font-semibold underline"
                    onClick={() =>
                      gigId && router.push(`/gig/${gigId}/applications`)
                    }
                  >
                    application
                  </span>{' '}
                  count is {gig.applicationCount}
                </p>
                <div className="mt-3 flex gap-2">
                  <Link
                    href={gigId ? `/gig/${gigId}/applications` : '#'}
                    className="btn-secondary flex-1"
                  >
                    View Applications
                  </Link>
                  <Link
                    href={gigId ? `/gig/${gigId}/submissions` : '#'}
                    className="btn-secondary flex-1"
                  >
                    View Submissions
                  </Link>
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => {
                      if (gig?.gigType === 'PRODUCT') {
                        showToast(
                          'error',
                          'Assignment is only available for Visit or Remote gigs, not Product gigs'
                        );
                        return;
                      }
                      setShowAssignModal(true);
                    }}
                    className={`btn-primary w-full ${
                      gig?.gigType === 'PRODUCT'
                        ? 'cursor-not-allowed opacity-50'
                        : ''
                    }`}
                    disabled={gig?.gigType === 'PRODUCT'}
                  >
                    {gig?.gigType === 'PRODUCT'
                      ? 'Assignment not allowed for Product Gigs'
                      : 'Assign User'}
                  </button>
                </div>
              </div>
            ) : isOwner && gig.status === 'DRAFT' ? (
              <div className="text-center">
                <div className="mb-2 text-4xl">📝</div>
                <p className="mb-2 font-semibold text-gray-600">Draft Mode</p>
                <p className="mb-4 text-sm text-gray-600">
                  {isOwner
                    ? 'Complete and publish this gig to start accepting applications'
                    : 'This gig is not yet published and not accepting applications'}
                </p>
                {isOwner && (
                  <button
                    onClick={() =>
                      router.push(`/gig/${gigId}/edit?publish=true`)
                    }
                    className="btn-primary w-full"
                  >
                    Complete & Publish
                  </button>
                )}
              </div>
            ) : applicationsLoading && !isOwner ? (
              <div className="text-center">
                <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                <p className="text-sm text-gray-600">
                  Loading application status...
                </p>
              </div>
            ) : (myApplications as any)?.status === 'APPROVED' &&
              (myApplications as any)?.gigId === gigId &&
              gigId &&
              !isOwner ? (
              <div className="text-center">
                <div className="mb-2 text-4xl">✅</div>
                <p className="mb-2 font-semibold text-green-600">
                  Application {myApplicationStatus}
                </p>
                <p className="mb-4 text-sm text-gray-600">
                  Your application has been approved, submit your work.
                </p>
                <button
                  onClick={() => setShowSubmissionForm(true)}
                  className="btn-primary w-full"
                >
                  Submit Work
                </button>
              </div>
            ) : !isOwner &&
              (myApplications as any)?.status === 'PENDING' &&
              (myApplications as any)?.gigId === gigId &&
              (myApplications as any)?.applicantType === 'owner' &&
              gigId &&
              !isOwner ? (
              <div className="text-center">
                <div className="mb-2 text-4xl">📄</div>
                <p className="mb-2 font-semibold text-gray-600">
                  You have been assigned to this gig
                </p>
                <p className="mb-4 text-sm text-gray-600">
                  Accept or reject the assignment in your applications
                </p>
                <div className="mb-4 flex flex-col items-start rounded-xl border border-blue-400 bg-blue-50 p-4">
                  <div className="space-y-2 text-left">
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-600">
                        Bid amount:
                      </span>{' '}
                      ₹{(myApplications as any)?.quotedPrice || 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-600">
                        Estimated time:
                      </span>{' '}
                      {(myApplications as any)?.estimatedTime ||
                        'Not specified'}
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="mb-1 font-semibold text-gray-600">
                        Proposal:
                      </div>
                      <div className="break-words leading-relaxed text-gray-700">
                        {(myApplications as any)?.proposal ||
                          'No proposal provided'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <button
                    className="btn-primary"
                    onClick={() => router.push('/my/applications')}
                  >
                    Accept
                  </button>
                  <button
                    className="btn-secondary text-red-600 hover:bg-red-50"
                    onClick={() => router.push('/my/applications')}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ) : (myApplications as any)?.status === 'PENDING' &&
              (myApplications as any)?.gigId === gigId &&
              gigId ? (
              <div className="text-center">
                <div className="mb-2 text-4xl">↻</div>
                <p className="mb-2 font-semibold text-yellow-600">
                  Application Pending
                </p>
                <p className="mb-4 text-sm text-gray-600">
                  Your application is pending
                </p>
                <Link href="/my/applications" className="btn-secondary w-full">
                  View My Applications
                </Link>
              </div>
            ) : (myApplications as any)?.status === 'SUBMITTED' &&
              (myApplications as any)?.gigId === gigId &&
              gigId &&
              !isOwner ? (
              <div className="text-center">
                <div className="mb-2 text-4xl">📄</div>
                <p className="mb-2 font-semibold text-gray-600">
                  Application Submitted
                </p>
                <p className="mb-4 text-sm text-gray-600">
                  Your application has been submitted
                </p>
                <Link href="/my/applications" className="btn-secondary w-full">
                  View My Applications
                </Link>
              </div>
            ) : (myApplications as any)?.status === 'REJECTED' &&
              (myApplications as any)?.gigId === gigId &&
              gigId &&
              !isOwner ? (
              <div className="text-center">
                <div className="mb-2 text-4xl">❌</div>
                <p className="mb-2 font-semibold text-red-600">
                  {(myApplications as any)?.applicantType === 'owner'
                    ? 'You declined the assignment'
                    : 'Your application was rejected'}
                </p>
                <p className="mb-4 text-sm text-gray-600">
                  Application raised by{' '}
                  {(myApplications as any)?.applicantType === 'owner'
                    ? 'the brand'
                    : 'you'}
                </p>
                <Link href="/my/applications" className="btn-secondary w-full">
                  View My Applications
                </Link>
              </div>
            ) : myApplicationStatus === 'CLOSED' &&
              (myApplications as any)?.gigId === gigId &&
              gigId &&
              !isOwner ? (
              <div className="text-center">
                <div className="mb-2 text-4xl">🎉</div>
                <p className="mb-2 font-semibold text-gray-600">
                  Congratulations! The gig was completed
                </p>
                <p className="mb-4 text-sm text-gray-600">
                  Thank you for being part of this campaign.
                </p>
                <Link href="/my/applications" className="btn-secondary w-full">
                  View My Applications
                </Link>
              </div>
            ) : !isOwner && !canApply ? (
              <div className="text-center">
                <div className="mb-2 text-4xl">⚠️</div>
                <p className="mb-2 font-semibold text-yellow-600">
                  Cannot Apply
                </p>
                <p className="mb-4 text-sm text-gray-600">
                  {gig.status !== 'OPEN'
                    ? 'This gig is no longer active'
                    : 'Application limit reached'}
                </p>
              </div>
            ) : (
              !isOwner && (
                <div className="text-center">
                  {showApplicationForm ? (
                    <button
                      onClick={() => setShowApplicationForm(false)}
                      className="btn-secondary w-full"
                    >
                      Cancel Application
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowApplicationForm(true)}
                      className="btn-primary w-full"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              )
            )}

            {/* Owner management options */}
            {isOwner && (
              <div className="mt-4">
                {(gig.status === 'OPEN' || gig.status === 'ASSIGNED') && (
                  <button className="btn-secondary mt-2 w-full">
                    Pause Gig
                  </button>
                )}
                {(gig.status === 'PAUSED' || gig.status === 'IN_REVIEW') && (
                  <button className="btn-secondary mt-2 w-full">
                    Reopen Gig
                  </button>
                )}
                <button className="btn-secondary mt-2 w-full">
                  Make Gig {gig.isPublic ? 'Private' : 'Public'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
            <h2 className="mb-4 text-2xl font-bold">Apply for this Gig</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Cover Letter *
                </label>
                <textarea
                  value={application.coverLetter}
                  onChange={(e) =>
                    setApplication((prev) => ({
                      ...prev,
                      coverLetter: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell the brand why you're perfect for this gig..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Estimated Time *
                </label>
                <select
                  value={application.estimatedTime}
                  onChange={(e) =>
                    setApplication((prev) => ({
                      ...prev,
                      estimatedTime: e.target.value,
                    }))
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select timeline</option>
                  <option value="1-3 days">1-3 days</option>
                  <option value="1 week">1 week</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="1 month">1 month</option>
                  <option value="2+ months">2+ months</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Proposed Rate (₹)
                </label>
                <input
                  type="number"
                  value={application.proposedRate || ''}
                  onChange={(e) =>
                    setApplication((prev) => ({
                      ...prev,
                      proposedRate: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your rate"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowApplicationForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={
                    isApplying ||
                    !application.coverLetter.trim() ||
                    !application.estimatedTime
                  }
                  className="btn-primary flex-1"
                >
                  {isApplying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Features */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Progressive enhancement - replace SSR sidebar with enhanced client version
            window.addEventListener('load', function() {
              setTimeout(function() {
                // Hide the SSR sidebar and show enhanced version
                const ssrSidebar = document.querySelector('.space-y-2:has(.card-glass)');
                const enhancedSidebar = document.getElementById('sidebar-enhanced');
                
                if (ssrSidebar && enhancedSidebar) {
                  // Replace SSR sidebar with enhanced version
                  ssrSidebar.style.display = 'none';
                  enhancedSidebar.classList.remove('hidden');
                  enhancedSidebar.style.display = 'block';
                }
                
                // Show enhanced application status if it exists
                const enhancedStatus = document.getElementById('application-status-enhanced');
                if (enhancedStatus) {
                  enhancedStatus.classList.remove('hidden');
                }
              }, 100);
            });
          `,
        }}
      />
    </>
  );
};

export default GigDetailClient;
