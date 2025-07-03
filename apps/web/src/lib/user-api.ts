'use client';

import { apiClient } from './api-client';
import type { APIResponse } from './api-client';

// Enhanced User Profile Types based on comprehensive API schema
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

export interface UserProfile {
  // Core Identity
  user: any;
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  coverPhoto?: string;

  // Role & Status System
  roles: UserRole[]; // Multiple roles support
  status: UserStatus;
  isEmailVerified: boolean;
  isProfileVerified: boolean;

  // Contact & Location
  phone?: string;
  website?: string;
  location?: string;
  timezone?: string;

  // Professional Profile
  currentRole?: string;
  skills?: string[];
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
  portfolioUrl?: string;

  // Platform Performance Metrics
  totalGigs: number;
  completedGigs: number;
  totalEarnings: number;
  averageRating: number;
  reviewCount: number;

  // Social Media Integration
  instagramHandle?: string;
  twitterHandle?: string;
  linkedinHandle?: string;
  youtubeHandle?: string;
  tiktokHandle?: string;
  facebookHandle?: string;
  snapchatHandle?: string;

  // Role-Specific Fields
  // Influencer-specific
  contentCategories?: string[];
  primaryNiche?: string;
  primaryPlatform?: string;
  followerCount?: { [platform: string]: number };
  engagementRate?: { [platform: string]: number };
  audienceDemographics?: {
    ageGroups: { [range: string]: number };
    genderSplit: { [gender: string]: number };
    topLocations: string[];
  };

  // Brand-specific
  companyName?: string;
  industry?: string;
  companyType?: 'STARTUP' | 'SME' | 'ENTERPRISE' | 'AGENCY' | 'NONPROFIT';
  companySize?: string;
  foundedYear?: number;
  campaignTypes?: string[];
  marketingBudget?: string;
  targetAudience?: string[];

  // Crew-specific
  crewSkills?: string[];
  experienceLevel?: 'ENTRY' | 'INTERMEDIATE' | 'SENIOR' | 'EXPERT';
  availability?: 'FULL_TIME' | 'PART_TIME' | 'FREELANCE' | 'CONTRACT';
  hourlyRate?: number;
  equipment?: string[];
  certifications?: string[];
  languages?: string[];

  // Privacy & Preferences
  isPublic?: boolean;
  allowMessages?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  showLocation?: boolean;
  allowDirectBooking?: boolean;

  // Timestamps
  lastActiveAt?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EducationEntry {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number;
  gpa?: number;
  description?: string;
  isVerified?: boolean;
}

export interface ExperienceEntry {
  id?: string;
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  location?: string;
  skills: string[];
  achievements?: string[];
  isVerified?: boolean;
}

export interface UpdateProfileRequest {
  // Basic Info
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  currentRole?: string;

  // Contact
  phone?: string;
  website?: string;
  location?: string;
  timezone?: string;

  // Skills & Portfolio
  skills?: string[];
  portfolioUrl?: string;

  // Privacy Settings
  isPublic?: boolean;
  allowMessages?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  showLocation?: boolean;
  allowDirectBooking?: boolean;
}

export interface UpdateSocialHandlesRequest {
  instagramHandle?: string;
  twitterHandle?: string;
  linkedinHandle?: string;
  youtubeHandle?: string;
  tiktokHandle?: string;
  facebookHandle?: string;
  snapchatHandle?: string;
}

export interface UpdateInfluencerInfoRequest {
  contentCategories?: string[];
  primaryNiche?: string;
  primaryPlatform?: string;
  followerCount?: { [platform: string]: number };
  engagementRate?: { [platform: string]: number };
  audienceDemographics?: {
    ageGroups: { [range: string]: number };
    genderSplit: { [gender: string]: number };
    topLocations: string[];
  };
}

export interface UpdateBrandInfoRequest {
  companyName?: string;
  industry?: string;
  companyType?: 'STARTUP' | 'SME' | 'ENTERPRISE' | 'AGENCY' | 'NONPROFIT';
  companySize?: string;
  foundedYear?: number;
  campaignTypes?: string[];
  marketingBudget?: string;
  targetAudience?: string[];
}

export interface UpdateCrewInfoRequest {
  crewSkills?: string[];
  experienceLevel?: 'ENTRY' | 'INTERMEDIATE' | 'SENIOR' | 'EXPERT';
  availability?: 'FULL_TIME' | 'PART_TIME' | 'FREELANCE' | 'CONTRACT';
  hourlyRate?: number;
  equipment?: string[];
  certifications?: string[];
  languages?: string[];
}

export interface UpdateEducationRequest {
  education: EducationEntry[];
}

export interface UpdateExperienceRequest {
  experience: ExperienceEntry[];
}

export interface UserRoleChangeRequest {
  rolesToAdd?: UserRole[];
  rolesToRemove?: UserRole[];
}

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
    gigUpdates: boolean;
    messageNotifications: boolean;
    achievementAlerts: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'connections';
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    allowMessages: boolean;
    allowDirectBooking: boolean;
    showActivity: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    currency: string;
    theme: 'light' | 'dark' | 'auto';
    emailDigest: 'daily' | 'weekly' | 'monthly' | 'never';
  };
}

export interface UserAnalytics {
  profileViews: number;
  profileViewsThisMonth: number;
  searchAppearances: number;
  applicationsSent: number;
  applicationsReceived: number;
  messagingStats: {
    messagesReceived: number;
    messagesSent: number;
    responseRate: number;
  };
  gigStats: {
    totalCompleted: number;
    successRate: number;
    averageRating: number;
    repeatClients: number;
  };
}

/**
 * Enhanced User Service API Client
 * Comprehensive API for all user-related operations
 */
export class UserAPI {
  /**
   * Profile Management
   */
  static async getCurrentProfile(): Promise<APIResponse<UserProfile>> {
    return apiClient.get<UserProfile>('/api/user/profile');
  }

  static async updateProfile(
    data: UpdateProfileRequest
  ): Promise<APIResponse<UserProfile>> {
    return apiClient.put<UserProfile>('/api/user/profile', data);
  }

  static async updateProfilePicture(
    file: File
  ): Promise<APIResponse<{ profilePicture: string }>> {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return apiClient.put<{ profilePicture: string }>(
      '/api/user/profile-picture',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
  }

  static async updateCoverPhoto(
    file: File
  ): Promise<APIResponse<{ coverPhoto: string }>> {
    const formData = new FormData();
    formData.append('coverPhoto', file);
    return apiClient.put<{ coverPhoto: string }>(
      '/api/user/cover-photo',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
  }

  /**
   * Social Media Management
   */
  static async updateSocialHandles(
    data: UpdateSocialHandlesRequest
  ): Promise<APIResponse<UserProfile>> {
    return apiClient.put<UserProfile>('/api/user/social', data);
  }

  static async verifyPlatform(
    platform: string,
    handle: string
  ): Promise<APIResponse<{ verified: boolean }>> {
    return apiClient.post<{ verified: boolean }>('/api/user/social/verify', {
      platform,
      handle,
    });
  }

  /**
   * Role-Specific Information
   */
  static async updateInfluencerInfo(
    data: UpdateInfluencerInfoRequest
  ): Promise<APIResponse<UserProfile>> {
    return apiClient.put<UserProfile>('/api/user/influencer-info', data);
  }

  static async updateBrandInfo(
    data: UpdateBrandInfoRequest
  ): Promise<APIResponse<UserProfile>> {
    return apiClient.put<UserProfile>('/api/user/brand-info', data);
  }

  static async updateCrewInfo(
    data: UpdateCrewInfoRequest
  ): Promise<APIResponse<UserProfile>> {
    return apiClient.put<UserProfile>('/api/user/crew-info', data);
  }

  /**
   * Education & Experience
   */
  static async updateEducation(
    data: UpdateEducationRequest
  ): Promise<APIResponse<UserProfile>> {
    return apiClient.put<UserProfile>('/api/user/education', data);
  }

  static async updateExperience(
    data: UpdateExperienceRequest
  ): Promise<APIResponse<UserProfile>> {
    return apiClient.put<UserProfile>('/api/user/experience', data);
  }

  /**
   * Role Management
   */
  static async requestRoleChange(
    data: UserRoleChangeRequest
  ): Promise<APIResponse<{ status: string; message: string }>> {
    return apiClient.post<{ status: string; message: string }>(
      '/api/user/roles/request',
      data
    );
  }

  static async getAvailableRoles(): Promise<
    APIResponse<{ roles: UserRole[]; descriptions: { [key: string]: string } }>
  > {
    return apiClient.get<{
      roles: UserRole[];
      descriptions: { [key: string]: string };
    }>('/api/user/roles/available');
  }

  /**
   * Settings & Preferences
   */
  static async getUserSettings(): Promise<APIResponse<UserSettings>> {
    return apiClient.get<UserSettings>('/api/user/settings');
  }

  static async updateUserSettings(
    data: Partial<UserSettings>
  ): Promise<APIResponse<UserSettings>> {
    return apiClient.put<UserSettings>('/api/user/settings', data);
  }

  /**
   * Analytics & Insights
   */
  static async getUserAnalytics(
    timeframe?: 'week' | 'month' | 'quarter' | 'year'
  ): Promise<APIResponse<UserAnalytics>> {
    const params = timeframe ? `?timeframe=${timeframe}` : '';
    return apiClient.get<UserAnalytics>(`/api/user/analytics${params}`);
  }

  /**
   * Discovery & Search
   */
  static async getPublicProfile(
    userId: string
  ): Promise<APIResponse<UserProfile>> {
    return apiClient.get<UserProfile>(`/api/user/public/users/${userId}`);
  }

  static async searchUsers(params: {
    q?: string;
    roles?: UserRole[];
    location?: string;
    skills?: string[];
    experienceLevel?: string;
    availability?: string;
    verified?: boolean;
    page?: number;
    limit?: number;
  }): Promise<
    APIResponse<{
      users: UserProfile[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>
  > {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append('q', params.q);
    if (params.roles)
      params.roles.forEach((role) => searchParams.append('roles', role));
    if (params.location) searchParams.append('location', params.location);
    if (params.skills)
      params.skills.forEach((skill) => searchParams.append('skills', skill));
    if (params.experienceLevel)
      searchParams.append('experienceLevel', params.experienceLevel);
    if (params.availability)
      searchParams.append('availability', params.availability);
    if (params.verified !== undefined)
      searchParams.append('verified', params.verified.toString());
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    return apiClient.get(
      `/api/user/search/users${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Verification & Achievements
   */
  static async requestVerification(
    type: 'email' | 'profile' | 'platform'
  ): Promise<APIResponse<{ status: string }>> {
    return apiClient.post<{ status: string }>(
      '/api/user/verification/request',
      { type }
    );
  }

  static async getAchievements(): Promise<
    APIResponse<{ achievements: any[]; progress: any[] }>
  > {
    return apiClient.get<{ achievements: any[]; progress: any[] }>(
      '/api/user/achievements'
    );
  }
}

// Export individual functions for easier use
export const {
  getCurrentProfile,
  updateProfile,
  updateProfilePicture,
  updateCoverPhoto,
  updateSocialHandles,
  verifyPlatform,
  updateInfluencerInfo,
  updateBrandInfo,
  updateCrewInfo,
  updateEducation,
  updateExperience,
  requestRoleChange,
  getAvailableRoles,
  getUserSettings,
  updateUserSettings,
  getUserAnalytics,
  getPublicProfile,
  searchUsers,
  requestVerification,
  getAchievements,
} = UserAPI;
