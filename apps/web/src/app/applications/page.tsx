'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Application {
  id: string;
  gigId: string;
  applicantId: string;
  status: 'PENDING' | 'REVIEWING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  appliedAt: string;
  proposedRate?: number;
  coverLetter?: string;
  gig?: {
    id: string;
    title: string;
    category: string;
    budgetType: string;
    budgetMin?: number;
    budgetMax?: number;
    currency: string;
  };
  applicant?: {
    id: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    profilePicture?: string;
    averageRating: number;
    reviewCount: number;
    completedGigs: number;
    skills?: string[];
  };
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  REVIEWING: 'bg-blue-100 text-blue-700',
  SHORTLISTED: 'bg-purple-100 text-purple-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-700',
};

export default function ApplicationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'REVIEWING' | 'SHORTLISTED' | 'ACCEPTED'>('ALL');

  // Redirect if not authenticated or not a brand
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.roles?.includes('BRAND'))) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Load applications
  useEffect(() => {
    if (user?.roles?.includes('BRAND')) {
      loadApplications();
    }
  }, [user]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/applications/received');
      
      if (response.success) {
        setApplications((response.data as Application[]) || []);
      } else {
        setError('Failed to load applications');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const response = await apiClient.put(`/api/applications/${applicationId}/status`, {
        status: newStatus,
      });
      
      if (response.success) {
        setApplications(prev => prev.map(app => 
          app.id === applicationId ? { ...app, status: newStatus as any } : app
        ));
      } else {
        alert('Failed to update application status');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update application status');
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'ALL') return true;
    return app.status === filter;
  });

  const formatBudget = (app: Application) => {
    if (app.proposedRate) {
      return `${app.gig?.currency || '$'} ${app.proposedRate}`;
    }
    if (app.gig?.budgetType === 'NEGOTIABLE') return 'Negotiable';
    if (app.gig?.budgetMin && app.gig?.budgetMax) {
      return `${app.gig.currency} ${app.gig.budgetMin} - ${app.gig.budgetMax}`;
    }
    return 'Not specified';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getApplicantName = (applicant?: Application['applicant']) => {
    if (applicant?.displayName) return applicant.displayName;
    if (applicant?.firstName || applicant?.lastName) {
      return `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim();
    }
    return 'Anonymous';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <div className="border-brand-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-heading mb-2 text-3xl font-bold">
                Applications
              </h1>
              <p className="text-muted">
                Review and manage applications for your gigs
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-red-600">❌ {error}</p>
              </div>
            )}

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-2">
              {['ALL', 'PENDING', 'REVIEWING', 'SHORTLISTED', 'ACCEPTED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-brand-primary text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {status === 'ALL' ? 'All Applications' : status.charAt(0) + status.slice(1).toLowerCase()}
                  {status === 'ALL' && ` (${applications.length})`}
                  {status !== 'ALL' && ` (${applications.filter(a => a.status === status).length})`}
                </button>
              ))}
            </div>

            {/* Applications List */}
            {loading ? (
              <div className="card-glass p-8 text-center">
                <div className="border-brand-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
                <p className="text-muted">Loading applications...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="card-glass p-8 text-center">
                <div className="mb-4">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {filter === 'ALL' ? 'No applications yet' : `No ${filter.toLowerCase()} applications`}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {filter === 'ALL' 
                      ? 'Applications for your gigs will appear here.'
                      : `You don't have any ${filter.toLowerCase()} applications at the moment.`
                    }
                  </p>
                </div>
                
                {filter === 'ALL' && (
                  <Link
                    href="/my-gigs"
                    className="btn-primary"
                  >
                    View My Gigs
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="card-glass p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Applicant Info */}
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {application.applicant?.profilePicture ? (
                            <img 
                              src={application.applicant.profilePicture} 
                              alt="Profile" 
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            getApplicantName(application.applicant)[0]?.toUpperCase() || 'A'
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {getApplicantName(application.applicant)}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[application.status]}`}>
                              {application.status.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center space-x-1">
                              {renderStars(application.applicant?.averageRating || 0)}
                              <span className="ml-1">
                                {application.applicant?.averageRating?.toFixed(1) || '0.0'} 
                                ({application.applicant?.reviewCount || 0} reviews)
                              </span>
                            </div>
                            <span>🎯 {application.applicant?.completedGigs || 0} completed gigs</span>
                          </div>
                          
                          {application.applicant?.skills && application.applicant.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {application.applicant.skills.slice(0, 5).map((skill) => (
                                <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  {skill}
                                </span>
                              ))}
                              {application.applicant.skills.length > 5 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  +{application.applicant.skills.length - 5} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Application Details */}
                      <div className="flex-1">
                        <div className="mb-3">
                          <h4 className="font-medium text-gray-900 mb-1">
                            For: {application.gig?.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span>🏷️ {application.gig?.category}</span>
                            <span>💰 {formatBudget(application)}</span>
                            <span>📅 Applied {formatDate(application.appliedAt)}</span>
                          </div>
                        </div>
                        
                        {application.coverLetter && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              {application.coverLetter}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-col space-y-2 lg:min-w-[180px]">
                        <Link
                          href={`/application/${application.id}` as any}
                          className="btn-ghost-sm text-center"
                        >
                          View Details
                        </Link>
                        
                        <Link
                          href={`/influencers/${application.applicantId}` as any}
                          className="btn-ghost-sm text-center"
                        >
                          View Profile
                        </Link>
                        
                        {application.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(application.id, 'REVIEWING')}
                              className="btn-primary-sm"
                            >
                              Start Review
                            </button>
                            <button
                              onClick={() => handleStatusChange(application.id, 'SHORTLISTED')}
                              className="btn-primary-sm bg-purple-600 hover:bg-purple-700"
                            >
                              Shortlist
                            </button>
                          </>
                        )}
                        
                        {application.status === 'REVIEWING' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(application.id, 'SHORTLISTED')}
                              className="btn-primary-sm bg-purple-600 hover:bg-purple-700"
                            >
                              Shortlist
                            </button>
                            <button
                              onClick={() => handleStatusChange(application.id, 'REJECTED')}
                              className="btn-ghost-sm text-red-600"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        
                        {application.status === 'SHORTLISTED' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(application.id, 'ACCEPTED')}
                              className="btn-primary-sm bg-green-600 hover:bg-green-700"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusChange(application.id, 'REJECTED')}
                              className="btn-ghost-sm text-red-600"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        
                        {application.status === 'ACCEPTED' && (
                          <Link
                            href={`/gig/${application.gigId}/project/${application.id}` as any}
                            className="btn-primary-sm bg-green-600 hover:bg-green-700"
                          >
                            Manage Project
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stats Summary */}
            {applications.length > 0 && (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card-glass p-4 text-center">
                  <div className="text-2xl font-bold text-brand-primary">
                    {applications.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Applications</div>
                </div>
                
                <div className="card-glass p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {applications.filter(a => a.status === 'PENDING').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending Review</div>
                </div>
                
                <div className="card-glass p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {applications.filter(a => a.status === 'SHORTLISTED').length}
                  </div>
                  <div className="text-sm text-gray-600">Shortlisted</div>
                </div>
                
                <div className="card-glass p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {applications.filter(a => a.status === 'ACCEPTED').length}
                  </div>
                  <div className="text-sm text-gray-600">Accepted</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
