// types/profile.types.ts
export interface UserProfileData {
  // Basic Info
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  location?: string;
  profilePicture?: string;
  coverImage?: string;

  // Social Media
  instagramHandle?: string;
  twitterHandle?: string;
  linkedinHandle?: string;
  youtubeHandle?: string;
  website?: string;

  // Role-specific Data
  roles: string[];
  status: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;

  // Influencer Data
  contentCategories: string[];
  primaryNiche?: string;
  primaryPlatform?: string;
  estimatedFollowers?: number;

  // Brand Data
  companyName?: string;
  companyType?: string;
  industry?: string;
  gstNumber?: string;
  companyWebsite?: string;
  marketingBudget?: string;
  targetAudience: string[];
  campaignTypes: string[];
  designationTitle?: string;

  // Crew Data
  crewSkills: string[];
  experienceLevel?: string;
  equipmentOwned: string[];
  portfolioUrl?: string;
  hourlyRate?: number;
  availability?: string;
  workStyle?: string;
  specializations: string[];
}

export interface WorkHistoryData {
  workSummary: {
    totalProjects: number;
    averageRating: number;
    onTimeDeliveryRate: number;
    totalEarnings: number;
    completionRate: number;
  };
  skills: Array<{
    skill: string;
    level: string;
    score: number;
    projectCount: number;
    averageRating: number;
  }>;
  achievements: Array<{
    type: string;
    title: string;
    description: string;
    achievedAt: string;
    verified: boolean;
  }>;
  recentWork: Array<{
    title: string;
    category: string;
    clientRating: number;
    completedAt: string;
    verified: boolean;
  }>;
}

export interface AnalyticsData {
  profileViews: number;
  searchAppearances: number;
  popularityScore: number;
  engagementScore: number;
  lastViewedAt?: string;
}

export interface ReputationData {
  userId: string;
  baseScore: number;
  bonusScore: number;
  finalScore: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  badges: string[];
  metrics: {
    gigsCompleted: number;
    gigsPosted: number;
    boostsReceived: number;
    boostsGiven: number;
    averageRating: number;
    profileViews: number;
    connectionsMade: number;
    applicationSuccess: number;
    completionRate: number;
    responseTime: number;
    clanContributions: number;
  };
  ranking: {
    global: {
      userId: string;
      rank: number;
      type: 'global' | 'tier';
      finalScore: number;
      tier: string;
    };
    tier: {
      userId: string;
      rank: number;
      type: 'global' | 'tier';
      finalScore: number;
      tier: string;
    };
  };
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompleteProfileData {
  user: UserProfileData;
  workHistory: WorkHistoryData | null;
  analytics: AnalyticsData | null;
  reputation: ReputationData | null;
}

export interface ProfileState {
  profile: CompleteProfileData | null;
  loading: boolean;
  editing: {
    section: string | null;
    data: any;
  };
  errors: Record<string, string>;
  isOwner: boolean;
}
