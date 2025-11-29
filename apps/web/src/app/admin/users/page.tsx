'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'brands' | 'influencers'>(
    'brands'
  );
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, [activeTab, statusFilter, verificationFilter, searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);
      if (verificationFilter !== 'all')
        queryParams.append('verificationStatus', verificationFilter);
      if (searchQuery) queryParams.append('search', searchQuery);

      const endpoint =
        activeTab === 'brands'
          ? `/api/gig-admin/users/brands?${queryParams.toString()}`
          : `/api/gig-admin/users/influencers?${queryParams.toString()}`;

      const response = await apiClient.get<any>(endpoint);

      if (response.success) {
        setUsers(
          (response.data as any)?.users ||
            (response.data as any)?.brands ||
            (response.data as any)?.influencers ||
            []
        );
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    const verificationType = activeTab === 'brands' ? 'BRAND' : 'INFLUENCER';
    const notes = prompt('Verification notes (optional):');

    try {
      const response = await apiClient.post<any>(
        `/api/gig-admin/users/${userId}/verify`,
        { verificationType, verificationNotes: notes || undefined }
      );

      if (response.success) {
        alert('User verified successfully');
        loadUsers();
      }
    } catch (error) {
      console.error('Failed to verify user:', error);
      alert('Failed to verify user');
    }
  };

  const handleSuspendUser = async (userId: string) => {
    const reason = prompt('Suspension reason:');
    if (!reason) return;

    const durationDays = prompt(
      'Suspension duration in days (leave empty for indefinite):'
    );
    const duration = durationDays ? parseInt(durationDays) : undefined;

    try {
      const response = await apiClient.post<any>(
        `/api/gig-admin/users/${userId}/suspend`,
        {
          reason,
          suspensionDuration: duration,
        }
      );

      if (response.success) {
        alert('User suspended successfully');
        loadUsers();
      }
    } catch (error) {
      console.error('Failed to suspend user:', error);
      alert('Failed to suspend user');
    }
  };

  const handleViewGigHistory = async (userId: string) => {
    try {
      const response = await apiClient.get<any>(
        `/api/gig-admin/users/${userId}/gig-history`
      );

      if (response.success) {
        const history = (response.data as any)?.gigHistory || [];
        alert(
          `User has ${history.length} gigs in their history. Check console for details.`
        );
        console.log('Gig History:', history);
      }
    } catch (error) {
      console.error('Failed to load gig history:', error);
      alert('Failed to load gig history');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-heading mb-4 text-2xl font-bold">
            User Management
          </h1>

          {/* Tabs */}
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setActiveTab('brands')}
              className={`rounded-none px-4 py-2 font-medium transition-colors ${
                activeTab === 'brands'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Brands
            </button>
            <button
              onClick={() => setActiveTab('influencers')}
              className={`rounded-none px-4 py-2 font-medium transition-colors ${
                activeTab === 'influencers'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Influencers
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="text"
              placeholder={`Search ${activeTab} by name or email...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field flex-1"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field md:w-48"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="input-field md:w-48"
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="card-glass p-8 text-center">
            <div className="text-body">Loading users...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="card-glass p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-heading text-lg font-semibold">
                        {user.fullName || user.username}
                      </h3>
                      <span className="rounded-none border border-blue-500 bg-blue-50 px-2 py-1 text-xs text-blue-600">
                        {user.role}
                      </span>
                      <span
                        className={`rounded-none border px-2 py-1 text-xs ${
                          user.status === 'active'
                            ? 'border-green-500 bg-green-50 text-green-600'
                            : 'border-red-500 bg-red-50 text-red-600'
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>
                    <div className="text-body mt-2 text-sm">
                      <div>Email: {user.email}</div>
                      <div>
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                      {activeTab === 'brands' && (
                        <>
                          <div>Total Gigs: {user.totalGigs || 0}</div>
                          <div>Active Gigs: {user.activeGigs || 0}</div>
                          <div>Total Spent: ${user.totalSpent || 0}</div>
                        </>
                      )}
                      {activeTab === 'influencers' && (
                        <>
                          <div>Completed Gigs: {user.completedGigs || 0}</div>
                          <div>Success Rate: {user.successRate || 0}%</div>
                          <div>Total Earned: ${user.totalEarnings || 0}</div>
                        </>
                      )}
                      <div>
                        Verification:{' '}
                        {user.isVerified ? '✅ Verified' : '⏳ Pending'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!user.isVerified && (
                      <button
                        onClick={() => handleVerifyUser(user.id)}
                        className="rounded-none border border-green-500 bg-green-50 px-3 py-1 text-sm text-green-600 hover:bg-green-100"
                      >
                        Verify User
                      </button>
                    )}
                    <button
                      onClick={() => handleSuspendUser(user.id)}
                      className="rounded-none border border-orange-500 bg-orange-50 px-3 py-1 text-sm text-orange-600 hover:bg-orange-100"
                    >
                      Suspend
                    </button>
                    <button
                      onClick={() => handleViewGigHistory(user.id)}
                      className="rounded-none border border-blue-500 bg-blue-50 px-3 py-1 text-sm text-blue-600 hover:bg-blue-100"
                    >
                      Gig History
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="card-glass p-8 text-center">
                <div className="text-muted">No users found</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
