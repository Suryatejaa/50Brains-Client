import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { clanApiClient } from '@/lib/clan-api';

export interface Clan {
    id: string;
    name: string;
    slug: string;
    description?: string;
    tagline?: string;
    visibility: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
    isVerified: boolean;
    isActive: boolean;
    clanHeadId: string;
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
        return clans.filter(clan => clan.clanHeadId === user.id);
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
                // Handle the basic clan data structure from /api/clan/my
                const responseData = response.data as any;
                const clansData = responseData?.clans || response.data;
                const data = Array.isArray(clansData) ? clansData : [];
                console.log('Setting my clans:', data);
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
        setError
    };
}

export function useClan(clanId: string) {
    const { user, isAuthenticated } = useAuth();
    const [clan, setClan] = useState<Clan | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchClan = useCallback(async () => {
        if (!clanId || !isAuthenticated) return;

        try {
            setLoading(true);
            setError(null);

            const response = await clanApiClient.getClan(clanId);

            if (response.success) {
                setClan((response.data as any).clan);
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

            const response = await clanApiClient.inviteMember({
                clanId,
                ...invitationData
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

            const response = await clanApiClient.updateMemberRole(clanId, userId, roleData);

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