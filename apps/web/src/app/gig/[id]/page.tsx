'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useClanSearch } from '@/hooks/useClanSearch';
import { useMemberSuggest } from '@/hooks/useMemberSuggest';
import { useMyClans, useClanMembers } from '@/hooks/useClans';

interface Gig {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OPEN' | 'ASSIGNED';
  budgetType: 'fixed' | 'hourly' | 'negotiable';
  budgetMin: number;
  budgetMax: number;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  assignedToId?: string | null;
  assignedToType?: string | null;
  completedAt?: string | null;
  deliverables: string[];
  duration: string;
  experienceLevel: string;
  isClanAllowed: boolean;
  location: string;
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
  teamPlan?: Array<{ role: string; memberId: string; hours?: number; deliverables?: string[] }>;
  milestonePlan?: Array<{ title: string; dueAt: string; amount: number; deliverables?: string[] }>;
  payoutSplit?: Array<{ memberId: string; percentage?: number; fixedAmount?: number }>;
}

export default function GigDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();
  const [gig, setGig] = useState<Gig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [alreadyAppliedMessage, setAlreadyAppliedMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning', message: string } | null>(null);
  const [application, setApplication] = useState<Application>({
    coverLetter: '',
    portfolio: [],
    proposedRate: undefined,
    estimatedTime: '',
    applicantType: 'user'
  });

  const gigId = params.id as string;
  const userType = getUserTypeForRole(currentRole);

  // Check if current user owns this gig (is the brand who posted it)
  const isOwner = isAuthenticated && userType === 'brand' && (gig?.brand?.id === user?.id || gig?.postedById === user?.id);

  // Show toast notification
  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000); // Auto-hide after 5 seconds
  };

  // Helper function to navigate back intelligently
  const goBack = () => {
    // Use the gig-specific session referrer for navigation, but keep the original referrer for logic if needed
    const lastPageReferrer = sessionStorage.getItem('lastPage') || document.referrer;
    const currentUrl = window.location.href;
    const sessionReferrer = sessionStorage.getItem(`gig-${gigId}-referrer`);

    console.log('🔙 goBack debug:', {
      lastPageReferrer,
      sessionReferrer,
      currentUrl,
      gigId
    });

    // Always use session referrer if present and not current page
    if (sessionReferrer && sessionReferrer !== currentUrl) {
      console.log('🔙 [goBack] Using session referrer:', sessionReferrer);
      sessionStorage.removeItem(`gig-${gigId}-referrer`);
      window.location.href = sessionReferrer;
      return;
    }

    // Check if user came from edit page - skip back to original source
    if (lastPageReferrer && lastPageReferrer.includes(`/gig/${gigId}/edit`)) {
      // User came from edit page, try to get the original referrer
      const originalReferrer = sessionStorage.getItem(`gig-${gigId}-referrer`);

      if (originalReferrer && originalReferrer !== currentUrl) {
        console.log('🔙 Going back to original referrer:', originalReferrer);
        window.location.href = originalReferrer;
        return;
      } else {
        // No original referrer stored, go to my-gigs if user is brand owner
        if (isOwner) {
          console.log('🔙 Going to my-gigs (owner, no original referrer)');
          router.push('/my-gigs');
          return;
        }
      }
    }

    // Check if user came from my-gigs page
    if (lastPageReferrer && lastPageReferrer.includes('/my-gigs')) {
      console.log('🔙 Going back to my-gigs');
      router.push('/my-gigs');
      return;
    }

    // Check if user came from another gig page (common when browsing gigs)
    if (lastPageReferrer && lastPageReferrer.includes('/gig/') && !lastPageReferrer.includes(`/gig/${gigId}`)) {
      // User came from another gig, try to go to my-gigs if they're the owner
      if (isOwner) {
        console.log('🔙 Going to my-gigs (came from other gig, is owner)');
        router.push('/my-gigs');
        return;
      }
    }

    // Check if user came from dashboard
    if (lastPageReferrer && lastPageReferrer.includes('/dashboard')) {
      // If they're viewing their own gig, take them to my-gigs instead of dashboard
      if (isOwner) {
        console.log('🔙 Going to my-gigs (came from dashboard, is owner)');
        router.push('/my-gigs');
        return;
      } else {
        console.log('🔙 Going back to dashboard');
        router.push('/dashboard');
        return;
      }
    }

    // Default cases based on user type and ownership
    if (isOwner) {
      // If user owns this gig, they probably want to go to my-gigs
      console.log('🔙 Going to my-gigs (default for owner)');
      router.push('/my-gigs');
    } else if (window.history.length > 1) {
      // For non-owners, try normal back navigation
      console.log('🔙 Using browser back');
      router.back();
    } else {
      // Fallback to marketplace for non-owners
      console.log('🔙 Going to marketplace (fallback)');
      router.push('/marketplace');
    }
  };

  useEffect(() => {
    if (gigId) {
      // Store the original referrer if this is the first visit to this gig (not from edit page)
      const referrer = sessionStorage.getItem('lastPage') || document.referrer;
      const currentReferrer = sessionStorage.getItem(`gig-${gigId}-referrer`);

      console.log('📍 useEffect storing referrer debug:', {
        referrer,
        currentReferrer,
        gigId,
        isEditPage: referrer?.includes(`/gig/${gigId}/edit`)
      });

      // Only store referrer if:
      // 1. No referrer is already stored
      // 2. The referrer is not the edit page for this gig
      // 3. The referrer is not another gig page (to avoid gig-hopping confusion)
      // 4. The referrer is a meaningful source page
      if (!currentReferrer && referrer &&
        !referrer.includes(`/gig/${gigId}/edit`) &&
        !referrer.includes('/gig/') && // Don't store other gig pages
        (referrer.includes('/my-gigs') ||
          referrer.includes('/dashboard') ||
          referrer.includes('/marketplace') ||
          referrer.includes('/search'))) {

        console.log('📍 [useEffect] Storing referrer:', referrer);
        sessionStorage.setItem(`gig-${gigId}-referrer`, referrer);
      }

      loadGigDetails();
    }
  }, [gigId]);

  // Refresh data when the page becomes visible (user returns from edit)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && gigId) {
        console.log('🔄 Page became visible, refreshing gig data');
        loadGigDetails(true); // Force refresh when page becomes visible
      }
    };

    const handleFocus = () => {
      if (gigId) {
        console.log('🔄 Window focused, refreshing gig data');
        loadGigDetails(true); // Force refresh when window is focused
      }
    };

    const handleUnload = () => {
      // Clean up session storage on page unload
      sessionStorage.removeItem(`gig-${gigId}-referrer`);
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

  const loadGigDetails = async (forceRefresh = false) => {
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

    // Set a flag in session storage to indicate we want to publish after editing
    sessionStorage.setItem('publishDraftIntent', 'true');

    console.log('🚀 Redirecting to edit page for draft completion before publishing:', gigId);

    // Navigate to edit page with publish intent
    router.push(`/gig/${gigId}/edit?publish=true`);
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!user) {
      showToast('error', 'User information not available. Please refresh and try again.');
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
        showToast('error', 'Invalid gig ID. Please refresh the page and try again.');
        return;
      }

      // Convert portfolio to string array format expected by backend
      const portfolioUrls = application.portfolio.map(item => item.url).filter(url => url.trim());

      // Base payload
      let applicationData: any = {
        proposal: application.coverLetter.trim(),
        portfolio: portfolioUrls,
        quotedPrice: application.proposedRate || 0,
        estimatedTime: application.estimatedTime,
        applicantType: application.applicantType
      };

      if (application.applicantType === 'clan') {
        // Require a clan selection only
        if (!(application.clanSlug?.trim() || application.clanId?.trim())) {
          showToast('warning', 'Please select your clan (slug or ID)');
          return;
        }

        // Enforce proposed price not exceeding gig max budget (if provided)
        if (gig?.budgetMax && (Number(application.proposedRate || 0) > Number(gig.budgetMax))) {
          showToast('warning', `Proposed price (₹${application.proposedRate}) cannot exceed gig max budget (₹${gig.budgetMax}).`);
          return;
        }

        // If milestones provided, ensure valid and within proposed price
        if ((application.milestonePlan?.length || 0) > 0) {
          const milestoneInvalid = (application.milestonePlan || []).some((ms: any) => !ms.title?.trim() || !ms.dueAt || (Number(ms.amount) || 0) <= 0);
          if (milestoneInvalid) {
            showToast('warning', 'Each milestone needs title, due date, and amount > 0');
            return;
          }
          const totalMilestoneAmount = (application.milestonePlan || []).reduce((sum: number, ms: any) => sum + (Number(ms.amount) || 0), 0);
          const proposedTotal = Number(application.proposedRate || 0);
          if (proposedTotal > 0 && totalMilestoneAmount > proposedTotal) {
            showToast('warning', `Total milestone amount (₹${totalMilestoneAmount}) cannot exceed proposed price (₹${proposedTotal}).`);
            return;
          }
        }

        // If payout provided, ensure each entry has some value
        if ((application.payoutSplit?.length || 0) > 0) {
          const payoutInvalid = (application.payoutSplit || []).some((p: any) => (Number(p.percentage) || 0) <= 0 && (Number(p.fixedAmount) || 0) <= 0);
          if (payoutInvalid) {
            showToast('warning', 'Each payout entry must have percentage or fixed amount > 0');
            return;
          }
        }

        // If team provided, ensure each entry has role and hours
        if ((application.teamPlan?.length || 0) > 0) {
          const teamInvalid = (application.teamPlan || []).some((m: any) => !m.role?.trim() || (Number(m.hours) || 0) <= 0);
          if (teamInvalid) {
            showToast('warning', 'Each team member must have a role and hours > 0');
            return;
          }
        }

        const sanitize = (list: any[]) => (list || []).map((s: any) => String(s).replace(/,+$/, '').trim()).filter(Boolean);
        const toIdentifier = (m: any) => {
          const uuidLike = typeof m.username === 'string' && /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-/.test(m.username);
          const id = m.memberId || (uuidLike ? m.username : undefined);
          return id ? { memberId: id } : (m.username ? { username: m.username } : {});
        };

        applicationData = {
          ...applicationData,
          applicantType: 'clan',
          clanSlug: application.clanSlug?.trim(),
          ...(application.clanId?.trim() ? { clanId: application.clanId.trim() } : {}),
          ...(application.teamPlan && application.teamPlan.length > 0 ? {
            teamPlan: application.teamPlan.map((m: any) => ({
              role: m.role,
              ...toIdentifier(m),
              ...(m.email ? { email: m.email } : {}),
              hours: m.hours,
              deliverables: sanitize(m.deliverables)
            }))
          } : {}),
          ...(application.milestonePlan && application.milestonePlan.length > 0 ? {
            milestonePlan: application.milestonePlan.map((ms: any) => ({
              title: ms.title,
              dueAt: ms.dueAt,
              amount: ms.amount,
              deliverables: sanitize(ms.deliverables)
            }))
          } : {}),
          ...(application.payoutSplit && application.payoutSplit.length > 0 ? {
            payoutSplit: application.payoutSplit.map((p: any) => ({
              ...toIdentifier(p),
              ...(p.email ? { email: p.email } : {}),
              percentage: p.percentage,
              fixedAmount: p.fixedAmount
            }))
          } : {})
        };
      }

      console.log('🚀 Sending application data:', applicationData);
      console.log('🔑 User info:', { id: user.id, email: user.email });
      console.log('🎯 Gig ID:', gigId);

      console.log('🚀 Application data:', applicationData);

      const response = await apiClient.post(`/api/gig/${gigId}/apply`, applicationData);

      console.log('✅ Application response:', response);

      if (response.success) {
        // Refresh gig data to update application status
        await loadGigDetails();
        setShowApplicationForm(false);
        setApplication({
          coverLetter: '',
          portfolio: [],
          proposedRate: undefined,
          estimatedTime: '',
          applicantType: 'user'
        });

        // Show success message
        showToast('success', 'Application submitted successfully! The brand will review your application soon.');

        // If applied as clan, navigate to the workflow to assign tasks
        if (application.applicantType === 'clan' && application.clanId) {
          router.push(`/clan/${application.clanId}/gig-workflow?gigId=${gigId}&tab=tasks`);
        }
      }
    } catch (error: any) {
      console.error('❌ Failed to apply to gig:', error);
      console.error('❌ Error details:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error,
        details: error.details
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
      if (userMessage.toLowerCase().includes('already applied')) {
        userMessage = 'You have already applied to this gig. Check your applications in the "My Applications" section.';
        setAlreadyAppliedMessage('You have already applied to this gig');
        showToast('warning', userMessage);
        // Also refresh the gig data to update the UI state
        await loadGigDetails();
      } else if (userMessage.toLowerCase().includes('not authenticated')) {
        userMessage = 'Please log in again to apply for this gig.';
        showToast('error', userMessage);
        router.push('/login');
      } else if (userMessage.toLowerCase().includes('maximum applications')) {
        userMessage = 'This gig has reached its maximum number of applications.';
        showToast('warning', userMessage);
      } else if (userMessage.toLowerCase().includes('gig not found')) {
        userMessage = 'This gig is no longer available.';
        showToast('error', userMessage);
      } else if (userMessage.toLowerCase().includes('validation')) {
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
    setApplication(prev => ({
      ...prev,
      portfolio: [...prev.portfolio, { title: '', url: '' }]
    }));
  };

  const updatePortfolioItem = (index: number, field: 'title' | 'url', value: string) => {
    setApplication(prev => ({
      ...prev,
      portfolio: prev.portfolio.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removePortfolioItem = (index: number) => {
    setApplication(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index)
    }));
  };

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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading gig details...</p>
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
          <p className="text-gray-600 mb-6">The gig you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={goBack}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const canApply = isAuthenticated && !gig.isApplied &&
    (gig.status === 'OPEN' || gig.status === 'ACTIVE') &&
    (!gig.maxApplications || gig.applicationCount < gig.maxApplications);

  // console.log('🔍 Gig details:', gig);

  return (
    <div className="min-h-screen bg-gray-50 py-2">
      <div className="mx-auto max-w-6xl px-1 sm:px-1 lg:px-1">
        {/* Header */}
        <div className="mb-2">
          <div className="flex flex-row md:flex-row items-left justify-between">
            <div className="flex items-center space-x-1">
              <button
                onClick={goBack}
                className="btn-secondary"
              >
                ←
              </button>
              <button
                onClick={() => loadGigDetails(true)}
                className="btn-secondary text-sm"
                disabled={isLoading}
                title="Refresh gig data"
              >
                {isLoading ? '🔄' : '↻'}
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
                      className="text-sm cursor-pointer text-blue-600 hover:underline"
                      title="Review and complete your draft gig before publishing"
                    >
                      Complete & Publish
                    </button>
                  )}
                  <span> | </span>
                  <Link
                    href={`/gig/${gigId}/edit`}
                    className="text-sm cursor-pointer text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <span> | </span>
                  {/* Only show applications link for published gigs */}
                  {gig.status !== 'DRAFT' && (
                    <Link
                      href={`/gig/${gigId}/applications`}
                      className="text-sm cursor-pointer text-blue-600 hover:underline"
                    >
                      Applications ({gig.applicationCount || 0})
                    </Link>
                  )}
                </div>
              )}
              {/* Status Badge */}
              {gig.status !== 'OPEN' && gig.status !== 'ASSIGNED' && (
                <span className={`px-1 py-1 rounded-none text-sm font-medium ${gig.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  gig.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                    gig.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      gig.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                  }`}>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          {/* Draft Notice */}
          {gig.status === 'DRAFT' && (
            <div className="lg:col-span-3 mb-2">
              <div className="bg-yellow-50 border border-yellow-200 rounded-none p-1 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {/* <div className="text-2xl">📝</div> */}
                  <div>
                    <p className="font-semibold text-yellow-800">Draft Gig</p>
                    <p className="text-sm text-yellow-600">
                      {isOwner
                        ? 'This gig is still in draft mode. Complete and publish it to make it live and start accepting applications.'
                        : 'This gig is currently in draft mode and not accepting applications.'
                      }
                    </p>
                  </div>
                </div>
                {isOwner && (
                  <button
                    onClick={handlePublishDraft}
                    className="text-sm p-2 cursor-pointer text-blue-600 hover:underline"
                  >
                    Complete...
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Already Applied Banner */}
          {(gig.isApplied || alreadyAppliedMessage) && (
            <div className="lg:col-span-3 mb-1">
              <div className="bg-green-50 border border-green-200 rounded-none p-1 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <p className="font-semibold text-green-800">Application Submitted</p>
                    <p className="text-sm text-green-600">
                      {alreadyAppliedMessage || 'You have already applied to this gig. The brand will review your application soon.'}
                    </p>
                  </div>
                </div>
                <Link href="/my/applications" className="text-sm cursor-pointer text-blue-600 hover:underline p-2">
                  View
                </Link>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-2">
            {/* Gig Header */}
            <div className="card-glass p-2">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{gig.title}</h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {gig.brand?.logo && (
                        <img
                          src={gig.brand?.logo}
                          alt={gig.brand?.name}
                          className="w-8 h-8 rounded-none"
                        />
                      )}
                      <span className="font-medium">{gig.brand?.name}</span>
                      {gig.brand?.verified && <span className="text-blue-500">✓</span>}
                    </div>
                    <div className="px-1 py-1 bg-blue-100 text-blue-800 rounded-none text-sm">
                      {gig.category}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-3xl font-bold text-green-600">
                      ₹{gig.budgetMin?.toLocaleString()}{gig.budgetMax && gig.budgetMax !== gig.budgetMin ? ` - ₹${gig.budgetMax?.toLocaleString()}` : ''}
                    </div>
                    <div className="text-sm text-gray-600">Budget ({gig.budgetType})</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">Deadline</label>
                  <div className="text-lg">{gig.deadline ? new Date(gig.deadline).toLocaleDateString() : 'Not specified'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Applications</label>
                  <div className="text-lg">
                    {gig._count?.applications} {gig.maxApplications && `/ ${gig.maxApplications}`}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Duration</label>
                  <div className="text-lg">{gig.duration || 'Not specified'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Urgency</label>
                  <div className="text-lg">
                    <span className={`px-2 py-1 rounded text-sm ${gig.urgency === 'HIGH' ? 'bg-red-100 text-red-800' :
                      gig.urgency === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                      {gig.urgency || 'Normal'}
                    </span>
                  </div>
                </div>
              </div>

              {gig.tags && gig.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {gig.tags.map((tag, index) => (
                    <span key={index} className="px-1 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="card-glass p-1">
              <h2 className="text-xl font-semibold mb-4">📝 Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{gig.description}</p>
              </div>
            </div>

            {/* Requirements */}
            <div className="card-glass p-1">
              <h2 className="text-xl font-semibold mb-2">✅ Requirements</h2>

              {/* General Requirements */}
              {gig.requirements && (
                <div className="mb-2">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{gig.requirements}</p>
                  </div>
                </div>
              )}

              {/* Skills Required */}
              {gig.skillsRequired && gig.skillsRequired.length > 0 && (
                <div className="mb-2">
                  <h3 className="font-semibold mb-3">💼 Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {gig.skillsRequired.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-none text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Role Required */}
              {gig.roleRequired && (
                <div className="mb-2">
                  <h3 className="font-semibold mb-3">👤 Role Required</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-none text-sm">
                    {gig.roleRequired}
                  </span>
                </div>
              )}

              {/* Experience Level */}
              {gig.experienceLevel && (
                <div className="mb-2">
                  <h3 className="font-semibold mb-3">📊 Experience Level</h3>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-none text-sm">
                    {gig.experienceLevel}
                  </span>
                </div>
              )}

              {/* Platform Requirements */}
              {gig.platformRequirements && gig.platformRequirements.length > 0 && (
                <div className="mb-2">
                  <h3 className="font-semibold mb-3">📱 Platform Requirements</h3>
                  <div className="space-y-2">
                    {gig.platformRequirements.map((req: any, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <span className="font-medium">{req.platform || 'Platform'}</span>
                        <span className="text-sm text-gray-600">
                          {req.minFollowers ? `${req.minFollowers.toLocaleString()}+ followers` : 'Requirements specified'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              {gig.location && (
                <div className="mb-2">
                  <h3 className="font-semibold mb-3">📍 Location</h3>
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-none text-sm">
                    {gig.location}
                  </span>
                </div>
              )}

              {/* Clan Allowed */}
              <div className="mb-2">
                <h3 className="font-semibold mb-3">👥 Team Applications</h3>
                <span className={`px-3 py-1 rounded-none text-sm ${gig.isClanAllowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                  {gig.isClanAllowed ? 'Clan applications allowed' : 'Individual applications only'}
                </span>
              </div>
            </div>

            {/* Deliverables */}
            {gig.deliverables && gig.deliverables.length > 0 && (
              <div className="card-glass p-3">
                <h2 className="text-xl font-semibold mb-2">🎯 Deliverables</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {gig.deliverables.map((deliverable, index) => (
                    <li key={index}>{deliverable}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-2">
            {/* Application Status */}
            <div className="card-glass p-3">
              <h3 className="text-lg font-semibold mb-4">Application Status</h3>

              {!isAuthenticated ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Sign in to apply for this gig</p>
                  <Link href="/login" className="btn-primary w-full">
                    Sign In
                  </Link>
                </div>
              ) : gig.status === 'DRAFT' ? (
                <div className="text-center">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="font-semibold text-gray-600 mb-2">Draft Mode</p>
                  <p className="text-sm text-gray-600 mb-4">
                    {isOwner
                      ? 'Complete and publish this gig to start accepting applications'
                      : 'This gig is not yet published and not accepting applications'
                    }
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
              ) : gig.isApplied ? (
                <div className="text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="font-semibold text-green-600 mb-2">Already Applied</p>
                  <p className="text-sm text-gray-600 mb-4">Your application is under review</p>
                  <Link href="/my/applications" className="btn-secondary w-full">
                    View My Applications
                  </Link>
                </div>
              ) : !canApply ? (
                <div className="text-center">
                  <div className="text-4xl mb-2">⚠️</div>
                  <p className="font-semibold text-yellow-600 mb-2">Cannot Apply</p>
                  <p className="text-sm text-gray-600 mb-4">
                    {gig.status !== 'OPEN' && gig.status !== 'ACTIVE' ? 'This gig is no longer active' :
                      'Application limit reached'}
                  </p>
                </div>
              ) : (
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
              )}
            </div>

            {/* Brand Info */}
            <div className="card-glass p-3">
              <h3 className="text-lg font-semibold mb-4">About the Brand</h3>
              <div className="flex items-center space-x-3 mb-4">
                {gig.brand?.logo && (
                  <img
                    src={gig.brand?.logo}
                    alt={gig.brand?.name}
                    className="w-12 h-12 rounded-none"
                  />
                )}
                <div>
                  <div className="font-semibold">{gig.brand?.name}</div>
                  {gig.brand?.verified && (
                    <div className="text-sm text-blue-600">✓ Verified Brand</div>
                  )}
                </div>
              </div>
              <Link
                href={`/brand/${gig.brand?.id}` as any}
                className="btn-secondary w-full"
              >
                View Brand Profile
              </Link>
            </div>

            {/* Similar Gigs */}
            <div className="card-glass p-3">
              <h3 className="text-lg font-semibold mb-4">Similar Gigs</h3>
              <div className="space-y-3">
                <Link href="/marketplace" className="block p-3 border rounded hover:bg-gray-50">
                  <div className="font-medium text-sm">Browse more {gig.category} gigs</div>
                  <div className="text-xs text-gray-600">Find similar opportunities</div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form Modal */}
        {showApplicationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-1">
            <div className="bg-white w-full max-w-[85vw] -mt-10 max-h-[85vh] overflow-y-auto mx-2 application-modal" style={{ maxWidth: 'calc(100vw - 8px)' }}>
              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold truncate flex-1 mr-2">Apply to: {gig.title}</h2>
                  <button
                    onClick={() => setShowApplicationForm(false)}
                    className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Cover Letter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter *</label>
                    <textarea
                      value={application.coverLetter}
                      onChange={(e) => setApplication(prev => ({ ...prev, coverLetter: e.target.value }))}
                      rows={4}
                      className="w-full border border-gray-300 rounded-none px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Tell the brand why you're perfect for this campaign..."
                      style={{ maxWidth: '100%' }}
                    />
                  </div>

                  {/* Proposed Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Rate (optional)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500 text-sm">₹</span>
                      <input
                        type="number"
                        value={application.proposedRate || ''}
                        onChange={(e) => setApplication(prev => ({
                          ...prev,
                          proposedRate: e.target.value ? Number(e.target.value) : undefined
                        }))}
                        className="w-full border border-gray-300 rounded-none pl-8 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Your rate for this campaign"
                        style={{ maxWidth: '100%' }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Budget: ₹{gig.budgetMin?.toLocaleString()}{gig.budgetMax && gig.budgetMax !== gig.budgetMin ? ` - ₹${gig.budgetMax?.toLocaleString()}` : ''} ({gig.budgetType})
                    </p>
                  </div>

                  {/* Estimated Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time to Complete *</label>
                    <select
                      value={application.estimatedTime}
                      onChange={(e) => setApplication(prev => ({ ...prev, estimatedTime: e.target.value }))}
                      className="w-full border border-gray-300 rounded-none px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      style={{
                        fontSize: '14px',
                        maxWidth: '100%',
                        width: '100%',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      <option value="" style={{ fontSize: '14px' }}>Select estimated time</option>
                      <option value="1-3 days" style={{ fontSize: '14px' }}>1-3 days</option>
                      <option value="4-7 days" style={{ fontSize: '14px' }}>4-7 days</option>
                      <option value="1-2 weeks" style={{ fontSize: '14px' }}>1-2 weeks</option>
                      <option value="2-4 weeks" style={{ fontSize: '14px' }}>2-4 weeks</option>
                      <option value="1-2 months" style={{ fontSize: '14px' }}>1-2 months</option>
                      <option value="2+ months" style={{ fontSize: '14px' }}>2+ months</option>
                    </select>
                  </div>

                  {/* Application Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Type</label>
                    <select
                      value={application.applicantType}
                      onChange={(e) => setApplication(prev => ({ ...prev, applicantType: e.target.value as 'user' | 'clan' }))}
                      className="w-full border border-gray-300 rounded-none px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      style={{
                        fontSize: '14px',
                        maxWidth: '100%',
                        width: '100%',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      <option value="user" style={{ fontSize: '14px' }}>Individual Application</option>
                      {gig.isClanAllowed && <option value="clan" style={{ fontSize: '14px' }}>Clan Application</option>}
                    </select>
                    {!gig.isClanAllowed && (
                      <p className="text-xs text-gray-600 mt-1">
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

                  {/* Portfolio */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Portfolio Examples
                      </label>
                      <button
                        onClick={addPortfolioItem}
                        className="btn-ghost btn-sm text-blue-600 text-xs"
                      >
                        + Add Item
                      </button>
                    </div>

                    {application.portfolio.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 gap-2 mb-2">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updatePortfolioItem(index, 'title', e.target.value)}
                          className="border border-gray-300 rounded-none px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Title"
                          style={{ maxWidth: '100%' }}
                        />
                        <div className="flex space-x-2">
                          <input
                            type="url"
                            value={item.url}
                            onChange={(e) => updatePortfolioItem(index, 'url', e.target.value)}
                            className="flex-1 border border-gray-300 rounded-none px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="URL"
                            style={{ maxWidth: '100%' }}
                          />
                          <button
                            onClick={() => removePortfolioItem(index)}
                            className="btn-ghost btn-sm text-red-600 text-xs px-2"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setShowApplicationForm(false)}
                      className="flex-1 btn-secondary text-sm py-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApply}
                      disabled={application.coverLetter.trim().length < 10 || !application.estimatedTime || isApplying}
                      className="flex-1 btn-primary disabled:opacity-50 text-sm py-0"
                    >
                      {isApplying ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className={`p-4 rounded-none shadow-lg border-l-4 ${toast.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
            toast.type === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-800' :
              'bg-red-50 border-red-500 text-red-800'
            }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2">
                <div className="text-lg">
                  {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : '❌'}
                </div>
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <button
                onClick={() => setToast(null)}
                className="text-gray-400 hover:text-gray-600 ml-2"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Clan extras subcomponent ---
function ClanApplyExtras({ application, setApplication }: {
  application: any;
  setApplication: React.Dispatch<React.SetStateAction<any>>;
}) {
  const { clans: myClans, loading: clansLoading } = useMyClans();
  const { members: clanMembers, loading: membersLoading } = useClanMembers(application.clanId);

  const handleClanChange = (clanId: string) => {
    const selectedClan = myClans.find(clan => clan.id === clanId);
    setApplication((prev: any) => ({
      ...prev,
      clanId: clanId,
      clanSlug: selectedClan?.slug || '',
      clanName: selectedClan?.name || ''
    }));
  };

  const handleMemberSelect = (member: any, type: 'team' | 'payout') => {
    if (type === 'team') {
      setApplication((prev: any) => ({
        ...prev,
        teamPlan: [...(prev.teamPlan || []), {
          role: '',
          memberId: member.userId,
          username: member.username || member.user?.username || member.email,
          email: member.email,
          hours: 0,
          deliverables: []
        }]
      }));
    } else {
      setApplication((prev: any) => ({
        ...prev,
        payoutSplit: [...(prev.payoutSplit || []), {
          memberId: member.userId,
          username: member.username || member.user?.username || member.email,
          email: member.email,
          percentage: 0
        }]
      }));
    }
  };

  // Helpers to edit team plan entries
  const updateTeamMember = (index: number, field: string, value: any) => {
    setApplication((prev: any) => ({
      ...prev,
      teamPlan: (prev.teamPlan || []).map((m: any, i: number) => i === index ? { ...m, [field]: value } : m)
    }));
  };
  const removeTeamMember = (index: number) => {
    setApplication((prev: any) => ({
      ...prev,
      teamPlan: (prev.teamPlan || []).filter((_: any, i: number) => i !== index)
    }));
  };

  // Helpers to edit payout split
  const updatePayout = (index: number, field: string, value: any) => {
    setApplication((prev: any) => ({
      ...prev,
      payoutSplit: (prev.payoutSplit || []).map((p: any, i: number) => i === index ? { ...p, [field]: value } : p)
    }));
  };
  const removePayout = (index: number) => {
    setApplication((prev: any) => ({
      ...prev,
      payoutSplit: (prev.payoutSplit || []).filter((_: any, i: number) => i !== index)
    }));
  };

  // Helpers to edit milestones
  const addMilestone = () => {
    setApplication((prev: any) => ({
      ...prev,
      milestonePlan: [
        ...(prev.milestonePlan || []),
        { title: '', dueAt: new Date().toISOString().slice(0, 10), amount: 0, deliverables: [] }
      ]
    }));
  };
  const updateMilestone = (index: number, field: string, value: any) => {
    setApplication((prev: any) => ({
      ...prev,
      milestonePlan: (prev.milestonePlan || []).map((m: any, i: number) => i === index ? { ...m, [field]: value } : m)
    }));
  };
  const removeMilestone = (index: number) => {
    setApplication((prev: any) => ({
      ...prev,
      milestonePlan: (prev.milestonePlan || []).filter((_: any, i: number) => i !== index)
    }));
  };

  return (
    <div className="space-y-3">
      {/* Clan Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Clan *</label>
        <select
          value={application.clanId || ''}
          onChange={(e) => handleClanChange(e.target.value)}
          className="w-full border border-gray-300 rounded-none px-3 py-2 text-sm"
          disabled={clansLoading}
          style={{
            fontSize: '14px',
            maxWidth: '100%',
            width: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          <option value="" style={{ fontSize: '14px' }}>Select a clan...</option>
          {myClans.map((clan: any) => (
            <option key={clan.id} value={clan.id} style={{ fontSize: '14px' }}>
              {clan.name.length > 20 ? `${clan.name.substring(0, 20)}...` : clan.name}
            </option>
          ))}
        </select>
        {clansLoading && (
          <p className="text-xs text-gray-500 mt-1">Loading your clans...</p>
        )}
        {application.clanId && (
          <p className="text-xs text-gray-500 mt-1 truncate">
            Selected: {myClans.find((c: any) => c.id === application.clanId)?.name}
          </p>
        )}
      </div>

      {/* Clan Members List (optional) */}
      {application.clanId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Clan Members</label>
          {membersLoading ? (
            <p className="text-xs text-gray-500">Loading members...</p>
          ) : clanMembers.length > 0 ? (
            <div className="border rounded p-2 bg-gray-50">
              <p className="text-xs text-gray-600 mb-1">Click to add members to your application:</p>
              <div className="space-y-1">
                {clanMembers.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between p-1.5 bg-white rounded border text-xs">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {member.user?.name || member.user?.username || member.username || member.email || member.userId || 'Unknown Member'}
                      </div>
                      <div className="text-gray-500 truncate">
                        Role: {member.role}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMemberSelect(member, 'team')}
                        className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 whitespace-nowrap"
                      >
                        + Team
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMemberSelect(member, 'payout')}
                        className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 whitespace-nowrap"
                      >
                        + Payout
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500">No members found in this clan.</p>
          )}
        </div>
      )}

      {/* Selected Team Plan (optional) */}
      {(application.teamPlan && application.teamPlan.length > 0) && (
        <div className="border rounded p-2">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium">Selected Team</h4>
          </div>
          <p className="text-[11px] text-gray-500 mb-2">Assign a role and estimated hours for each team member.</p>
          <div className="space-y-1">
            {application.teamPlan.map((m: any, idx: number) => (
              <div key={idx} className="grid grid-cols-3 gap-2 items-center">
                <div className="text-xs truncate" aria-label="Team member username">{m.username || m.email}</div>
                <div>
                  <label className="block text-[11px] text-gray-600 mb-0.5">Role</label>
                  <input
                    value={m.role}
                    onChange={(e) => updateTeamMember(idx, 'role', e.target.value)}
                    placeholder="e.g., Editor, Director"
                    className="border px-2 py-1 text-xs w-full"
                    aria-label="Role"
                  />
                  <label className="block text-[11px] text-gray-600 mt-2 mb-0.5">Deliverables</label>
                  <textarea
                    rows={2}
                    value={(m.deliverables || []).join('\n')}
                    onChange={(e) => updateTeamMember(idx, 'deliverables', (e.target.value || '').split(/\r?\n/).map((s: string) => s.trim()).filter(Boolean))}
                    placeholder="One per line (e.g. First cut)"
                    className="border px-2 py-1 text-xs w-full"
                    aria-label="Team member deliverables"
                  />
                </div>
                <div className="flex items-start gap-1">
                  <div className="flex-1">
                    <label className="block text-[11px] text-gray-600 mb-0.5">Hours</label>
                    <input
                      type="number"
                      min={0}
                      value={m.hours || 0}
                      onChange={(e) => updateTeamMember(idx, 'hours', Number(e.target.value) || 0)}
                      placeholder="e.g., 10"
                      className="border px-2 py-1 text-xs w-full"
                      aria-label="Estimated hours"
                    />
                  </div>
                  <button onClick={() => removeTeamMember(idx)} className="text-red-600 text-xs mt-6" aria-label="Remove team member">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestone Plan (optional) */}
      <div className="border rounded p-2">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-medium">Milestones</h4>
          <button type="button" onClick={addMilestone} className="text-xs text-blue-600" aria-label="Add milestone">+ Add</button>
        </div>
        <p className="text-[11px] text-gray-500 mb-2">Break down the work and budget into phases.</p>
        {(application.milestonePlan && application.milestonePlan.length > 0) ? (
          <div className="space-y-2">
            {application.milestonePlan.map((ms: any, i: number) => (
              <div key={i} className="grid grid-cols-3 gap-2 items-center">
                <div>
                  <label className="block text-[11px] text-gray-600 mb-0.5">Title</label>
                  <input
                    value={ms.title}
                    onChange={(e) => updateMilestone(i, 'title', e.target.value)}
                    placeholder="e.g., Pre-production"
                    className="border px-2 py-1 text-xs w-full"
                    aria-label="Milestone title"
                  />
                  <label className="block text-[11px] text-gray-600 mt-2 mb-0.5">Deliverables</label>
                  <textarea
                    rows={2}
                    value={(ms.deliverables || []).join('\n')}
                    onChange={(e) => updateMilestone(i, 'deliverables', (e.target.value || '').split(/\r?\n/).map((s: string) => s.trim()).filter(Boolean))}
                    placeholder="One per line (e.g. Script)"
                    className="border px-2 py-1 text-xs w-full"
                    aria-label="Milestone deliverables"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-600 mb-0.5">Due date</label>
                  <input
                    type="date"
                    value={(ms.dueAt || '').slice(0, 10)}
                    onChange={(e) => updateMilestone(i, 'dueAt', e.target.value)}
                    className="border px-2 py-1 text-xs w-full"
                    aria-label="Milestone due date"
                  />
                </div>
                <div className="flex items-start gap-1">
                  <div className="flex-1">
                    <label className="block text-[11px] text-gray-600 mb-0.5">Amount (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={ms.amount || 0}
                      onChange={(e) => updateMilestone(i, 'amount', Number(e.target.value) || 0)}
                      placeholder="e.g., 1500"
                      className="border px-2 py-1 text-xs w-full"
                      aria-label="Milestone amount"
                    />
                  </div>
                  <button type="button" onClick={() => removeMilestone(i)} className="text-red-600 text-xs mt-6" aria-label="Remove milestone">Remove</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">Add at least one milestone.</p>
        )}
      </div>

      {/* Payout Split (optional) */}
      {(application.payoutSplit && application.payoutSplit.length > 0) && (
        <div className="border rounded p-2">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium">Payout Split</h4>
          </div>
          <p className="text-[11px] text-gray-500 mb-2">Set each member's payout percentage (typically totals 100%).</p>
          <div className="space-y-1">
            {application.payoutSplit.map((p: any, idx: number) => (
              <div key={idx} className="grid grid-cols-3 gap-2 items-center">
                <div className="text-xs truncate" aria-label="Payout member username">{p.username || p.email}</div>
                <div>
                  <label className="block text-[11px] text-gray-600 mb-0.5">Percentage</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={p.percentage || 0}
                    onChange={(e) => updatePayout(idx, 'percentage', Number(e.target.value) || 0)}
                    placeholder="e.g., 50"
                    className="border px-2 py-1 text-xs w-full"
                    aria-label="Payout percentage"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-600 mb-0.5">Fixed Amount (₹, optional)</label>
                  <input
                    type="number"
                    min={0}
                    value={p.fixedAmount || 0}
                    onChange={(e) => updatePayout(idx, 'fixedAmount', Number(e.target.value) || 0)}
                    placeholder="e.g., 1000"
                    className="border px-2 py-1 text-xs w-full"
                    aria-label="Payout fixed amount"
                  />
                </div>
                <button onClick={() => removePayout(idx)} className="text-red-600 text-xs mt-4" aria-label="Remove payout entry">Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inline notes */}
      <p className="text-xs text-gray-500 italic">💡 You can add team, milestones, and payout now or set them up later in the workflow after applying.</p>
      <p className="text-[11px] text-gray-500">• Team/Milestones/Payout are optional here. You can finish details in the clan workflow.</p>
    </div>
  );
}
