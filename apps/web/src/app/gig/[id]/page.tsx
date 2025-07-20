'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface Gig {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OPEN';
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
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'warning', message: string} | null>(null);
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
    // Get the referrer to understand where user came from
    const referrer = document.referrer;
    const currentUrl = window.location.href;
    
    console.log('🔙 Navigation debug:', {
      referrer,
      currentUrl,
      gigId,
      sessionReferrer: sessionStorage.getItem(`gig-${gigId}-referrer`)
    });
    
    // Check if user came from edit page - skip back to original source
    if (referrer && referrer.includes(`/gig/${gigId}/edit`)) {
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
    if (referrer && referrer.includes('/my-gigs')) {
      console.log('🔙 Going back to my-gigs');
      router.push('/my-gigs');
      return;
    }
    
    // Check if user came from another gig page (common when browsing gigs)
    if (referrer && referrer.includes('/gig/') && !referrer.includes(`/gig/${gigId}`)) {
      // User came from another gig, try to go to my-gigs if they're the owner
      if (isOwner) {
        console.log('🔙 Going to my-gigs (came from other gig, is owner)');
        router.push('/my-gigs');
        return;
      }
    }
    
    // Check if user came from dashboard
    if (referrer && referrer.includes('/dashboard')) {
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
      const referrer = document.referrer;
      const currentReferrer = sessionStorage.getItem(`gig-${gigId}-referrer`);
      
      console.log('📍 Storing referrer debug:', {
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
        
        console.log('📍 Storing referrer:', referrer);
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
        console.log('🎯 Loaded gig data:', {
          id: gigData.id,
          title: gigData.title,
          isApplied: gigData.isApplied,
          status: gigData.status,
          applicationCount: gigData._count?.applications,
          updatedAt: gigData.updatedAt,
          forceRefresh
        });
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
      
      // Prepare application data
      const applicationData = {
        proposal: application.coverLetter.trim(),
        portfolio: portfolioUrls,
        quotedPrice: application.proposedRate || 0,
        estimatedTime: application.estimatedTime,
        applicantType: application.applicantType
      };
      
      console.log('🚀 Sending application data:', applicationData);
      console.log('🔑 User info:', { id: user.id, email: user.email });
      console.log('🎯 Gig ID:', gigId);
      
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
        showToast('success', '✅ Application submitted successfully! The brand will review your application soon.');
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

  console.log('🔍 Gig details:', gig);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={goBack}
                className="btn-secondary"
              >
                ← Back
              </button>
              <button 
                onClick={() => loadGigDetails(true)}
                className="btn-secondary text-sm"
                disabled={isLoading}
                title="Refresh gig data"
              >
                {isLoading ? '🔄' : '↻'} Refresh
              </button>
            </div>
            <div className="flex items-center space-x-3">
              {/* Owner Actions */}
              {isOwner && (
                <div className="flex items-center space-x-2">
                  {/* Publish Draft Button - only show for DRAFT status */}
                  {gig.status === 'DRAFT' && (
                    <button
                      onClick={handlePublishDraft}
                      className="btn-primary"
                      title="Review and complete your draft gig before publishing"
                    >
                      � Complete & Publish
                    </button>
                  )}
                  
                  <Link 
                    href={`/gig/${gigId}/edit`} 
                    className="btn-secondary"
                  >
                    ✏️ Edit Gig
                  </Link>
                  
                  {/* Only show applications link for published gigs */}
                  {gig.status !== 'DRAFT' && (
                    <Link 
                      href={`/gig/${gigId}/applications`} 
                      className="btn-primary"
                    >
                      📋 View Applications ({gig._count?.applications || 0})
                    </Link>
                  )}
                </div>
              )}
              
              {/* Status Badge */}
              {gig.status !== 'OPEN' && gig.status !== 'ACTIVE' && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  gig.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  gig.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                  gig.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                  gig.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {gig.status === 'DRAFT' ? '📝 DRAFT' : gig.status}
                </span>
              )}
              
              <div className="text-sm text-gray-500">
                Posted {new Date(gig.createdAt).toLocaleDateString()}
                {gig.updatedAt !== gig.createdAt && (
                  <div className="text-xs">
                    Updated {new Date(gig.updatedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Draft Notice */}
          {gig.status === 'DRAFT' && (
            <div className="lg:col-span-3 mb-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📝</div>
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
                    className="btn-primary"
                  >
                    � Complete & Publish
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Already Applied Banner */}
          {(gig.isApplied || alreadyAppliedMessage) && (
            <div className="lg:col-span-3 mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <p className="font-semibold text-green-800">Application Submitted</p>
                    <p className="text-sm text-green-600">
                      {alreadyAppliedMessage || 'You have already applied to this gig. The brand will review your application soon.'}
                    </p>
                  </div>
                </div>
                <Link href="/my/applications" className="btn-secondary">
                  View My Applications
                </Link>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gig Header */}
            <div className="card-glass p-2">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{gig.title}</h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {gig.brand?.logo && (
                        <img 
                          src={gig.brand?.logo} 
                          alt={gig.brand?.name}
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <span className="font-medium">{gig.brand?.name}</span>
                      {gig.brand?.verified && <span className="text-blue-500">✓</span>}
                    </div>
                    <div className="px-1 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {gig.category}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    ₹{gig.budgetMin?.toLocaleString()}{gig.budgetMax && gig.budgetMax !== gig.budgetMin ? ` - ₹${gig.budgetMax?.toLocaleString()}` : ''}
                  </div>
                  <div className="text-sm text-gray-600">Budget ({gig.budgetType})</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                    <span className={`px-2 py-1 rounded text-sm ${
                      gig.urgency === 'HIGH' ? 'bg-red-100 text-red-800' :
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
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="card-glass p-3">
              <h2 className="text-xl font-semibold mb-4">📝 Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{gig.description}</p>
              </div>
            </div>

            {/* Requirements */}
            <div className="card-glass p-3">
              <h2 className="text-xl font-semibold mb-4">✅ Requirements</h2>
              
              {/* General Requirements */}
              {gig.requirements && (
                <div className="mb-6">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{gig.requirements}</p>
                  </div>
                </div>
              )}

              {/* Skills Required */}
              {gig.skillsRequired && gig.skillsRequired.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">💼 Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {gig.skillsRequired.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Role Required */}
              {gig.roleRequired && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">👤 Role Required</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {gig.roleRequired}
                  </span>
                </div>
              )}

              {/* Experience Level */}
              {gig.experienceLevel && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">📊 Experience Level</h3>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {gig.experienceLevel}
                  </span>
                </div>
              )}

              {/* Platform Requirements */}
              {gig.platformRequirements && gig.platformRequirements.length > 0 && (
                <div className="mb-6">
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
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">📍 Location</h3>
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    {gig.location}
                  </span>
                </div>
              )}

              {/* Clan Allowed */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">👥 Team Applications</h3>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  gig.isClanAllowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {gig.isClanAllowed ? 'Team applications allowed' : 'Individual applications only'}
                </span>
              </div>
            </div>

            {/* Deliverables */}
            {gig.deliverables && gig.deliverables.length > 0 && (
              <div className="card-glass p-3">
                <h2 className="text-xl font-semibold mb-4">🎯 Deliverables</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {gig.deliverables.map((deliverable, index) => (
                    <li key={index}>{deliverable}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                      � Complete & Publish
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
                    className="w-12 h-12 rounded-full"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Apply to: {gig.title}</h2>
                  <button 
                    onClick={() => setShowApplicationForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Cover Letter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter *
                    </label>
                    <textarea
                      value={application.coverLetter}
                      onChange={(e) => setApplication(prev => ({ ...prev, coverLetter: e.target.value }))}
                      rows={6}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell the brand why you're perfect for this campaign..."
                    />
                  </div>

                  {/* Proposed Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proposed Rate (optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={application.proposedRate || ''}
                        onChange={(e) => setApplication(prev => ({ 
                          ...prev, 
                          proposedRate: e.target.value ? Number(e.target.value) : undefined 
                        }))}
                        className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Your rate for this campaign"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Budget: ₹{gig.budgetMin?.toLocaleString()}{gig.budgetMax && gig.budgetMax !== gig.budgetMin ? ` - ₹${gig.budgetMax?.toLocaleString()}` : ''} ({gig.budgetType})
                    </p>
                  </div>

                  {/* Estimated Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Time to Complete *
                    </label>
                    <select
                      value={application.estimatedTime}
                      onChange={(e) => setApplication(prev => ({ ...prev, estimatedTime: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                  {/* Application Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Type
                    </label>
                    <select
                      value={application.applicantType}
                      onChange={(e) => setApplication(prev => ({ ...prev, applicantType: e.target.value as 'user' | 'clan' }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="user">Individual Application</option>
                      {gig.isClanAllowed && <option value="clan">Team/Clan Application</option>}
                    </select>
                    {!gig.isClanAllowed && (
                      <p className="text-sm text-gray-600 mt-1">
                        This gig only accepts individual applications
                      </p>
                    )}
                  </div>

                  {/* Portfolio */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Portfolio Examples
                      </label>
                      <button 
                        onClick={addPortfolioItem}
                        className="btn-ghost btn-sm text-blue-600"
                      >
                        + Add Item
                      </button>
                    </div>
                    
                    {application.portfolio.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updatePortfolioItem(index, 'title', e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Title"
                        />
                        <div className="flex space-x-2">
                          <input
                            type="url"
                            value={item.url}
                            onChange={(e) => updatePortfolioItem(index, 'url', e.target.value)}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="URL"
                          />
                          <button 
                            onClick={() => removePortfolioItem(index)}
                            className="btn-ghost btn-sm text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submit */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowApplicationForm(false)}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApply}
                      disabled={!application.coverLetter.trim() || !application.estimatedTime || isApplying}
                      className="flex-1 btn-primary disabled:opacity-50"
                    >
                      {isApplying ? 'Applying...' : 'Submit Application'}
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
          <div className={`p-4 rounded-lg shadow-lg border-l-4 ${
            toast.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
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
