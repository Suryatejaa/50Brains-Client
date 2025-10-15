// lib/brand-api-client.ts - Brand-specific API client
import { apiClient } from './api-client';

export interface BrandProfile {
  id: string;
  email: string;
  roles: string[];
  firstName: string;
  lastName: string;
  username: string;
  companyName?: string;
  industry?: string;
  companyType?: string;
  companyWebsite?: string;
  website?: string;
  bio?: string;
  location?: string;
  targetAudience?: string[];
  profileViews?: number;
  profilePicture?: string;
  coverImage?: string;
  phone?: string;
  isActive: boolean;
  isBanned: boolean;
  status: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  primaryPlatform?: string;
  instagramHandle?: string;
  youtubeHandle?: string;
  twitterHandle?: string;
  linkedinHandle?: string;
  primaryNiche?: string;
  contentCategories?: string[];
  specializations?: string[];
  crewSkills?: string[];
  experienceLevel?: string;
  hourlyRate?: number;
  workStyle?: string;
  availability?: string;
  designationTitle?: string;
  portfolioUrl?: string;
  equipmentOwned?: string[];
  estimatedFollowers?: number;
  marketingBudget?: string;
  campaignTypes?: string[];
  gstNumber?: string;
  analytics?: {
    profileScore: number;
    completionPercentage: number;
  };
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
  lastLoginAt?: string;
  emailVerifiedAt?: string;
  bannedAt?: string;
  bannedBy?: string;
  banReason?: string;
  banExpiresAt?: string;
}

export interface BrandGig {
  id: string;
  title: string;
  description: string;
  _count: {
    applications: number;
    submissions: number;
  };
  stats?: {
    applicationsCount: number;
    submissionsCount: number;
    daysOld: number;
    daysUntilDeadline: number;
  };
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'OPEN' | 'ASSIGNED';
  budget: number;
  budgetMin: number;
  budgetMax: number;
  applications:any[];
  budgetType: 'FIXED' | 'HOURLY';
  category: string;
  subcategory?: string;
  requirements: string[];
  deliverables: string[];
  deadline: string;
  applicationDeadline: string;
  maxApplications: number;
  preferredPlatforms: string[];
  targetAudience: string[];
  campaignObjectives: string[];
  applicationsCount: number;
  acceptedCount: number;
  pendingApplicationsCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt?: string; // Optional since it might not always be present
}

export interface GigApplication {
  id: string;
  gigId: string;
  applicantId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  proposedBudget: number;
  coverLetter: string;
  portfolio: Array<{
    title: string;
    url: string;
    metrics: {
      views: number;
      engagement: number;
    };
  }>;
  applicant: {
    id: string;
    firstName: string;
    lastName: string;
    primaryPlatform: string;
    followers: number;
    avgEngagement: number;
    niche: string;
  };
  appliedAt: string;
}

export interface WorkSubmission {
  id: string;
  gigId: string;
  influencerId: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
  submittedAt: string;
  deliverables: Array<{
    type: string;
    url: string;
    description: string;
    metrics?: {
      views: number;
      likes: number;
      comments: number;
    };
  }>;
  influencerNotes: string;
  influencer: {
    firstName: string;
    lastName: string;
    primaryPlatform: string;
  };
}

export interface BrandWallet {
  walletId: string;
  balance: number;
  totalPurchased: number;
  totalSpent: number;
  currency: string;
  lastUpdated: string;
}

export interface BrandCollaboration {
  id: string;
  gigId: string;
  influencerId: string;
  projectTitle: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  budget: number;
  startDate: string;
  endDate: string;
  rating?: number;
  feedback?: string;
  deliverables: Array<{
    type: string;
    url: string;
    metrics: {
      views: number;
      engagement: number;
    };
  }>;
  influencer: {
    firstName: string;
    lastName: string;
    primaryPlatform: string;
  };
}

class BrandApiClient {
  // Profile Management
  async getProfile(): Promise<{
    success: boolean;
    data?: BrandProfile;
    error?: string;
  }> {
    try {
      const response = await apiClient.get('/api/user/profile');
      return response as {
        success: boolean;
        data?: BrandProfile;
        error?: string;
      };
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      return { success: false, error: 'Failed to fetch profile' };
    }
  }

  async updateProfile(
    data: Partial<BrandProfile>
  ): Promise<{ success: boolean; data?: BrandProfile; error?: string }> {
    try {
      const response = await apiClient.put('/api/user/profile', data);
      return response as {
        success: boolean;
        data?: BrandProfile;
        error?: string;
      };
    } catch (error) {
      return { success: false, error: 'Failed to update profile' };
    }
  }

  // Gig Management
  async createGig(
    gigData: Partial<BrandGig>
  ): Promise<{ success: boolean; data?: BrandGig; error?: string }> {
    try {
      const response = await apiClient.post('/api/gig', gigData);
      return response as { success: boolean; data?: BrandGig; error?: string };
    } catch (error) {
      return { success: false, error: 'Failed to create gig' };
    }
  }

  async getMyGigs(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data?: {
      gigs: BrandGig[];
      pagination: any;
      stats: {
        totalGigs: number;
        activeGigs: number;
        completedGigs: number;
        totalBudget: number;
      };
    };
    error?: string;
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiClient.get(
        `/api/gig/my-posted?${queryParams.toString()}`
      );
      // console.log(response);
      return response as {
        success: boolean;
        data?: {
          gigs: BrandGig[];
          pagination: any;
          stats: {
            totalGigs: number;
            activeGigs: number;
            completedGigs: number;
            totalBudget: number;
          };
        };
        error?: string;
      };
    } catch (error) {
      return { success: false, error: 'Failed to fetch gigs' };
    }
  }

  async updateGig(
    gigId: string,
    gigData: Partial<BrandGig>
  ): Promise<{ success: boolean; data?: BrandGig; error?: string }> {
    try {
      const response = await apiClient.put(`/api/gig/${gigId}`, gigData);
      return response as { success: boolean; data?: BrandGig; error?: string };
    } catch (error) {
      return { success: false, error: 'Failed to update gig' };
    }
  }

  async deleteGig(
    gigId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.delete(`/api/gig/${gigId}`);
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to delete gig' };
    }
  }

  async getGigApplications(gigId: string): Promise<{
    success: boolean;
    data?: {
      applications: GigApplication[];
      pagination: any;
    };
    error?: string;
  }> {
    try {
      const response = await apiClient.get(`/api/gig/${gigId}/applications`);
      return response as {
        success: boolean;
        data?: {
          applications: GigApplication[];
          pagination: any;
        };
        error?: string;
      };
    } catch (error) {
      return { success: false, error: 'Failed to fetch applications' };
    }
  }

  async acceptApplication(
    applicationId: string,
    data: {
      finalBudget: number;
      notes?: string;
      additionalTerms?: string[];
    }
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await apiClient.post(
        `/api/gig/applications/${applicationId}/accept`,
        data
      );
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to accept application' };
    }
  }

  async rejectApplication(
    applicationId: string,
    data: {
      reason: string;
      feedback?: string;
    }
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await apiClient.post(
        `/api/gig/applications/${applicationId}/reject`,
        data
      );
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to reject application' };
    }
  }

  async getGigSubmissions(gigId: string): Promise<{
    success: boolean;
    data?: {
      submissions: WorkSubmission[];
    };
    error?: string;
  }> {
    try {
      const response = await apiClient.get(`/api/gig/${gigId}/submissions`);
      return response as {
        success: boolean;
        data?: {
          submissions: WorkSubmission[];
        };
        error?: string;
      };
    } catch (error) {
      return { success: false, error: 'Failed to fetch submissions' };
    }
  }

  async approveSubmission(
    submissionId: string,
    data: {
      rating: number;
      feedback?: string;
      bonusAmount?: number;
    }
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await apiClient.post(
        `/api/gig/submissions/${submissionId}/review`,
        data
      );
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to approve submission' };
    }
  }

  // Credit Management
  async getWallet(): Promise<{
    success: boolean;
    data?: BrandWallet;
    error?: string;
  }> {
    try {
      const response = await apiClient.get('/api/credit/wallet');
      return response as {
        success: boolean;
        data?: BrandWallet;
        error?: string;
      };
    } catch (error) {
      return { success: false, error: 'Failed to fetch wallet' };
    }
  }

  async purchaseCredits(data: {
    packageId: string;
    amount: number;
    paymentMethod: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await apiClient.post('/api/credit/purchase', data);
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to purchase credits' };
    }
  }

  async boostProfile(
    duration: number
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await apiClient.post('/api/credit/boost/profile', {
        duration,
      });
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to boost profile' };
    }
  }

  async boostGig(
    gigId: string,
    duration: number
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await apiClient.post('/api/credit/boost/gig', {
        gigId,
        duration,
      });
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to boost gig' };
    }
  }

  async getCreditHistory(): Promise<{
    success: boolean;
    data?: {
      transactions: Array<{
        id: string;
        type: 'PURCHASE' | 'SPEND' | 'REFUND' | 'BOOST';
        amount: number;
        description: string;
        status: 'PENDING' | 'COMPLETED' | 'FAILED';
        createdAt: string;
      }>;
    };
    error?: string;
  }> {
    try {
      const response = await apiClient.get('/api/credit/history');
      return response as {
        success: boolean;
        data?: {
          transactions: Array<{
            id: string;
            type: 'PURCHASE' | 'SPEND' | 'REFUND' | 'BOOST';
            amount: number;
            description: string;
            status: 'PENDING' | 'COMPLETED' | 'FAILED';
            createdAt: string;
          }>;
        };
        error?: string;
      };
    } catch (error) {
      return { success: false, error: 'Failed to fetch credit history' };
    }
  }

  async purchaseBoost(data: {
    boostType: string;
    cost: number;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await apiClient.post('/api/credit/boost', data);
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to purchase boost' };
    }
  }

  // Work History
  async getCollaborationHistory(): Promise<{
    success: boolean;
    data?: {
      collaborations: BrandCollaboration[];
      stats: {
        totalCollaborations: number;
        successfulProjects: number;
        avgRating: number;
        totalSpent: number;
        repeatCollaborators: number;
      };
    };
    error?: string;
  }> {
    try {
      const response = await apiClient.get('/api/work-history/brand');
      return response as {
        success: boolean;
        data?: {
          collaborations: BrandCollaboration[];
          stats: {
            totalCollaborations: number;
            successfulProjects: number;
            avgRating: number;
            totalSpent: number;
            repeatCollaborators: number;
          };
        };
        error?: string;
      };
    } catch (error) {
      return { success: false, error: 'Failed to fetch collaboration history' };
    }
  }

  // Search & Discovery
  async searchInfluencers(params: {
    niche?: string;
    minFollowers?: number;
    maxFollowers?: number;
    platform?: string;
    location?: string;
    verified?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('role', 'INFLUENCER');
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await apiClient.get(
        `/api/user/search?${queryParams.toString()}`
      );
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to search influencers' };
    }
  }

  async searchClans(params: {
    category?: string;
    skills?: string;
    location?: string;
    verified?: boolean;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await apiClient.get(
        `/api/clan/search?${queryParams.toString()}`
      );
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to search clans' };
    }
  }
}

export const brandApiClient = new BrandApiClient();
