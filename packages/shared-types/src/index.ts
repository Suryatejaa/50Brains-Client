// API Response Types
export interface APISuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  details?: any; // For compatibility with legacy code
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    processingTime: number;
  };
}

export interface APIErrorResponse {
  success?: boolean;
  error?: string; // Main error message from backend
  errors?: string[]; // Array of validation errors
  message?: string; // Alternative message field
  statusCode: number;
  timestamp: string;
  path: string;
  requestId: string;
  details?: any;
}

// User Types
export enum UserRole {
  USER = 'USER',
  INFLUENCER = 'INFLUENCER',
  BRAND = 'BRAND',
  CREW = 'CREW',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum UserStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
}

export interface User {
  // Basic Info
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  coverPhoto?: string;

  // Role-Specific Data
  roles: UserRole[]; // Changed from single role to array of roles
  status: UserStatus;
  isEmailVerified: boolean;
  isProfileVerified: boolean;

  // Influencer-specific fields
  contentCategories?: string[];
  estimatedFollowers?: number;
  collaborationRates?: {
    postRate?: number;
    storyRate?: number;
    reelRate?: number;
    videoRate?: number;
  };
  targetAudience?: {
    ageGroups?: string[];
    interests?: string[];
    geography?: string[];
  };
  mediaKit?: string; // URL to media kit

  // Crew-specific fields
  crewSkills?: string[];
  equipmentOwned?: string[];
  hourlyRate?: number;
  experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' | 'SPECIALIST';
  serviceCategories?: string[];
  portfolioItems?: any[];
  certifications?: string[];
  availabilityStatus?: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';

  // Contact & Social
  phone?: string;
  website?: string;
  location?: string;
  timezone?: string;
  socialMediaHandles?: SocialMediaHandle[];

  // Professional Info
  currentRole?: string;
  skills?: string[];
  education?: any[];
  experience?: any[];

  // Platform Data
  totalGigs: number;
  completedGigs: number;
  totalEarnings: number;
  averageRating: number;
  reviewCount: number;

  // Timestamps
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  roles: UserRole[]; // Changed to support multiple roles
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  roles: UserRole[]; // Changed to support multiple roles
  iat: number;
  exp: number;
}

// Gig Types
export interface Gig {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  skills: string[];

  // Posting Details
  posterId: string;
  posterType: 'USER' | 'BRAND' | 'CLAN';
  postingType: 'INDIVIDUAL' | 'CLAN_POSTING';

  // Requirements
  experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' | 'ANY';
  location?: string;
  isRemote: boolean;
  deadline?: string;
  estimatedDuration?: string;

  // Compensation
  budgetType: 'FIXED' | 'HOURLY' | 'NEGOTIABLE';
  budgetMin?: number;
  budgetMax?: number;
  currency: string;

  // Application Settings
  maxApplicants?: number;
  applicationDeadline?: string;

  // Status & Metrics
  status:
    | 'DRAFT'
    | 'ACTIVE'
    | 'PAUSED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  applicationCount: number;
  viewCount: number;
  isUrgent: boolean;
  isFeatured: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Clan Types
export enum ClanRole {
  HEAD = 'HEAD',
  CO_HEAD = 'CO_HEAD',
  ADMIN = 'ADMIN',
  SENIOR_MEMBER = 'SENIOR_MEMBER',
  MEMBER = 'MEMBER',
  TRAINEE = 'TRAINEE',
}

export interface Clan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  tagline?: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
  isActive: boolean;
  isVerified: boolean;
  headId: string;

  // Contact Info
  email?: string;
  website?: string;
  instagramHandle?: string;
  twitterHandle?: string;
  linkedinHandle?: string;

  // Settings
  requiresApproval: boolean;
  isPaidMembership: boolean;
  membershipFee?: number;
  maxMembers: number;

  // Classification
  primaryCategory?: string;
  categories: string[];
  skills: string[];
  location?: string;
  timezone?: string;

  // Metrics
  totalGigs: number;
  completedGigs: number;
  totalRevenue: number;
  averageRating: number;
  memberCount: number;
  portfolioCount: number;
  reviewCount: number;
  reputationScore: number;

  // Calculated Score
  score: number;
  scoreBreakdown: {
    memberScore: number;
    portfolioScore: number;
    reviewScore: number;
    activityScore: number;
    verificationBonus: number;
  };

  createdAt: string;
  updatedAt: string;
}

// Credit Types
export interface CreditWallet {
  id: string;
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  currency: string;
  lastUpdated: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type:
    | 'PURCHASE'
    | 'BOOST_PROFILE'
    | 'BOOST_GIG'
    | 'BOOST_CLAN'
    | 'CONTRIBUTE_CLAN'
    | 'REFUND';
  amount: number;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  reference?: string;
  paymentGateway?: 'RAZORPAY' | 'STRIPE';
  externalReference?: string;
  createdAt: string;
}

// Reputation Types
export interface ReputationScore {
  id: string;
  userId: string;

  // Core Metrics
  gigsCompleted: number;
  totalEarnings: number;
  averageRating: number;
  reviewCount: number;
  profileViews: number;
  clanContributions: number;

  // Engagement Metrics
  applicationSuccess: number;
  responseTime: number;
  completionRate: number;

  // Calculated Scores
  baseScore: number;
  bonusScore: number;
  penaltyScore: number;
  finalScore: number;

  // Tier System
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'LEGEND';
  badges: string[];

  // Admin Controls
  isVerified: boolean;
  isSuspended: boolean;
  adminOverride?: number;

  updatedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type:
    | 'GIG_APPLICATION'
    | 'CLAN_INVITATION'
    | 'WORK_SUBMISSION'
    | 'RATING_RECEIVED'
    | 'BOOST_APPLIED'
    | 'PAYMENT_RECEIVED';
  title: string;
  message: string;

  // Related Data
  relatedId?: string;
  relatedType?: 'GIG' | 'CLAN' | 'USER' | 'APPLICATION' | 'SUBMISSION';
  actionUrl?: string;

  // Status
  isRead: boolean;
  isArchived: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  // Delivery
  deliveryMethod: 'IN_APP' | 'EMAIL' | 'PUSH' | 'SMS';
  isDelivered: boolean;
  deliveredAt?: string;

  createdAt: string;
  readAt?: string;
  updatedAt: string;
}

// Dashboard-specific types
export interface InfluencerDashboardMetrics {
  contentMetrics: {
    totalFollowers: number;
    avgEngagementRate: number;
    monthlyReach: number;
    topPerformingPlatform: string;
    contentViews: number;
    storiesViewed: number;
    postsLiked: number;
    commentsReceived: number;
  };
  campaignMetrics: {
    activeCollaborations: number;
    pendingApplications: number;
    completedCampaigns: number;
    campaignSuccessRate: number;
    averageCampaignValue: number;
    brandPartnerships: number;
    totalCampaignReach: number;
  };
  earningsMetrics: {
    monthlyEarnings: number;
    totalEarnings: number;
    avgGigPayment: number;
    pendingPayments: number;
    lastPaymentDate: string;
    topPayingBrand: string;
    earningsGrowth: number;
  };
  audienceMetrics: {
    demographicBreakdown: {
      age: Record<string, number>;
      gender: Record<string, number>;
      location: Record<string, number>;
      interests: Record<string, number>;
    };
    engagementTrends: {
      week: number[];
      month: number[];
      quarter: number[];
    };
    bestPostingTimes: {
      days: string[];
      hours: number[];
    };
  };
}

export interface CrewDashboardMetrics {
  projectMetrics: {
    activeProjects: number;
    pendingBids: number;
    completedProjects: number;
    avgProjectValue: number;
    projectSuccessRate: number;
    onTimeDeliveryRate: number;
    clientRetentionRate: number;
  };
  skillMetrics: {
    totalSkills: number;
    expertiseLevel: string;
    hourlyRate: number;
    equipmentCount: number;
    certificationCount: number;
    skillProficiencyScores: Record<string, number>;
  };
  businessMetrics: {
    monthlyRevenue: number;
    totalRevenue: number;
    utilizationRate: number;
    averageProjectDuration: number;
    repeatClientPercentage: number;
    revenueGrowth: number;
    profitMargin: number;
  };
  portfolioMetrics: {
    totalPortfolioItems: number;
    portfolioViews: number;
    portfolioLikes: number;
    showcaseCategories: string[];
    topViewedItems: any[];
  };
}

export interface SocialMediaAnalytics {
  userId: string;
  platforms: {
    platform: string;
    followers: number;
    following: number;
    posts: number;
    engagement: number;
    growthRate: number;
    lastUpdated: string;
  }[];
  totalFollowers: number;
  totalEngagement: number;
  averageEngagement: number;
  reachScore: number;
  influencerTier: string;
  growthTrends: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  topContent: {
    posts: any[];
    stories: any[];
    reels: any[];
  };
}

export interface CampaignApplication {
  id: string;
  gigId: string;
  applicantId: string;
  status:
    | 'PENDING'
    | 'REVIEWING'
    | 'SHORTLISTED'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'WITHDRAWN';
  appliedAt: string;
  proposedRate?: number;
  coverLetter?: string;
  deliverables?: string[];
  timeline?: string;
  portfolioLinks?: string[];
  gig?: Gig;
  applicant?: User;
  brand?: User;

  // Campaign-specific fields
  contentType?: 'POST' | 'STORY' | 'REEL' | 'VIDEO' | 'BLOG' | 'LIVE';
  platforms?: string[];
  targetAudience?: string[];
  hashtags?: string[];
  mentions?: string[];

  // Crew-specific fields
  projectScope?: string;
  technicalRequirements?: string[];
  equipmentNeeded?: string[];
  skillsRequired?: string[];

  // Payment & Timeline
  milestones?: {
    name: string;
    description: string;
    dueDate: string;
    amount: number;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
  }[];

  // Communication
  messages?: any[];
  lastMessageAt?: string;

  updatedAt: string;
}

export interface WorkHistoryItem {
  id: string;
  userId: string;
  gigId: string;
  clientId: string;
  type: 'CAMPAIGN' | 'PROJECT' | 'COLLABORATION';
  title: string;
  description: string;
  category: string;

  // Timeline
  startDate: string;
  endDate: string;
  duration: number; // in days

  // Financial
  agreedAmount: number;
  finalAmount: number;
  currency: string;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'COMPLETED' | 'OVERDUE';

  // Performance
  rating: number;
  review?: string;
  feedback?: string;

  // Deliverables
  deliverables: {
    type: string;
    url: string;
    description: string;
    submittedAt: string;
    approvedAt?: string;
  }[];

  // Status
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completionRate: number;

  // Relationships
  gig?: Gig;
  client?: User;

  createdAt: string;
  updatedAt: string;
}

export interface BrandRecommendation {
  id: string;
  brandId: string;
  brand: User;
  matchScore: number;
  reasons: string[];
  openGigs: number;
  avgBudget: number;
  category: string;
  preferredContentTypes: string[];
  audienceAlignment: number;
  pastCollaborations: number;
  responseRate: number;
  paymentReliability: number;
  campaignSuccess: number;
}

export interface CrewOpportunity {
  id: string;
  gigId: string;
  gig: Gig;
  matchScore: number;
  reasons: string[];
  skillsMatched: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  clientRating: number;
  projectComplexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'EXPERT';
  estimatedDuration: string;
  isRemote: boolean;
  competitionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Social Media Types
export interface SocialMediaHandle {
  id: string;
  userId: string;
  platform:
    | 'INSTAGRAM'
    | 'TIKTOK'
    | 'YOUTUBE'
    | 'TWITTER'
    | 'LINKEDIN'
    | 'FACEBOOK';
  handle: string;
  url: string;
  isVerified: boolean;
  followerCount?: number;
  isPublic: boolean;
  lastUpdated: string;
}

// Common Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchFilters {
  query?: string;
  category?: string;
  location?: string;
  minBudget?: number;
  maxBudget?: number;
  experienceLevel?: string;
  isRemote?: boolean;
}

export interface FileUpload {
  file: File;
  type:
    | 'PROFILE_PICTURE'
    | 'COVER_PHOTO'
    | 'PORTFOLIO_ITEM'
    | 'WORK_SUBMISSION';
  metadata?: Record<string, any>;
}

// Error Types
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public error: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Theme Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  reputation: {
    bronze: string;
    silver: string;
    gold: string;
    platinum: string;
    diamond: string;
    legend: string;
  };
}

// Form Types
export interface FormField<T = any> {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'file';
  value: T;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
}

export interface FormState {
  fields: Record<string, FormField>;
  isValid: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}
