'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { GigAPI } from '@/lib/gig-api';
import { useClanSearch } from '@/hooks/useClanSearch';
import { useMemberSuggest } from '@/hooks/useMemberSuggest';
import { Submission, SubmissionStatus } from '@/types/gig.types';
import { useMyClans, useClanMembers } from '@/hooks/useClans';
import WorkSubmissionForm from '@/components/gig/WorkSubmissionForm';
import AssignModal from '@/components/gig/AssignModal';
import { FaBullseye, FaAccessibleIcon } from 'react-icons/fa';
import { m } from 'framer-motion';
import MiniConfirmDialog from '@/frontend-profile/components/common/MiniConfirmDialog';
import { GigDetailLoadingSkeleton } from '@/components/gig/ssr/GigDetailSkeleton';
import { GuidelinesModal } from '@/components/modals/GuidelinesModal';
import { useGuidelinesModal } from '@/hooks/useGuidelinesModal';
import { GigChat } from '@/components/chat/GigChat';
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
    | 'ASSIGNED';
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

  // Brand info (optional - might be populated via join)
  brand?: {
    id: string;
    name: string;
    logo?: string;
    verified: boolean;
  };

  // Application info (for influencer view)
  isApplied?: boolean;
}

interface Application {
  coverLetter: string;
  portfolio: { title: string; url: string }[];
  proposedRate?: number;
  estimatedTime?: string;
  applicantType: 'user' | 'clan';
  // Clan-only fields
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

interface WorkSubmission {
  title: string;
  description: string;
  deliverables: Array<{
    content?: string;
    url?: string;
    file?: File;
  }>;
  notes?: string;
}

export default function GigDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();
  const { isOpen, guidelinesType, openGuidelines, closeGuidelines } =
    useGuidelinesModal();
  const [gig, setGig] = useState<Gig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
  const [gigId, setGigId] = useState<string | null>(null);
  const [workSubmission, setWorkSubmission] = useState<WorkSubmission>({
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
  const [isGigIdLoading, setIsGigIdLoading] = useState(true);
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
  const [agreed, setAgreed] = useState(false);
  const userType = getUserTypeForRole(currentRole);

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
  const openDialog = (
    type: 'pause' | 'visibility' | 're-open',
    actionData?: any
  ) => {
    setConfirmDialog({
      isOpen: true,
      type,
      loading: false,
      error: null,
      actionData,
    });
  };

  const closeDialog = () => {
    if (!confirmDialog.loading) {
      setConfirmDialog({
        isOpen: false,
        type: null,
        loading: false,
        error: null,
        actionData: null,
      });
    }
  };

  // Get dialog configuration for different gig actions
  const getDialogType = ():
    | 'logout'
    | 'deactivate'
    | 'delete'
    | 'pause'
    | 'resume'
    | 'publish'
    | 'unpublish'
    | 'cancel'
    | 'close'
    | 'save'
    | 'submit'
    | 'confirm'
    | 'archive'
    | 'restore'
    | 'block'
    | 'unblock' => {
    switch (confirmDialog.type) {
      case 'pause':
        return 'pause'; // Uses pause-specific styling and messaging
      case 're-open':
        return 'resume'; // Uses resume-specific styling and messaging
      case 'visibility':
        return confirmDialog.actionData?.newVisibility
          ? 'publish'
          : 'unpublish'; // Uses publish/unpublish based on action
      default:
        return 'confirm';
    }
  };

  const handleConfirmAction = async () => {
    setConfirmDialog((prev) => ({ ...prev, loading: true, error: null }));

    try {
      let success = false;
      let successMessage = '';

      switch (confirmDialog.type) {
        case 'pause':
          await changeGigStatus('PAUSED');
          success = true;
          successMessage = 'Gig paused successfully';
          break;
        case 'visibility':
          const newVisibility =
            confirmDialog.actionData?.newVisibility ?? !gig?.isPublic;
          await changeGigVisibility(newVisibility);
          success = true;
          successMessage = `Gig is now ${newVisibility ? 'public' : 'private'}`;
          break;
        case 're-open':
          await changeGigStatus('OPEN');
          success = true;
          successMessage = 'Gig reopened successfully';
          break;
      }

      // console.log(`result of ${confirmDialog.type}:`, success);
      if (success) {
        closeDialog();
        showToast('success', successMessage);
      } else {
        setConfirmDialog((prev) => ({
          ...prev,
          loading: false,
          error: `Failed to ${confirmDialog.type} gig. Please try again.`,
        }));
      }
    } catch (error: any) {
      console.error(`Failed to ${confirmDialog.type} gig:`, error);
      console.log('🔍 Error object structure:', {
        message: error?.message,
        error: error?.error,
        statusCode: error?.statusCode,
        status: error?.status,
        details: error?.details,
        fullError: error,
      });

      // Extract error message from various possible structures
      const errorMessage =
        error?.error ||
        error?.message ||
        error?.data?.message ||
        error?.response?.data?.message ||
        `Failed to ${confirmDialog.type} gig. Please try again.`;

      console.log('📝 Final error message to display:', errorMessage);
      setConfirmDialog((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  // Extract gigId from params with debugging and fallback
  useEffect(() => {
    //console.log(('🔍 === GIG ID DEBUG ===');
    //console.log(('📱 Params object:', params);
    //console.log(('🆔 Params.id:', params.id);
    //console.log(('🔗 Current URL:', window.location.href);
    //console.log(('📍 Pathname:', window.location.pathname);

    if (params.id && params.id !== 'undefined') {
      const extractedId = params.id as string;
      //console.log(('✅ Extracted gigId from params:', extractedId);
      setGigId(extractedId);
    } else {
      //console.log(('❌ No valid gigId found in params');
      // Try to extract from URL pathname as fallback
      const pathParts = window.location.pathname.split('/');
      const urlId = pathParts[2]; // /gig/[id]/...
      if (urlId && urlId !== 'undefined' && urlId !== 'gig') {
        //console.log(('🔄 Fallback: extracted from URL pathname:', urlId);
        setGigId(urlId);
      } else {
        //console.log(('❌ Fallback also failed, no valid ID found');
      }
    }
    setIsGigIdLoading(false);
    //console.log(('================================');
  }, [params]);

  const withdrawApplication = async (applicationId: string) => {
    try {
      const response = await apiClient.delete(
        `/api/gig/applications/${applicationId}`
      );
      if (response.success) {
        await window.location.reload(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to withdraw application:', error);
    }
  };

  // Show toast notification
  const showToast = (
    type: 'success' | 'error' | 'warning',
    message: string
  ) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000); // Auto-hide after 5 seconds
  };

  // Handle work submission
  const handleSubmitWork = async () => {
    if (!gigId || !user?.id) {
      showToast('error', 'Missing required data');
      return;
    }

    // Reset validation errors
    setValidationErrors({});
    let hasErrors = false;
    const errors: {
      title?: string;
      description?: string;
      deliverables?: string;
    } = {};

    // Validate form
    if (!workSubmission.title.trim()) {
      errors.title = 'Title is required';
      hasErrors = true;
    }
    if (!workSubmission.description.trim()) {
      errors.description = 'Description is required';
      hasErrors = true;
    }
    if (
      !workSubmission.deliverables.length ||
      !workSubmission.deliverables.some((d) => d.content || d.url || d.file)
    ) {
      errors.deliverables =
        'At least one deliverable with content, URL, or file is required';
      hasErrors = true;
    }

    if (hasErrors) {
      setValidationErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await apiClient.post(
        `/api/gig/${gigId}/submit`,
        workSubmission
      );

      if (response.success) {
        showToast(
          'success',
          'Work submitted successfully! The brand will review your submission.'
        );
        setShowSubmissionForm(false);
        loadGigDetails(true); // Refresh gig data
      } else {
        const errorMessage =
          typeof response === 'object' &&
          response !== null &&
          'message' in response
            ? String(response.message)
            : 'Failed to submit work';
        showToast('error', errorMessage);
      }
    } catch (error: any) {
      console.error('Error submitting work:', error);
      showToast('error', error.message || 'Failed to submit work');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle submission success
  const handleSubmissionSuccess = () => {
    setShowSubmissionForm(false);
    showToast(
      'success',
      'Work submitted successfully! The brand will review your submission.'
    );
    loadGigDetails(true); // Refresh gig data
  };

  const handleAcceptAssignment = async (bidId: string) => {
    //console.log(('Accepting assignment for bidId:', bidId);
    // Show UPI modal first to collect payment details
    setPendingBidId(bidId);
    setUpiId('');
    setUpiValidationError('');
    setShowUpiModal(true);
  };

  // Enhanced UPI validation function
  const validateUpiId = (upiIdValue: string): string | null => {
    const trimmedUpi = upiIdValue.trim();

    if (!trimmedUpi) {
      return 'UPI ID is required';
    }

    if (trimmedUpi.length < 3) {
      return 'UPI ID is too short';
    }

    if (trimmedUpi.length > 50) {
      return 'UPI ID is too long (max 50 characters)';
    }

    // Enhanced regex for better UPI validation
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    if (!upiRegex.test(trimmedUpi)) {
      return 'Invalid UPI ID format. Use format: username@bankname (e.g., john@paytm, user123@phonepe)';
    }

    // Check for valid UPI provider patterns
    const validProviders = [
      'paytm',
      'phonepe',
      'gpay',
      'googlepay',
      'amazon',
      'amazonpay',
      'bharatpe',
      'mobikwik',
      'freecharge',
      'jiomoney',
      'airtel',
      'sbi',
      'icici',
      'hdfc',
      'axis',
      'kotak',
      'pnb',
      'bob',
      'canara',
      'union',
      'indusind',
      'yes',
      'idbi',
      'syndicate',
      'allahabad',
      'okaxis',
      'okhdfcbank',
      'okicici',
      'oksbi',
      'ibl',
      'ybl',
      'axl',
      'waaxis',
      'wahdfcbank',
      'waicici',
      'wasbi',
      'jupiteraxis',
    ];

    const domain = trimmedUpi.split('@')[1]?.toLowerCase();
    if (!domain) {
      return 'Invalid UPI ID: Missing provider after @ symbol';
    }

    // Check if domain contains known UPI provider or follows bank domain pattern
    const hasValidProvider = validProviders.some(
      (provider) => domain.includes(provider) || domain.endsWith('.ifsc.npci')
    );

    if (
      !hasValidProvider &&
      !domain.includes('bank') &&
      !domain.includes('upi')
    ) {
      return 'Please enter a valid UPI ID from a recognized provider (e.g., @paytm, @phonepe, @sbi, etc.)';
    }

    // Check for invalid characters
    if (trimmedUpi.includes(' ')) {
      return 'UPI ID cannot contain spaces';
    }

    if (trimmedUpi.startsWith('@') || trimmedUpi.endsWith('@')) {
      return 'UPI ID cannot start or end with @ symbol';
    }

    if ((trimmedUpi.match(/@/g) || []).length !== 1) {
      return 'UPI ID must contain exactly one @ symbol';
    }

    return null; // Valid UPI ID
  };

  const handleUpiSubmit = async () => {
    if (!pendingBidId) return;

    // Validate UPI ID format
    const validationError = validateUpiId(upiId);
    if (validationError) {
      setUpiValidationError(validationError);
      return;
    }

    try {
      const response = await apiClient.post(
        `/api/gig/applications/${pendingBidId}/accept-invitation`,
        { upiId: upiId.trim(), agreedToTerms: true }
      );
      if (response.success) {
        showToast('success', 'Assignment accepted successfully!');
        setShowUpiModal(false);
        setPendingBidId(null);
        setUpiId('');
        // Refresh bids and stats
        await loadGigDetails(true);
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Failed to accept assignment:', error);
      showToast('error', error.message || 'Failed to accept assignment');
    }
  };

  const handleReject = async (bidId: string) => {
    try {
      const response = await apiClient.post(
        `/api/gig/applications/${bidId}/reject-invitation`
      );
      if (response.success) {
        // Refresh bids and stats
        await loadGigDetails(true);
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to reject bid:', error);
    }
  };
  // Handle user assignment - show mini modal for assignment details
  const handleAssignUser = (selectedUser: any) => {
    if (!gigId || !selectedUser?.id) {
      showToast('error', 'Missing required data for assignment');
      return;
    }

    // Check if gig type allows assignment
    if (gig?.gigType === 'PRODUCT') {
      showToast(
        'error',
        'Assignment is only available for Visit or Remote gigs, not Product gigs'
      );
      return;
    }

    // Store selected user and show assignment details modal
    setSelectedUserForAssignment(selectedUser);
    setAssignmentDetails({
      quotedPrice: gig?.budgetMin?.toString() || '',
      estimatedTime: '',
      proposal: `We'd love to have you work on this project. Your portfolio matches perfectly with our requirements.`,
    });
    setShowAssignDetailsModal(true);
  };

  // Handle final assignment with details
  const handleFinalAssignment = async () => {
    if (!selectedUserForAssignment || !gigId) {
      showToast('error', 'Missing required data for assignment');
      return;
    }

    if (
      !assignmentDetails.quotedPrice ||
      !assignmentDetails.estimatedTime ||
      !assignmentDetails.proposal.trim()
    ) {
      showToast('error', 'Please fill in all assignment details');
      return;
    }

    try {
      const response = await apiClient.post(`/api/gig/${gigId}/assign`, {
        applicantId: selectedUserForAssignment.id,
        applicantType: 'owner',
        proposal: assignmentDetails.proposal.trim(),
        quotedPrice: Number(assignmentDetails.quotedPrice),
        estimatedTime: assignmentDetails.estimatedTime,
      });

      if (response.success) {
        showToast(
          'success',
          `Successfully assigned ${selectedUserForAssignment.firstName || selectedUserForAssignment.username} to this gig`
        );
        setShowAssignDetailsModal(false);
        setShowAssignModal(false);
        setSelectedUserForAssignment(null);
        loadGigDetails(true); // Refresh gig data
      } else if (response && response.success === false) {
        console.error('Assignment failed:', response);
        showToast('error', response.message || 'Failed to assign user');
      }
    } catch (error: any) {
      console.error('Error assigning user:', error);
      showToast('error', error.message || 'Failed to assign user');
    }
  };

  // Helper function to navigate back intelligently
  const goBack = () => {
    // Use the gig-specific session referrer for navigation, but keep the original referrer for logic if needed
    const lastPageReferrer =
      sessionStorage.getItem('lastPage') || document.referrer;
    const currentUrl = window.location.href;
    const sessionReferrer = gigId
      ? sessionStorage.getItem(`gig-${gigId}-referrer`)
      : null;

    // //console.log(('🔙 goBack debug:', {
    //   lastPageReferrer,
    //   sessionReferrer,
    //   currentUrl,
    //   gigId,
    // });

    // Always use session referrer if present and not current page
    if (sessionReferrer && sessionReferrer !== currentUrl) {
      //console.log(('🔙 [goBack] Using session referrer:', sessionReferrer);
      if (gigId) {
        sessionStorage.removeItem(`gig-${gigId}-referrer`);
      }
      window.location.href = sessionReferrer;
      return;
    }

    // Check if user came from edit page - skip back to original source
    if (
      gigId &&
      lastPageReferrer &&
      lastPageReferrer.includes(`/gig/${gigId}/edit`)
    ) {
      // User came from edit page, try to get the original referrer
      const originalReferrer = sessionStorage.getItem(`gig-${gigId}-referrer`);

      if (originalReferrer && originalReferrer !== currentUrl) {
        //console.log(('🔙 Going back to original referrer:', originalReferrer);
        window.location.href = originalReferrer;
        return;
      } else {
        // No original referrer stored, go to my-gigs if user is brand owner
        if (isOwner) {
          //console.log(('🔙 Going to my-gigs (owner, no original referrer)');
          router.push('/my-gigs');
          return;
        }
      }
    }

    // Check if user came from my-gigs page
    if (lastPageReferrer && lastPageReferrer.includes('/my-gigs')) {
      //console.log(('🔙 Going back to my-gigs');
      router.push('/my-gigs');
      return;
    }

    // Check if user came from another gig page (common when browsing gigs)
    if (
      gigId &&
      lastPageReferrer &&
      lastPageReferrer.includes('/gig/') &&
      !lastPageReferrer.includes(`/gig/${gigId}`)
    ) {
      // User came from another gig, try to go to my-gigs if they're the owner
      if (isOwner) {
        //console.log(('🔙 Going to my-gigs (came from other gig, is owner)');
        router.push('/my-gigs');
        return;
      }
    }

    // Check if user came from dashboard
    if (lastPageReferrer && lastPageReferrer.includes('/dashboard')) {
      // If they're viewing their own gig, take them to my-gigs instead of dashboard
      if (isOwner) {
        //console.log(('🔙 Going to my-gigs (came from dashboard, is owner)');
        router.push('/my-gigs');
        return;
      } else {
        //console.log(('🔙 Going back to dashboard');
        router.push('/dashboard');
        return;
      }
    }

    // Default cases based on user type and ownership
    if (isOwner) {
      // If user owns this gig, they probably want to go to my-gigs
      //console.log(('🔙 Going to my-gigs (default for owner)');
      router.push('/my-gigs');
    } else if (window.history.length > 1) {
      // For non-owners, try normal back navigation
      //console.log(('🔙 Using browser back');
      router.back();
    } else {
      // Fallback to marketplace for non-owners
      //console.log(('🔙 Going to marketplace (fallback)');
      router.push('/marketplace');
    }
  };

  useEffect(() => {
    if (gigId) {
      // Store the original referrer if this is the first visit to this gig (not from edit page)
      const referrer = sessionStorage.getItem('lastPage') || document.referrer;
      const currentReferrer = sessionStorage.getItem(`gig-${gigId}-referrer`);

      // //console.log(('📍 useEffect storing referrer debug:', {
      //   referrer,
      //   currentReferrer,
      //   gigId,
      //   isEditPage: gigId ? referrer?.includes(`/gig/${gigId}/edit`) : false,
      // });

      // Only store referrer if:
      // 1. No referrer is already stored
      // 2. The referrer is not the edit page for this gig
      // 3. The referrer is not another gig page (to avoid gig-hopping confusion)
      // 4. The referrer is a meaningful source page
      if (
        !currentReferrer &&
        referrer &&
        gigId &&
        !referrer.includes(`/gig/${gigId}/edit`) &&
        !referrer.includes('/gig/') && // Don't store other gig pages
        (referrer.includes('/my-gigs') ||
          referrer.includes('/dashboard') ||
          referrer.includes('/marketplace') ||
          referrer.includes('/search'))
      ) {
        //console.log(('📍 [useEffect] Storing referrer:', referrer);
        sessionStorage.setItem(`gig-${gigId}-referrer`, referrer);
      }

      loadGigDetails();
    }
  }, [gigId]);

  // Refresh data when the page becomes visible (user returns from edit)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && gigId) {
        //console.log(('↻ Page became visible, refreshing gig data');
        loadGigDetails(true); // Force refresh when page becomes visible
      }
    };

    const handleFocus = () => {
      if (gigId) {
        //console.log(('↻ Window focused, refreshing gig data');
        loadGigDetails(true); // Force refresh when window is focused
      }
    };

    const handleUnload = () => {
      // Clean up session storage on page unload
      if (gigId) {
        sessionStorage.removeItem(`gig-${gigId}-referrer`);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [gigId]);

  const isOwner =
    isAuthenticated &&
    userType === 'brand' &&
    (gig?.brand?.id === user?.id || gig?.postedById === user?.id);
  console.log('🔍 Is owner:', isOwner);

  const loadMyApplications = async () => {
    if (!gigId || !user?.id || isOwner) {
      //console.log(('⚠️ Skipping application load - missing gigId or userId or isOwner');
      return;
    }

    try {
      setApplicationsLoading(true);
      const response = await apiClient.get(`/api/my/${gigId}/applications`);
      // console.log('🎯 Loaded my applications:', response);
      if (response.success && response.data) {
        const formatMyApplications = (response.data as any).applicationStatus;
        const applicantType = (response.data as any).application?.applicantType;
        const applicationId = (response.data as any).application?.id;
        const applicationData = (response.data as any).application;
        // console.log('🎯 Application data:', applicationData);
        // Add applicantType to the application status object
        const applicationWithType = {
          ...formatMyApplications,
          quotedPrice: applicationData.quotedPrice,
          estimatedTime: applicationData.estimatedTime,
          proposal: applicationData.proposal,
          applicantType: applicantType,
          applicationId: applicationId,
        };
        // console.log('🎯 Formatted my applications:', applicationWithType);
        setMyApplications(applicationWithType);
      }
    } catch (error) {
      console.error('❌ Failed to load applications:', error);
      // Don't set error state here, just log it
      // Applications are optional for viewing gig details
    } finally {
      setApplicationsLoading(false);
    }
  };

  const changeGigStatus = async (newStatus: Gig['status']) => {
    if (!gigId || !user?.id) {
      showToast('error', 'Missing required data');
      return;
    }
    try {
      setIsLoading(true);
      const response = await apiClient.post(`/api/gig/${gigId}/change-status`, {
        status: newStatus,
      });
      if (response.success) {
        showToast('success', `Gig status changed to ${newStatus}`);
        loadGigDetails(true); // Refresh gig data
        if (newStatus === 'CANCELLED') {
          // After cancelling, go back to my-gigs
          router.push('/my-gigs');
        }
      } else {
        const errorMessage =
          typeof response === 'object' && response.message
            ? String(response.message)
            : 'Failed to change status';
        showToast('error', errorMessage);
      }
    } catch (error: any) {
      console.error('Error changing gig status:', error);
      showToast('error', error.message || 'Failed to change status');
    } finally {
      setIsLoading(false);
    }
  };

  const changeGigVisibility = async (isPublic: boolean) => {
    if (!gigId || !user?.id) {
      showToast('error', 'Missing required data');
      return;
    }
    try {
      setIsLoading(true);
      const response = await apiClient.put(
        `/api/gig/${gigId}/change-visibility`,
        {
          isPublic,
        }
      );
      if (response.success) {
        showToast(
          'success',
          `Gig visibility changed to ${isPublic ? 'Public' : 'Private'}`
        );
        loadGigDetails(true); // Refresh gig data
      } else {
        const errorMessage =
          typeof response === 'object' && response.message
            ? String(response.message)
            : 'Failed to change visibility';
        showToast('error', errorMessage);
      }
    } catch (error: any) {
      console.error('Error changing gig visibility:', error);
      showToast('error', error.message || 'Failed to change visibility');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGigDetails = async (forceRefresh = false) => {
    if (!gigId) {
      //console.log(('⚠️ Skipping gig details load - gigId not available');
      return;
    }

    try {
      setIsLoading(true);

      // Add cache busting parameter for force refresh
      const url = forceRefresh
        ? `/api/gig/${gigId}?_t=${Date.now()}`
        : `/api/gig/${gigId}`;

      const response = await apiClient.get(url);

      if (response.success && response.data) {
        const gigData = response.data as Gig;
        console.log('🎯 Loaded gig data:', gigData);
        setGig(gigData);
      } else {
        // Go back to previous page or fallback to marketplace
        goBack();
      }
    } catch (error) {
      console.error('Failed to load gig details:', error);
      // Go back to previous page or fallback to marketplace
      goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishDraft = () => {
    if (!gig || gig.status !== 'DRAFT') {
      showToast('error', 'Only draft gigs can be published');
      return;
    }

    if (!gigId) {
      showToast('error', 'Gig ID not available');
      return;
    }

    // Set a flag in session storage to indicate we want to publish after editing
    sessionStorage.setItem('publishDraftIntent', 'true');

    //console.log((
    //   '🚀 Redirecting to edit page for draft completion before publishing:',
    //   gigId
    // );

    // Navigate to edit page with publish intent
    router.push(`/gig/${gigId}/edit?publish=true`);
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

      // Validate required fields
      if (!application.coverLetter.trim()) {
        showToast('warning', 'Please enter a cover letter');
        return;
      }

      if (!application.estimatedTime) {
        showToast('warning', 'Please select an estimated time to complete');
        return;
      }

      // Validate gig ID format (should be a valid ID)
      if (!gigId || typeof gigId !== 'string' || gigId.length < 10) {
        showToast(
          'error',
          'Invalid gig ID. Please refresh the page and try again.'
        );
        return;
      }

      // Convert portfolio to string array format expected by backend
      const portfolioUrls = application.portfolio
        .map((item) => item.url)
        .filter((url) => url.trim());

      // Validate portfolio URLs
      for (const url of portfolioUrls) {
        const isValidUrl =
          /^https?:\/\/.+/.test(url) ||
          /^www\..+/.test(url) ||
          /^.+\..+/.test(url);
        if (!isValidUrl) {
          showToast(
            'warning',
            `Invalid portfolio URL: "${url}". Please use a valid format like https://example.com or www.example.com`
          );
          return;
        }
      }

      // Normalize portfolio URLs to include protocol if missing
      const normalizedPortfolioUrls = portfolioUrls.map((url) => {
        if (url.startsWith('www.')) {
          return `https://${url}`;
        } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
          return `https://${url}`;
        }
        return url;
      });

      // Base payload
      let applicationData: any = {
        proposal: application.coverLetter.trim(),
        portfolio: normalizedPortfolioUrls,
        quotedPrice: application.proposedRate || 0,
        upiId: application.upiId?.trim() || undefined,
        estimatedTime: application.estimatedTime,
        applicantType: application.applicantType,
        address: application.address?.trim() || undefined,
      };

      if (application.applicantType === 'clan') {
        // Require a clan selection only
        if (!(application.clanSlug?.trim() || application.clanId?.trim())) {
          showToast('warning', 'Please select your clan (slug or ID)');
          return;
        }

        // Enforce proposed price not exceeding gig max budget (if provided)
        if (
          gig?.budgetMax &&
          Number(application.proposedRate || 0) > Number(gig.budgetMax)
        ) {
          showToast(
            'warning',
            `Proposed price (₹${application.proposedRate}) cannot exceed gig max budget (₹${gig.budgetMax}).`
          );
          return;
        }

        // If milestones provided, ensure valid and within proposed price
        if ((application.milestonePlan?.length || 0) > 0) {
          const milestoneInvalid = (application.milestonePlan || []).some(
            (ms: any) =>
              !ms.title?.trim() || !ms.dueAt || (Number(ms.amount) || 0) <= 0
          );
          if (milestoneInvalid) {
            showToast(
              'warning',
              'Each milestone needs title, due date, and amount > 0'
            );
            return;
          }
          const totalMilestoneAmount = (application.milestonePlan || []).reduce(
            (sum: number, ms: any) => sum + (Number(ms.amount) || 0),
            0
          );
          const proposedTotal = Number(application.proposedRate || 0);
          if (proposedTotal > 0 && totalMilestoneAmount > proposedTotal) {
            showToast(
              'warning',
              `Total milestone amount (₹${totalMilestoneAmount}) cannot exceed proposed price (₹${proposedTotal}).`
            );
            return;
          }
        }

        // If payout provided, ensure each entry has some value
        if ((application.payoutSplit?.length || 0) > 0) {
          const payoutInvalid = (application.payoutSplit || []).some(
            (p: any) =>
              (Number(p.percentage) || 0) <= 0 &&
              (Number(p.fixedAmount) || 0) <= 0
          );
          if (payoutInvalid) {
            showToast(
              'warning',
              'Each payout entry must have percentage or fixed amount > 0'
            );
            return;
          }
        }

        // If team provided, ensure each entry has role and hours
        if ((application.teamPlan?.length || 0) > 0) {
          const teamInvalid = (application.teamPlan || []).some(
            (m: any) => !m.role?.trim() || (Number(m.hours) || 0) <= 0
          );
          if (teamInvalid) {
            showToast(
              'warning',
              'Each team member must have a role and hours > 0'
            );
            return;
          }
        }

        const sanitize = (list: any[]) =>
          (list || [])
            .map((s: any) => String(s).replace(/,+$/, '').trim())
            .filter(Boolean);
        const toIdentifier = (m: any) => {
          const uuidLike =
            typeof m.username === 'string' &&
            /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-/.test(m.username);
          const id = m.memberId || (uuidLike ? m.username : undefined);
          return id
            ? { memberId: id }
            : m.username
              ? { username: m.username }
              : {};
        };

        applicationData = {
          ...applicationData,
          applicantType: 'clan',
          clanSlug: application.clanSlug?.trim(),
          ...(application.clanId?.trim()
            ? { clanId: application.clanId.trim() }
            : {}),
          ...(application.teamPlan && application.teamPlan.length > 0
            ? {
                teamPlan: application.teamPlan.map((m: any) => ({
                  role: m.role,
                  ...toIdentifier(m),
                  ...(m.email ? { email: m.email } : {}),
                  hours: m.hours,
                  deliverables: sanitize(m.deliverables),
                })),
              }
            : {}),
          ...(application.milestonePlan && application.milestonePlan.length > 0
            ? {
                milestonePlan: application.milestonePlan.map((ms: any) => ({
                  title: ms.title,
                  dueAt: ms.dueAt,
                  amount: ms.amount,
                  deliverables: sanitize(ms.deliverables),
                })),
              }
            : {}),
          ...(application.payoutSplit && application.payoutSplit.length > 0
            ? {
                payoutSplit: application.payoutSplit.map((p: any) => ({
                  ...toIdentifier(p),
                  ...(p.email ? { email: p.email } : {}),
                  percentage: p.percentage,
                  fixedAmount: p.fixedAmount,
                })),
              }
            : {}),
        };
      }

      //console.log(('🚀 Sending application data:', applicationData);
      //console.log(('🔑 User info:', { id: user.id, email: user.email });
      //console.log(('🎯 Gig ID:', gigId);

      //console.log(('🚀 Application data:', applicationData);

      const response = await apiClient.post(
        `/api/gig/${gigId}/apply`,
        applicationData
      );

      //console.log(('✅ Application response:', response);

      if (response.success) {
        // Refresh gig data to update application status
        await loadGigDetails();
        setShowApplicationForm(false);
        setApplication({
          coverLetter: '',
          portfolio: [],
          proposedRate: undefined,
          estimatedTime: '',
          applicantType: 'user',
        });

        // Show success message
        showToast(
          'success',
          'Application submitted successfully! The brand will review your application soon.'
        );

        // Reload the page to get fresh data
        // If applied as clan, navigate to the workflow to assign tasks

        window.location.reload();
      }
    } catch (error: any) {
      console.error('❌ Failed to apply to gig:', error);
      console.error('❌ Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error,
        details: error.details,
      });
      console.error('❌ Gig ID:', gigId);

      // Determine the most appropriate error message
      let userMessage = 'Failed to submit application. Please try again.';

      if (error.error) {
        // Backend provided a specific error message
        userMessage = error.error;
      } else if (error.message) {
        userMessage = error.message;
      } else if (error.details) {
        userMessage = error.details;
      }

      // Special handling for common errors
      if (
        String(userMessage || '')
          .toLowerCase()
          .includes('already applied')
      ) {
        userMessage =
          'You have already applied to this gig. Check your applications in the "My Applications" section.';
        setAlreadyAppliedMessage('You have already applied to this gig');
        showToast('warning', userMessage);
        // Also refresh the gig data to update the UI state
        await loadGigDetails();
      } else if (
        String(userMessage || '')
          .toLowerCase()
          .includes('not authenticated')
      ) {
        userMessage = 'Please log in again to apply for this gig.';
        showToast('error', userMessage);
        router.push('/login');
      } else if (
        String(userMessage || '')
          .toLowerCase()
          .includes('maximum applications')
      ) {
        userMessage =
          'This gig has reached its maximum number of applications.';
        showToast('warning', userMessage);
      } else if (
        String(userMessage || '')
          .toLowerCase()
          .includes('gig not found')
      ) {
        userMessage = 'This gig is no longer available.';
        showToast('error', userMessage);
      } else if (
        String(userMessage || '')
          .toLowerCase()
          .includes('validation')
      ) {
        userMessage = 'Please check all required fields and try again.';
        showToast('warning', userMessage);
      } else {
        showToast('error', userMessage);
      }
    } finally {
      setIsApplying(false);
    }
  };

  const addPortfolioItem = () => {
    setApplication((prev) => ({
      ...prev,
      portfolio: [...prev.portfolio, { title: '', url: '' }],
    }));
  };

  const validatePortfolioUrl = (url: string): string | null => {
    if (!url.trim()) return null; // Empty URLs are allowed, will be filtered out

    // Basic URL pattern validation
    const urlPattern =
      /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/;
    if (!urlPattern.test(url.trim())) {
      return 'Please enter a valid URL (e.g., https://example.com or www.example.com)';
    }

    return null;
  };

  const updatePortfolioItem = (
    index: number,
    field: 'title' | 'url',
    value: string
  ) => {
    setApplication((prev) => ({
      ...prev,
      portfolio: prev.portfolio.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removePortfolioItem = (index: number) => {
    setApplication((prev) => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index),
    }));
  };

  // Check if current user owns this gig (is the brand who posted it)

  // Only load applications if user is authenticated and it's not their own gig
  useEffect(() => {
    const isOwnGig = gig?.brand?.id === user?.id;
    if (isAuthenticated && !isOwnGig && gigId && user?.id) {
      loadMyApplications();
    } else {
      // Reset applications when not needed
      setMyApplications([]);
      setApplicationsLoading(false);
    }
  }, [isAuthenticated, gig?.brand?.id, gigId, user?.id]);

  // Add mobile-optimized styles for select elements
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        select {
          max-width: 100vw !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          word-wrap: break-word !important;
          white-space: nowrap !important;
          box-sizing: border-box !important;
        }
        select option {
          max-width: 100vw !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
          font-size: 14px !important;
          padding: 8px !important;
        }
        .application-modal {
          max-width: calc(100vw - 16px) !important;
          width: calc(100vw - 16px) !important;
        }
        .application-modal select,
        .application-modal input,
        .application-modal textarea {
          max-width: 100% !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .application-modal select option {
          max-width: calc(100vw - 32px) !important;
          width: calc(100vw - 32px) !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        /* Force mobile-friendly select behavior */
        select:focus {
          max-width: 100% !important;
          width: 100% !important;
        }
        select:focus option {
          max-width: 100% !important;
          width: 100% !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (isLoading) {
    return <GigDetailLoadingSkeleton />;
  }

  if (!gig) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="card-glass p-8 text-center">
          <div className="mb-4 text-6xl">❌</div>
          <h1 className="mb-4 text-2xl font-bold">Gig Not Found</h1>
          <p className="mb-6 text-gray-600">
            The gig you're looking for doesn't exist or has been removed.
          </p>
          <button onClick={goBack} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const canApply =
    isAuthenticated &&
    !gig.isApplied &&
    userType === 'creator' &&
    (gig.status === 'OPEN' || gig.status === 'ASSIGNED') &&
    (!gig.maxApplications || gig.applicationCount < gig.maxApplications);
  console.log(
    `User type: ${userType}, Gig status: ${gig.status}, Can apply: ${canApply}`
  );
  // console.log('🔍 Gig details:', gig);
  //console.log(('🔍 Is own gig:', isOwner);
  //console.log(('🔍 My applications:', myApplications);

  const myApplicationStatus = (myApplications as any)?.status || null;
  // console.log('🔍 My application status:', myApplicationStatus);
  // console.log('🔍 My applications data:', (myApplications as any).quotedPrice);

  return (
    <div className="min-h-screen bg-gray-50 py-2">
      <div className="mx-auto max-w-6xl px-1 sm:px-1 lg:px-1">
        {/* Header */}
        <div className="mb-2">
          <div className="items-left flex flex-row justify-between md:flex-row">
            <div className="flex items-center space-x-1">
              <button onClick={goBack} className="btn-secondary">
                ←
              </button>
              <button
                // reload window not working with router.reload()
                onClick={() => window.location.reload()}
                className="btn-secondary text-sm"
                disabled={isLoading}
                title="Refresh gig data"
              >
                {isLoading ? '↻' : '↻'}
              </button>
            </div>
            <div className=" flex items-center space-x-1">
              {/* Owner Actions */}
              {isOwner && (
                <div className="flex items-center space-x-1">
                  {/* Publish Draft Button - only show for DRAFT status */}
                  {gig.status === 'DRAFT' && (
                    <button
                      onClick={handlePublishDraft}
                      className="cursor-pointer text-sm text-blue-600 hover:underline"
                      title="Review and complete your draft gig before publishing"
                    >
                      Complete & Publish
                    </button>
                  )}
                  <span> | </span>
                  <Link
                    href={gigId ? `/gig/${gigId}/edit` : '#'}
                    className="cursor-pointer text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <span> | </span>
                  {/* Only show applications link for published gigs */}
                  {gig.status !== 'DRAFT' && (
                    <Link
                      href={gigId ? `/gig/${gigId}/applications` : '#'}
                      className="cursor-pointer text-sm text-blue-600 hover:underline"
                    >
                      Applications ({gig.applicationCount || 0})
                    </Link>
                  )}

                  {/* Gig Management Actions */}
                  {/* {gig.status !== 'DRAFT' && (
                    <>
                      <span> | </span>
                      {gig.status === 'PAUSED' ? (
                        <button
                          onClick={() => openDialog('re-open')}
                          className="cursor-pointer text-sm text-green-600 hover:underline"
                          title="Reactivate this gig"
                        >
                          Resume
                        </button>
                      ) : (
                        <button
                          onClick={() => openDialog('pause')}
                          className="cursor-pointer text-sm text-yellow-600 hover:underline"
                          title="Pause this gig temporarily"
                        >
                          Pause
                        </button>
                      )}
                      <span> | </span>
                      <button
                        onClick={() =>
                          openDialog('visibility', {
                            newVisibility: !gig.isPublic,
                          })
                        }
                        className="cursor-pointer text-sm text-blue-600 hover:underline"
                        title={`Make gig ${gig.isPublic ? 'private' : 'public'}`}
                      >
                        {gig.isPublic ? 'Make Private' : 'Make Public'}
                      </button>
                    </>
                  )} */}
                </div>
              )}
              <span> | </span>
              {/* Status Badge */}
              {gig.status !== 'OPEN' && gig.status !== 'ASSIGNED' && (
                <span
                  className={`rounded-none px-1 py-1 text-sm font-medium ${
                    gig.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : gig.status === 'PAUSED'
                        ? 'bg-yellow-100 text-yellow-800'
                        : gig.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : gig.status === 'DRAFT'
                            ? 'bg-gray-100 text-gray-800'
                            : gig.status === 'SUBMITTED' && !isOwner
                              ? 'bg-green-100 text-gray-800'
                              : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {gig.status === 'DRAFT' ? 'DRAFT' : gig.status}
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">
              Posted {new Date(gig.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {/* Draft Notice */}
          {gig.status === 'DRAFT' && (
            <div className="mb-2 lg:col-span-3">
              <div className="flex items-center justify-between rounded-none border border-yellow-200 bg-yellow-50 p-1">
                <div className="flex items-center space-x-1">
                  {/* <div className="text-2xl">📝</div> */}
                  <div>
                    <p className="font-semibold text-yellow-800">Draft Gig</p>
                    <p className="text-sm text-yellow-600">
                      {isOwner
                        ? 'This gig is still in draft mode. Complete and publish it to make it live and start accepting applications.'
                        : 'This gig is currently in draft mode and not accepting applications.'}
                    </p>
                  </div>
                </div>
                {isOwner && (
                  <button
                    onClick={handlePublishDraft}
                    className="cursor-pointer p-2 text-sm text-blue-600 hover:underline"
                  >
                    Complete...
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Already Applied Banner */}
          {(gig.isApplied || alreadyAppliedMessage) &&
            !isOwner &&
            (applicationsLoading ? (
              <div className="mb-1 lg:col-span-3">
                <div className="flex items-center justify-center rounded-none border border-blue-200 bg-blue-50 p-1">
                  <div className="flex items-center space-x-3">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-sm text-blue-600">
                      Loading application status...
                    </span>
                  </div>
                </div>
              </div>
            ) : (myApplications as any)?.status === 'APPROVED' &&
              (myApplications as any)?.gigId === gigId &&
              gigId ? (
              <div className="mb-1 lg:col-span-3">
                <div className="flex items-center justify-between rounded-none border border-green-200 bg-green-50 p-1">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">✅</div>
                    <div>
                      <p className="font-semibold text-green-800">
                        Application {myApplicationStatus}
                      </p>
                      <p className="text-sm text-green-600">
                        {alreadyAppliedMessage ||
                          'Your application has been approved. Please start working on the gig.'}
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
            ) : myApplicationStatus === 'SUBMITTED' &&
              (myApplications as any)?.gigId === gigId &&
              gigId ? (
              <div className="mb-1 lg:col-span-3">
                <div className="flex items-center justify-between rounded-none border border-yellow-200 bg-yellow-50 p-1">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">⏳</div>
                    <div>
                      <p className="font-semibold text-yellow-800">
                        Application {myApplicationStatus}
                      </p>
                      <p className="text-sm text-yellow-600">
                        {alreadyAppliedMessage ||
                          'You have already submitted the gig. The brand will review your submission soon.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : myApplicationStatus === 'CLOSED' &&
              (myApplications as any)?.gigId === gigId &&
              gigId &&
              !isOwner ? (
              <div className="mb-1 lg:col-span-3">
                <div className="flex items-center justify-between rounded-none border border-green-200 bg-green-50 p-1">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">✅</div>
                    <div>
                      <p className="font-semibold text-green-800">
                        Application {myApplicationStatus}
                      </p>
                      <p className="text-sm text-blue-600">
                        {alreadyAppliedMessage ||
                          'You have already applied to this gig. You have completed the gig successfully.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : myApplicationStatus === 'PENDING' &&
              (myApplications as any)?.gigId === gigId &&
              (myApplications as any)?.applicantType === 'owner' &&
              gigId &&
              !isOwner ? (
              <div className="mb-1 lg:col-span-3">
                <div className="flex items-center justify-between rounded-none border border-green-200 bg-green-50 p-1">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">✅</div>
                    <div>
                      <p className="font-semibold text-green-800">
                        Application {myApplicationStatus}
                      </p>
                      <p className="text-sm text-blue-600">
                        {alreadyAppliedMessage ||
                          'You have been assigned to this gig. Accept the assignment to start working on it.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-none border border-green-200 bg-green-50 p-1">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">✅</div>
                    <div>
                      <p className="font-semibold text-green-800">
                        Application {myApplicationStatus}
                      </p>
                      <p className="text-sm text-blue-600">
                        {alreadyAppliedMessage ||
                          'You have already applied to this gig. You have completed the gig successfully.'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ))}

          {/* Main Content */}
          <div className="space-y-2 lg:col-span-2">
            {/* Gig Header */}
            <div className="card-glass p-2">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h1 className="mb-2 text-3xl font-bold text-gray-900">
                    {gig.title}
                  </h1>
                  Created at:{' '}
                  <span>{new Date(gig.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {gig.brand?.logo && (
                        <img
                          src={gig.brand?.logo}
                          alt={gig.brand?.name}
                          className="h-8 w-8 rounded-none"
                        />
                      )}
                      <span className="font-medium">{gig.brand?.name}</span>
                      {gig.brand?.verified && (
                        <span className="text-blue-500">✓</span>
                      )}
                    </div>
                    <div className="rounded-none bg-blue-100 px-1 py-1 text-sm text-blue-800">
                      {gig.category}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-bold text-green-600">
                      ₹{(gig.budgetMin || 0).toLocaleString() ?? 0}
                      {gig.budgetMax && gig.budgetMax !== gig.budgetMin
                        ? ` - ₹${(gig.budgetMax || 0).toLocaleString() ?? 0}`
                        : ''}
                    </div>
                    <div className="text-sm text-gray-600">
                      Budget ({gig.budgetType})
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Deadline
                  </label>
                  <div className="text-lg">
                    {gig.deadline
                      ? new Date(gig.deadline).toLocaleDateString()
                      : 'Not specified'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Applications
                  </label>
                  <div className="text-lg">
                    {gig._count?.applications}{' '}
                    {gig.maxApplications && `/ ${gig.maxApplications}`}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Submissions
                  </label>
                  <div className="text-lg">{gig._count?.submissions || 0}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Duration
                  </label>
                  <div className="text-lg">
                    {gig.duration || 'Not specified'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Urgency
                  </label>
                  <div className="text-lg">
                    <span
                      className={`rounded px-2 py-1 text-sm ${
                        gig.urgency === 'HIGH'
                          ? 'bg-red-100 text-red-800'
                          : gig.urgency === 'MEDIUM'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {gig.urgency || 'Normal'}
                    </span>
                  </div>
                </div>
              </div>

              {gig.tags && gig.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {gig.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="rounded bg-gray-100 px-1 py-1 text-sm text-gray-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="card-glass p-1">
              <h2 className="mb-4 text-xl font-semibold">📝 Description</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">
                  {gig.description}
                </p>
              </div>
            </div>

            {/* Requirements */}
            <div className="card-glass p-1">
              <h2 className="mb-2 text-xl font-semibold">✅ Requirements</h2>

              {/* General Requirements */}
              {gig.requirements && (
                <div className="mb-2">
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap text-gray-700">
                      {gig.requirements}
                    </p>
                  </div>
                </div>
              )}

              {/* Skills Required */}
              {gig.skillsRequired && gig.skillsRequired.length > 0 && (
                <div className="mb-2">
                  <h3 className="mb-3 font-semibold">💼 Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {gig.skillsRequired.map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-none bg-blue-100 px-3 py-1 text-sm text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Role Required */}
              {gig.roleRequired && (
                <div className="mb-2">
                  <h3 className="mb-3 font-semibold">👤 Role Required</h3>
                  <span className="rounded-none bg-green-100 px-3 py-1 text-sm text-green-800">
                    {gig.roleRequired}
                  </span>
                </div>
              )}

              {/* Experience Level */}
              {gig.experienceLevel && (
                <div className="mb-2">
                  <h3 className="mb-3 font-semibold">📊 Experience Level</h3>
                  <span className="rounded-none bg-purple-100 px-3 py-1 text-sm text-purple-800">
                    {gig.experienceLevel}
                  </span>
                </div>
              )}

              {/* Platform Requirements */}
              {gig.platformRequirements &&
                gig.platformRequirements.length > 0 && (
                  <div className="mb-2">
                    <h3 className="mb-3 font-semibold">
                      📱 Platform Requirements
                    </h3>
                    <div className="space-y-2">
                      {gig.platformRequirements.map(
                        (req: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded bg-gray-50 p-3"
                          >
                            <span className="font-medium">
                              {req.platform || 'Platform'}
                            </span>
                            <span className="text-sm text-gray-600">
                              {req.minFollowers
                                ? `${(req.minFollowers || 0).toLocaleString() ?? 0}+ followers`
                                : 'Requirements specified'}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Location */}
              {gig.location && (
                <div className="mb-2">
                  <h3 className="mb-3 font-semibold">📍 Location</h3>
                  <span className="rounded-none bg-orange-100 px-3 py-1 text-sm text-orange-800">
                    {gig.address ? gig.address : gig.location}
                  </span>
                  {gig.latitude && gig.longitude && (
                    <>
                      <span> | </span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${gig.latitude},${gig.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        View on Map
                      </a>
                    </>
                  )}
                </div>
              )}

              {/* Clan Allowed */}
              <div className="mb-2">
                <h3 className="mb-3 font-semibold">👥 Team Applications</h3>
                <span
                  className={`rounded-none px-3 py-1 text-sm ${
                    gig.isClanAllowed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {gig.isClanAllowed
                    ? 'Clan applications allowed'
                    : 'Individual applications only'}
                </span>
              </div>
            </div>

            {/* Deliverables */}
            {gig.deliverables && gig.deliverables.length > 0 && (
              <div className="card-glass p-3">
                <h2 className="mb-2 text-xl font-semibold">🎯 Deliverables</h2>
                <ul className="list-inside list-disc space-y-2 text-gray-700">
                  {gig.deliverables.map((deliverable, index) => (
                    <li key={index}>{deliverable}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-2">
            <div>
              <div className="card-glass p-3">
                <h3 className="mb-4 text-lg font-semibold">
                  Application Status
                </h3>

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
                    {/* Chat with approved applicant */}
                    {(myApplications as any)?.status === 'APPROVED' &&
                      (myApplications as any)?.applicationId && (
                        <button
                          onClick={() => {
                            const params = new URLSearchParams({
                              gigTitle: gig?.title || 'Gig Chat',
                              applicantName: 'Creator',
                              brandName: gig?.brand?.name || 'Brand',
                            });
                            router.push(
                              `/chat/${(myApplications as any)?.applicationId}?${params.toString()}`
                            );
                          }}
                          className="btn-secondary mt-2 w-full"
                        >
                          💬 Chat with Creator
                        </button>
                      )}
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
                        <FaBullseye />
                        {gig?.gigType === 'PRODUCT'
                          ? 'Assignment not allowed for Product Gigs'
                          : 'Assign User'}
                      </button>
                    </div>
                  </div>
                ) : isOwner && gig.status === 'DRAFT' ? (
                  <div className="text-center">
                    <div className="mb-2 text-4xl">📝</div>
                    <p className="mb-2 font-semibold text-gray-600">
                      Draft Mode
                    </p>
                    <p className="mb-4 text-sm text-gray-600">
                      {isOwner
                        ? 'Complete and publish this gig to start accepting applications'
                        : 'This gig is not yet published and not accepting applications'}
                    </p>
                    {isOwner && (
                      <button
                        onClick={handlePublishDraft}
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
                    <button
                      onClick={() => {
                        const params = new URLSearchParams({
                          gigTitle: gig?.title || 'Gig Chat',
                          applicantName: 'Applicant',
                          brandName: gig?.brand?.name || 'Brand',
                        });
                        router.push(
                          `/chat/${(myApplications as any)?.applicationId || null}?${params.toString()}`
                        );
                      }}
                      className="btn-secondary mt-2 w-full"
                    >
                      💬 Chat with Brand
                    </button>
                    {gig.deadline && new Date() > new Date(gig.deadline) && (
                      <div>
                        <p className="mb-2 text-sm text-red-600">
                          Submission deadline has passed
                        </p>
                        <p className="text-xs text-gray-600">
                          Deadline was:{' '}
                          {new Date(gig.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    )}
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
                        className="btn-primary "
                        onClick={() =>
                          handleAcceptAssignment(
                            (myApplications as any)?.applicationId
                          )
                        }
                      >
                        Accept
                      </button>
                      <button
                        className="btn-secondary text-red-600 hover:bg-red-50"
                        onClick={() =>
                          handleReject((myApplications as any)?.applicationId)
                        }
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          const params = new URLSearchParams({
                            gigTitle: gig?.title || 'Gig Chat',
                            applicantName: 'Applicant',
                            brandName: gig?.brand?.name || 'Brand',
                          });
                          router.push(
                            `/chat/${(myApplications as any)?.applicationId || null}?${params.toString()}`
                          );
                        }}
                        className="btn-secondary mt-2 w-full"
                      >
                        💬 Chat with Brand
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
                    <Link
                      href="/my/applications"
                      className="btn-secondary w-full"
                    >
                      View My Applications
                    </Link>
                    <button
                      onClick={() =>
                        withdrawApplication(
                          (myApplications as any)?.applicationId
                        )
                      }
                      className="btn-secondary mt-2 w-full text-red-600 hover:bg-red-50"
                    >
                      Withdraw
                    </button>
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
                    <Link
                      href="/my/applications"
                      className="btn-secondary w-full"
                    >
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
                    <Link
                      href="/my/applications"
                      className="btn-secondary w-full"
                    >
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
                    <Link
                      href="/my/applications"
                      className="btn-secondary w-full"
                    >
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
                        : userType !== 'creator'
                          ? 'Only creators can apply for gigs'
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
                {/* // If owner change status of gig */}
                {/* </div>
              <div> */}
                {isOwner && (
                  <div>
                    {isOwner &&
                      (gig.status === 'OPEN' || gig.status === 'ASSIGNED') && (
                        <button
                          onClick={() => openDialog('pause')}
                          className="btn-secondary mt-2 w-full"
                        >
                          Pause Gig
                        </button>
                      )}
                    {isOwner &&
                      (gig.status === 'PAUSED' ||
                        gig.status === 'IN_REVIEW') && (
                        <button
                          onClick={() => openDialog('re-open')}
                          className="btn-secondary mt-2 w-full"
                        >
                          Reopen Gig
                        </button>
                      )}
                    {isOwner && (
                      <button
                        onClick={() =>
                          openDialog('visibility', {
                            newVisibility: !gig.isPublic,
                          })
                        }
                        className="btn-secondary mt-2 w-full"
                      >
                        {gig.isPublic ? 'Make Gig Private' : 'Make Gig Public'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Brand Info */}
            <div className="card-glass p-3">
              <h3 className="mb-4 text-lg font-semibold">About the Brand</h3>
              <div className="mb-4 flex items-center space-x-3">
                {gig.brand?.logo && (
                  <img
                    src={gig.brand?.logo}
                    alt={gig.brand?.name}
                    className="h-12 w-12 rounded-none"
                  />
                )}
                <div>
                  <div className="font-semibold">{gig.brand?.name}</div>
                  {gig.brand?.verified && (
                    <div className="text-sm text-blue-600">
                      ✓ Verified Brand
                    </div>
                  )}
                </div>
              </div>
              <Link
                href={`/profile/${gig.brand?.id}` as any}
                className="btn-secondary w-full"
              >
                View Brand Profile
              </Link>
            </div>

            {/* Similar Gigs */}
            <div className="card-glass p-3">
              <h3 className="mb-4 text-lg font-semibold">Similar Gigs</h3>
              <div className="space-y-3">
                <Link
                  href="/marketplace"
                  className="block rounded border p-3 hover:bg-gray-50"
                >
                  <div className="text-sm font-medium">
                    Browse more {gig.category} gigs
                  </div>
                  <div className="text-xs text-gray-600">
                    Find similar opportunities
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form Modal */}
        {showApplicationForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-1">
            <div
              className="application-modal mx-2 -mt-10 max-h-[85vh] w-full max-w-[85vw] overflow-y-auto bg-white"
              style={{ maxWidth: 'calc(100vw - 8px)' }}
            >
              <div className="p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="mr-2 flex-1 truncate text-lg font-bold">
                    Apply to: {gig.title}
                  </h2>
                  <button
                    onClick={() => setShowApplicationForm(false)}
                    className="flex-shrink-0 text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Cover Letter */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
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
                      className="w-full rounded-none border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell the brand why you're perfect for this campaign..."
                      style={{ maxWidth: '100%' }}
                    />
                    <p className="mt-1 text-xs text-gray-600">
                      {application.coverLetter.length < 10
                        ? 'Minimum 10 characters required'
                        : `${application.coverLetter.length} / 1000 characters`}
                    </p>
                  </div>

                  {/* Proposed Rate */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Proposed Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-sm text-gray-500">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={application.proposedRate || ''}
                        onChange={(e) =>
                          setApplication((prev) => ({
                            ...prev,
                            proposedRate: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          }))
                        }
                        required
                        max={gig.budgetMax}
                        className="w-full rounded-none border border-gray-300 py-2 pl-8 pr-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        placeholder="Your rate for this campaign"
                        style={{ maxWidth: '100%' }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-600">
                      Budget: ₹{(gig.budgetMin || 0).toLocaleString() ?? 0}
                      {gig.budgetMax && gig.budgetMax !== gig.budgetMin
                        ? ` - ₹${(gig.budgetMax || 0).toLocaleString() ?? 0}`
                        : ''}{' '}
                      ({gig.budgetType})
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      UPI ID *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={application.upiId || ''}
                        onChange={(e) => {
                          const newUpiId = e.target.value;
                          setApplication((prev) => ({
                            ...prev,
                            upiId: newUpiId,
                          }));

                          // Real-time validation feedback
                          if (newUpiId.trim()) {
                            const error = validateUpiId(newUpiId);
                            if (error) {
                              // Show validation error visually but don't block typing
                              e.target.style.borderColor = '#ef4444';
                            } else {
                              e.target.style.borderColor = '#10b981';
                            }
                          } else {
                            e.target.style.borderColor = '#d1d5db';
                          }
                        }}
                        onBlur={(e) => {
                          // Show validation message on blur
                          const error = validateUpiId(e.target.value);
                          if (error && e.target.value.trim()) {
                            showToast('warning', error);
                          }
                        }}
                        required
                        className="w-full rounded-none border border-gray-300 py-2 pr-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., yourname@paytm, user123@phonepe"
                        style={{ maxWidth: '100%' }}
                      />
                      {application.upiId && (
                        <div className="absolute right-2 top-2">
                          {validateUpiId(application.upiId) ? (
                            <span className="text-sm text-red-500">❌</span>
                          ) : (
                            <span className="text-sm text-green-500">✅</span>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-600">
                      💡 Enter your UPI ID for secure payments (e.g.,
                      yourname@paytm, user123@phonepe)
                    </p>
                    {application.upiId && validateUpiId(application.upiId) && (
                      <p className="mt-1 text-xs text-red-600">
                        {validateUpiId(application.upiId)}
                      </p>
                    )}
                  </div>

                  {/* Estimated Time */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Estimated Time to Complete *
                    </label>
                    <select
                      value={application.estimatedTime}
                      onChange={(e) =>
                        setApplication((prev) => ({
                          ...prev,
                          estimatedTime: e.target.value,
                        }))
                      }
                      className="w-full rounded-none border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      style={{
                        fontSize: '14px',
                        maxWidth: '100%',
                        width: '100%',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <option value="" style={{ fontSize: '14px' }}>
                        Select estimated time
                      </option>
                      <option value="1-3 days" style={{ fontSize: '14px' }}>
                        1-3 days
                      </option>
                      <option value="4-7 days" style={{ fontSize: '14px' }}>
                        4-7 days
                      </option>
                      <option value="1-2 weeks" style={{ fontSize: '14px' }}>
                        1-2 weeks
                      </option>
                      <option value="2-4 weeks" style={{ fontSize: '14px' }}>
                        2-4 weeks
                      </option>
                      <option value="1-2 months" style={{ fontSize: '14px' }}>
                        1-2 months
                      </option>
                      <option value="2+ months" style={{ fontSize: '14px' }}>
                        2+ months
                      </option>
                    </select>
                  </div>

                  {/* Application Type */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Application Type
                    </label>
                    <select
                      value={application.applicantType}
                      onChange={(e) =>
                        setApplication((prev) => ({
                          ...prev,
                          applicantType: e.target.value as 'user' | 'clan',
                        }))
                      }
                      className="w-full rounded-none border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      style={{
                        fontSize: '14px',
                        maxWidth: '100%',
                        width: '100%',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      <option value="user" style={{ fontSize: '14px' }}>
                        Individual Application
                      </option>
                      {/* {gig.isClanAllowed && (
                        <option value="clan" style={{ fontSize: '14px' }}>
                          Clan Application
                        </option>
                      )} */}
                    </select>
                    {!gig.isClanAllowed && (
                      <p className="mt-1 text-xs text-gray-600">
                        This gig only accepts individual applications
                      </p>
                    )}
                  </div>

                  {/* Clan-only Fields */}
                  {application.applicantType === 'clan' && (
                    <ClanApplyExtras
                      application={application}
                      setApplication={setApplication}
                    />
                  )}

                  {/* Delivery address for gigType = PRODUCT */}
                  {gig.gigType === 'PRODUCT' && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Delivery Address *
                      </label>
                      <textarea
                        value={application.address}
                        onChange={(e) =>
                          setApplication((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        rows={3}
                        className="w-full rounded-none border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your full delivery address"
                        style={{ maxWidth: '100%' }}
                        required
                      />
                    </div>
                  )}

                  {/* Portfolio */}
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Portfolio Examples
                      </label>
                      <button
                        onClick={addPortfolioItem}
                        className="btn-ghost btn-sm text-xs text-blue-600"
                      >
                        + Add Item
                      </button>
                    </div>

                    {application.portfolio.map((item, index) => (
                      <div key={index} className="mb-2 grid grid-cols-1 gap-2">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            updatePortfolioItem(index, 'title', e.target.value)
                          }
                          className="rounded-none border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          placeholder="Title"
                          style={{ maxWidth: '100%' }}
                        />
                        <div className="flex space-x-2">
                          <div className="flex-1">
                            <input
                              type="url"
                              value={item.url}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                updatePortfolioItem(index, 'url', newValue);

                                // Real-time validation feedback
                                if (newValue.trim()) {
                                  const error = validatePortfolioUrl(newValue);
                                  if (error) {
                                    e.target.style.borderColor = '#ef4444';
                                  } else {
                                    e.target.style.borderColor = '#10b981';
                                  }
                                } else {
                                  e.target.style.borderColor = '#d1d5db';
                                }
                              }}
                              className="w-full rounded-none border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                              placeholder="https://example.com or www.example.com"
                              style={{ maxWidth: '100%' }}
                            />
                            {item.url && validatePortfolioUrl(item.url) && (
                              <p className="mt-1 text-xs text-red-600">
                                {validatePortfolioUrl(item.url)}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removePortfolioItem(index)}
                            className="btn-ghost btn-sm px-2 text-xs text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-4">
                    <label className="flex items-start gap-2 sm:gap-3">
                      <div className='w-4 h-4'>
                        <input
                          type="checkbox"
                          checked={agreed}
                          onChange={(e) => setAgreed(e.target.checked)}
                          className="mt-1 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                        />
                      </div>
                      <p className="min-w-0 flex-1 break-words text-xs leading-relaxed text-gray-700 sm:text-sm">
                        I will disclose this is a paid promotion and will only
                        promote legal, ethical products/services. I have read{' '}
                        <button
                          type="button"
                          onClick={() => openGuidelines('creator')}
                          className="inline text-blue-600 underline transition-colors hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        >
                          Creator Guidelines
                        </button>
                        .
                      </p>
                    </label>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setShowApplicationForm(false)}
                      className="btn-secondary flex-1 py-2 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApply}
                      disabled={
                        application.coverLetter.trim().length < 10 ||
                        !application.estimatedTime ||
                        !application.upiId ||
                        validateUpiId(application.upiId) !== null ||
                        application.proposedRate! < gig.budgetMin! ||
                        application.proposedRate! >
                          (gig.budgetMax || Number.MAX_SAFE_INTEGER) ||
                        (gig.gigType === 'PRODUCT' &&
                          (!application.address ||
                            application.address.trim().length < 15)) ||
                        application.portfolio.some(
                          (item) =>
                            item.url.trim() && validatePortfolioUrl(item.url)
                        ) ||
                        !agreed ||
                        isApplying
                      }
                      className="btn-primary flex-1 py-0 text-sm disabled:opacity-50"
                    >
                      {isApplying ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Work Submission Form Modal */}
        {showSubmissionForm &&
          gigId &&
          gig &&
          !isGigIdLoading &&
          (!gig.deadline || new Date() <= new Date(gig.deadline)) && (
            <WorkSubmissionForm
              gigId={gigId}
              gigTitle={gig.title}
              onSuccess={handleSubmissionSuccess}
              onCancel={() => setShowSubmissionForm(false)}
            />
          )}
      </div>

      {/* Assign Modal */}
      <AssignModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssign={handleAssignUser}
        gigId={gigId || undefined}
        title="Assign User to Gig"
      />

      {/* Assignment Details Mini Modal */}
      {showAssignDetailsModal && selectedUserForAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="mx-2 w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Assign{' '}
                  {selectedUserForAssignment.firstName ||
                    selectedUserForAssignment.username}
                </h3>
                <button
                  onClick={() => {
                    setShowAssignDetailsModal(false);
                    setSelectedUserForAssignment(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Proposal */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Proposal Message *
                  </label>
                  <textarea
                    value={assignmentDetails.proposal}
                    onChange={(e) =>
                      setAssignmentDetails((prev) => ({
                        ...prev,
                        proposal: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter a message for the assignment..."
                  />
                </div>

                {/* Quoted Price */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Quoted Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-sm text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={assignmentDetails.quotedPrice}
                      onChange={(e) =>
                        setAssignmentDetails((prev) => ({
                          ...prev,
                          quotedPrice: e.target.value,
                        }))
                      }
                      min={gig?.budgetMin || 0}
                      max={gig?.budgetMax || undefined}
                      className="w-full rounded border border-gray-300 py-2 pl-8 pr-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter quoted price"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-600">
                    Budget: ₹{(gig?.budgetMin || 0).toLocaleString() ?? 0}
                    {gig?.budgetMax && gig.budgetMax !== gig.budgetMin
                      ? ` - ₹${(gig.budgetMax || 0).toLocaleString() ?? 0}`
                      : ''}{' '}
                    ({gig?.budgetType})
                  </p>
                </div>

                {/* Estimated Time */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Estimated Time *
                  </label>
                  <select
                    value={assignmentDetails.estimatedTime}
                    onChange={(e) =>
                      setAssignmentDetails((prev) => ({
                        ...prev,
                        estimatedTime: e.target.value,
                      }))
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select estimated time</option>
                    <option value="1-3 days">1-3 days</option>
                    <option value="4-7 days">4-7 days</option>
                    <option value="1-2 weeks">1-2 weeks</option>
                    <option value="2-4 weeks">2-4 weeks</option>
                    <option value="1-2 months">1-2 months</option>
                    <option value="2+ months">2+ months</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowAssignDetailsModal(false);
                    setSelectedUserForAssignment(null);
                  }}
                  className="flex-1 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinalAssignment}
                  disabled={
                    !assignmentDetails.quotedPrice ||
                    !assignmentDetails.estimatedTime ||
                    !assignmentDetails.proposal.trim() ||
                    Number(assignmentDetails.quotedPrice) <
                      (gig?.budgetMin ?? 0) ||
                    Boolean(
                      gig?.budgetMax &&
                        Number(assignmentDetails.quotedPrice) > gig.budgetMax
                    )
                  }
                  className="flex-1 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Assign User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPI ID Collection Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                💳 Payment Details Required
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Please provide your UPI ID to receive payments for this
                assignment.
              </p>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                UPI ID *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => {
                    const newUpiId = e.target.value;
                    setUpiId(newUpiId);
                    setUpiValidationError('');

                    // Real-time visual feedback
                    if (newUpiId.trim()) {
                      const error = validateUpiId(newUpiId);
                      if (error) {
                        e.target.style.borderColor = '#ef4444';
                      } else {
                        e.target.style.borderColor = '#10b981';
                      }
                    } else {
                      e.target.style.borderColor = '#d1d5db';
                    }
                  }}
                  onBlur={(e) => {
                    // Validate on blur and show error
                    const error = validateUpiId(e.target.value);
                    if (error) {
                      setUpiValidationError(error);
                    }
                  }}
                  placeholder="e.g., yourname@paytm, user123@phonepe, john@sbi"
                  className={`w-full rounded-md border px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    upiValidationError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {upiId && (
                  <div className="absolute right-3 top-2.5">
                    {validateUpiId(upiId) ? (
                      <span className="text-sm text-red-500">❌</span>
                    ) : (
                      <span className="text-sm text-green-500">✅</span>
                    )}
                  </div>
                )}
              </div>
              {upiValidationError && (
                <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2">
                  <p className="text-sm font-medium text-red-600">
                    ❌ {upiValidationError}
                  </p>
                </div>
              )}
              <div className="mt-2 rounded-md border border-blue-200 bg-blue-50 p-2">
                <p className="text-xs text-blue-700">
                  💡 This UPI ID will be used for payment after work completion
                </p>
                <p className="mt-1 text-xs text-blue-600">
                  ✅ Supported: @paytm, @phonepe, @gpay, @sbi, @hdfc, @icici,
                  and other bank UPI IDs
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  I will disclose this is a paid promotion and will only promote
                  legal, ethical products/services. I have read{' '}
                  <button
                    type="button"
                    onClick={() => openGuidelines('creator')}
                    className="text-blue-600 underline hover:text-blue-700"
                  >
                    Creator Guidelines
                  </button>
                  .
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUpiModal(false);
                  setPendingBidId(null);
                  setUpiId('');
                  setUpiValidationError('');
                }}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpiSubmit}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                disabled={!upiId || Boolean(validateUpiId(upiId)) || !agreed}
              >
                Accept Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <MiniConfirmDialog
        isOpen={confirmDialog.isOpen}
        type={getDialogType()}
        onConfirm={handleConfirmAction}
        onCancel={closeDialog}
        loading={confirmDialog.loading}
        error={confirmDialog.error}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed right-4 top-4 z-50 max-w-md">
          <div
            className={`rounded-none border-l-4 p-4 shadow-lg ${
              toast.type === 'success'
                ? 'border-green-500 bg-green-50 text-green-800'
                : toast.type === 'warning'
                  ? 'border-yellow-500 bg-yellow-50 text-yellow-800'
                  : 'border-red-500 bg-red-50 text-red-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2">
                <div className="text-lg">
                  {toast.type === 'success'
                    ? '✅'
                    : toast.type === 'warning'
                      ? '⚠️'
                      : '❌'}
                </div>
                <p className="text-sm font-medium">{toast.message}</p>
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

      {/* Guidelines Modal */}
      <GuidelinesModal
        isOpen={isOpen}
        onClose={closeGuidelines}
        type={guidelinesType}
      />
    </div>
  );
}

// --- Clan extras subcomponent ---
function ClanApplyExtras({
  application,
  setApplication,
}: {
  application: any;
  setApplication: React.Dispatch<React.SetStateAction<any>>;
}) {
  const { clans: myClans, loading: clansLoading } = useMyClans();
  const { members: clanMembers, loading: membersLoading } = useClanMembers(
    application.clanId
  );

  const handleClanChange = (clanId: string) => {
    const selectedClan = myClans.find((clan) => clan.id === clanId);
    setApplication((prev: any) => ({
      ...prev,
      clanId: clanId,
      clanSlug: selectedClan?.slug || '',
      clanName: selectedClan?.name || '',
    }));
  };

  const handleMemberSelect = (member: any, type: 'team' | 'payout') => {
    if (type === 'team') {
      setApplication((prev: any) => ({
        ...prev,
        teamPlan: [
          ...(prev.teamPlan || []),
          {
            role: '',
            memberId: member.userId,
            username: member.username || member.user?.username || member.email,
            email: member.email,
            hours: 0,
            deliverables: [],
          },
        ],
      }));
    } else {
      setApplication((prev: any) => ({
        ...prev,
        payoutSplit: [
          ...(prev.payoutSplit || []),
          {
            memberId: member.userId,
            username: member.username || member.user?.username || member.email,
            email: member.email,
            percentage: 0,
          },
        ],
      }));
    }
  };

  // Helpers to edit team plan entries
  const updateTeamMember = (index: number, field: string, value: any) => {
    setApplication((prev: any) => ({
      ...prev,
      teamPlan: (prev.teamPlan || []).map((m: any, i: number) =>
        i === index ? { ...m, [field]: value } : m
      ),
    }));
  };
  const removeTeamMember = (index: number) => {
    setApplication((prev: any) => ({
      ...prev,
      teamPlan: (prev.teamPlan || []).filter(
        (_: any, i: number) => i !== index
      ),
    }));
  };

  // Helpers to edit payout split
  const updatePayout = (index: number, field: string, value: any) => {
    setApplication((prev: any) => ({
      ...prev,
      payoutSplit: (prev.payoutSplit || []).map((p: any, i: number) =>
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  };
  const removePayout = (index: number) => {
    setApplication((prev: any) => ({
      ...prev,
      payoutSplit: (prev.payoutSplit || []).filter(
        (_: any, i: number) => i !== index
      ),
    }));
  };

  // Helpers to edit milestones
  const addMilestone = () => {
    setApplication((prev: any) => ({
      ...prev,
      milestonePlan: [
        ...(prev.milestonePlan || []),
        {
          title: '',
          dueAt: new Date().toISOString().slice(0, 10),
          amount: 0,
          deliverables: [],
        },
      ],
    }));
  };
  const updateMilestone = (index: number, field: string, value: any) => {
    setApplication((prev: any) => ({
      ...prev,
      milestonePlan: (prev.milestonePlan || []).map((m: any, i: number) =>
        i === index ? { ...m, [field]: value } : m
      ),
    }));
  };
  const removeMilestone = (index: number) => {
    setApplication((prev: any) => ({
      ...prev,
      milestonePlan: (prev.milestonePlan || []).filter(
        (_: any, i: number) => i !== index
      ),
    }));
  };

  return (
    <div className="space-y-3">
      {/* Clan Selector */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Select Clan *
        </label>
        <select
          value={application.clanId || ''}
          onChange={(e) => handleClanChange(e.target.value)}
          className="w-full rounded-none border border-gray-300 px-3 py-2 text-sm"
          disabled={clansLoading}
          style={{
            fontSize: '14px',
            maxWidth: '100%',
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <option value="" style={{ fontSize: '14px' }}>
            Select a clan...
          </option>
          {myClans.map((clan: any) => (
            <option key={clan.id} value={clan.id} style={{ fontSize: '14px' }}>
              {clan.name.length > 20
                ? `${clan.name.substring(0, 20)}...`
                : clan.name}
            </option>
          ))}
        </select>
        {clansLoading && (
          <p className="mt-1 text-xs text-gray-500">Loading your clans...</p>
        )}
        {application.clanId && (
          <p className="mt-1 truncate text-xs text-gray-500">
            Selected:{' '}
            {myClans.find((c: any) => c.id === application.clanId)?.name}
          </p>
        )}
      </div>

      {/* Clan Members List (optional) */}
      {application.clanId && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Clan Members
          </label>
          {membersLoading ? (
            <p className="text-xs text-gray-500">Loading members...</p>
          ) : clanMembers.length > 0 ? (
            <div className="rounded border bg-gray-50 p-2">
              <p className="mb-1 text-xs text-gray-600">
                Click to add members to your application:
              </p>
              <div className="space-y-1">
                {clanMembers.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded border bg-white p-1.5 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">
                        {member.user?.name ||
                          member.user?.username ||
                          member.username ||
                          member.email ||
                          member.userId ||
                          'Unknown Member'}
                      </div>
                      <div className="truncate text-gray-500">
                        Role: {member.role}
                      </div>
                    </div>
                    <div className="ml-2 flex flex-shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => handleMemberSelect(member, 'team')}
                        className="whitespace-nowrap rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700 hover:bg-blue-200"
                      >
                        + Team
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMemberSelect(member, 'payout')}
                        className="whitespace-nowrap rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700 hover:bg-green-200"
                      >
                        + Payout
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              No members found in this clan.
            </p>
          )}
        </div>
      )}

      {/* Selected Team Plan (optional) */}
      {application.teamPlan && application.teamPlan.length > 0 && (
        <div className="rounded border p-2">
          <div className="mb-1 flex items-center justify-between">
            <h4 className="text-sm font-medium">Selected Team</h4>
          </div>
          <p className="mb-2 text-[11px] text-gray-500">
            Assign a role and estimated hours for each team member.
          </p>
          <div className="space-y-1">
            {application.teamPlan.map((m: any, idx: number) => (
              <div key={idx} className="grid grid-cols-3 items-center gap-2">
                <div
                  className="truncate text-xs"
                  aria-label="Team member username"
                >
                  {m.username || m.email}
                </div>
                <div>
                  <label className="mb-0.5 block text-[11px] text-gray-600">
                    Role
                  </label>
                  <input
                    value={m.role}
                    onChange={(e) =>
                      updateTeamMember(idx, 'role', e.target.value)
                    }
                    placeholder="e.g., Editor, Director"
                    className="w-full border px-2 py-1 text-xs"
                    aria-label="Role"
                  />
                  <label className="mb-0.5 mt-2 block text-[11px] text-gray-600">
                    Deliverables
                  </label>
                  <textarea
                    rows={2}
                    value={(m.deliverables || []).join('\n')}
                    onChange={(e) =>
                      updateTeamMember(
                        idx,
                        'deliverables',
                        (e.target.value || '')
                          .split(/\r?\n/)
                          .map((s: string) => s.trim())
                          .filter(Boolean)
                      )
                    }
                    placeholder="One per line (e.g. First cut)"
                    className="w-full border px-2 py-1 text-xs"
                    aria-label="Team member deliverables"
                  />
                </div>
                <div className="flex items-start gap-1">
                  <div className="flex-1">
                    <label className="mb-0.5 block text-[11px] text-gray-600">
                      Hours
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={m.hours || 0}
                      onChange={(e) =>
                        updateTeamMember(
                          idx,
                          'hours',
                          Number(e.target.value) || 0
                        )
                      }
                      placeholder="e.g., 10"
                      className="w-full border px-2 py-1 text-xs"
                      aria-label="Estimated hours"
                    />
                  </div>
                  <button
                    onClick={() => removeTeamMember(idx)}
                    className="mt-6 text-xs text-red-600"
                    aria-label="Remove team member"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestone Plan (optional) */}
      <div className="rounded border p-2">
        <div className="mb-1 flex items-center justify-between">
          <h4 className="text-sm font-medium">Milestones</h4>
          <button
            type="button"
            onClick={addMilestone}
            className="text-xs text-blue-600"
            aria-label="Add milestone"
          >
            + Add
          </button>
        </div>
        <p className="mb-2 text-[11px] text-gray-500">
          Break down the work and budget into phases.
        </p>
        {application.milestonePlan && application.milestonePlan.length > 0 ? (
          <div className="space-y-2">
            {application.milestonePlan.map((ms: any, i: number) => (
              <div key={i} className="grid grid-cols-3 items-center gap-2">
                <div>
                  <label className="mb-0.5 block text-[11px] text-gray-600">
                    Title
                  </label>
                  <input
                    value={ms.title}
                    onChange={(e) =>
                      updateMilestone(i, 'title', e.target.value)
                    }
                    placeholder="e.g., Pre-production"
                    className="w-full border px-2 py-1 text-xs"
                    aria-label="Milestone title"
                  />
                  <label className="mb-0.5 mt-2 block text-[11px] text-gray-600">
                    Deliverables
                  </label>
                  <textarea
                    rows={2}
                    value={(ms.deliverables || []).join('\n')}
                    onChange={(e) =>
                      updateMilestone(
                        i,
                        'deliverables',
                        (e.target.value || '')
                          .split(/\r?\n/)
                          .map((s: string) => s.trim())
                          .filter(Boolean)
                      )
                    }
                    placeholder="One per line (e.g. Script)"
                    className="w-full border px-2 py-1 text-xs"
                    aria-label="Milestone deliverables"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-[11px] text-gray-600">
                    Due date
                  </label>
                  <input
                    type="date"
                    value={(ms.dueAt || '').slice(0, 10)}
                    onChange={(e) =>
                      updateMilestone(i, 'dueAt', e.target.value)
                    }
                    className="w-full border px-2 py-1 text-xs"
                    aria-label="Milestone due date"
                  />
                </div>
                <div className="flex items-start gap-1">
                  <div className="flex-1">
                    <label className="mb-0.5 block text-[11px] text-gray-600">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={ms.amount || 0}
                      onChange={(e) =>
                        updateMilestone(
                          i,
                          'amount',
                          Number(e.target.value) || 0
                        )
                      }
                      placeholder="e.g., 1500"
                      className="w-full border px-2 py-1 text-xs"
                      aria-label="Milestone amount"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMilestone(i)}
                    className="mt-6 text-xs text-red-600"
                    aria-label="Remove milestone"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">Add at least one milestone.</p>
        )}
      </div>

      {/* Payout Split (optional) */}
      {application.payoutSplit && application.payoutSplit.length > 0 && (
        <div className="rounded border p-2">
          <div className="mb-1 flex items-center justify-between">
            <h4 className="text-sm font-medium">Payout Split</h4>
          </div>
          <p className="mb-2 text-[11px] text-gray-500">
            Set each member's payout percentage (typically totals 100%).
          </p>
          <div className="space-y-1">
            {application.payoutSplit.map((p: any, idx: number) => (
              <div key={idx} className="grid grid-cols-3 items-center gap-2">
                <div
                  className="truncate text-xs"
                  aria-label="Payout member username"
                >
                  {p.username || p.email}
                </div>
                <div>
                  <label className="mb-0.5 block text-[11px] text-gray-600">
                    Percentage
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={p.percentage || 0}
                    onChange={(e) =>
                      updatePayout(
                        idx,
                        'percentage',
                        Number(e.target.value) || 0
                      )
                    }
                    placeholder="e.g., 50"
                    className="w-full border px-2 py-1 text-xs"
                    aria-label="Payout percentage"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-[11px] text-gray-600">
                    Fixed Amount (₹, optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={p.fixedAmount || 0}
                    onChange={(e) =>
                      updatePayout(
                        idx,
                        'fixedAmount',
                        Number(e.target.value) || 0
                      )
                    }
                    placeholder="e.g., 1000"
                    className="w-full border px-2 py-1 text-xs"
                    aria-label="Payout fixed amount"
                  />
                </div>
                <button
                  onClick={() => removePayout(idx)}
                  className="mt-4 text-xs text-red-600"
                  aria-label="Remove payout entry"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inline notes */}
      <p className="text-xs italic text-gray-500">
        💡 You can add team, milestones, and payout now or set them up later in
        the workflow after applying.
      </p>
      <p className="text-[11px] text-gray-500">
        • Team/Milestones/Payout are optional here. You can finish details in
        the clan workflow.
      </p>
    </div>
  );
}
