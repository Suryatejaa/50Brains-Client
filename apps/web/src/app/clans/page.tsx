'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClans, Clan } from '@/hooks/useClans';
import { ClanCard } from '@/components/clan/ClanCard';
import { ClanFilters } from '@/components/clan/ClanFilters';
import { CreateClanModal } from '@/components/clan/CreateClanModal';
import { clanApiClient } from '@/lib/clan-api';
import Link from 'next/link';

export default function ClansPage() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'my-clans' | 'discover'>('my-clans');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinRequestLoading, setJoinRequestLoading] = useState<string | null>(null);

  // Initialize clans hook with default filters
  const {
    clans,
    loading,
    error,
    filters,
    pagination,
    userClans,
    userHeadClans,
    updateFilters,
    refetch,
    getPublicClans,
    getFeaturedClans,
    setError
  } = useClans({
    sortBy: 'score',
    order: 'desc',
    limit: 20
  });

  console.log('clans', clans);
  console.log('userClans', userClans);
  console.log('userHeadClans', userHeadClans);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // You can implement search logic here or use it as a filter
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: any) => {
    updateFilters(newFilters);
  };

  // Handle join clan request
  const handleJoinClan = async (clanId: string) => {
    if (!user) return;

    try {
      setJoinRequestLoading(clanId);
      await clanApiClient.inviteMember({
        clanId,
        invitedUserId: user.id,
        role: 'MEMBER',
        message: `Hi! I'd like to join your clan. I'm excited to collaborate and contribute to your team.`
      });

      // Show success message
      alert('Join request sent successfully!');

      // Refresh clans to update the UI
      refetch();
    } catch (error: any) {
      console.error('Error joining clan:', error);
      alert(error.message || 'Failed to send join request');
    } finally {
      setJoinRequestLoading(null);
    }
  };

  // Handle view clan details
  const handleViewClan = (clanId: string) => {
    // Navigate to clan detail page
    window.location.href = `/clans/${clanId}`;
  };

  // Handle manage clan
  const handleManageClan = (clanId: string) => {
    // Navigate to clan management page
    window.location.href = `/clans/${clanId}/manage`;
  };

  // Handle clan creation success
  const handleClanCreated = (clan: Clan) => {
    console.log('handleClanCreated called with:', clan);

    if (!clan || !clan.name) {
      console.error('Invalid clan data received:', clan);
      alert('Clan created successfully, but there was an issue with the response data.');
      refetch();
      return;
    }

    // Refresh the clans list
    refetch();
    // Show success message
    alert(`Clan "${clan.name}" created successfully!`);
  };

  // Load different clan sets based on active tab
  useEffect(() => {
    if (activeTab === 'discover') {
      getPublicClans();
    } else {
      refetch();
    }
  }, [activeTab, getPublicClans, refetch]);

  // Filter clans based on search query
  const filteredClans = clans.filter(clan =>
    searchQuery === '' ||
    clan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clan.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clan.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clan.primaryCategory?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-16">
          <div className="content-container py-8">
            <div className="mx-auto max-w-2xl">
              <div className="card-glass p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Please Sign In
                </h3>
                <p className="text-gray-600 mb-6">
                  You need to be signed in to view and join clans.
                </p>
                <Link href="/login" className="btn-primary">
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
      <div className="page-container min-h-screen pt-0">
        <div className="content-container py-1">
          {/* Clans Header */}
          <div className="mb-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-heading mb-2 text-3xl font-bold">Clans</h1>
                <p className="text-muted">
                  Join creative teams and collaborate on amazing projects
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary px-2 py-2"
              >
                Create Clan
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-4">
            <div className="flex space-x-1 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('my-clans')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'my-clans'
                  ? 'bg-brand-primary text-white'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                My Clans ({userClans.length + userHeadClans.length})
              </button>
              <button
                onClick={() => setActiveTab('discover')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'discover'
                  ? 'bg-brand-primary text-white'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Discover Clans ({filteredClans.length})
              </button>
            </div>
          </div>

          {/* Filters */}
          <ClanFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
            searchQuery={searchQuery}
          />

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card-glass p-3 animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="card-glass p-8 text-center">
              <div className="mb-4">
                <div className="mx-auto mb-4 h-16 w-16 rounded-none bg-red-100 flex items-center justify-center">
                  <span className="text-2xl">❌</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Error Loading Clans
                </h3>
                <p className="text-gray-600 mb-6">{error}</p>
              </div>
              <button onClick={refetch} className="btn-primary">
                Try Again
              </button>
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            <>
              {/* My Clans Section */}
              {activeTab === 'my-clans' && (
                <div className="mb-2">
                  <h2 className="text-heading mb-2 text-xl font-semibold">
                    My Clans
                  </h2>

                  {userClans.length === 0 && userHeadClans.length === 0 ? (
                    <div className="card-glass p-2 text-center">
                      <div className="mb-4">
                        <div className="mx-auto mb-2 h-16 w-16 rounded-none bg-gray-100 flex items-center justify-center">
                          <span className="text-2xl">👥</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No Clans Yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                          You haven't joined any clans yet. Start by discovering clans or create your own!
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('discover')}
                        className="btn-primary"
                      >
                        Discover Clans
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-1 md:grid-cols-2 lg:grid-cols-3 p-2">
                      {/* User's Head Clans */}
                      {userHeadClans.map((clan) => (
                        <div key={clan.id} className="card-glass border-brand-primary/30 bg-brand-light-blue/5 border-2 p-0">
                          <ClanCard
                            clan={clan}
                            showActions={true}
                            onView={handleViewClan}
                            onManage={handleManageClan}
                          />
                        </div>
                      ))}

                      {/* User's Member Clans */}
                      {userClans.filter(clan => !userHeadClans.some(headClan => headClan.id === clan.id)).map((clan) => (
                        <div key={clan.id} className="card-glass p-2">
                          <ClanCard
                            clan={clan}
                            showActions={true}
                            onView={handleViewClan}
                          />
                        </div>
                      ))}

                      {/* Create New Clan Card */}
                      <div className="card-glass border-brand-border hover:border-brand-primary/50 hover:bg-brand-light-blue/5 cursor-pointer border-2 border-dashed transition-all duration-200">
                        <div className="text-center pb-2">
                          <div className="bg-brand-light-blue/20 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-none">
                            <span className="text-xl">➕</span>
                          </div>
                          <h3 className="text-heading mb-2 font-semibold">
                            Create New Clan
                          </h3>
                          <p className="text-muted mb-2 text-sm">
                            Start your own creative team and collaborate with talented creators
                          </p>
                          <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary px-2 py-2 text-sm"
                          >
                            Get Started
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Discover Clans Section */}
              {activeTab === 'discover' && (
                <div className="mb-2">
                  <h2 className="text-heading mb-2 text-xl font-semibold">
                    Discover Clans
                  </h2>

                  {filteredClans.length === 0 ? (
                    <div className="card-glass p-8 text-center">
                      <div className="mb-4">
                        <div className="mx-auto mb-4 h-16 w-16 rounded-none bg-gray-100 flex items-center justify-center">
                          <span className="text-2xl">🔍</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No Clans Found
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {searchQuery
                            ? `No clans match your search for "${searchQuery}". Try adjusting your filters.`
                            : 'No clans available with the current filters. Try adjusting your search criteria.'
                          }
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          handleFiltersChange({});
                          setSearchQuery('');
                        }}
                        className="btn-primary"
                      >
                        Clear Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-2 lg:grid-cols-2">
                      {filteredClans.map((clan) => (
                        <ClanCard
                          key={clan.id}
                          clan={clan}
                          showActions={true}
                          onJoin={handleJoinClan}
                          onView={handleViewClan}
                        />
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {pagination && pagination.pages > 1 && (
                    <div className="mt-6 flex justify-center">
                      <div className="flex space-x-2">
                        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => updateFilters({ page })}
                            className={`px-3 py-2 text-sm rounded ${page === pagination.page
                              ? 'bg-brand-primary text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Clan Benefits */}
          <div className="card-glass p-2 text-center">
            <h2 className="text-heading mb-2 text-2xl font-bold">
              Why Join a Clan?
            </h2>
            <p className="text-muted mx-auto mb-2 max-w-2xl">
              Collaborate with talented creators, share resources, and take on bigger projects together
            </p>
            <div className="grid gap-2 md:grid-cols-3">
              {[
                {
                  icon: '🤝',
                  title: 'Collaboration',
                  description: 'Work together on complex projects and share expertise',
                },
                {
                  icon: '💰',
                  title: 'Higher Earnings',
                  description: 'Access to premium gigs and better negotiating power',
                },
                {
                  icon: '🏆',
                  title: 'Reputation Boost',
                  description: 'Build credibility through verified team achievements',
                },
              ].map((benefit) => (
                <div key={benefit.title} className="text-center">
                  <div className="mb-3 text-4xl">{benefit.icon}</div>
                  <h3 className="text-heading mb-2 font-semibold">
                    {benefit.title}
                  </h3>
                  <p className="text-muted text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Clan Modal */}
      <CreateClanModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleClanCreated}
      />
    </div>
  );
}
