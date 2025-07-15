'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Bid {
  id: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  bidAmount: number;
  proposedDuration: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'EXPIRED';
  submittedAt: string;
  expiresAt?: string;
  responseAt?: string;
  projectDeadline: string;
  projectBudget: {
    min: number;
    max: number;
    type: 'FIXED' | 'HOURLY' | 'NEGOTIABLE';
  };
  attachments?: string[];
  skills: string[];
  equipment?: string[];
  location?: string;
  isRemote: boolean;
}

interface BidStats {
  totalBids: number;
  pendingBids: number;
  acceptedBids: number;
  rejectedBids: number;
  successRate: number;
  avgResponseTime: number;
  totalValue: number;
}

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳', label: 'Under Review' },
  ACCEPTED: { color: 'bg-green-100 text-green-800', icon: '✅', label: 'Accepted' },
  REJECTED: { color: 'bg-red-100 text-red-800', icon: '❌', label: 'Rejected' },
  WITHDRAWN: { color: 'bg-gray-100 text-gray-800', icon: '↩️', label: 'Withdrawn' },
  EXPIRED: { color: 'bg-orange-100 text-orange-800', icon: '⏰', label: 'Expired' }
};

export default function MyBidsPage() {
  const { user, isAuthenticated } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [stats, setStats] = useState<BidStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'amount' | 'deadline'>('recent');

  useEffect(() => {
    if (isAuthenticated) {
      loadBids();
      loadStats();
    }
  }, [isAuthenticated, filter, sortBy]);

  const loadBids = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        ...(filter !== 'all' && { status: filter }),
        sortBy,
        limit: '50'
      });
      
      const response = await apiClient.get(`/api/crew/bids?${params}`);
      
      if (response.success) {
        setBids((response.data as any)?.bids || []);
      } else {
        setError('Failed to load bids');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiClient.get('/api/crew/bids/stats');
      if (response.success) {
        setStats(response.data as BidStats);
      }
    } catch (error) {
      console.error('Failed to load bid stats:', error);
    }
  };

  const withdrawBid = async (bidId: string) => {
    try {
      const response = await apiClient.patch(`/api/crew/bids/${bidId}/withdraw`);
      if (response.success) {
        setBids(prev => prev.map(bid => 
          bid.id === bidId ? { ...bid, status: 'WITHDRAWN' as const } : bid
        ));
      }
    } catch (error: any) {
      setError(error.message || 'Failed to withdraw bid');
    }
  };

  const filteredBids = bids.filter(bid => {
    if (filter === 'all') return true;
    return bid.status === filter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffInHours = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 0) return 'Expired';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h remaining`;
    return `${Math.floor(diffInHours / 24)}d remaining`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-16">
          <div className="content-container py-8">
            <div className="mx-auto max-w-4xl text-center">
              <div className="card-glass p-8">
                <div className="mb-6">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    My Bids
                  </h1>
                  <p className="text-gray-600">
                    Please sign in to view your project bids
                  </p>
                </div>
                
                <Link href={"/auth/login" as any} className="btn-primary">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-heading mb-2 text-3xl font-bold">
                    My Bids
                  </h1>
                  <p className="text-muted">
                    Track and manage your project proposals
                  </p>
                </div>
                
                <div className="mt-4 sm:mt-0">
                  <Link href={"/marketplace" as any} className="btn-primary">
                    Browse New Projects
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="card-glass p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <span className="text-xl">📋</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Bids</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalBids}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-glass p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <span className="text-xl">⏳</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.pendingBids}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-glass p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <span className="text-xl">✅</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Accepted</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.acceptedBids}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-glass p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <span className="text-xl">📈</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.successRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card-glass p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <span className="text-xl">💰</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(stats.totalValue)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters and Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex flex-wrap gap-2 mb-4 sm:mb-0">
                {[
                  { key: 'all', label: 'All Bids' },
                  { key: 'PENDING', label: 'Pending' },
                  { key: 'ACCEPTED', label: 'Accepted' },
                  { key: 'REJECTED', label: 'Rejected' }
                ].map((filterOption) => (
                  <button
                    key={filterOption.key}
                    onClick={() => setFilter(filterOption.key)}
                    className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                      filter === filterOption.key
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="input w-auto"
                >
                  <option value="recent">Most Recent</option>
                  <option value="amount">Bid Amount</option>
                  <option value="deadline">Project Deadline</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-red-600">❌ {error}</p>
              </div>
            )}

            {/* Bids List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="card-glass p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredBids.length === 0 ? (
              <div className="card-glass p-8 text-center">
                <div className="mb-4">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {filter === 'all' ? 'No bids yet' : `No ${filter.toLowerCase()} bids`}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {filter === 'all' 
                      ? 'Start bidding on projects to build your portfolio' 
                      : `You don't have any ${filter.toLowerCase()} bids at the moment`
                    }
                  </p>
                </div>
                
                <Link href={"/marketplace" as any} className="btn-primary">
                  Browse Projects
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBids.map((bid) => (
                  <div key={bid.id} className="card-glass p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <Link
                            href={`/project/${bid.projectId}` as any}
                            className="text-lg font-semibold text-gray-900 hover:text-brand-primary"
                          >
                            {bid.projectTitle}
                          </Link>
                          
                          <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig[bid.status].color}`}>
                            {statusConfig[bid.status].icon} {statusConfig[bid.status].label}
                          </span>
                          
                          {bid.isRemote && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                              Remote
                            </span>
                          )}
                        </div>
                        
                        {/* Client and Bid Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Client:</span>
                            <br />
                            {bid.clientName}
                          </div>
                          <div>
                            <span className="font-medium">Your Bid:</span>
                            <br />
                            <span className="text-lg font-bold text-green-600">
                              {formatCurrency(bid.bidAmount)}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span>
                            <br />
                            {bid.proposedDuration}
                          </div>
                        </div>
                        
                        {/* Project Budget Range */}
                        <div className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">Project Budget:</span> {formatCurrency(bid.projectBudget.min)} - {formatCurrency(bid.projectBudget.max)} ({bid.projectBudget.type})
                        </div>
                        
                        {/* Message Preview */}
                        {bid.message && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <p className="text-sm text-gray-700 line-clamp-2">
                              <span className="font-medium">Your message:</span> {bid.message}
                            </p>
                          </div>
                        )}
                        
                        {/* Skills and Equipment */}
                        {(bid.skills.length > 0 || bid.equipment) && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {bid.skills.slice(0, 3).map((skill) => (
                              <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                            {bid.equipment && bid.equipment.length > 0 && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                📹 Equipment included
                              </span>
                            )}
                            {bid.skills.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                +{bid.skills.length - 3} more skills
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Dates */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <span>📅 Submitted: {formatDate(bid.submittedAt)}</span>
                          <span>⏰ Project Deadline: {formatDate(bid.projectDeadline)}</span>
                          {bid.expiresAt && bid.status === 'PENDING' && (
                            <span className="text-orange-600">
                              🕒 {getTimeUntilExpiry(bid.expiresAt)}
                            </span>
                          )}
                          {bid.responseAt && (
                            <span>📬 Response: {formatDate(bid.responseAt)}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2 lg:min-w-[120px]">
                        <Link
                          href={`/project/${bid.projectId}` as any}
                          className="btn-ghost-sm text-center"
                        >
                          View Project
                        </Link>
                        
                        {bid.status === 'PENDING' && (
                          <button
                            onClick={() => withdrawBid(bid.id)}
                            className="btn-secondary-sm text-center"
                          >
                            Withdraw Bid
                          </button>
                        )}
                        
                        {bid.status === 'ACCEPTED' && (
                          <Link
                            href={`/project/${bid.projectId}/workspace` as any}
                            className="btn-primary-sm text-center"
                          >
                            Go to Workspace
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">🚀 Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href={"/marketplace" as any} className="btn-secondary text-center">
                  🔍 Browse New Projects
                </Link>
                <Link href={"/profile" as any} className="btn-secondary text-center">
                  👤 Update Profile
                </Link>
                <Link href={"/equipment" as any} className="btn-secondary text-center">
                  📹 Manage Equipment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
