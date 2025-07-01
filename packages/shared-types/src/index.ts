// API Response Types
export interface APISuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
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
  success: false;
  error: string;
  message: string;
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

  // Contact & Social
  phone?: string;
  website?: string;
  location?: string;
  timezone?: string;

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
  clanHeadId: string;

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
