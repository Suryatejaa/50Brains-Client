// lib/reputation-service.ts - Server-side reputation data fetching with ISR caching
import { headers } from 'next/headers';

export interface ReputationMetrics {
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
}

export interface ReputationRanking {
  userId: string;
  rank: number;
  type: 'global' | 'tier';
  finalScore: number;
  tier: string;
}

export interface ReputationData {
  userId: string;
  baseScore: number;
  bonusScore: number;
  finalScore: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  badges: string[];
  metrics: ReputationMetrics;
  ranking: {
    global: ReputationRanking;
    tier: ReputationRanking;
  };
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReputationResponse {
  success: boolean;
  data?: ReputationData;
  error?: {
    message: string;
    code?: string;
  };
}

class ReputationService {
  private static instance: ReputationService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }

  public static getInstance(): ReputationService {
    if (!ReputationService.instance) {
      ReputationService.instance = new ReputationService();
    }
    return ReputationService.instance;
  }

  // Server-side reputation fetching with ISR caching
  async getReputation(userId: string): Promise<ReputationResponse> {
    try {
      console.log(
        `🏆 [ReputationService] Fetching reputation for user: ${userId}`
      );

      const headersList = await headers();
      const cookie = headersList.get('cookie');

      const response = await fetch(`${this.baseUrl}/api/reputation/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(cookie && { Cookie: cookie }),
        },
        // ISR caching - revalidate every 5 minutes
        next: {
          revalidate: 300,
          tags: [`reputation-${userId}`],
        },
      });

      if (!response.ok) {
        console.error(
          `❌ [ReputationService] HTTP ${response.status}: ${response.statusText}`
        );

        if (response.status === 404) {
          return {
            success: false,
            error: { message: 'Reputation data not found', code: 'NOT_FOUND' },
          };
        }

        if (response.status === 401) {
          return {
            success: false,
            error: { message: 'Authentication required', code: 'UNAUTHORIZED' },
          };
        }

        return {
          success: false,
          error: {
            message: `Server error: ${response.status}`,
            code: 'SERVER_ERROR',
          },
        };
      }

      const result = await response.json();

      if (!result.success) {
        console.error(
          '❌ [ReputationService] API returned error:',
          result.error
        );
        return {
          success: false,
          error: result.error || { message: 'Unknown API error' },
        };
      }

      console.log(
        `✅ [ReputationService] Successfully fetched reputation for ${userId}`
      );
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error('❌ [ReputationService] Network error:', error);
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
        `🏆 [ReputationService] Fetching global leaderboard (limit: ${limit})`
      );

      const headersList = await headers();
      const cookie = headersList.get('cookie');

      const response = await fetch(
        `${this.baseUrl}/api/reputation/leaderboard?limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(cookie && { Cookie: cookie }),
          },
          // ISR caching - revalidate every 10 minutes for leaderboard
          next: {
            revalidate: 600,
            tags: ['leaderboard-global'],
          },
        }
      );

      if (!response.ok) {
        console.error(
          `❌ [ReputationService] Leaderboard HTTP ${response.status}: ${response.statusText}`
        );
        return {
          success: false,
          error: {
            message: `Failed to fetch leaderboard: ${response.status}`,
            code: 'SERVER_ERROR',
          },
        };
      }

      const result = await response.json();
      console.log(
        `✅ [ReputationService] Successfully fetched global leaderboard`
      );

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error('❌ [ReputationService] Leaderboard network error:', error);
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
        `🏆 [ReputationService] Fetching ${tier} tier leaderboard (limit: ${limit})`
      );

      const headersList = await headers();
      const cookie = headersList.get('cookie');

      const response = await fetch(
        `${this.baseUrl}/api/reputation/leaderboard/${tier}?limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(cookie && { Cookie: cookie }),
          },
          // ISR caching - revalidate every 10 minutes
          next: {
            revalidate: 600,
            tags: [`leaderboard-${tier.toLowerCase()}`],
          },
        }
      );

      if (!response.ok) {
        console.error(
          `❌ [ReputationService] Tier leaderboard HTTP ${response.status}: ${response.statusText}`
        );
        return {
          success: false,
          error: {
            message: `Failed to fetch ${tier} leaderboard: ${response.status}`,
            code: 'SERVER_ERROR',
          },
        };
      }

      const result = await response.json();
      console.log(
        `✅ [ReputationService] Successfully fetched ${tier} tier leaderboard`
      );

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error(
        '❌ [ReputationService] Tier leaderboard network error:',
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

export const reputationService = ReputationService.getInstance();
