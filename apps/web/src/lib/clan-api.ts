import { apiClient } from './api-client';

/**
 * 🚨 IMPORTANT: When debugging API errors, look for the console group:
 * "🔴 [Context] - Server Response Details"
 * 
 * This will show you:
 * - HTTP Status Code and Error Type
 * - Server Error Message
 * - Validation Errors (if any)
 * - Full error object (collapsed for readability)
 * 
 * The error is still thrown as an APIError, but now you get clear server response details!
 */
// Utility function to get detailed error information for debugging
const logDetailedError = (error: any, context: string) => {
  console.group(`🔴 ${context} - Server Response Details`);

  // Show the most important information first
  if (error.statusCode) {
    console.error(`Status: ${error.statusCode} ${error.error || 'Error'}`);
    console.error(`Message: ${error.message || 'No message'}`);

    if (error.details && Array.isArray(error.details)) {
      console.error('Validation Errors:');
      error.details.forEach((detail: any, index: number) => {
        console.error(`  ${index + 1}. ${detail.message || detail.msg || 'Unknown error'}`);
      });
    } else if (error.errors && Array.isArray(error.errors)) {
      console.error('Errors:', error.errors);
    }
  } else {
    console.error('Error:', error.message || error);
  }

  // Show full error object in collapsed group
  console.groupCollapsed('Full Error Object (click to expand)');
  console.error(error);
  console.groupEnd();

  console.groupEnd();
};

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
    sortBy?: 'rank' | 'score' | 'name' | 'createdAt' | 'reputationScore' | 'totalGigs' | 'averageRating';
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

    const endpoint = `/api/clans?${queryParams}`;
    console.log('Calling getClans with URL:', endpoint);
    const res = await apiClient.get(endpoint);
    console.log('getClans response:', res);
    return res;
  },

  // Get clan feed (enhanced with reputation)
  async getClanFeed(params: {
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
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/api/clans/feed?${queryParams}`;
    console.log('Calling getClanFeed with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Get single clan by ID
  async getClan(clanId: string) {
    const endpoint = `/api/clans/${clanId}`;
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
    const endpoint = '/api/clans';
    console.log('Calling createClan with URL:', endpoint);

    try {
      const res = await apiClient.post(endpoint, clanData);
      console.log('createClan response:', res);
      return res;
    } catch (error: any) {
      // Use the utility function for detailed error logging
      logDetailedError(error, 'Clan Creation API Call');

      // Re-throw the error so the calling code can handle it
      throw error;
    }
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
    const endpoint = `/api/clans/${clanId}`;
    console.log('Calling updateClan with URL:', endpoint);
    return apiClient.put(endpoint, clanData);
  },

  // Delete clan
  async deleteClan(clanId: string) {
    const endpoint = `/api/clans/${clanId}`;
    console.log('Calling deleteClan with URL:', endpoint);
    return apiClient.delete(endpoint);
  },

  // Get clan members
  async getClanMembers(clanId: string) {
    const endpoint = `/api/members/${clanId}`;
    console.log('Calling getClanMembers with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  async getClanMemberDetails(userIds: string[]) {
    const endpoint = `/api/public/profiles/internal/by-ids`;
    console.log('Calling getClanMemberDetails with URL:', endpoint);
    return apiClient.post(endpoint, {
      userIds: userIds,
    });
  },

  // Invite member to clan
  async inviteMember(invitationData: {
    clanId: string;
    invitedUserId?: string;
    invitedEmail?: string;
    role?: 'OWNER' | 'ADMIN' | 'MEMBER';
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
    const endpoint = `/api/members/${clanId}/${userId}`;
    console.log('Calling removeMember with URL:', endpoint);
    return apiClient.delete(endpoint);
  },

  // Update member role
  async updateMemberRole(clanId: string, userId: string, roleData: {
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    customRole?: string;
  }) {
    const endpoint = `/api/members/${clanId}/${userId}/role`;
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
    sortBy?: 'rank' | 'score' | 'name' | 'createdAt' | 'reputationScore' | 'totalGigs' | 'averageRating';
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

    const endpoint = `/api/clans?${queryParams}`;
    console.log('Calling getPublicClans with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Get featured clans
  async getFeaturedClans() {
    const endpoint = '/api/clans/featured';
    console.log('Calling getFeaturedClans with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Get user's clans (my clans)
  async getMyClans() {
    const endpoint = '/api/clans/my';
    console.log('Calling getMyClans with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Get user's clan memberships (owner + member)
  async getMyClanMemberships() {
    const endpoint = '/api/clans/my-memberships';
    console.log('Calling getMyClanMemberships with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Health check
  async getHealth() {
    const endpoint = '/api/clans/health';
    console.log('Calling getHealth with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Join Request Endpoints
  // Request to join a clan
  async joinClan(clanId: string, data: { message?: string } = {}) {
    const endpoint = `/api/members/${clanId}/join-requests`;
    console.log('Calling joinClan with URL:', endpoint);
    const res = await apiClient.post(endpoint, data);
    console.log('joinClan response:', res);
    return res;
  },

  // Get join requests (clan owner only)
  async getJoinRequests(clanId: string) {
    const endpoint = `/api/clans/${clanId}/pending-requests`;
    console.log('Calling getJoinRequests with URL:', endpoint);
    const res = await apiClient.get(endpoint);
    console.log('getJoinRequests response:', res);
    return res;
  },

  // Approve join request
  async approveJoinRequest(clanId: string, requestId: string) {
    const usedId = requestId;
    const endpoint = `/api/clans/${clanId}/join-requests/${usedId}/approve`;
    console.log('Calling approveJoinRequest with URL:', endpoint);
    const res = await apiClient.post(endpoint, {
      headers: {
        'x-user-id': clanId,
      },
    });
    console.log('approveJoinRequest response:', res);
    return res;
  },

  // Reject join request
  async rejectJoinRequest(clanId: string, requestId: string, data: { reason?: string } = {}) {
    const endpoint = `/api/clans/${clanId}/join-requests/${requestId}/reject`;
    console.log('Calling rejectJoinRequest with URL:', endpoint);
    const res = await apiClient.post(endpoint, data);
    console.log('rejectJoinRequest response:', res);
    return res;
  },

  // Announcements
  async getAnnouncements(clanId: string) {
    const endpoint = `/api/clans/${clanId}/announcements`;
    console.log('Calling getAnnouncements with URL:', endpoint);
    return apiClient.get(endpoint);
  },
  async createAnnouncement(clanId: string, data: { title: string; body: string; pinned?: boolean }) {
    const endpoint = `/api/clans/${clanId}/announcements`;
    console.log('Calling createAnnouncement with URL:', endpoint);
    return apiClient.post(endpoint, data);
  },
  async reactToAnnouncement(clanId: string, announcementId: string, data: { emoji: string }) {
    const endpoint = `/api/clans/${clanId}/announcements/${announcementId}/react`;
    console.log('Calling reactToAnnouncement with URL:', endpoint);
    return apiClient.post(endpoint, data);
  },

  // Polls
  async getPolls(clanId: string) {
    const endpoint = `/api/clans/${clanId}/polls`;
    console.log('Calling getPolls with URL:', endpoint);
    return apiClient.get(endpoint);
  },
  async createPoll(clanId: string, data: { question: string; options: string[]; multipleChoice?: boolean; closesAt?: string }) {
    const endpoint = `/api/clans/${clanId}/polls`;
    console.log('Calling createPoll with URL:', endpoint);
    return apiClient.post(endpoint, data);
  },
  async votePoll(clanId: string, pollId: string, data: { optionId: string }) {
    const endpoint = `/api/clans/${clanId}/polls/${pollId}/vote`;
    console.log('Calling votePoll with URL:', endpoint);
    return apiClient.post(endpoint, data);
  },

  // Resources
  async getResources(clanId: string) {
    const endpoint = `/api/clans/${clanId}/resources`;
    console.log('Calling getResources with URL:', endpoint);
    return apiClient.get(endpoint);
  },
  async submitResource(clanId: string, data: { title: string; url: string }) {
    const endpoint = `/api/clans/${clanId}/resources`;
    console.log('Calling submitResource with URL:', endpoint);
    return apiClient.post(endpoint, data);
  },
  async approveResource(clanId: string, resourceId: string) {
    const endpoint = `/api/clans/${clanId}/resources/${resourceId}/approve`;
    console.log('Calling approveResource with URL:', endpoint);
    return apiClient.post(endpoint);
  },
  async rejectResource(clanId: string, resourceId: string) {
    const endpoint = `/api/clans/${clanId}/resources/${resourceId}/reject`;
    console.log('Calling rejectResource with URL:', endpoint);
    return apiClient.post(endpoint);
  },

  // Join code
  async getJoinCode(clanId: string) {
    const endpoint = `/api/clans/${clanId}/join-code`;
    console.log('Calling getJoinCode with URL:', endpoint);
    return apiClient.get(endpoint);
  },
  async rotateJoinCode(clanId: string) {
    const endpoint = `/api/clans/${clanId}/join-code/rotate`;
    console.log('Calling rotateJoinCode with URL:', endpoint);
    return apiClient.post(endpoint);
  },
  async disableJoinCode(clanId: string) {
    const endpoint = `/api/clans/${clanId}/join-code/disable`;
    console.log('Calling disableJoinCode with URL:', endpoint);
    return apiClient.post(endpoint);
  },
  async joinWithCode(clanId: string, data: { code: string }) {
    const endpoint = `/api/clans/${clanId}/join-with-code`;
    console.log('Calling joinWithCode with URL:', endpoint);
    return apiClient.post(endpoint, data);
  },

  // Feed (posts)
  async getFeed(clanId: string, params: { cursor?: string; filter?: 'all' | 'announcements' | 'gigs' | 'help' | 'polls' } = {}) {
    const query = new URLSearchParams();
    if (params.cursor) query.append('cursor', params.cursor);
    if (params.filter) query.append('filter', params.filter);
    const endpoint = `/api/clans/${clanId}/feed?${query.toString()}`;
    console.log('Calling getFeed with URL:', endpoint);
    return apiClient.get(endpoint);
  },
  async createPost(clanId: string, data: any) {
    const endpoint = `/api/clans/${clanId}/posts`;
    return apiClient.post(endpoint, data);
  },
  async reactToPost(clanId: string, postId: string, data: { emoji: string }) {
    const endpoint = `/api/clans/${clanId}/posts/${postId}/react`;
    return apiClient.post(endpoint, data);
  },
  async commentOnPost(clanId: string, postId: string, data: { text: string }) {
    const endpoint = `/api/clans/${clanId}/posts/${postId}/comments`;
    return apiClient.post(endpoint, data);
  },

  // Clan gigs
  async getClanGigs(clanId: string) {
    const endpoint = `/api/clans/${clanId}/gigs`;
    console.log('Calling getClanGigs with URL:', endpoint);
    return apiClient.get(endpoint);
  },
  async assignGig(clanId: string, gigId: string, userId: string) {
    const endpoint = `/api/clans/${clanId}/gigs/${gigId}/assign`;
    return apiClient.post(endpoint, { userId });
  },

  // Credits
  async getClanCredits(clanId: string) {
    const endpoint = `/api/clans/${clanId}/credits`;
    console.log('Calling getClanCredits with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Activities (Feed)
  async getActivities(clanId: string, params: { cursor?: string; filter?: string } = {}) {
    const qs = new URLSearchParams();
    if (params.cursor) qs.append('cursor', params.cursor);
    if (params.filter) qs.append('filter', params.filter);
    const endpoint = `/api/clans/${clanId}/activity${qs.toString() ? `?${qs.toString()}` : ''}`;
    console.log('Calling getActivities with URL:', endpoint);
    return apiClient.get(endpoint);
  },
  async createActivity(clanId: string, data: any) {
    const endpoint = `/api/clans/${clanId}/activity`;
    return apiClient.post(endpoint, data);
  },
  async updateActivity(activityId: string, data: any) {
    const endpoint = `/api/clans/activity/${activityId}`;
    return apiClient.patch(endpoint, data);
  },
  async deleteActivity(activityId: string) {
    const endpoint = `/api/clans/activity/${activityId}`;
    return apiClient.delete(endpoint);
  },
  async togglePinActivity(activityId: string, pinned: boolean) {
    const endpoint = `/api/clans/activity/${activityId}/pin`;
    return apiClient.patch(endpoint, { pinned });
  },
  async voteActivity(activityId: string, data: { optionId: string }) {
    const endpoint = `/api/clans/activity/${activityId}/vote`;
    return apiClient.post(endpoint, data);
  },

  // New GIG-CLAN Workflow Methods

  // Create clan gig plan
  async createClanGigPlan(clanId: string, gigId: string, data: {
    members: {
      userId: string;
      role: string;
      expectedHours: number;
      deliverables: string[];
      payoutPercentage?: number;
      payoutFixedAmount?: number;
    }[];
  }) {
    const endpoint = `/api/clans/${clanId}/gigs/${gigId}/plan`;
    console.log('Calling createClanGigPlan with URL:', endpoint);
    return apiClient.post(endpoint, data);
  },

  // Create clan task
  async createClanTask(clanId: string, gigId: string, data: {
    title: string;
    description?: string;
    assigneeUserId: string;
    estimatedHours?: number;
    deliverables: string[];
    dueDate?: string;
  }) {
    const endpoint = `/api/clans/${clanId}/gigs/${gigId}/tasks`;
    console.log('Calling createClanTask with URL:', endpoint);
    return apiClient.post(endpoint, data);
  },

  // Update clan task
  async updateClanTask(clanId: string, gigId: string, taskId: string, data: {
    title?: string;
    description?: string;
    assigneeUserId?: string;
    status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
    estimatedHours?: number;
    actualHours?: number;
    deliverables?: string[];
    notes?: string;
    dueDate?: string;
  }) {
    const endpoint = `/api/clans/${clanId}/gigs/${gigId}/tasks/${taskId}`;
    console.log('Calling updateClanTask with URL:', endpoint);
    return apiClient.patch(endpoint, data);
  },

  // Get clan tasks
  async getClanTasks(clanId: string, gigId: string) {
    const endpoint = `/api/clans/${clanId}/gigs/${gigId}/tasks`;
    console.log('Calling getClanTasks with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Get clan gig assignments
  async getClanGigAssignments(clanId: string) {
    const endpoint = `/api/clans/${clanId}/gig-assignments`;
    console.log('Calling getClanGigAssignments with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Get clan member agreements for a gig
  async getClanMemberAgreements(clanId: string, gigId: string) {
    const endpoint = `/api/clans/${clanId}/gigs/${gigId}/member-agreements`;
    console.log('Calling getClanMemberAgreements with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Get shared gigs for a clan
  async getSharedGigs(clanId: string) {
    const endpoint = `/api/clans/${clanId}/shared-gigs`;
    console.log('Calling getSharedGigs with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Share a gig with clan
  async shareGig(clanId: string, gigData: {
    gigId: string;
    gigTitle: string;
    gigDescription: string;
    gigUrl: string;
  }) {
    const endpoint = `/api/clans/${clanId}/share-gig`;
    console.log('Calling shareGig with URL:', endpoint);
    return apiClient.post(endpoint, gigData);
  },
}; 