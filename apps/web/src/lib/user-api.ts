'use client';

import { apiClient } from './api-client';
import type { APIResponse } from './api-client';

// User Profile Types based on your API documentation
export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  coverPhoto?: string;
  phone?: string;
  website?: string;
  location?: string;
  timezone?: string;

  // Role-specific data
  role: string;
  roles: string[];

  // Social Media Handles
  instagramHandle?: string;
  twitterHandle?: string;
  linkedinHandle?: string;
  youtubeHandle?: string;
  tiktokHandle?: string;

  // Professional Info (role-specific)
  currentRole?: string;
  experience?: string;
  skills?: string[];
  portfolioUrl?: string;

  // Influencer-specific
  contentCategories?: string[];
  primaryNiche?: string;
  primaryPlatform?: string;
  followerCount?: {
    [platform: string]: number;
  };

  // Brand-specific
  companyName?: string;
  industry?: string;
  companyType?: string;
  campaignTypes?: string[];

  // Crew-specific
  crewSkills?: string[];
  experienceLevel?: string;
  availability?: string;
  hourlyRate?: number;
  equipment?: string[];

  // Profile Status
  status: string;
  isEmailVerified: boolean;
  isProfileVerified?: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;

  // Settings
  isPublic?: boolean;
  allowMessages?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  phone?: string;
  website?: string;
  location?: string;
  timezone?: string;
  currentRole?: string;
  isPublic?: boolean;
  allowMessages?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
}

export interface UpdateSocialHandlesRequest {
  instagramHandle?: string;
  twitterHandle?: string;
  linkedinHandle?: string;
  youtubeHandle?: string;
  tiktokHandle?: string;
}

export interface UpdateRoleInfoRequest {
  // Influencer fields
  contentCategories?: string[];
  primaryNiche?: string;
  primaryPlatform?: string;
  followerCount?: { [platform: string]: number };

  // Brand fields
  companyName?: string;
  industry?: string;
  companyType?: string;
  campaignTypes?: string[];

  // Crew fields
  crewSkills?: string[];
  experienceLevel?: string;
  availability?: string;
  hourlyRate?: number;
  equipment?: string[];
}

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'connections';
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    currency: string;
  };
}

/**
 * User Service API Client
 * Based on your backend API documentation
 */
export class UserAPI {
  /**
   * Get current user profile
   * GET /api/user/profile
   */
  static async getCurrentProfile(): Promise<APIResponse<UserProfile>> {
    return apiClient.get<UserProfile>('/api/user/profile');
  }

  /**
   * Update user profile
   * PUT /api/user/profile
   */
  static async updateProfile(
    data: UpdateProfileRequest
  ): Promise<APIResponse<UserProfile>> {
    return apiClient.put<UserProfile>('/api/user/profile', data);
  }

  /**
   * Update profile picture
   * PUT /api/user/profile-picture
   */
  static async updateProfilePicture(
    file: File
  ): Promise<APIResponse<{ profilePicture: string }>> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    return apiClient.put<{ profilePicture: string }>(
      '/api/user/profile-picture',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }

  /**
   * Update social media handles
   * PUT /api/user/social
   */
  static async updateSocialHandles(
    data: UpdateSocialHandlesRequest
  ): Promise<APIResponse<UserProfile>> {
    return apiClient.put<UserProfile>('/api/user/social', data);
  }

  /**
   * Update role-specific information
   * PUT /api/user/roles-info
   */
  static async updateRoleInfo(
    data: UpdateRoleInfoRequest
  ): Promise<APIResponse<UserProfile>> {
    return apiClient.put<UserProfile>('/api/user/roles-info', data);
  }

  /**
   * Get user settings
   * GET /api/user/settings
   */
  static async getUserSettings(): Promise<APIResponse<UserSettings>> {
    return apiClient.get<UserSettings>('/api/user/settings');
  }

  /**
   * Update user settings
   * PUT /api/user/settings
   */
  static async updateUserSettings(
    data: Partial<UserSettings>
  ): Promise<APIResponse<UserSettings>> {
    return apiClient.put<UserSettings>('/api/user/settings', data);
  }

  /**
   * Get public user profile
   * GET /api/user/public/users/:userId
   */
  static async getPublicProfile(
    userId: string
  ): Promise<APIResponse<UserProfile>> {
    return apiClient.get<UserProfile>(`/api/user/public/users/${userId}`);
  }

  /**
   * Search users
   * GET /api/user/search/users
   */
  static async searchUsers(params: {
    q?: string;
    role?: string;
    location?: string;
    skills?: string[];
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
    if (params.role) searchParams.append('role', params.role);
    if (params.location) searchParams.append('location', params.location);
    if (params.skills) {
      params.skills.forEach((skill) => searchParams.append('skills', skill));
    }
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    return apiClient.get(
      `/api/user/search/users${queryString ? `?${queryString}` : ''}`
    );
  }
}

// Export individual functions for easier use
export const {
  getCurrentProfile,
  updateProfile,
  updateProfilePicture,
  updateSocialHandles,
  updateRoleInfo,
  getUserSettings,
  updateUserSettings,
  getPublicProfile,
  searchUsers,
} = UserAPI;
