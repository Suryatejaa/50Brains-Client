'use client';

import { useState, useEffect } from 'react';
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
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'EXPIRED' | 'APPROVED';
  submittedAt: string;
  responseAt?: string;
  projectDeadline: string;
  projectBudget: {
    min: number;
    max: number;
    type: string;
  };
  attachments: string[];
  skills: string[];
  equipment: string[];
  location: string;
  isRemote: boolean;
  expiresAt: string;
}

interface BidStats {
  totalBids: number;
  pendingBids: number;
  acceptedBids: number;
  rejectedBids: number;
  approvedBids: number;
  successRate: number;
  avgResponseTime: number;
  totalValue: number;
}

export default function MyBidsPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [stats, setStats] = useState<BidStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    sortBy: 'recent',
    page: 1,
    limit: 20,
    search: ''
  });

  useEffect(() => {
    loadBids();
    loadStats();
  }, [filters]);

  const loadBids = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await apiClient.get(`/api/crew/bids?${params}`);
      if (response.success) {
        // Explicitly type response.data to avoid 'unknown' error
        const data = response.data as { bids: Bid[] };
        setBids(data.bids);
      }
    } catch (error) {
      console.error('Failed to load bids:', error);
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
      console.error('Failed to load stats:', error);
    }
  };

  const handleWithdraw = async (bidId: string) => {
    try {
      const response = await apiClient.patch(`/api/crew/bids/${bidId}/withdraw`);
      if (response.success) {
        // Refresh bids and stats
        await loadBids();
        await loadStats();
      }
    } catch (error) {
      console.error('Failed to withdraw bid:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'WITHDRAWN': return 'bg-gray-100 text-gray-800';
      case 'EXPIRED': return 'bg-orange-100 text-orange-800';
      case 'APPROVED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-1">
      <div className="mx-auto max-w-6xl px-1">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-900">My Bids</h1>
          <p className="text-gray-600">Manage your project bids and track performance</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-4 md:grid-cols-4 gap-1 mb-1">
            <div className="card-glass p-1 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalBids}</div>
              <div className="text-sm text-gray-600">Total Bids</div>
            </div>
            <div className="card-glass p-1 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingBids}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="card-glass p-1 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.acceptedBids}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="card-glass p-1 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.successRate}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card-glass p-1 mb-1">
          <div className="flex flex-wrap gap-1">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="input"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="WITHDRAWN">Withdrawn</option>
              <option value="EXPIRED">Expired</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="input"
            >
              <option value="recent">Most Recent</option>
              <option value="amount">Highest Amount</option>
              <option value="deadline">Earliest Deadline</option>
            </select>

            <input
              type="text"
              placeholder="Search projects..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="input flex-1"
            />
          </div>
        </div>

        {/* Bids List */}
        {loading ? (
          <div className="card-glass p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading bids...</p>
          </div>
        ) : bids.length === 0 ? (
          <div className="card-glass p-2 text-center">
            <div className="text-6xl mb-2">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bids found</h3>
            <p className="text-gray-600 mb-2">Start bidding on projects to see them here</p>
            <Link href="/marketplace" className="btn-primary">
              Browse Projects
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {bids.map((bid) => (
              <div key={bid.id} className="card-glass p-2">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
                    <div className="flex items-center space-x-1 mb-1">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(bid.status)}`}>
                        {bid.status}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {bid.projectTitle}
                      </h3>
                    </div>

                    <p className="text-gray-600 text-sm mb-1 line-clamp-2">
                      {bid.message}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-1 text-sm text-gray-500 mb-1">
                      <div>
                        <span className="font-medium">Bid Amount:</span>
                        <div className="text-green-600 font-semibold">₹{bid.bidAmount.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span>
                        <div>{bid.proposedDuration}</div>
                      </div>
                      <div>
                        <span className="font-medium">Project Budget:</span>
                        <div>₹{bid.projectBudget.min.toLocaleString()} - ₹{bid.projectBudget.max.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="font-medium">Deadline:</span>
                        <div>{new Date(bid.projectDeadline).toLocaleDateString()}</div>
                      </div>
                    </div>

                    {bid.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {bid.skills.map((skill) => (
                          <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col space-y-2">
                    <Link
                      href={`/gig/${bid.projectId}` as any}
                      className="btn-ghost-sm"
                    >
                      View Project
                    </Link>

                    {bid.status === 'PENDING' && (
                      <button
                        onClick={() => handleWithdraw(bid.id)}
                        className="btn-secondary-sm text-red-600 hover:bg-red-50"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Submitted: {new Date(bid.submittedAt).toLocaleDateString()}
                  {bid.responseAt && ` • Responded: ${new Date(bid.responseAt).toLocaleDateString()}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
