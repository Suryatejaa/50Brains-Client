// lib/gig-api.ts - Gig service API client

import { apiClient } from './api-client';
import type {
  Gig,
  CreateGigData,
  Application,
  CreateApplicationData,
  Submission,
  CreateSubmissionData,
  GigFilters,
  GigStats,
  GigBoostEvent,
  GigApiResponse,
} from '@/types/gig.types';

// Use the main API gateway instead of direct service connection
const GIG_API_BASE = '/api/gig';

export class GigAPI {
  // Gig Management
  static async createGig(data: CreateGigData): Promise<Gig> {
    const response = await apiClient.post(`${GIG_API_BASE}`, data);
    console.log(response);
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to create gig');
    }
    return response.data as Gig;
  }

  static async createDraftGig(data: CreateGigData): Promise<Gig> {
    // Use the dedicated draft endpoint that allows partial data
    const response = await apiClient.post(`${GIG_API_BASE}/draft`, data);
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to create draft gig');
    }
    return response.data as Gig;
  }

  static async updateGig(
    gigId: string,
    data: Partial<CreateGigData>
  ): Promise<Gig> {
    const response = await apiClient.put(`${GIG_API_BASE}/${gigId}`, data);
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to update gig');
    }
    return response.data as Gig;
  }

  static async deleteGig(gigId: string): Promise<void> {
    const response = await apiClient.delete(`${GIG_API_BASE}/${gigId}`);
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to delete gig');
    }
  }

  static async getGig(gigId: string): Promise<Gig> {
    const response = await apiClient.get(`${GIG_API_BASE}/${gigId}`);
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to fetch gig');
    }
    return response.data as Gig;
  }

  static async publishGig(gigId: string): Promise<Gig> {
    const response = await apiClient.patch(`${GIG_API_BASE}/${gigId}/publish`);
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to publish gig');
    }
    return response.data as Gig;
  }

  static async closeGig(gigId: string): Promise<Gig> {
    const response = await apiClient.patch(`${GIG_API_BASE}/${gigId}/close`);
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to close gig');
    }
    return response.data as Gig;
  }

  // Public Gig Discovery - Fixed route
  static async getPublicGigs(
    filters?: GigFilters
  ): Promise<{ gigs: Gig[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const response = await apiClient.get(
      `/api/gig/feed?${params.toString()}`
    );
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to fetch gigs');
    }
    return response.data as {
      gigs: Gig[];
      total: number;
      page: number;
      totalPages: number;
    };
  }

  static async searchGigs(
    query: string,
    filters?: GigFilters
  ): Promise<{ gigs: Gig[]; total: number }> {
    const params = new URLSearchParams({ search: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const response = await apiClient.get(
      `/api/gig/feed?${params.toString()}`
    );
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to search gigs');
    }
    return response.data as { gigs: Gig[]; total: number };
  }

  static async getFeaturedGigs(): Promise<Gig[]> {
    const response = await apiClient.get(`/api/gig/public/featured`);
    if (!response.success) {
      throw new Error(
        (response as any).error || 'Failed to fetch featured gigs'
      );
    }
    return response.data as Gig[];
  }

  // My Gigs (Posted) - Now with pagination support
  static async getMyPostedGigs(options?: {
    page?: number;
    limit?: number;
    status?: string[];
    search?: string;
    sortBy?: string;
    sort?: 'asc' | 'desc';
  }): Promise<{
    gigs: Gig[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const response = await apiClient.get(`/api/my/posted?${params.toString()}`);
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to fetch posted gigs');
    }
    return response.data as {
      gigs: Gig[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    };
  }

  static async getMyDraftGigs(options?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sort?: 'asc' | 'desc';
  }): Promise<{
    gigs: Gig[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get(`/api/my/drafts?${params.toString()}`);
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to fetch draft gigs');
    }
    return response.data as {
      gigs: Gig[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    };
  }

  static async getDraftGig(gigId: string): Promise<Gig> {
    const response = await apiClient.get(`/api/gig/draft/${gigId}`);
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to fetch draft gig');
    }
    return response.data as Gig;
  }

  static async publishDraftGig(gigId: string): Promise<Gig> {
    const response = await apiClient.post(`/api/gig/draft/${gigId}/publish`);
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to publish draft gig');
    }
    return response.data as Gig;
  }

  static async getAllGigs(filters?: GigFilters): Promise<GigApiResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const response = await apiClient.get(`/api/gig/feed?${params.toString()}`);
    // console.log(response);
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to fetch all gigs');
    }
    return response.data as GigApiResponse;
  }

  static async getMyGigStats(): Promise<GigStats> {
    const response = await apiClient.get(`${GIG_API_BASE}/my/stats`);
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to fetch gig stats');
    }
    return response.data as GigStats;
  }

  // My Applications - Now with pagination support
  static async getMyApplications(options?: {
    page?: number;
    limit?: number;
    status?: string[];
    search?: string;
    sortBy?: string;
    sort?: 'asc' | 'desc';
  }): Promise<{
    applications: Application[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const response = await apiClient.get(`/api/my/applications?${params.toString()}`);
    if (!response.success) {
      throw new Error(
        (response as any).error || 'Failed to fetch applications'
      );
    }
    return response.data as {
      applications: Application[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    };
  }

  static async getMyActiveGigs(): Promise<Gig[]> {
    const response = await apiClient.get(`${GIG_API_BASE}/my/active`);
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to fetch active gigs');
    }
    return response.data as Gig[];
  }

  static async getMyCompletedGigs(): Promise<Gig[]> {
    const response = await apiClient.get(`${GIG_API_BASE}/my/completed`);
    if (!response.success) {
      throw new Error(
        (response as any).error || 'Failed to fetch completed gigs'
      );
    }
    return response.data as Gig[];
  }

  // Application Management
  static async applyToGig(data: CreateApplicationData): Promise<Application> {
    const response = await apiClient.post(`${GIG_API_BASE}/applications`, data);
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to apply to gig');
    }
    return response.data as Application;
  }

  static async updateApplication(
    applicationId: string,
    data: Partial<CreateApplicationData>
  ): Promise<Application> {
    const response = await apiClient.put(
      `${GIG_API_BASE}/applications/${applicationId}`,
      data
    );
    if (!response.success) {
      throw new Error(
        (response as any).error || 'Failed to update application'
      );
    }
    return response.data as Application;
  }

  static async withdrawApplication(applicationId: string): Promise<void> {
    const response = await apiClient.delete(
      `${GIG_API_BASE}/applications/${applicationId}`
    );
    if (!response.success) {
      throw new Error(
        (response as any).error || 'Failed to withdraw application'
      );
    }
  }

  static async getGigApplications(gigId: string): Promise<Application[]> {
    const response = await apiClient.get(
      `${GIG_API_BASE}/${gigId}/applications`
    );
    if (!response.success) {
      throw new Error(
        (response as any).error || 'Failed to fetch gig applications'
      );
    }
    return response.data as Application[];
  }

  static async approveApplication(applicationId: string): Promise<Application> {
    const response = await apiClient.patch(
      `${GIG_API_BASE}/applications/${applicationId}/approve`
    );
    if (!response.success) {
      throw new Error(
        (response as any).error || 'Failed to approve application'
      );
    }
    return response.data as Application;
  }

  static async rejectApplication(
    applicationId: string,
    reason?: string
  ): Promise<Application> {
    const response = await apiClient.patch(
      `${GIG_API_BASE}/applications/${applicationId}/reject`,
      { reason }
    );
    if (!response.success) {
      throw new Error(
        (response as any).error || 'Failed to reject application'
      );
    }
    return response.data as Application;
  }

  // Submission Management
  static async createSubmission(
    data: CreateSubmissionData
  ): Promise<Submission> {
    const response = await apiClient.post(`${GIG_API_BASE}/submissions`, data);
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to create submission');
    }
    return response.data as Submission;
  }

  static async updateSubmission(
    submissionId: string,
    data: Partial<CreateSubmissionData>
  ): Promise<Submission> {
    const response = await apiClient.put(
      `${GIG_API_BASE}/submissions/${submissionId}`,
      data
    );
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to update submission');
    }
    return response.data as Submission;
  }

  static async getGigSubmissions(gigId: string): Promise<Submission[]> {
    const response = await apiClient.get(
      `${GIG_API_BASE}/${gigId}/submissions`
    );
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to fetch submissions');
    }
    return response.data as Submission[];
  }

  static async approveSubmission(
    submissionId: string,
    rating?: number,
    feedback?: string
  ): Promise<Submission> {
    const response = await apiClient.patch(
      `${GIG_API_BASE}/submissions/${submissionId}/approve`,
      { rating, feedback }
    );
    if (!response.success) {
      throw new Error(
        (response as any).error || 'Failed to approve submission'
      );
    }
    return response.data as Submission;
  }

  static async rejectSubmission(
    submissionId: string,
    feedback: string
  ): Promise<Submission> {
    const response = await apiClient.patch(
      `${GIG_API_BASE}/submissions/${submissionId}/reject`,
      { feedback }
    );
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to reject submission');
    }
    return response.data as Submission;
  }

  static async requestRevision(
    submissionId: string,
    feedback: string
  ): Promise<Submission> {
    const response = await apiClient.patch(
      `${GIG_API_BASE}/submissions/${submissionId}/revision`,
      { feedback }
    );
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to request revision');
    }
    return response.data as Submission;
  }

  // Gig Boosting
  static async boostGig(
    gigId: string,
    amount: number,
    duration: number
  ): Promise<GigBoostEvent> {
    const response = await apiClient.post(`${GIG_API_BASE}/${gigId}/boost`, {
      amount,
      duration,
    });
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to boost gig');
    }
    return response.data as GigBoostEvent;
  }

  static async getGigBoosts(gigId: string): Promise<GigBoostEvent[]> {
    const response = await apiClient.get(`${GIG_API_BASE}/${gigId}/boosts`);
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to fetch gig boosts');
    }
    return response.data as GigBoostEvent[];
  }

  // Categories and Skills - Fixed routes
  static async getCategories(): Promise<string[]> {
    const response = await apiClient.get(`/api/gig/public/categories`);
    if (!response.success) {
      throw new Error((response as any).error || 'Failed to fetch categories');
    }
    return response.data as string[];
  }

  static async getPopularSkills(): Promise<string[]> {
    const response = await apiClient.get(`/api/gig/public/skills`);
    if (!response.success) {
      throw new Error(
        (response as any).error || 'Failed to fetch popular skills'
      );
    }
    return response.data as string[];
  }
}

export default GigAPI;
