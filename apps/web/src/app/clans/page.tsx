'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClans, Clan } from '@/hooks/useClans';
import { ClanCard } from '@/components/clan/ClanCard';
import { CreateClanModal } from '@/components/clan/CreateClanModal';
import { clanApiClient } from '@/lib/clan-api';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ClansPage() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'my-clans' | 'discover'>('my-clans');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinRequestLoading, setJoinRequestLoading] = useState<string | null>(null);
  // Swipe gesture refs for mobile tab navigation
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const lastTouchXRef = useRef<number | null>(null);
  const lastTouchYRef = useRef<number | null>(null);



  // Separate state for caching clan data
  const [myClansData, setMyClansData] = useState<Clan[]>([]);
  const [discoverClansData, setDiscoverClansData] = useState<Clan[]>([]);
  const [myClansLoading, setMyClansLoading] = useState(false);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [pendingRequestsMap, setPendingRequestsMap] = useState<Record<string, number>>({});

  // Refs to track if data has been loaded to prevent infinite calls
  const myClansLoadedRef = useRef(false);
  const discoverClansLoadedRef = useRef(false);

  // Initialize clans hook with default filters
  const {
    clans,
    loading,
    error,
    userClans,
    userHeadClans,
    refetch,
    getClanFeed,
    getMyClans,
    getPublicClans,
    setError
  } = useClans({
    sortBy: 'createdAt',
    order: 'desc',
    limit: 20
  });

  const loadMyClans = useCallback(async () => {
    try {
      setMyClansLoading(true);

      // Strategy 1: Try to get all clans and filter by membership
      const allClansResponse = await clanApiClient.getPublicClans();

      if (allClansResponse.success) {
        const allClans = (allClansResponse.data as any)?.clans || [];

        // Filter to only include clans where user is owner or member
        const myClans = allClans.filter((clan: Clan) => {
          if (!user?.id) return false;

          const isOwner = clan.clanHeadId === user.id;
          const isMember = clan.members?.some(member =>
            member.userId === user.id
          ) || clan.memberIds?.includes(user.id);

          return isOwner || isMember;
        });

        setMyClansData(myClans);

        // Fetch pending requests for owned clans
        if (myClans.length > 0) {
          await loadPendingRequestsForClans(myClans);
        }
      } else {
        // Strategy 2: Fallback to the original endpoint
        const response = await clanApiClient.getMyClans();

        if (response.success) {
          const clansData = (response.data as any)?.clans || [];
          setMyClansData(clansData);

          // Fetch pending requests for owned clans
          if (clansData.length > 0) {
            await loadPendingRequestsForClans(clansData);
          }
        }
      }
    } catch (error) {
      console.error('Error loading my clans:', error);
    } finally {
      setMyClansLoading(false);
    }
  }, [user?.id]);

  const loadDiscoverClans = useCallback(async () => {
    try {
      setDiscoverLoading(true);
      const response = await clanApiClient.getPublicClans();
      if (response.success) {
        const clansData = (response.data as any)?.clans || [];
        setDiscoverClansData(clansData);
      }
    } catch (error) {
      console.error('Error loading discover clans:', error);
    } finally {
      setDiscoverLoading(false);
    }
  }, []);

  const loadPendingRequestsForClans = useCallback(async (clans: Clan[]) => {
    try {
      const pendingMap: Record<string, number> = {};

      // Only fetch for clans where user is owner or admin
      const managedClans = clans.filter(clan => {
        const isOwner = clan.clanHeadId === user?.id;
        const isAdmin = clan.members?.some(member =>
          member.userId === user?.id &&
          ['HEAD', 'CO_HEAD', 'ADMIN'].includes(member.role)
        );
        return isOwner || isAdmin;
      });

      for (const clan of managedClans) {
        try {
          const response = await clanApiClient.getJoinRequests(clan.id);
          if (response.success) {
            const requests = (response.data as any) || [];
            const pendingCount = requests.filter((req: any) => req.status === 'PENDING').length;
            if (pendingCount > 0) {
              pendingMap[clan.id] = pendingCount;
            }
          }
        } catch (error) {
          console.error(`Error loading join requests for clan ${clan.id}:`, error);
        }
      }

      setPendingRequestsMap(pendingMap);
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  }, [user?.id]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle join clan request
  const handleJoinClan = async (clanId: string) => {
    if (!user) return;

    try {
      setJoinRequestLoading(clanId);
      await clanApiClient.joinClan(clanId, {
        message: `Hi! I'd like to join your clan.`
      });

      toast.success('Join request sent! The clan owner will review it.');

      // Clear cached data to force refresh
      setMyClansData([]);
      setDiscoverClansData([]);
      myClansLoadedRef.current = false;
      discoverClansLoadedRef.current = false;
      refetch();
    } catch (error: any) {
      console.error('Error joining clan:', error);
      toast.error(error.error || 'Failed to send join request');
    } finally {
      setJoinRequestLoading(null);
    }
  };

  // Handle view clan details
  const handleViewClan = (clanId: string) => {
    window.location.href = `/clan/${clanId}`;
  };

  // Handle manage clan
  const handleManageClan = (clanId: string) => {
    window.location.href = `/clan/${clanId}/manage`;
  };

  // Handle clan creation success
  const handleClanCreated = (clan: Clan) => {
    // console.log('Clan created:', clan);
    // Clear cached data to force refresh
    setMyClansData([]);
    setDiscoverClansData([]);
    myClansLoadedRef.current = false;
    discoverClansLoadedRef.current = false;
    refetch();
    toast.success(`Clan "${clan.name}" created successfully!`);
  };

  // Enhanced refetch that clears cached data
  const handleRefetch = () => {
    setMyClansData([]);
    setDiscoverClansData([]);
    myClansLoadedRef.current = false;
    discoverClansLoadedRef.current = false;
    refetch();
  };

  // Get current loading state based on active tab
  const currentLoading = activeTab === 'my-clans' ? myClansLoading || loading : discoverLoading || loading;

  // Handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    touchStartXRef.current = t.clientX;
    touchStartYRef.current = t.clientY;
    lastTouchXRef.current = t.clientX;
    lastTouchYRef.current = t.clientY;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    lastTouchXRef.current = t.clientX;
    lastTouchYRef.current = t.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    const startY = touchStartYRef.current;
    const endX = lastTouchXRef.current ?? startX;
    const endY = lastTouchYRef.current ?? startY;
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    lastTouchXRef.current = null;
    lastTouchYRef.current = null;

    if (startX == null || startY == null || endX == null || endY == null) return;
    const dx = endX - startX;
    const dy = endY - startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const horizontalThreshold = 50; // px
    const verticalGuard = 40; // ignore if mostly vertical

    if (absDx > horizontalThreshold && absDx > absDy && Math.abs(dy) < verticalGuard) {
      if (dx < 0) {
        // Swipe left → go to next tab
        setActiveTab('discover');
      } else {
        // Swipe right → go to previous tab
        setActiveTab('my-clans');
      }
    }
  };

  // Load different clan sets based on active tab
  useEffect(() => {
    if (user?.id) {
      if (activeTab === 'my-clans') {
        loadMyClans();
      } else {
        loadDiscoverClans();
      }
    }
  }, [user?.id, activeTab, loadMyClans, loadDiscoverClans]); // Add function dependencies

  // Initial load effect - ensure data is loaded when component mounts
  useEffect(() => {
    if (user?.id) {
      // Always load my clans on initial mount since it's the default tab
      loadMyClans();
    }
  }, [user?.id, loadMyClans]); // Add loadMyClans to dependencies

  // Update cached data when clans change
  useEffect(() => {
    if (activeTab === 'my-clans' && myClansLoading) {
      setMyClansData(Array.isArray(clans) ? clans : []);
      setMyClansLoading(false);
    } else if (activeTab === 'discover' && discoverLoading) {
      setDiscoverClansData(Array.isArray(clans) ? clans : []);
      setDiscoverLoading(false);
    }
  }, [clans, activeTab, myClansLoading, discoverLoading]);

  // Remove the redundant initial load effect since it's handled above

  // Helper function to check if user is member or owner of a clan
  const isUserInClan = (clan: Clan): boolean => {
    if (!user?.id) return false;

    // Check if user is the owner
    if (clan.clanHeadId === user.id) return true;

    // Check if user is a member via memberIds array
    if (clan.memberIds && clan.memberIds.includes(user.id)) return true;

    // Check if user is in members array (alternative structure)
    if (clan.members && clan.members.some(member => member.id === user.id || member.userId === user.id)) return true;

    return false;
  };

  // My Clans: clans where user is owner or member
  const myClans: Clan[] = React.useMemo(() => {
    if (!user?.id) return [];

    // Use cached my clans data, fallback to global clans state if cache is empty and we're on my-clans tab
    let clansToUse = myClansData;
    if (clansToUse.length === 0 && activeTab === 'my-clans' && Array.isArray(clans)) {
      clansToUse = clans;
    }

    // Always filter to only include clans where user is owner or member
    const filteredClans = clansToUse.filter(clan => isUserInClan(clan));

    // Sort: clans with pending requests first (descending by pending count)
    const sortedClans = [...filteredClans].sort((a, b) => {
      const aCount = pendingRequestsMap[a.id] || 0;
      const bCount = pendingRequestsMap[b.id] || 0;
      if (bCount !== aCount) return bCount - aCount;
      return 0;
    });

    return sortedClans;
  }, [user?.id, myClansData, clans, activeTab, pendingRequestsMap]);

  // Discover Clans: clans where user is NOT owner or member  
  const discoverClans: Clan[] = React.useMemo(() => {
    if (!user?.id) {
      // If no user, show all discover clans
      return discoverClansData.length > 0 ? discoverClansData : (Array.isArray(clans) ? clans : []);
    }

    // Use cached discover clans data, fallback to global clans state if cache is empty and we're on discover tab
    let clansToUse = discoverClansData;
    if (clansToUse.length === 0 && activeTab === 'discover' && Array.isArray(clans)) {
      clansToUse = clans;
    }

    // console.log('DiscoverClans computation - discoverClansData length:', discoverClansData.length);
    // console.log('DiscoverClans computation - using clans length:', clansToUse.length);
    // console.log('DiscoverClans computation - activeTab:', activeTab);

    // Always filter out clans where user is already owner or member
    const filteredClans = clansToUse.filter(clan => !isUserInClan(clan));
    // console.log('DiscoverClans computation - filtered result:', filteredClans.length);

    return filteredClans;
  }, [user?.id, discoverClansData, clans, activeTab]);

  // Apply search filter to discover clans
  const filteredDiscoverClans = discoverClans.filter(clan => {
    return (
      searchQuery === '' ||
      clan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clan.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clan.primaryCategory?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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
        <div
          className="content-container py-1"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Clans Header */}
          <div className="mb-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-heading mb-2 text-3xl font-bold">Clans</h1>
                <p className="text-muted">
                  Join creative clans and collaborate with talented creators
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
                My Clans
              </button>
              <button
                onClick={() => setActiveTab('discover')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'discover'
                  ? 'bg-brand-primary text-white'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Discover Clans
              </button>
            </div>
          </div>

          {/* Simple Search */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search clans..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {currentLoading && (
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
          {error && !currentLoading && (
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
              <button onClick={handleRefetch} className="btn-primary">
                Try Again
              </button>
            </div>
          )}

          {/* Content */}
          {!currentLoading && !error && (
            <>
              {/* My Clans Section */}
              {activeTab === 'my-clans' && (
                <div className="mb-1">
                  <h2 className="text-heading mb-1 text-xl font-semibold">
                    My Clans
                  </h2>

                  {myClans.length === 0 ? (
                    <div className="card-glass p-1 text-center">
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
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 p-0">
                      {/* User's Clans (owned or member-of) */}
                      {myClans.map((clan) => {
                        const isOwner = clan.clanHeadId === user?.id;
                        const isMember = isUserInClan(clan) && !isOwner;
                        const pendingRequests = pendingRequestsMap[clan.id] || 0;

                        return (
                          <div key={clan.id} className={`card-glass p-0`}>
                            <ClanCard
                              clan={clan}
                              showActions={true}
                              onView={handleViewClan}
                              // Only show manage option if user is the owner
                              onManage={isOwner ? handleManageClan : undefined}
                              // Don't show join option since user is already in the clan
                              onJoin={undefined}
                              pendingRequestsCount={pendingRequests}
                            />
                            {/* Show member badge if user is member but not owner */}
                            {/* {isMember && (
                              <div className="px-3 pb-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Member
                                </span>
                              </div>
                            )} */}
                            {/* Show owner badge if user is owner */}
                            {/* {isOwner && (
                              <div className="px-3 pb-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Owner
                                </span>
                              </div>
                            )} */}
                          </div>
                        );
                      })}

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
                            Start your own creative clan and collaborate with talented creators
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
                  <h2 className="text-heading mb-1 text-xl font-semibold">
                    Discover Clans
                  </h2>

                  {filteredDiscoverClans.length === 0 ? (
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
                            ? `No clans match your search for "${searchQuery}". Try adjusting your search.`
                            : 'No clans available to discover. You may already be a member of all available clans!'
                          }
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                        }}
                        className="btn-primary"
                      >
                        Clear Search
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-2 lg:grid-cols-3">
                      {filteredDiscoverClans.map((clan: Clan) => {
                        const pendingRequests = pendingRequestsMap[clan.id] || 0;
                        return (
                          <ClanCard
                            key={clan.id}
                            clan={clan}
                            showActions={true}
                            onJoin={handleJoinClan}
                            onView={handleViewClan}
                            onManage={undefined}
                            pendingRequestsCount={pendingRequests}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Clan Benefits */}
          <div className="card-glass p-1 text-center">
            <h2 className="text-heading mb-1 text-xl font-bold">
              Why Join a Clan?
            </h2>
            <p className="text-muted mx-auto mb-1 max-w-2xl">
              Collaborate with talented creators, share resources, and take on bigger projects together
            </p>
            <div className="grid grid-cols-3 gap-1 md:grid-cols-3">
              {[
                {
                  icon: '🤝',
                  title: 'Collaboration',
                  description: 'Work together on projects and share expertise',
                },
                {
                  icon: '💰',
                  title: 'Higher Earnings',
                  description: 'Access to premium gigs and better opportunities',
                },
                {
                  icon: '🏆',
                  title: 'Growth',
                  description: 'Learn from others and build your skills',
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
