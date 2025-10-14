'use client';

/**
 * Clans Page with Role-Based Access Control
 * 
 * Access Control Rules:
 * - Clan Owners (headId === user.id): Full management access
 * - Clan Admins (userMembership.role === 'admin'): Management access
 * - Regular Members: View access only, no management
 * - Non-members: Can discover and request to join
 * 
 * Management Features:
 * - Only owners and admins see "Manage Clan" button
 * - Management access is visually indicated with badges
 * - Discover section filters out clans user is already a member of
 */

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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinRequestLoading, setJoinRequestLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'my' | 'discover'>('my');

  // Handle tab switching
  const handleTabChange = (tab: 'my' | 'discover') => {
    setActiveTab(tab);
    if (tab === 'discover' && discoverClans.length === 0) {
      loadDiscoverClans();
    }
  };

  // Separate state for caching clan data
  const [myClansData, setMyClansData] = useState<Clan[]>([]);
  const [myClansLoading, setMyClansLoading] = useState(false);
  const [pendingRequestsMap, setPendingRequestsMap] = useState<Record<string, number>>({});

  // Discover section state
  const [discoverClans, setDiscoverClans] = useState<Clan[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const [discoverPage, setDiscoverPage] = useState(1);
  const [hasMoreDiscover, setHasMoreDiscover] = useState(true);
  const [discoverLoadingMore, setDiscoverLoadingMore] = useState(false);

  // Search state
  const [searchParams, setSearchParams] = useState({
    name: '',
    category: '',
    location: '',
    sortBy: 'score' as 'score' | 'name' | 'createdAt' | 'rank' | 'reputationScore' | 'totalGigs' | 'averageRating',
    order: 'desc' as 'asc' | 'desc',
    limit: 20
  });
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Ref to prevent duplicate processing of the same clan data
  const lastProcessedClanIds = useRef<string>('');

  // Initialize clans hook with default filters
  const {
    clans,
    loading,
    error,
    refetch,
    getMyClans,
    setError
  } = useClans({
    sortBy: 'createdAt',
    order: 'desc',
    limit: 20
  });

  const loadMyClans = useCallback(async () => {
    try {
      setMyClansLoading(true);

      // Use the hook's getMyClans method instead of direct API call
      await getMyClans();

      // Note: Pending requests will be fetched in the useEffect when clans change
      // This prevents duplicate API calls
    } catch (error) {
      console.error('Error loading my clans:', error);
    } finally {
      setMyClansLoading(false);
    }
  }, [getMyClans]);

  // Load discover clans
  const loadDiscoverClans = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setDiscoverLoading(true);
        setDiscoverError(null);
      } else {
        setDiscoverLoadingMore(true);
      }

      const response = await clanApiClient.getClanFeed({
        ...searchParams,
        page
      });

      if (response.success) {
        const newClans = response.data as Clan[];

        // Filter out clans where the current user is already a member
        const filteredClans = newClans.filter(clan => {
          // Check if user is a member by looking at memberIds array
          const isUserMember = clan.memberIds?.includes(user?.id || '');
          // Check if user has a pending request
          const isUserPending = clan.pendingJoinUserIds?.includes(user?.id || '');

          // Only show clans where user is NOT a member and has NO pending request
          return !isUserMember && !isUserPending;
        });

        if (append) {
          setDiscoverClans(prev => [...prev, ...filteredClans]);
        } else {
          setDiscoverClans(filteredClans);
        }

        // Update hasMoreDiscover based on filtered results
        // If we filtered out some clans, we might need to load more to reach the limit
        const effectiveClansCount = append ? discoverClans.length + filteredClans.length : filteredClans.length;
        setHasMoreDiscover(newClans.length === 20 && effectiveClansCount < 20);
        setDiscoverPage(page);
      } else {
        setDiscoverError('Failed to load discover clans');
      }
    } catch (error) {
      console.error('Error loading discover clans:', error);
      setDiscoverError('Failed to load discover clans');
    } finally {
      setDiscoverLoading(false);
      setDiscoverLoadingMore(false);
    }
  }, [searchParams, user?.id, discoverClans.length]);

  // Load more discover clans
  const loadMoreDiscover = useCallback(() => {
    if (!discoverLoadingMore && hasMoreDiscover) {
      loadDiscoverClans(discoverPage + 1, true);
    }
  }, [discoverLoadingMore, hasMoreDiscover, discoverPage, loadDiscoverClans]);

  // Intersection observer for lazy loading
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastClanElementRef = useCallback((node: HTMLDivElement) => {
    if (discoverLoadingMore) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreDiscover) {
        loadMoreDiscover();
      }
    });

    if (node) observerRef.current.observe(node);
  }, [discoverLoadingMore, hasMoreDiscover, loadMoreDiscover]);



  const loadPendingRequestsForClans = useCallback(async (clans: Clan[]) => {
    try {
      // Prevent duplicate processing by checking if we already have pending requests for these clans
      const clanIds = clans.map(c => c.id).sort().join(',');
      if (clanIds === lastProcessedClanIds.current && Object.keys(pendingRequestsMap).length > 0) {
        console.log('↻ Skipping duplicate pending requests processing');
        return; // Already processed these clans
      }

      console.log('↻ Loading pending requests for clans:', clans.map(c => ({ id: c.id, name: c.name })));

      const pendingMap: Record<string, number> = {};

      // Only fetch join requests for clans where the user is owner or admin
      for (const clan of clans) {
        const isOwner = clan.headId === user?.id;
        const isAdmin = clan.userMembership?.role === 'admin';
        const canManage = isOwner || isAdmin;

        if (!canManage) {
          console.log(`⏭️ Skipping clan ${clan.name} - user cannot manage (owner: ${isOwner}, admin: ${isAdmin})`);
          continue;
        }

        try {
          console.log(`🔍 Fetching join requests for clan: ${clan.name} (${clan.id})`);
          const response = await clanApiClient.getJoinRequests(clan.id);

          if (response.success) {
            const requests = (response.data as any) || [];
            console.log(`📋 Clan ${clan.name} join requests:`, requests);

            // Count pending requests
            const pendingCount = requests.filter((req: any) => {
              // Handle different data structures
              if (typeof req === 'string') {
                return true; // If it's just user IDs, assume all are pending
              } else if (req && typeof req === 'object' && 'status' in req) {
                return req.status === 'PENDING';
              } else {
                return true; // If no status field, assume pending
              }
            }).length;

            if (pendingCount > 0) {
              pendingMap[clan.id] = pendingCount;
              console.log(`✅ Clan ${clan.name} has ${pendingCount} pending requests`);
            } else {
              console.log(`✅ Clan ${clan.name} has no pending requests`);
            }
          } else {
            console.warn(`⚠️ Failed to get join requests for clan ${clan.name}:`, response);
          }
        } catch (error: any) {
          // Log the specific error for debugging
          if (error?.statusCode === 400 || error?.statusCode === 403) {
            console.log(`🚫 Clan ${clan.name}: User not authorized to view join requests (${error.statusCode})`);
          } else {
            console.error(`❌ Error fetching join requests for clan ${clan.name}:`, error);
          }
        }
      }

      console.log('📊 Final pending requests map:', pendingMap);
      setPendingRequestsMap(pendingMap);
      lastProcessedClanIds.current = clanIds;
    } catch (error) {
      console.error('❌ Error in loadPendingRequestsForClans:', error);
    }
  }, [pendingRequestsMap, user?.id]);





  // Handle join clan request
  const handleJoinClan = async (clanId: string) => {
    if (!user) return;

    try {
      setJoinRequestLoading(clanId);
      await clanApiClient.joinClan(clanId, {
        message: `Hi! I'd like to join your clan.`
      });

      toast.success('Join request sent! The clan owner will review it.');

      // Use the hook's refetch method instead of manually clearing cached data
      refetch();

      // Also refresh discover clans to remove the joined clan from the list
      if (activeTab === 'discover') {
        loadDiscoverClans();
      }
    } catch (error: any) {
      console.error('Error joining clan:', error);
      toast.error(error.error || 'Failed to send join request');
    } finally {
      setJoinRequestLoading(null);
    }
  };

  // Handle leave clan request
  const handleLeaveClan = async (clanId: string) => {
    if (!user) return;

    try {
      setJoinRequestLoading(clanId);
      await clanApiClient.leaveClan(clanId);

      toast.success('Successfully left the clan.');

      // Refresh both my clans and discover clans
      refetch();
      if (activeTab === 'discover') {
        loadDiscoverClans();
      }
    } catch (error: any) {
      console.error('Error leaving clan:', error);
      toast.error(error.error || 'Failed to leave clan');
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
    // Use the hook's refetch method instead of manually clearing cached data
    refetch();
    toast.success(`Clan "${clan.name}" created successfully!`);
  };

  // Enhanced refetch that uses the hook's refetch method
  const handleRefetch = () => {
    refetch();
  };

  // Refresh discover clans
  const handleRefreshDiscover = () => {
    setDiscoverPage(1);
    setDiscoverClans([]);
    setHasMoreDiscover(true);
    loadDiscoverClans();
  };

  // Handle search with debouncing
  const handleSearch = (newParams: Partial<typeof searchParams>) => {
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Update search params immediately for UI responsiveness
    setSearchParams(prev => ({ ...prev, ...newParams }));

    // Set new timeout for API call
    const timeout = setTimeout(() => {
      setDiscoverPage(1);
      setDiscoverClans([]);
      setHasMoreDiscover(true);
      loadDiscoverClans();
    }, 300); // 300ms debounce

    setSearchTimeout(timeout);
  };

  // Clear search
  const clearSearch = () => {
    setSearchParams({
      name: '',
      category: '',
      location: '',
      sortBy: 'score',
      order: 'desc',
      limit: 20
    });
    setDiscoverPage(1);
    setDiscoverClans([]);
    setHasMoreDiscover(true);
    loadDiscoverClans();
  };

  // Helper function to check if user is member or owner of a clan
  const isUserInClan = (clan: Clan): boolean => {
    if (!user?.id) return false;

    // Check if user is the owner (headId)
    if (clan.headId === user.id) return true;

    // Check if user is a member (memberIds array)
    if (clan.memberIds && Array.isArray(clan.memberIds) && clan.memberIds.includes(user.id)) {
      return true;
    }

    // Check if user has a pending join request
    if (clan.pendingJoinUserIds && Array.isArray(clan.pendingJoinUserIds) && clan.pendingJoinUserIds.includes(user.id)) {
      return true;
    }

    return false;
  };

  // Helper function to check if clan is in myClans
  const isClanInMyClans = (clan: Clan): boolean => {
    return myClans.some(myClan => myClan.id === clan.id);
  };

  // Get current loading state based on active tab
  const currentLoading = activeTab === 'my' ? myClansLoading : (discoverLoading || (activeTab === 'discover' && discoverClans.length === 0));


  // Load my clans when user is available
  useEffect(() => {
    if (user?.id) {
      loadMyClans();
    }
  }, [user?.id, loadMyClans]);

  // Initial load effect - ensure data is loaded when component mounts
  useEffect(() => {
    if (user?.id) {
      // Always load my clans on initial mount since it's the default tab
      loadMyClans();
    }
  }, [user?.id, loadMyClans]);

  // Load discover clans when discover tab is active
  useEffect(() => {
    if (activeTab === 'discover' && user?.id && discoverClans.length === 0) {
      loadDiscoverClans();
    }
  }, [activeTab, user?.id, discoverClans.length, loadDiscoverClans]);

  // Auto-expand search when there are active filters
  useEffect(() => {
    if (searchParams.name || searchParams.category || searchParams.location || searchParams.sortBy !== 'score' || searchParams.order !== 'desc') {
      setIsSearchExpanded(true);
    }
  }, [searchParams.name, searchParams.category, searchParams.location, searchParams.sortBy, searchParams.order]);

  // Cleanup intersection observer and search timeout on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Update cached data when clans change from the hook
  useEffect(() => {
    if (!myClansLoading && clans.length > 0) {
      // Since getMyClans returns only user's clans, we can directly use them
      // No need to filter by ownership/membership
      setMyClansData(clans);

      // Fetch pending requests for owned clans only once when clans change
      // Use a ref to prevent multiple calls for the same clan data
      const clanIds = clans.map(c => c.id).sort().join(',');
      if (clanIds !== lastProcessedClanIds.current) {
        lastProcessedClanIds.current = clanIds;
        loadPendingRequestsForClans(clans);
      }
    }
  }, [clans, myClansLoading, user?.id, loadPendingRequestsForClans]);

  // My Clans: clans where user is owner or member
  const myClans: Clan[] = React.useMemo(() => {
    if (!user?.id) return [];

    // Use cached my clans data, fallback to global clans state if cache is empty
    let clansToUse = myClansData;
    if (clansToUse.length === 0 && Array.isArray(clans)) {
      clansToUse = clans;
    }

    // Debug logging for clan data structure
    console.log('🔍 My Clans Data Debug:', {
      userId: user?.id,
      myClansDataLength: myClansData.length,
      clansLength: clans.length,
      clansToUseLength: clansToUse.length,
      sampleClan: clansToUse[0] ? {
        id: clansToUse[0].id,
        name: clansToUse[0].name,
        keys: Object.keys(clansToUse[0]),
        hasClanHeadId: 'headId' in clansToUse[0],
        hasUserMembership: 'userMembership' in clansToUse[0],
        headId: (clansToUse[0] as any).headId,
        userMembership: (clansToUse[0] as any).userMembership,
        fullClanData: clansToUse[0]
      } : null
    });

    // Filter to only include clans where user is owner or member
    const filteredClans = clansToUse.filter(clan => isUserInClan(clan));

    console.log('🔍 Filtered Clans Debug:', {
      totalClans: clansToUse.length,
      filteredClans: filteredClans.length,
      userClans: filteredClans.map(c => ({
        id: c.id,
        name: c.name,
        isOwner: c.headId === user.id,
        isMember: c.memberIds?.includes(user.id),
        hasPendingRequest: c.pendingJoinUserIds?.includes(user.id)
      }))
    });

    // Sort: clans with pending requests first (descending by pending count)
    const sortedClans = [...filteredClans].sort((a, b) => {
      const aCount = pendingRequestsMap[a.id] || 0;
      const bCount = pendingRequestsMap[b.id] || 0;
      if (bCount !== aCount) return bCount - aCount;
      return 0;
    });

    return sortedClans;
  }, [user?.id, myClansData, clans, pendingRequestsMap]);



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

  const isClanReadyForProd = false;

  // Debug logging for user and authentication
  // Debug logging for user and authentication
  // console.log('🔍 User Debug:', {
  //   isAuthenticated,
  //   user: user ? {
  //     id: user.id,
  //     email: user.email,
  //     username: user.username,
  //     keys: Object.keys(user)
  //   } : null
  // });

  if (!isClanReadyForProd) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-0">
          <div className="content-container py-1">
            <div className="card-glass p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                This feature is not available yet
              </h3>
              <p className="text-gray-600 mb-6">
                We're working on it and it will be available soon.
              </p>
              <Link href="/" className="btn-primary">
                Go Home
              </Link>
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
                onClick={() => handleTabChange('my')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'my'
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                My Clans
              </button>
              <button
                onClick={() => handleTabChange('discover')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'discover'
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                Discover
              </button>
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
          {((activeTab === 'my' && error) || (activeTab === 'discover' && discoverError)) && !currentLoading && (
            <div className="card-glass p-8 text-center">
              <div className="mb-4">
                <div className="mx-auto mb-4 h-16 w-16 rounded-none bg-red-100 flex items-center justify-center">
                  <span className="text-2xl">❌</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Error Loading {activeTab === 'my' ? 'My Clans' : 'Discover Clans'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {(() => {
                    const currentError = activeTab === 'my' ? error : discoverError;
                    // Hide authentication errors from users, show generic message instead
                    if (currentError?.includes('Authentication token is required') ||
                      currentError?.includes('401') ||
                      currentError?.includes('Unauthorized')) {
                      return 'Unable to load data at the moment. Please try again.';
                    }
                    return currentError;
                  })()}
                </p>
              </div>
              <button onClick={activeTab === 'my' ? handleRefetch : handleRefreshDiscover} className="btn-primary">
                Try Again
              </button>
            </div>
          )}

          {/* Content */}
          {!currentLoading && !(activeTab === 'my' ? error : discoverError) && (
            <>
              {/* My Clans Section */}
              {activeTab === 'my' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-heading text-xl font-semibold">
                      My Clans
                    </h2>
                    {/* Pending Applications Summary */}
                  </div>

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
                          You haven't joined any clans yet. Create your own clan to get started!
                        </p>
                      </div>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary"
                      >
                        Create Clan
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-0 md:grid-cols-2 lg:grid-cols-3 p-0 border-b-1 border-gray-200">
                      {/* User's Clans (owned or member-of) */}
                      {myClans.map((clan) => {
                        // Check if user is owner or admin of this clan
                        // Only owners and admins can access clan management
                        const isOwner = clan.headId === user?.id;
                        const isAdmin = clan.userMembership?.role === 'admin';
                        const canManage = isOwner || isAdmin;
                        const pendingRequests = pendingRequestsMap[clan.id] || 0;

                        // Debug logging for pending count
                        console.log(`🔍 Clan ${clan.name} pending count:`, {
                          clanId: clan.id,
                          pendingRequests,
                          pendingRequestsMap: pendingRequestsMap,
                          canManage,
                          isOwner,
                          isAdmin
                        });

                        // Debug logging for access control
                        console.log('🔍 Clan Access Debug:', {
                          clanId: clan.id,
                          clanName: clan.name,
                          userId: user?.id,
                          headId: clan.headId,
                          userMembership: clan.userMembership,
                          isOwner,
                          isAdmin,
                          canManage,
                          clanKeys: Object.keys(clan),
                          fullClanData: clan
                        });

                        return (
                          <div key={clan.id} className={`card-glass p-0 relative ${pendingRequests > 0 ? 'ring-2 ring-orange-200 bg-orange-50/30' : ''}`}>
                            {/* Pending Applications Indicator */}

                            <ClanCard
                              clan={clan}
                              showActions={true}
                              onView={handleViewClan}
                              onManage={canManage ? handleManageClan : undefined}
                              onJoin={undefined}
                              pendingRequestsCount={pendingRequests}
                            />
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
                            className="btn-primary px-6 py-2 text-sm"
                          >
                            Get Started
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Discover Section */}
              {activeTab === 'discover' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-heading text-xl font-semibold">
                      Discover Clans
                    </h2>
                    {discoverClans.length > 0 && (
                      <div className="text-right">
                        <span className="text-sm text-gray-500">
                          {discoverClans.length} clans found
                        </span>
                        <div className="text-xs text-gray-400 mt-1">
                          (excluding clans you're already a member of)
                        </div>
                        {(searchParams.name || searchParams.category || searchParams.location) && (
                          <div className="text-xs text-gray-400 mt-1">
                            for "{[searchParams.name, searchParams.category, searchParams.location].filter(Boolean).join(' ')}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Search Bar */}
                  <div className="mb-4">
                    <div className="card-glass p-4">
                      {/* Search Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Search Clans</h3>
                        <div className="flex items-center gap-3">
                          {(searchParams.name || searchParams.category || searchParams.location || searchParams.sortBy !== 'score' || searchParams.order !== 'desc') && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary">
                              🔍 Search Active
                            </span>
                          )}
                          <button
                            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <span className="mr-2">{isSearchExpanded ? '−' : '+'}</span>
                            {isSearchExpanded ? 'Hide Search' : 'Show Search'}
                          </button>
                        </div>
                      </div>

                      {/* Active Filters Summary - Always Visible */}
                      {(searchParams.name || searchParams.category || searchParams.location || searchParams.sortBy !== 'score' || searchParams.order !== 'desc') && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                            {!isSearchExpanded && (
                              <button
                                onClick={() => setIsSearchExpanded(true)}
                                className="text-xs text-brand-primary hover:text-brand-primary/80 underline"
                              >
                                Edit Search
                              </button>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {searchParams.name && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                                Name: {searchParams.name}
                              </span>
                            )}
                            {searchParams.category && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                Category: {searchParams.category}
                              </span>
                            )}
                            {searchParams.location && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                Location: {searchParams.location}
                              </span>
                            )}
                            {searchParams.sortBy !== 'score' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                                Sort: {searchParams.sortBy}
                              </span>
                            )}
                            {searchParams.order !== 'desc' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                                Order: {searchParams.order}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Expandable Search Form */}
                      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isSearchExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                          {/* Name Search */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., Creative Hub, Tech Innovators..."
                              value={searchParams.name}
                              onChange={(e) => handleSearch({ name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
                            />
                          </div>

                          {/* Category Search */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Category
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., Technology, Design..."
                              value={searchParams.category}
                              onChange={(e) => handleSearch({ category: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
                            />
                          </div>

                          {/* Location Search */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Location
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., Remote, NYC, London..."
                              value={searchParams.location}
                              onChange={(e) => handleSearch({ location: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
                            />
                          </div>

                          {/* Sort By */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Sort By
                            </label>
                            <select
                              value={searchParams.sortBy}
                              onChange={(e) => handleSearch({ sortBy: e.target.value as any })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
                            >
                              <option value="score">Score</option>
                              <option value="name">Name</option>
                              <option value="createdAt">Newest</option>
                              <option value="rank">Rank</option>
                              <option value="reputationScore">Reputation</option>
                            </select>
                          </div>

                          {/* Order */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Order
                            </label>
                            <select
                              value={searchParams.order}
                              onChange={(e) => handleSearch({ order: e.target.value as 'asc' | 'desc' })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
                            >
                              <option value="desc">Descending</option>
                              <option value="asc">Ascending</option>
                            </select>
                          </div>
                        </div>

                        {/* Clear Search Button */}
                        {(searchParams.name || searchParams.category || searchParams.location || searchParams.sortBy !== 'score' || searchParams.order !== 'desc') && (
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={clearSearch}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <span className="mr-2">✕</span>
                              Clear Search
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {discoverClans.length === 0 ? (
                    <div className="card-glass p-1 text-center">
                      <div className="mb-4">
                        <div className="mx-auto mb-2 h-16 w-16 rounded-none bg-gray-100 flex items-center justify-center">
                          <span className="text-2xl">🔍</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {searchParams.name || searchParams.category || searchParams.location ? 'No Clans Match Your Search' : 'No Clans Found'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {searchParams.name || searchParams.category || searchParams.location
                            ? `No clans found matching "${[searchParams.name, searchParams.category, searchParams.location].filter(Boolean).join(' ')}". Try adjusting your search criteria.`
                            : 'No new clans available to discover at the moment. You may already be a member of all available clans.'
                          }
                        </p>
                        {(searchParams.name || searchParams.category || searchParams.location) && (
                          <button
                            onClick={clearSearch}
                            className="btn-secondary mb-4"
                          >
                            Clear Search
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-0 md:grid-cols-2 lg:grid-cols-3 p-0 border-b-1 border-gray-200">
                      {/* Discover Clans (filtered to exclude user's existing clans) */}
                      {discoverClans.map((clan, index) => {
                        const isLast = index === discoverClans.length - 1;

                        return (
                          <div
                            key={clan.id}
                            className={`card-glass p-0`}
                            ref={isLast ? lastClanElementRef : undefined}
                          >
                            <ClanCard
                              clan={clan}
                              showActions={true}
                              onView={handleViewClan}
                              onManage={undefined}
                              onJoin={handleJoinClan}
                              onLeave={undefined}
                              pendingRequestsCount={0}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Loading More Indicator */}
                  {discoverLoadingMore && (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center px-4 py-2 text-sm text-gray-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-primary mr-2"></div>
                        Loading more clans...
                      </div>
                    </div>
                  )}

                  {/* Initial Loading Indicator */}
                  {discoverLoading && discoverClans.length === 0 && (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center px-4 py-2 text-sm text-gray-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-primary mr-2"></div>
                        {searchParams.name || searchParams.category || searchParams.location ? 'Searching clans...' : 'Loading discover clans...'}
                      </div>
                    </div>
                  )}

                  {/* Load More Button (Fallback) */}
                  {!discoverLoadingMore && hasMoreDiscover && discoverClans.length > 0 && (
                    <div className="text-center py-4">
                      <button
                        onClick={loadMoreDiscover}
                        className="btn-secondary px-6 py-2"
                        disabled={discoverLoadingMore}
                      >
                        Load More Clans
                      </button>
                    </div>
                  )}

                  {/* No More Clans Indicator */}
                  {!discoverLoadingMore && !hasMoreDiscover && discoverClans.length > 0 && (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg">
                        <span className="mr-2">✨</span>
                        You've reached the end of available clans
                      </div>
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
