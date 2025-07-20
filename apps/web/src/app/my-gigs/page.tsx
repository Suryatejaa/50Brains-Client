'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  _count: {
    applications: number;
    submissions: number;
  };
}

interface GigsResponse {
  gigs: Gig[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-700',
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
  OPEN: 'bg-green-100 text-green-700',
};

export default function MyGigsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'COMPLETED'>('ALL');
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  // Redirect if not authenticated or not a brand
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.roles?.includes('BRAND'))) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Check for refresh flag and URL parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const shouldRefresh = urlParams.get('refresh') || sessionStorage.getItem('refresh-my-gigs');
      
      if (shouldRefresh) {
        console.log('🔄 Detected refresh flag, will force refresh gigs data');
        setRefreshMessage('✅ Gig published successfully! Updating your gigs list...');
        
        // Clear the refresh flag
        sessionStorage.removeItem('refresh-my-gigs');
        // Clear URL parameter
        if (urlParams.get('refresh')) {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }
        
        // Clear the message after 5 seconds
        setTimeout(() => setRefreshMessage(null), 5000);
      }
    }
  }, []);

  // Load gigs
  useEffect(() => {
    if (user?.roles?.includes('BRAND')) {
      // Check if we need to force refresh
      const urlParams = new URLSearchParams(window.location.search);
      const shouldForceRefresh = urlParams.get('refresh') || sessionStorage.getItem('refresh-my-gigs');
      
      loadGigs(!!shouldForceRefresh);
    }
  }, [user]);

  const loadGigs = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Add cache busting parameter for force refresh
      const url = forceRefresh 
        ? `/api/gig/my-posted?_t=${Date.now()}`
        : '/api/gig/my-posted';
        
      const response = await apiClient.get<GigsResponse>(url);
      console.log('Fetched gigs:', response.data, forceRefresh ? '(force refresh)' : '(cached)');
      
      if (response.success) {
        // The API returns {gigs: Array, pagination: Object}
        if (response.data && Array.isArray(response.data.gigs)) {
          setGigs(response.data.gigs);
          const statuses = response.data.gigs.map(g => g.status).filter(Boolean);
          console.log('Gig statuses found:', Array.from(new Set(statuses)));
          
          // Update refresh message if this was a force refresh
          if (forceRefresh && refreshMessage) {
            setRefreshMessage('✅ Gigs list updated successfully!');
            setTimeout(() => setRefreshMessage(null), 3000);
          }
        } else if (Array.isArray(response.data)) {
          // Fallback if API returns array directly
          setGigs(response.data as Gig[]);
          
          // Update refresh message if this was a force refresh
          if (forceRefresh && refreshMessage) {
            setRefreshMessage('✅ Gigs list updated successfully!');
            setTimeout(() => setRefreshMessage(null), 3000);
          }
        } else {
          setGigs([]);
        }
      } else {
        setError('Failed to load gigs');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load gigs');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (gigId: string, newStatus: string) => {
    try {
      const response = await apiClient.put(`/api/gig/${gigId}/status`, {
        status: newStatus,
      });

      if (response.success) {
        setGigs(prev => prev.map(gig =>
          gig.id === gigId ? { ...gig, status: newStatus as any } : gig
        ));
      } else {
        alert('Failed to update gig status');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update gig status');
    }
  };

  const handleDeleteGig = async (gigId: string) => {
    if (!confirm('Are you sure you want to delete this gig?')) return;

    try {
      const response = await apiClient.delete(`/api/gig/${gigId}`);

      if (response.success) {
        setGigs(prev => prev.filter(gig => gig.id !== gigId));
      } else {
        alert('Failed to delete gig');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to delete gig');
    }
  };

  const filteredGigs = gigs.filter(gig => {
    if (filter === 'ALL') return true;
    return gig.status === filter;
  });

  // Get status counts for filter buttons
  const getStatusCount = (status: string) => {
    if (status === 'ALL') return gigs.length;
    return gigs.filter(g => g.status === status).length;
  };

  const formatBudget = (gig: Gig) => {
    if (gig.budgetType === 'negotiable') return 'Negotiable';
    if (gig.budgetMin && gig.budgetMax) {
      return `USD ${gig.budgetMin} - ${gig.budgetMax}`;
    }
    if (gig.budgetMin) {
      return `USD ${gig.budgetMin}+`;
    }
    return 'Not specified';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-heading mb-2 text-3xl font-bold">
                  My Gigs
                </h1>
                <p className="text-muted">
                  Manage your posted gigs and track applications
                </p>
              </div>

              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <button
                  onClick={() => loadGigs(true)}
                  disabled={loading}
                  className="btn-secondary"
                  title="Refresh gigs data"
                >
                  {loading ? '🔄' : '↻'} Refresh
                </button>
                <Link
                  href="/create-gig"
                  className="btn-primary"
                >
                  + Create New Gig
                </Link>
              </div>
            </div>

            {/* Success Message */}
            {refreshMessage && (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-green-600">{refreshMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-red-600">❌ {error}</p>
              </div>
            )}

            {/* Filters */}
            <div className="mb-6 flex gap-1 overflow-x-auto">
              {['ALL', 'OPEN', 'DRAFT', 'COMPLETED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as any)}
                  className={`px-1 py-1 rounded-md text-sm font-medium transition-colors ${filter === status
                    ? 'bg-brand-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {status === 'ALL' ? 'All Gigs' : status.charAt(0) + status.slice(1).toLowerCase()}
                  {` (${getStatusCount(status)})`}
                </button>
              ))}
            </div>

            {/* Gigs List */}
            {loading ? (
              <div className="card-glass p-8 text-center">
                <div className="border-brand-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
                <p className="text-muted">Loading gigs...</p>
              </div>
            ) : filteredGigs.length === 0 ? (
              <div className="card-glass p-8 text-center">
                <div className="mb-4">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {filter === 'ALL' ? 'No gigs yet' : `No ${filter.toLowerCase()} gigs`}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {filter === 'ALL'
                      ? 'Start by creating your first gig to find talented creators.'
                      : `You don't have any ${filter.toLowerCase()} gigs at the moment.`
                    }
                  </p>
                </div>

                {filter === 'ALL' && (
                  <Link
                    href="/create-gig"
                    className="btn-primary"
                  >
                    Create Your First Gig
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredGigs.map((gig) => (
                  <div key={gig.id} className="card-glass p-2">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {gig.title}
                          </h3>
                          {gig.status && (
                            <>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[gig.status] || 'bg-gray-100 text-gray-700'}`}>
                                {gig.status.replace('_', ' ')}
                              </span>
                            </>
                          )}
                          {gig.category && (
                            <span className="text-xs text-gray-500">
                              {gig.category}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {gig.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span>💰 {formatBudget(gig)}</span>
                          <span>👥 {gig._count.applications} applications</span>
                          <span>� {gig._count.submissions} submissions</span>
                          <span>📅 Posted {formatDate(gig.createdAt)}</span>
                          {gig.deadline && (
                            <span>⏰ Due {formatDate(gig.deadline)}</span>
                          )}
                          <span>🎯 {gig.experienceLevel}</span>
                          <span>📍 {gig.location}</span>
                        </div>
                      </div>

                      <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-wrap gap-2">
                        <Link
                          href={`/gig/${gig.id}`}
                          className="btn-ghost-sm text-gray-700 hover:text-blue-800"
                        >
                          View
                        </Link>
                        <span> | </span>
                        <Link
                          href={`/gig/${gig.id}/edit` as any}
                          className="btn-ghost-sm"
                        >
                          Edit
                        </Link>
                        <span> | </span>
                        <Link
                          href={`/gig/${gig.id}/applications`}
                          className="btn-primary-sm"
                        >
                          Applications ({gig._count.applications})
                        </Link>

                        {gig.status === 'OPEN' && (
                          <>
                            <span> | </span>
                            <button
                              onClick={() => handleStatusChange(gig.id, 'PAUSED')}
                              className="btn-ghost-sm text-yellow-600"
                            >
                              Pause
                            </button>
                          </>
                        )}

                        {gig.status === 'PAUSED' && (
                          <>
                            <span> | </span>
                            <button
                              onClick={() => handleStatusChange(gig.id, 'OPEN')}
                              className="btn-ghost-sm text-green-600"
                            >
                              Open
                            </button>
                          </>
                        )}

                        {gig.status && ['DRAFT', 'PAUSED'].includes(gig.status) && (
                          <>
                            <span> | </span>
                            <button
                              onClick={() => handleDeleteGig(gig.id)}
                              className="btn-ghost-sm text-red-600"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stats Summary */}
            {gigs.length > 0 && (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card-glass p-4 text-center">
                  <div className="text-2xl font-bold text-brand-primary">
                    {gigs.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Gigs</div>
                </div>

                <div className="card-glass p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {gigs.filter(g => g.status === 'OPEN').length}
                  </div>
                  <div className="text-sm text-gray-600">Open</div>
                </div>

                <div className="card-glass p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {gigs.reduce((sum, g) => sum + g._count.applications, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Applications</div>
                </div>

                <div className="card-glass p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {gigs.reduce((sum, g) => sum + g._count.submissions, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Submissions</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
