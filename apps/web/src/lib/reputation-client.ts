// lib/reputation-client.ts - Client-side reputation API calls
'use client';

import { apiClient } from './api-client';
import type { ReputationData } from './reputation-service';

export interface ReputationResponse {
  success: boolean;
  data?: ReputationData;
  error?: {
    message: string;
    code?: string;
  };
}

class ReputationClientService {
  private static instance: ReputationClientService;

  private constructor() {}

  public static getInstance(): ReputationClientService {
    if (!ReputationClientService.instance) {
      ReputationClientService.instance = new ReputationClientService();
    }
    return ReputationClientService.instance;
  }

  // Client-side reputation fetching
  async getReputation(userId: string): Promise<ReputationResponse> {
    try {
      console.log(
        `🏆 [ReputationClient] Fetching reputation for user: ${userId}`
      );

      const response = await apiClient.get(`/api/reputation/${userId}`);

      if (!response.success) {
        console.error(`❌ [ReputationClient] API returned error:`, response);
        return {
          success: false,
          error: { message: 'Failed to fetch reputation data' },
        };
      }

      console.log(
        `✅ [ReputationClient] Successfully fetched reputation for ${userId}`
      );
      return {
        success: true,
        data: response.data as ReputationData,
      };
    } catch (error) {
      console.error('❌ [ReputationClient] Network error:', error);
      return {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : 'Network error occurred',
          code: 'NETWORK_ERROR',
        },
      };
    }
  }

  // Get global leaderboard
  async getGlobalLeaderboard(limit = 10): Promise<ReputationResponse> {
    try {
      console.log(
        `🏆 [ReputationClient] Fetching global leaderboard (limit: ${limit})`
      );

      const response = await apiClient.get(
        `/api/reputation/leaderboard?limit=${limit}`
      );

      if (!response.success) {
        console.error(`❌ [ReputationClient] Leaderboard API error:`, response);
        return {
          success: false,
          error: { message: 'Failed to fetch leaderboard data' },
        };
      }

      console.log(
        `✅ [ReputationClient] Successfully fetched global leaderboard`
      );
      return {
        success: true,
        data: response.data as ReputationData,
      };
    } catch (error) {
      console.error('❌ [ReputationClient] Leaderboard network error:', error);
      return {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : 'Network error occurred',
          code: 'NETWORK_ERROR',
        },
      };
    }
  }

  // Get tier-specific leaderboard
  async getTierLeaderboard(
    tier: string,
    limit = 10
  ): Promise<ReputationResponse> {
    try {
      console.log(
        `🏆 [ReputationClient] Fetching ${tier} tier leaderboard (limit: ${limit})`
      );

      const response = await apiClient.get(
        `/api/reputation/leaderboard/${tier}?limit=${limit}`
      );

      if (!response.success) {
        console.error(
          `❌ [ReputationClient] Tier leaderboard API error:`,
          response
        );
        return {
          success: false,
          error: { message: `Failed to fetch ${tier} leaderboard data` },
        };
      }

      console.log(
        `✅ [ReputationClient] Successfully fetched ${tier} tier leaderboard`
      );
      return {
        success: true,
        data: response.data as ReputationData,
      };
    } catch (error) {
      console.error(
        '❌ [ReputationClient] Tier leaderboard network error:',
        error
      );
      return {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : 'Network error occurred',
          code: 'NETWORK_ERROR',
        },
      };
    }
  }
}

export const reputationClient = ReputationClientService.getInstance();
