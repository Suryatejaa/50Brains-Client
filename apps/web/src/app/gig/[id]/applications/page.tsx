'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

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
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  proposal: string;
  quotedPrice: number;
  estimatedTime: string;
  applicantType: 'user' | 'clan';
  portfolio: string[];
  appliedAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  applicant: Applicant;
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
      setIsLoading(true);
      console.log('Loading gig details for ID:', gigId);
      
      // Load gig details and applications in parallel
      const [gigResponse, applicationsResponse] = await Promise.allSettled([
        apiClient.get(`/api/gig/${gigId}`),
        apiClient.get(`/api/gig/${gigId}/applications`)
      ]);

      console.log('Gig response:', gigResponse);
      console.log('Applications response:', applicationsResponse);

      // Handle gig response
      if (gigResponse.status === 'fulfilled' && gigResponse.value.success) {
        const gigData = gigResponse.value.data;
        console.log('✅ Gig data received successfully:', gigData);
        
        // Check if user owns this gig
        const gigDetails = gigData as any; // Use any to access brand.id
        console.log('🔍 Checking gig:', gigDetails);
        
        // The API response has brand.id instead of postedById
        const gigOwnerId = gigDetails.brand?.id || gigDetails.postedById;
        console.log('🔍 Ownership check - Gig owner ID:', gigOwnerId, 'Current user ID:', user?.id);
        console.log('🔍 Ownership check - Types:', typeof gigOwnerId, typeof user?.id);
        console.log('🔍 Ownership check - Strict equality:', gigOwnerId === user?.id);
        console.log('🔍 Current role context:', {
          currentRole,
          userType,
          userRoles: user?.roles,
          userRole: user?.role
        });
        
        if (gigOwnerId !== user?.id) {
          console.log('❌ Ownership check failed - User does not own this gig, redirecting to my-gigs');
          router.push('/my-gigs');
          return;
        }
        
        console.log('✅ Ownership check passed - Setting gig data');
        setGig(gigData as Gig);
        console.log('✅ Gig set successfully');
      } else {
        console.error('❌ Failed to load gig - Response details:', {
          status: gigResponse.status,
          success: gigResponse.status === 'fulfilled' ? gigResponse.value.success : 'N/A',
          error: gigResponse.status === 'fulfilled' ? gigResponse.value : gigResponse.reason
        });
        console.log('❌ Redirecting to my-gigs due to gig load failure');
        router.push('/my-gigs');
        return;
      }

      // Handle applications response
      if (applicationsResponse.status === 'fulfilled' && applicationsResponse.value.success) {
        const applicationsData = (applicationsResponse.value.data as { applications: Application[] })?.applications || [];
        console.log('✅ Applications data received successfully:', applicationsData);
        console.log('📊 Number of applications found:', applicationsData.length);
        setApplications(applicationsData);
      } else {
        console.error('❌ Failed to load applications - Response details:', {
          status: applicationsResponse.status,
          success: applicationsResponse.status === 'fulfilled' ? applicationsResponse.value.success : 'N/A',
          error: applicationsResponse.status === 'fulfilled' ? applicationsResponse.value : applicationsResponse.reason
        });
        // Still allow page to load even if applications fail
        console.log('⚠️ Setting empty applications array and continuing');
        setApplications([]);
      }

      console.log('🎉 Load process completed successfully - Page should now render');
      
    } catch (error) {
      console.error('💥 Exception caught in loadGigAndApplications:', error);
      console.log('❌ Redirecting to my-gigs due to exception');
      router.push('/my-gigs');
    } finally {
      console.log('🏁 Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const handleAcceptApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to accept this application?')) return;
    
    try {
      setProcessingApplicationId(applicationId);
      
      const response = await apiClient.post(`/api/gig/applications/${applicationId}/accept`, {
        notes: 'Application accepted'
      });

      if (response.success) {
        await loadGigAndApplications(); // Reload to get updated data
        alert('Application accepted successfully!');
      }
    } catch (error) {
      console.error('Failed to accept application:', error);
      alert('Failed to accept application. Please try again.');
    } finally {
      setProcessingApplicationId(null);
    }
  };

  const handleRejectApplication = async () => {
    if (!rejectApplicationId || !rejectionReason.trim()) return;
    
    try {
      setProcessingApplicationId(rejectApplicationId);
      
      const response = await apiClient.post(`/api/gig/applications/${rejectApplicationId}/reject`, {
        reason: rejectionReason,
        feedback: rejectionReason
      });

      if (response.success) {
        await loadGigAndApplications(); // Reload to get updated data
        setShowRejectModal(false);
        setRejectApplicationId(null);
        setRejectionReason('');
        alert('Application rejected successfully.');
      }
    } catch (error) {
      console.error('Failed to reject application:', error);
      alert('Failed to reject application. Please try again.');
    } finally {
      setProcessingApplicationId(null);
    }
  };

  const openRejectModal = (applicationId: string) => {
    setRejectApplicationId(applicationId);
    setShowRejectModal(true);
  };

  const filteredApplications = applications.filter(app => {
    if (selectedStatus === 'all') return true;
    return app.status.toLowerCase() === selectedStatus.toLowerCase();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gig Applications</h1>
              <p className="text-gray-600">Manage applications for your gig</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/my-gigs" className="btn-secondary">
                ← Back to My Gigs
              </Link>
              <Link href={`/gig/${gigId}`} className="btn-secondary">
                View Gig Details
              </Link>
            </div>
          </div>
        </div>

        {/* Gig Info */}
        <div className="card-glass p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">{gig.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-2">{gig.description}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span>Category: {gig.category}</span>
                <span>Budget: ₹{gig.budgetMin.toLocaleString()} - ₹{gig.budgetMax.toLocaleString()}</span>
                <span>Applications: {gig.applicationCount}</span>
                {gig.deadline && <span>Deadline: {new Date(gig.deadline).toLocaleDateString()}</span>}
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              gig.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
              gig.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {gig.status}
            </span>
          </div>
        </div>

        {/* Filters and Stats */}
        <div className="card-glass p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold">Applications ({filteredApplications.length})</h3>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Applications</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-100 rounded-full"></div>
                <span>Pending: {applications.filter(a => a.status === 'PENDING').length}</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-100 rounded-full"></div>
                <span>Accepted: {applications.filter(a => a.status === 'ACCEPTED').length}</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-100 rounded-full"></div>
                <span>Rejected: {applications.filter(a => a.status === 'REJECTED').length}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-6">
            {filteredApplications.map((application) => (
              <div key={application.id} className="card-glass p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    {application.applicant.profilePicture ? (
                      <img
                        src={application.applicant.profilePicture}
                        alt={`${application.applicant.firstName} ${application.applicant.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 font-medium">
                          {application.applicant.firstName.charAt(0)}{application.applicant.lastName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">
                        {application.applicant.firstName} {application.applicant.lastName}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {application.applicant.primaryPlatform && (
                          <span>Platform: {application.applicant.primaryPlatform}</span>
                        )}
                        {application.applicant.primaryNiche && (
                          <span>Niche: {application.applicant.primaryNiche}</span>
                        )}
                        {application.applicant.location && (
                          <span>📍 {application.applicant.location}</span>
                        )}
                      </div>
                      {application.applicant.experienceLevel && (
                        <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {application.applicant.experienceLevel}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      Applied {new Date(application.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Application Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold mb-2">Proposal</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                      {application.proposal}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Application Details</h4>
                      <div className="space-y-2 text-sm">
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
                        {application.applicant.followers && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Followers:</span>
                            <span className="font-medium">{application.applicant.followers.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Portfolio */}
                {application.portfolio && application.portfolio.length > 0 && (
                  <div className="mb-6">
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
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2 text-red-600">Rejection Reason</h4>
                    <p className="text-gray-700 bg-red-50 p-3 rounded-lg">
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
                      onClick={() => handleAcceptApplication(application.id)}
                      disabled={processingApplicationId === application.id}
                      className="btn-primary"
                    >
                      {processingApplicationId === application.id ? 'Processing...' : 'Accept'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card-glass p-12 text-center">
            <div className="text-6xl mb-4">📨</div>
            <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-6">
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
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Reject Application</h2>
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting this application:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      </div>
    </div>
  );
}
