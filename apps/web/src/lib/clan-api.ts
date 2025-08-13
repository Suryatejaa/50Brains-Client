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

    const endpoint = `/api/clan/public?${queryParams}`;
    console.log('Calling getPublicClans with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Get featured clans
  async getFeaturedClans() {
    const endpoint = '/api/clan/featured';
    console.log('Calling getFeaturedClans with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Get user's clans (my clans)
  async getMyClans() {
    const endpoint = '/api/clan/my';
    console.log('Calling getMyClans with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Get user's clan memberships (owner + member)
  async getMyClanMemberships() {
    const endpoint = '/api/clan/my-memberships';
    console.log('Calling getMyClanMemberships with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Health check
  async getHealth() {
    const endpoint = '/api/health';
    console.log('Calling getHealth with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Join Request Endpoints
  // Request to join a clan
  async joinClan(clanId: string, data: { message?: string } = {}) {
    const endpoint = `/api/clan/${clanId}/join`;
    console.log('Calling joinClan with URL:', endpoint);
    const res = await apiClient.post(endpoint, data);
    console.log('joinClan response:', res);
    return res;
  },

  // Get join requests (clan head only)
  async getJoinRequests(clanId: string) {
    const endpoint = `/api/members/${clanId}/join-requests`;
    console.log('Calling getJoinRequests with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Approve join request
  async approveJoinRequest(clanId: string, requestId: string) {
    const endpoint = `/api/members/${clanId}/join-requests/${requestId}/approve`;
    console.log('Calling approveJoinRequest with URL:', endpoint);
    return apiClient.post(endpoint);
  },

  // Reject join request
  async rejectJoinRequest(clanId: string, requestId: string, data: { reason?: string } = {}) {
    const endpoint = `/api/members/${clanId}/join-requests/${requestId}/reject`;
    console.log('Calling rejectJoinRequest with URL:', endpoint);
    return apiClient.post(endpoint, data);
  },

  // Announcements
  async getAnnouncements(clanId: string) {
    const endpoint = `/api/clan/${clanId}/announcements`;
    console.log('Calling getAnnouncements with URL:', endpoint);
    return apiClient.get(endpoint);
  },
  async createAnnouncement(clanId: string, data: { title: string; body: string; pinned?: boolean }) {
    const endpoint = `/api/clan/${clanId}/announcements`;
    console.log('Calling createAnnouncement with URL:', endpoint);
    return apiClient.post(endpoint, data);
  },
  async reactToAnnouncement(clanId: string, announcementId: string, data: { emoji: string }) {
    const endpoint = `/api/clan/${clanId}/announcements/${announcementId}/react`;
    console.log('Calling reactToAnnouncement with URL:', endpoint);
    return apiClient.post(endpoint, data);
  },

  // Polls
  async getPolls(clanId: string) {
    const endpoint = `/api/clan/${clanId}/polls`;
    console.log('Calling getPolls with URL:', endpoint);
    return apiClient.get(endpoint);
  },
  async createPoll(clanId: string, data: { question: string; options: string[]; multipleChoice?: boolean; closesAt?: string }) {
    const endpoint = `/api/clan/${clanId}/polls`;
    console.log('Calling createPoll with URL:', endpoint);
    return apiClient.post(endpoint, data);
  },
  async votePoll(clanId: string, pollId: string, data: { optionId: string }) {
    const endpoint = `/api/clan/${clanId}/polls/${pollId}/vote`;
    console.log('Calling votePoll with URL:', endpoint);
    return apiClient.post(endpoint, data);
  },

  // Resources
  async getResources(clanId: string) {
    const endpoint = `/api/clan/${clanId}/resources`;
    console.log('Calling getResources with URL:', endpoint);
    return apiClient.get(endpoint);
  },
  async submitResource(clanId: string, data: { title: string; url: string }) {
    const endpoint = `/api/clan/${clanId}/resources`;
    console.log('Calling submitResource with URL:', endpoint);
    return apiClient.post(endpoint, data);
  },
  async approveResource(clanId: string, resourceId: string) {
    const endpoint = `/api/clan/${clanId}/resources/${resourceId}/approve`;
    console.log('Calling approveResource with URL:', endpoint);
    return apiClient.post(endpoint);
  },
  async rejectResource(clanId: string, resourceId: string) {
    const endpoint = `/api/clan/${clanId}/resources/${resourceId}/reject`;
    console.log('Calling rejectResource with URL:', endpoint);
    return apiClient.post(endpoint);
  },

  // Join code
  async getJoinCode(clanId: string) {
    const endpoint = `/api/clan/${clanId}/join-code`;
    console.log('Calling getJoinCode with URL:', endpoint);
    return apiClient.get(endpoint);
  },
  async rotateJoinCode(clanId: string) {
    const endpoint = `/api/clan/${clanId}/join-code/rotate`;
    console.log('Calling rotateJoinCode with URL:', endpoint);
    return apiClient.post(endpoint);
  },
  async disableJoinCode(clanId: string) {
    const endpoint = `/api/clan/${clanId}/join-code/disable`;
    console.log('Calling disableJoinCode with URL:', endpoint);
    return apiClient.post(endpoint);
  },
  async joinWithCode(clanId: string, data: { code: string }) {
    const endpoint = `/api/clan/${clanId}/join-with-code`;
    console.log('Calling joinWithCode with URL:', endpoint);
    return apiClient.post(endpoint, data);
  },

  // Feed (posts)
  async getFeed(clanId: string, params: { cursor?: string; filter?: 'all' | 'announcements' | 'gigs' | 'help' | 'polls' } = {}) {
    const query = new URLSearchParams();
    if (params.cursor) query.append('cursor', params.cursor);
    if (params.filter) query.append('filter', params.filter);
    const endpoint = `/api/clan/${clanId}/feed?${query.toString()}`;
    console.log('Calling getFeed with URL:', endpoint);
    return apiClient.get(endpoint);
  },
  async createPost(clanId: string, data: any) {
    const endpoint = `/api/clan/${clanId}/posts`;
    return apiClient.post(endpoint, data);
  },
  async reactToPost(clanId: string, postId: string, data: { emoji: string }) {
    const endpoint = `/api/clan/${clanId}/posts/${postId}/react`;
    return apiClient.post(endpoint, data);
  },
  async commentOnPost(clanId: string, postId: string, data: { text: string }) {
    const endpoint = `/api/clan/${clanId}/posts/${postId}/comments`;
    return apiClient.post(endpoint, data);
  },

  // Clan gigs
  async getClanGigs(clanId: string) {
    const endpoint = `/api/clan/${clanId}/gigs`;
    console.log('Calling getClanGigs with URL:', endpoint);
    return apiClient.get(endpoint);
  },
  async assignGig(clanId: string, gigId: string, userId: string) {
    const endpoint = `/api/clan/${clanId}/gigs/${gigId}/assign`;
    return apiClient.post(endpoint, { userId });
  },

  // Credits
  async getClanCredits(clanId: string) {
    const endpoint = `/api/clan/${clanId}/credits`;
    console.log('Calling getClanCredits with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Activities (Feed)
  async getActivities(clanId: string, params: { cursor?: string; filter?: string } = {}) {
    const qs = new URLSearchParams();
    if (params.cursor) qs.append('cursor', params.cursor);
    if (params.filter) qs.append('filter', params.filter);
    const endpoint = `/api/clan/${clanId}/activity${qs.toString() ? `?${qs.toString()}` : ''}`;
    console.log('Calling getActivities with URL:', endpoint);
    return apiClient.get(endpoint);
  },
  async createActivity(clanId: string, data: any) {
    const endpoint = `/api/clan/${clanId}/activity`;
    return apiClient.post(endpoint, data);
  },
  async updateActivity(activityId: string, data: any) {
    const endpoint = `/api/clan/activity/${activityId}`;
    return apiClient.patch(endpoint, data);
  },
  async deleteActivity(activityId: string) {
    const endpoint = `/api/clan/activity/${activityId}`;
    return apiClient.delete(endpoint);
  },
  async togglePinActivity(activityId: string, pinned: boolean) {
    const endpoint = `/api/clan/activity/${activityId}/pin`;
    return apiClient.patch(endpoint, { pinned });
  },
  async voteActivity(activityId: string, data: { optionId: string }) {
    const endpoint = `/api/clan/activity/${activityId}/vote`;
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
    const endpoint = `/api/clan/${clanId}/gigs/${gigId}/plan`;
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
    const endpoint = `/api/clan/${clanId}/gigs/${gigId}/tasks`;
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
    const endpoint = `/api/clan/${clanId}/gigs/${gigId}/tasks/${taskId}`;
    console.log('Calling updateClanTask with URL:', endpoint);
    return apiClient.patch(endpoint, data);
  },

  // Get clan tasks
  async getClanTasks(clanId: string, gigId: string) {
    const endpoint = `/api/clan/${clanId}/gigs/${gigId}/tasks`;
    console.log('Calling getClanTasks with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Get clan gig assignments
  async getClanGigAssignments(clanId: string) {
    const endpoint = `/api/clan/${clanId}/gig-assignments`;
    console.log('Calling getClanGigAssignments with URL:', endpoint);
    return apiClient.get(endpoint);
  },

  // Get clan member agreements for a gig
  async getClanMemberAgreements(clanId: string, gigId: string) {
    const endpoint = `/api/clan/${clanId}/gigs/${gigId}/member-agreements`;
    console.log('Calling getClanMemberAgreements with URL:', endpoint);
    return apiClient.get(endpoint);
  },
}; 