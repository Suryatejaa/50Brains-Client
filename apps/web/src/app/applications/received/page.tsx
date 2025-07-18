'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Application {
  id: string;
  status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  coverLetter: string;
  proposedRate?: number;
  appliedAt: string;
  reviewedAt?: string;
  
  // Applicant info
  applicant: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    verified: boolean;
    rating?: number;
    ratingCount?: number;
    
    // Social media stats
    socialMedia?: {
      platform: string;
      handle: string;
      followers: number;
      engagementRate: number;
    }[];
    
    // Profile stats
    stats?: {
      completedCampaigns: number;
      successRate: number;
      averageRating: number;
      totalEarnings: number;
    };
  };
  
  // Gig info
  gig: {
    id: string;
    title: string;
    category: string;
    budgetMin: number;
    budgetMax: number;
    deadline?: string;
    status: string;
  };
  
  // Portfolio items submitted with application
  portfolio?: {
    title: string;
    url: string;
    description?: string;
  }[];
  
  // Application quality score (AI-generated)
  qualityScore?: number;
  
  // Notes from brand
  notes?: string;
}

interface ApplicationStats {
  total: number;
  pending: number;
  reviewed: number;
  accepted: number;
  rejected: number;
  averageQualityScore: number;
  averageResponseTime: number; // in hours
}

export default function ReceivedApplicationsPage() {
  const { user, isAuthenticated } = useAuth();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'quality' | 'rating'>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const userType = getUserTypeForRole(currentRole);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (userType !== 'brand') {
        router.push('/dashboard');
        return;
      }
      loadApplications();
    }
  }, [isAuthenticated, user, userType, statusFilter, sortBy, currentPage]);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      
      const [applicationsResponse, statsResponse] = await Promise.allSettled([
        apiClient.get(`/api/applications/received?status=${statusFilter}&sort=${sortBy}&page=${currentPage}&limit=20`),
        apiClient.get('/api/applications/received/stats')
      ]);

      if (applicationsResponse.status === 'fulfilled' && applicationsResponse.value.success) {
        const data = applicationsResponse.value.data as any;
        setApplications(data.applications || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }

      if (statsResponse.status === 'fulfilled' && statsResponse.value.success) {
        setStats(statsResponse.value.data as ApplicationStats);
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId: string, action: 'accept' | 'reject', notes?: string) => {
    try {
      const response = await apiClient.post(`/api/applications/${applicationId}/${action}`, {
        notes
      });

      if (response.success) {
        await loadApplications();
        setSelectedApplication(null);
      }
    } catch (error) {
      console.error(`Failed to ${action} application:`, error);
      alert(`Failed to ${action} application. Please try again.`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REVIEWED': return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'WITHDRAWN': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view received applications.</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Received Applications</h1>
              <p className="text-gray-600">Review and manage applications for your campaigns</p>
            </div>
            <div className="flex space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Applications</option>
                <option value="PENDING">Pending Review</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="quality">Sort by Quality Score</option>
                <option value="rating">Sort by Applicant Rating</option>
              </select>
              <Link href="/dashboard" className="btn-secondary">
                ← Dashboard
              </Link>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="card-glass p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading applications...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Statistics */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="card-glass p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Applications</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      📝
                    </div>
                  </div>
                </div>

                <div className="card-glass p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Review</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      ⏳
                    </div>
                  </div>
                </div>

                <div className="card-glass p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Accepted</p>
                      <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      ✅
                    </div>
                  </div>
                </div>

                <div className="card-glass p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Quality Score</p>
                      <p className={`text-2xl font-bold ${getQualityScoreColor(stats.averageQualityScore)}`}>
                        {stats.averageQualityScore.toFixed(0)}/100
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      📊
                    </div>
                  </div>
                </div>

                <div className="card-glass p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                      <p className="text-2xl font-bold text-gray-900">{Math.round(stats.averageResponseTime)}h</p>
                    </div>
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      ⚡
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Applications List */}
            <div className="card-glass p-3">
              <h2 className="text-xl font-semibold mb-6">📋 Applications</h2>

              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div
                      key={application.id}
                      className={`border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors cursor-pointer ${
                        selectedApplication === application.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedApplication(selectedApplication === application.id ? null : application.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Applicant Avatar */}
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            {application.applicant.avatar ? (
                              <img
                                src={application.applicant.avatar}
                                alt={application.applicant.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500">
                                👤
                              </div>
                            )}
                          </div>

                          {/* Application Info */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                <span>{application.applicant.name}</span>
                                {application.applicant.verified && <span className="text-blue-500">✓</span>}
                              </h3>
                              <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(application.status)}`}>
                                {application.status}
                              </span>
                              {application.qualityScore && (
                                <span className={`px-2 py-1 bg-gray-100 rounded text-sm font-medium ${getQualityScoreColor(application.qualityScore)}`}>
                                  Score: {application.qualityScore}/100
                                </span>
                              )}
                            </div>

                            <p className="text-gray-600 mb-2">Applied for: <strong>{application.gig.title}</strong></p>
                            
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <span>📅 Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                              {application.applicant.rating && (
                                <span>⭐ {application.applicant.rating.toFixed(1)}/5.0 ({application.applicant.ratingCount} reviews)</span>
                              )}
                              {application.proposedRate && (
                                <span>💰 Proposed: ${application.proposedRate.toLocaleString()}</span>
                              )}
                              {application.applicant.stats && (
                                <span>🏆 {application.applicant.stats.completedCampaigns} campaigns completed</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex space-x-2 ml-4">
                          {application.status === 'PENDING' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplicationAction(application.id, 'accept');
                                }}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                ✅ Accept
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplicationAction(application.id, 'reject');
                                }}
                                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                              >
                                ❌ Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {selectedApplication === application.id && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Cover Letter */}
                            <div>
                              <h4 className="text-lg font-semibold mb-3">💌 Cover Letter</h4>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700 whitespace-pre-wrap">{application.coverLetter}</p>
                              </div>
                            </div>

                            {/* Applicant Details */}
                            <div>
                              <h4 className="text-lg font-semibold mb-3">👤 Applicant Profile</h4>
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Email</span>
                                  <span className="font-medium">{application.applicant.email}</span>
                                </div>
                                {application.applicant.stats && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Success Rate</span>
                                      <span className="font-medium text-green-600">{application.applicant.stats.successRate.toFixed(1)}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Total Earnings</span>
                                      <span className="font-medium">${application.applicant.stats.totalEarnings.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Average Rating</span>
                                      <span className="font-medium">{application.applicant.stats.averageRating.toFixed(1)}/5.0</span>
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* Social Media Stats */}
                              {application.applicant.socialMedia && application.applicant.socialMedia.length > 0 && (
                                <div className="mt-4">
                                  <h5 className="font-semibold mb-2">📱 Social Media</h5>
                                  <div className="space-y-2">
                                    {application.applicant.socialMedia.map((social, index) => (
                                      <div key={index} className="flex justify-between text-sm">
                                        <span className="text-gray-600">{social.platform} (@{social.handle})</span>
                                        <span className="font-medium">
                                          {social.followers.toLocaleString()} followers • {social.engagementRate.toFixed(1)}% engagement
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Portfolio */}
                          {application.portfolio && application.portfolio.length > 0 && (
                            <div className="mt-6">
                              <h4 className="text-lg font-semibold mb-3">📁 Portfolio</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {application.portfolio.map((item, index) => (
                                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                    <h5 className="font-semibold mb-2">{item.title}</h5>
                                    {item.description && (
                                      <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                                    )}
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline text-sm"
                                    >
                                      View Work →
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Notes and Actions */}
                          <div className="mt-6 flex justify-between items-start">
                            <div className="flex-1">
                              {application.notes && (
                                <div>
                                  <h5 className="font-semibold mb-2">📝 Notes</h5>
                                  <p className="text-gray-700 bg-yellow-50 p-3 rounded">{application.notes}</p>
                                </div>
                              )}
                            </div>

                            <div className="ml-6 space-x-3">
                              <Link
                                href={`/gig/${application.gig.id}`}
                                className="btn-secondary"
                              >
                                👁️ View Gig
                              </Link>
                              {application.status === 'ACCEPTED' && (
                                <a
                                  href={`/projects/${application.id}`}
                                  className="btn-primary"
                                >
                                  📂 Manage Project
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center space-x-2 mt-8">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50"
                      >
                        ← Previous
                      </button>
                      <span className="px-3 py-2">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📥</div>
                  <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
                  <p className="text-gray-600 mb-6">
                    {statusFilter === 'all' 
                      ? 'You haven\'t received any applications yet. Create some campaigns to start receiving applications!'
                      : `No applications with status "${statusFilter.toLowerCase()}" found.`}
                  </p>
                  {statusFilter === 'all' ? (
                    <Link href="/create-gig" className="btn-primary">
                      ➕ Create Your First Campaign
                    </Link>
                  ) : (
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="btn-secondary"
                    >
                      🔄 Show All Applications
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
