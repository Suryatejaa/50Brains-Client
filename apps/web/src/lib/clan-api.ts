import { apiClient } from './api-client';

// Clan API client for all clan-related operations
export const clanApiClient = {
  // Get all clans with filtering and pagination
  async getClans(params: {
    category?: string;
    location?: string;
    visibility?: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
    isVerified?: boolean;
    minMembers?: number;
    maxMembers?: number;
    sortBy?: 'score' | 'name' | 'createdAt' | 'reputationScore' | 'totalGigs' | 'averageRating';
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/clan?${queryParams}`;
    console.log('Calling getClans with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Get clan feed (enhanced with reputation)
  async getClanFeed(params: {
    category?: string;
    location?: string;
    visibility?: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
    isVerified?: boolean;
    minMembers?: number;
    maxMembers?: number;
    sortBy?: 'score' | 'name' | 'createdAt' | 'reputationScore' | 'totalGigs' | 'averageRating';
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/clan/feed?${queryParams}`;
    console.log('Calling getClanFeed with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Get single clan by ID
  async getClan(clanId: string) {
    const endpoint = `/api/clan/${clanId}`;
    console.log('Calling getClan with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Create new clan
  async createClan(clanData: {
    name: string;
    description?: string;
    tagline?: string;
    visibility?: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
    isVerified?: boolean;
    isActive?: boolean;
    email?: string;
    website?: string;
    instagramHandle?: string;
    twitterHandle?: string;
    linkedinHandle?: string;
    requiresApproval?: boolean;
    isPaidMembership?: boolean;
    membershipFee?: number;
    maxMembers?: number;
    primaryCategory?: string;
    categories?: string[];
    skills?: string[];
    location?: string;
    timezone?: string;
    portfolioImages?: string[];
    portfolioVideos?: string[];
    showcaseProjects?: string[];
  }) {
    const endpoint = '/api/clan';
    console.log('Calling createClan with URL:', endpoint);
    return apiClient.post(endpoint, clanData);
  },

  // Update clan
  async updateClan(clanId: string, clanData: Partial<{
    name: string;
    slug: string;
    description: string;
    tagline: string;
    visibility: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
    email: string;
    website: string;
    instagramHandle: string;
    twitterHandle: string;
    linkedinHandle: string;
    requiresApproval: boolean;
    isPaidMembership: boolean;
    membershipFee: number;
    maxMembers: number;
    primaryCategory: string;
    categories: string[];
    skills: string[];
    location: string;
    timezone: string;
  }>) {
    const endpoint = `/api/clan/${clanId}`;
    console.log('Calling updateClan with URL:', endpoint);
    return apiClient.put(endpoint, clanData);
  },

  // Delete clan
  async deleteClan(clanId: string) {
    const endpoint = `/api/clan/${clanId}`;
    console.log('Calling deleteClan with URL:', endpoint);
    return apiClient.delete(endpoint);
  },

  // Get clan members
  async getClanMembers(clanId: string) {
    const endpoint = `/api/members/${clanId}`;
    console.log('Calling getClanMembers with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Invite member to clan
  async inviteMember(invitationData: {
    clanId: string;
    invitedUserId?: string;
    invitedEmail?: string;
    role?: 'HEAD' | 'CO_HEAD' | 'ADMIN' | 'SENIOR_MEMBER' | 'MEMBER' | 'TRAINEE';
    customRole?: string;
    message?: string;
  }) {
    const endpoint = '/api/members/invite';
    console.log('Calling inviteMember with URL:', endpoint);
    return apiClient.post(endpoint, invitationData);
  },

  // Accept clan invitation
  async acceptInvitation(invitationId: string) {
    const endpoint = `/api/members/invitations/${invitationId}/accept`;
    console.log('Calling acceptInvitation with URL:', endpoint);
    return apiClient.post(endpoint);
  },

  // Remove member from clan
  async removeMember(clanId: string, userId: string) {
    const endpoint = `/api/members/${clanId}/members/${userId}`;
    console.log('Calling removeMember with URL:', endpoint);
    return apiClient.delete(endpoint);
  },

  // Update member role
  async updateMemberRole(clanId: string, userId: string, roleData: {
    role: 'HEAD' | 'CO_HEAD' | 'ADMIN' | 'SENIOR_MEMBER' | 'MEMBER' | 'TRAINEE';
    customRole?: string;
  }) {
    const endpoint = `/api/members/${clanId}/members/${userId}/role`;
    console.log('Calling updateMemberRole with URL:', endpoint);
    return apiClient.put(endpoint, roleData);
  },

  // Leave clan
  async leaveClan(clanId: string) {
    const endpoint = `/api/members/${clanId}/leave`;
    console.log('Calling leaveClan with URL:', endpoint);
    return apiClient.post(endpoint);
  },

  // Get clan rankings
  async getRankings(params: {
    category?: string;
    location?: string;
    sortBy?: 'score' | 'reputation' | 'revenue' | 'members';
    limit?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/rankings?${queryParams}`;
    console.log('Calling getRankings with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Get clan analytics
  async getClanAnalytics(clanId: string) {
    const endpoint = `/api/analytics/${clanId}`;
    console.log('Calling getClanAnalytics with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Get public clan info (no auth required)
  async getPublicClans(params: {
    category?: string;
    location?: string;
    visibility?: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
    isVerified?: boolean;
    minMembers?: number;
    maxMembers?: number;
    sortBy?: 'score' | 'name' | 'createdAt' | 'reputationScore' | 'totalGigs' | 'averageRating';
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/public?${queryParams}`;
    console.log('Calling getPublicClans with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Get featured clans
  async getFeaturedClans() {
    const endpoint = '/api/public/featured';
    console.log('Calling getFeaturedClans with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Health check
  async getHealth() {
    const endpoint = '/api/health';
    console.log('Calling getHealth with URL:', endpoint);
    return apiClient.get(endpoint);
  }
}; 