import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { clanApiClient } from '@/lib/clan-api';
import { getPublicProfiles } from '@/lib/user-api';

export interface Clan {
    id: string;
    name: string;
    slug: string;
    description?: string;
    tagline?: string;
    visibility: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
    isVerified: boolean;
    isActive: boolean;
    headId?: string; // Made optional since getMyClans response doesn't include it
    userMembership?: {
        status: 'pending' | 'member' | 'rejected';
        role: 'admin' | 'member';
    };
    email?: string;
    website?: string;
    instagramHandle?: string;
    twitterHandle?: string;
    linkedinHandle?: string;
    requiresApproval: boolean;
    isPaidMembership: boolean;
    membershipFee?: number;
    maxMembers: number;
    primaryCategory?: string;
    categories: string[];
    skills: string[];
    location?: string;
    timezone?: string;
    totalGigs: number;
    completedGigs: number;
    totalRevenue: number;
    averageRating: number;
    reputationScore: number;
    portfolioImages?: string[];
    portfolioVideos?: string[];
    showcaseProjects?: string[];
    createdAt: string;
    updatedAt: string;
    _count?: {
        members: number;
        portfolio: number;
        reviews: number;
    };
    memberCount: number;
    members?: ClanMember[];
    portfolio?: any[];
    reviews?: any[];
    analytics?: any;
    // New fields from the updated API response
    calculatedScore?: number;
    rank?: number;
    reputation?: {
        averageScore: number;
        totalScore: number;
        tier: string;
        rank: number | null;
    };
    stats?: {
        totalGigs: number;
        completedGigs: number;
        successRate: number;
        avgProjectValue: number;
        recentActivity: string;
    };
    featured?: {
        topMembers: Array<{
            userId: string;
            role: string;
            contributionScore: number;
            gigsParticipated: number;
        }>;
        recentPortfolio: any[];
    };
    memberIds?: string[];
    pendingJoinUserIds?: string[];
}

export interface ClanMember {
    id: string;
    userId: string;
    clanId: string;
    role: 'HEAD' | 'CO_HEAD' | 'ADMIN' | 'SENIOR_MEMBER' | 'MEMBER' | 'TRAINEE';
    customRole?: string;
    permissions: string[];
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
    isCore: boolean;
    gigsParticipated: number;
    revenueGenerated: number;
    contributionScore: number;
    joinedAt: string;
    lastActiveAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
}

export interface ClanFilters {
    category?: string;
    location?: string;
    visibility?: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
    isVerified?: boolean;
    minMembers?: number;
    maxMembers?: number;
    sortBy?: 'rank' | 'score' | 'name' | 'createdAt' | 'reputationScore' | 'totalGigs' | 'averageRating';
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface ClansResponse {
    clans: Clan[];
    meta: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        filters: any;
        sorting: {
            sortBy: string;
            order: string;
        };
    };
}

export function useClans(initialFilters: ClanFilters = {}) {
    const { user, isAuthenticated } = useAuth();
    const [clans, setClans] = useState<Clan[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<ClanFilters>(initialFilters);
    const [pagination, setPagination] = useState<ClansResponse['meta'] | null>(null);

    const fetchClans = useCallback(async (newFilters?: ClanFilters) => {
        if (!isAuthenticated) return;

        try {
            setLoading(true);
            setError(null);

            const currentFilters = newFilters || filters;
            const response = await clanApiClient.getClans(currentFilters);
            console.log('response', response);
            if (response.success) {
                // Handle both old and new API response structures
                const responseData = response.data as any;
                const clansData = responseData?.clans || response.data;
                const data = Array.isArray(clansData) ? clansData : [];
                console.log('Setting clans:', data);
                setClans(data);
                // The meta/pagination is now nested in response.data
                setPagination(responseData?.pagination || (response as any).meta || null);
            } else {
                setError('Failed to load clans');
                setClans([]); // Ensure clans is always an array
            }
        } catch (error: any) {
            console.error('Error fetching clans:', error);
            setError(error.message || 'Failed to load clans');
            setClans([]); // Ensure clans is always an array even on error
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, filters]);

    const updateFilters = useCallback((newFilters: Partial<ClanFilters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const refetch = useCallback(() => {
        fetchClans();
    }, [fetchClans]);

    useEffect(() => {
        fetchClans();
    }, [fetchClans]);

    // Get user's clans (clans where user is a member)
    const getUserClans = useCallback(() => {
        if (!user || !Array.isArray(clans)) return [];
        return clans.filter(clan =>
            clan.members?.some(member => member.userId === user.id)
        );
    }, [clans, user]);

    // Get clans where user is the head
    const getUserHeadClans = useCallback(() => {
        if (!user || !Array.isArray(clans)) return [];
        return clans.filter(clan => clan.headId === user.id);
    }, [clans, user]);

    // Get public clans for discovery
    const getPublicClans = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await clanApiClient.getPublicClans(filters);

            if (response.success) {
                // Handle both old and new API response structures
                const responseData = response.data as any;
                const clansData = responseData?.clans || response.data;
                const data = Array.isArray(clansData) ? clansData : [];
                setClans(data);
                setPagination(responseData?.pagination || (response as any).meta || null);
            } else {
                setError('Failed to load public clans');
                setClans([]); // Ensure clans is always an array
            }
        } catch (error: any) {
            console.error('Error fetching public clans:', error);
            setError(error.message || 'Failed to load public clans');
            setClans([]); // Ensure clans is always an array even on error
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const getClanFeed = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await clanApiClient.getClanFeed(filters);

            if (response.success) {
                // Handle both old and new API response structures
                const responseData = response.data as any;
                const clansData = responseData?.clans || response.data;
                const data = Array.isArray(clansData) ? clansData : [];
                console.log('Setting clans (getClanFeed):', data);
                setClans(data);
                setPagination(responseData?.pagination || (response as any).meta || null);
            }
        } catch (error: any) {
            console.error('Error fetching clan feed:', error);
            setError(error.message || 'Failed to load clan feed');
            setClans([]); // Ensure clans is always an array even on error
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Get featured clans
    const getFeaturedClans = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await clanApiClient.getFeaturedClans();

            if (response.success) {
                // Handle both old and new API response structures
                const responseData = response.data as any;
                const clansData = responseData?.clans || response.data;
                const data = Array.isArray(clansData) ? clansData : [];
                setClans(data);
                setPagination(responseData?.pagination || (response as any).meta || null);
            } else {
                setError('Failed to load featured clans');
                setClans([]); // Ensure clans is always an array
            }
        } catch (error: any) {
            console.error('Error fetching featured clans:', error);
            setError(error.message || 'Failed to load featured clans');
            setClans([]); // Ensure clans is always an array even on error
        } finally {
            setLoading(false);
        }
    }, []);

    // Get user's clans (my clans)
    const getMyClans = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await clanApiClient.getMyClans();

            if (response.success) {
                // Handle the new API response structure where clans are in response.data.clans
                const responseData = response.data as any;
                const clansData = responseData || [];
                const data = Array.isArray(clansData) ? clansData : [];
                console.log('Setting my clans data:', data);
                setClans(data);
                setPagination(responseData?.pagination || (response as any).meta || null);
            } else {
                setError('Failed to load my clans');
                setClans([]); // Ensure clans is always an array
            }
        } catch (error: any) {
            console.error('Error fetching my clans:', error);
            setError(error.message || 'Failed to load my clans');
            setClans([]); // Ensure clans is always an array even on error
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        clans,
        loading,
        error,
        filters,
        pagination,
        userClans: getUserClans(),
        userHeadClans: getUserHeadClans(),
        fetchClans,
        updateFilters,
        refetch,
        getClanFeed,
        getMyClans,
        getPublicClans,
        setError
    };
}

export function useClan(clanId: string) {
    const { user, isAuthenticated } = useAuth();
    const [clan, setClan] = useState<Clan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchClan = useCallback(async () => {
        if (!clanId || !isAuthenticated) return;

        try {
            setLoading(true);
            setError(null);

            const response = await clanApiClient.getClan(clanId);

            if (response.success) {
                const raw = (response.data as any);
                const normalized = raw?.clan ?? raw;
                setClan(normalized as Clan);
            } else {
                setError('Failed to load clan');
            }
        } catch (error: any) {
            console.error('Error fetching clan:', error);
            setError(error.message || 'Failed to load clan');
        } finally {
            setLoading(false);
        }
    }, [clanId, isAuthenticated]);

    const updateClan = useCallback(async (updateData: Partial<Clan>) => {
        if (!clanId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await clanApiClient.updateClan(clanId, updateData);

            if (response.success) {
                setClan((response.data as any).clan);
                return (response.data as any).clan;
            } else {
                setError('Failed to update clan');
            }
        } catch (error: any) {
            console.error('Error updating clan:', error);
            setError(error.message || 'Failed to update clan');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [clanId]);

    const deleteClan = useCallback(async () => {
        if (!clanId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await clanApiClient.deleteClan(clanId);

            if (response.success) {
                setClan(null);
                return true;
            } else {
                setError('Failed to delete clan');
            }
        } catch (error: any) {
            console.error('Error deleting clan:', error);
            setError(error.message || 'Failed to delete clan');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [clanId]);

    useEffect(() => {
        fetchClan();
    }, [fetchClan]);

    return {
        clan,
        loading,
        error,
        refetch: fetchClan,
        updateClan,
        deleteClan,
        setError
    };
}

export function useClanMembers(clanId: string) {
    const { user, isAuthenticated } = useAuth();
    const [members, setMembers] = useState<ClanMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMembers = useCallback(async () => {
        if (!clanId || !isAuthenticated) return;

        try {
            setLoading(true);
            setError(null);

            const response = await clanApiClient.getClanMembers(clanId);
            console.log('response', response);
            if (response.success) {
                setMembers((response.data as any).members);
            } else {
                setError('Failed to load clan members');
            }
        } catch (error: any) {
            console.error('Error fetching clan members:', error);
            setError(error.message || 'Failed to load clan members');
        } finally {
            setLoading(false);
        }
    }, [clanId, isAuthenticated]);

    const inviteMember = useCallback(async (invitationData: {
        invitedUserId?: string;
        invitedEmail?: string;
        role?: 'HEAD' | 'CO_HEAD' | 'ADMIN' | 'SENIOR_MEMBER' | 'MEMBER' | 'TRAINEE';
        customRole?: string;
        message?: string;
    }) => {
        if (!clanId) return;

        try {
            setLoading(true);
            setError(null);

            // Map role to API-accepted values
            const { role, ...restInvitationData } = invitationData;
            let mappedRole: 'ADMIN' | 'MEMBER' | 'OWNER' | undefined = undefined;
            if (role === 'ADMIN' || role === 'MEMBER') {
                mappedRole = role;
            } else if (role === 'HEAD') {
                mappedRole = 'OWNER';
            } else if (role) {
                // All other roles map to MEMBER
                mappedRole = 'MEMBER';
            }

            const response = await clanApiClient.inviteMember({
                clanId,
                ...restInvitationData,
                role: mappedRole,
            });

            if (response.success) {
                // Optionally refresh members list
                await fetchMembers();
                return (response.data as any).invitation;
            } else {
                setError('Failed to invite member');
            }
        } catch (error: any) {
            console.error('Error inviting member:', error);
            setError(error.message || 'Failed to invite member');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [clanId, fetchMembers]);

    const removeMember = useCallback(async (userId: string) => {
        if (!clanId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await clanApiClient.removeMember(clanId, userId);

            if (response.success) {
                setMembers(prev => prev.filter(member => member.userId !== userId));
            } else {
                setError('Failed to remove member');
            }
        } catch (error: any) {
            console.error('Error removing member:', error);
            setError(error.message || 'Failed to remove member');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [clanId]);

    const updateMemberRole = useCallback(async (userId: string, roleData: {
        role: 'HEAD' | 'CO_HEAD' | 'ADMIN' | 'SENIOR_MEMBER' | 'MEMBER' | 'TRAINEE';
        customRole?: string;
    }) => {
        if (!clanId) return;

        try {
            setLoading(true);
            setError(null);

            // Map custom roles to API roles
            const apiRoleMap: Record<string, 'ADMIN' | 'MEMBER' | 'OWNER'> = {
                HEAD: 'OWNER',
                CO_HEAD: 'ADMIN',
                ADMIN: 'ADMIN',
                SENIOR_MEMBER: 'MEMBER',
                MEMBER: 'MEMBER',
                TRAINEE: 'MEMBER',
            };

            const apiRole = apiRoleMap[roleData.role];
            if (!apiRole) {
                setError('Invalid role');
                setLoading(false);
                return;
            }

            const response = await clanApiClient.updateMemberRole(clanId, userId, {
                role: apiRole,
                customRole: roleData.customRole,
            });

            if (response.success) {
                setMembers(prev => prev.map(member =>
                    member.userId === userId
                        ? { ...member, ...(response.data as any).member }
                        : member
                ));
                return (response.data as any).member;
            } else {
                setError('Failed to update member role');
            }
        } catch (error: any) {
            console.error('Error updating member role:', error);
            setError(error.message || 'Failed to update member role');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [clanId]);

    const leaveClan = useCallback(async () => {
        if (!clanId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await clanApiClient.leaveClan(clanId);

            if (response.success) {
                return true;
            } else {
                setError('Failed to leave clan');
            }
        } catch (error: any) {
            console.error('Error leaving clan:', error);
            setError(error.message || 'Failed to leave clan');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [clanId]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    return {
        members,
        loading,
        error,
        refetch: fetchMembers,
        inviteMember,
        removeMember,
        updateMemberRole,
        leaveClan,
        setError
    };
}

export interface ClanJoinRequest {
    id: string;
    clanId: string;
    userId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    message?: string;
    requestedRole?: 'HEAD' | 'CO_HEAD' | 'ADMIN' | 'SENIOR_MEMBER' | 'MEMBER' | 'TRAINEE';
    portfolio?: any;
    reviewMessage?: string | null;
    reviewedAt?: string | null;
    reviewedBy?: string | null;
    createdAt: string;
    user?: {
        id: string;
        username?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        avatar?: string;
        profilePicture?: string;
        location?: string;
        roles?: string[];
        bio?: string;
        website?: string;
        instagramHandle?: string;
        twitterHandle?: string;
        linkedinHandle?: string;
        youtubeHandle?: string;
        phone?: string;
        showContact?: boolean;
        createdAt?: string;
    };
}

export function useClanJoinRequests(clanId: string) {
    const { isAuthenticated } = useAuth();
    const [requests, setRequests] = useState<ClanJoinRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = useCallback(async () => {
        if (!clanId || !isAuthenticated) {
            console.log('Skipping join requests fetch - missing clanId or not authenticated');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await clanApiClient.getJoinRequests(clanId);
            if (response.success) {
                const raw = (response.data as any) ?? [];
                const list = Array.isArray(raw) ? raw : [];

                // Check if the backend already provides user data in the join requests
                const hasUserData = list.length > 0 && list[0] && (
                    list[0].username ||
                    list[0].firstName ||
                    list[0].lastName ||
                    list[0].email
                );

                if (hasUserData) {
                    // Backend already provides user data, just format it correctly
                    const formattedRequests = list.map((request: any) => ({
                        id: request.id,
                        clanId: request.clanId || clanId,
                        userId: request.userId || request.id, // Use request.id as fallback
                        status: request.status || 'PENDING',
                        message: request.message,
                        requestedRole: request.requestedRole,
                        portfolio: request.portfolio,
                        reviewMessage: request.reviewMessage,
                        reviewedAt: request.reviewedAt,
                        reviewedBy: request.reviewedBy,
                        createdAt: request.createdAt,
                        user: {
                            id: request.id,
                            username: request.username,
                            firstName: request.firstName,
                            lastName: request.lastName,
                            email: request.email,
                            avatar: request.avatar,
                            profilePicture: request.profilePicture,
                            location: request.location,
                            roles: request.roles,
                            bio: request.bio,
                            website: request.website,
                            instagramHandle: request.instagramHandle,
                            twitterHandle: request.twitterHandle,
                            linkedinHandle: request.linkedinHandle,
                            youtubeHandle: request.youtubeHandle,
                            phone: request.phone,
                            showContact: request.showContact,
                            createdAt: request.createdAt
                        }
                    }));
                    setRequests(formattedRequests);
                } else {
                    // Backend only provides user IDs, need to fetch user data separately
                    console.log('list', list);
                    setRequests(list);
                }
            } else {
                // Handle API errors more gracefully
                const errorMessage = (response as any).error || (response as any).message || 'Failed to load join requests';
                if (errorMessage.includes('not authorized')) {
                    console.warn('User not authorized to view join requests for this clan');
                    setError('Not authorized to view join requests');
                } else {
                    setError(errorMessage);
                }
                setRequests([]);
            }
        } catch (e: any) {
            console.error('Error fetching join requests:', e);
            // Handle specific error types
            if (e?.statusCode === 400) {
                setError('Not authorized to view join requests for this clan');
            } else if (e?.statusCode === 403) {
                setError('Access denied');
            } else {
                setError(e?.message || 'Failed to load join requests');
            }
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }, [clanId, isAuthenticated]);

    const approve = useCallback(async (requestId: string) => {
        if (!clanId) return;
        try {
            setLoading(true);
            setError(null);
            const res = await clanApiClient.approveJoinRequest(clanId, requestId);
            console.log('res', res);
            if (res.success) {
                await fetchRequests();
                return true;
            }
            setError('Failed to approve request');
            return false;
        } catch (e: any) {
            console.error('Error approving join request:', e);
            setError(e?.message || 'Failed to approve request');
            throw e;
        } finally {
            setLoading(false);
        }
    }, [clanId, fetchRequests]);

    const reject = useCallback(async (requestId: string, reason?: string) => {
        if (!clanId) return;
        try {
            setLoading(true);
            setError(null);
            const res = await clanApiClient.rejectJoinRequest(clanId, requestId, reason ? { reason } : {});
            console.log('res', res);
            if (res.success) {
                await fetchRequests();
                return true;
            }
            setError('Failed to reject request');
            return false;
        } catch (e: any) {
            console.error('Error rejecting join request:', e);
            setError(e?.message || 'Failed to reject request');
            throw e;
        } finally {
            setLoading(false);
        }
    }, [clanId, fetchRequests]);

    // Don't automatically fetch on mount - let the component decide when to fetch
    // useEffect(() => {
    //     fetchRequests();
    // }, [fetchRequests]);

    return {
        requests,
        loading,
        error,
        refetch: fetchRequests,
        approve,
        reject,
        setError,
        // Add a note that this hook should only be used when user has permission
        hasPermission: isAuthenticated && !!clanId,
    };
}

export function useMyClans() {
    const [clans, setClans] = useState<Clan[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMyClans = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await clanApiClient.getMyClans();
            if (response.success) {
                setClans((response.data as any)?.clans || []);
            } else {
                setError(response.message || 'Failed to fetch clans');
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch clans');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyClans();
    }, [fetchMyClans]);

    return { clans, loading, error, refetch: fetchMyClans };
}