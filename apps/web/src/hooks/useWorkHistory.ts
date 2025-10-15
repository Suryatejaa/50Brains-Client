import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  getUserWorkHistory,
  getUserWorkSummary,
  getUserSkills,
  getUserAchievements,
  getWorkStatistics,
  getUserSummary,
  getUserReputation,
  getUserPortfolio,
  updateWorkRecordVerification,
  createWorkRecord,
  awardAchievementManually,
  revokeAchievement,
} from '@/lib/work-history-api';

interface WorkRecord {
  id: string;
  gigId: string;
  title: string;
  category: string;
  actualBudget: number | string;
  skills: string[];
  completedAt: string;
  clientRating: number;
  clientFeedback?: string;
  verified: boolean;
  status: string;
}

interface WorkSummary {
  id: string;
  userId: string;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  averageRating: number;
  totalRatings: number;
  fiveStarCount: number;
  fourStarCount: number;
  onTimeDeliveryRate: number;
  averageDeliveryTime: number;
  fastestDelivery: number;
  totalEarnings: number;
  averageProjectValue: number;
  highestProjectValue: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string;
  topSkills: string[];
  topCategories: string[];
  lastActiveDate: string;
  projectsThisMonth: number;
  projectsThisYear: number;
  verificationLevel: string;
  verifiedProjectCount: number;
  createdAt: string;
  updatedAt: string;
  // Computed properties
  successRate?: number;
}

interface Skill {
  id: string;
  userId: string;
  skill: string;
  level: string;
  score: number;
  projectCount: number;
  totalRating: number;
  averageRating: number;
  lastUsed: string;
  recentProjects: any[];
  improvementRate: number;
  createdAt: string;
  updatedAt: string;
  // Computed properties
  proficiency?: string;
}

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  category?: string;
  value?: number;
  iconUrl?: string;
  badgeUrl?: string;
  achievedAt: string;
  verified: boolean;
  expiresAt?: string;
}

interface ReputationData {
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
      type: 'global';
      finalScore: number;
      tier: string;
    };
    tier: {
      userId: string;
      rank: number;
      type: 'tier';
      finalScore: number;
      tier: string;
    };
  };
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

interface PortfolioItem {
  id: string;
  workRecordId: string;
  title: string;
  description: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  fileSize?: number;
  format: string;
  isPublic: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  workContext: {
    workRecordId: string;
    gigId: string;
    title: string;
    category: string;
    skills: string[];
    completedAt: string;
    clientRating: number;
  };
}

export function useWorkHistory(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  const [workHistory, setWorkHistory] = useState<WorkRecord[]>([]);
  const [workSummary, setWorkSummary] = useState<WorkSummary | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [userSummary, setUserSummary] = useState<any>(null);
  const [reputation, setReputation] = useState<ReputationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkHistory = useCallback(
    async (params?: {
      category?: string;
      skills?: string;
      rating?: number;
      limit?: number;
      offset?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => {
      if (!targetUserId) return;

      try {
        setLoading(true);
        setError(null);
        console.log(
          'Fetching work history for user:',
          targetUserId,
          'with params:',
          params
        );
        const response = await getUserWorkHistory(targetUserId, params);
        console.log('Work history response:', response);

        if (response.success) {
          // The API response has recentWork directly in response.data
          console.log('Work history data:', response.data);
          const data = response.data as any;
          setWorkHistory(data.recentWork || []);
        } else {
          console.error('Work history response not successful:', response);
          setError('Failed to load work history');
        }
      } catch (error: any) {
        console.error('Failed to fetch work history:', error);
        setError(error.message || 'Failed to load work history');
      } finally {
        setLoading(false);
      }
    },
    [targetUserId]
  );

  const fetchWorkSummary = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const response = await getUserWorkSummary(targetUserId);
      console.log('Work Summary API Response:', response);
      if (response.success && response.data) {
        const data = response.data as any;
        const summaryData = data.workSummary;
        // Calculate success rate from completion data
        if (summaryData) {
          summaryData.successRate =
            summaryData.totalProjects > 0
              ? Math.round(
                  (summaryData.completedProjects / summaryData.totalProjects) *
                    100
                )
              : 0;
        }
        console.log('Processed Work Summary Data:', summaryData);
        setWorkSummary(summaryData);

        // Also set recent work history from the same response
        if (data.recentWork) {
          setWorkHistory(data.recentWork);
        }
      }
    } catch (error) {
      console.error('Failed to fetch work summary:', error);
    }
  }, [targetUserId]);

  const fetchSkills = useCallback(
    async (params?: { level?: string; limit?: number }) => {
      if (!targetUserId) return;

      try {
        const response = await getUserSkills(targetUserId, params);
        console.log('Skills API Response:', response);
        const data = response.data as any;
        if (response.success && data && data.topSkills) {
          // Map skills and add proficiency based on level
          const skillsWithProficiency = data.topSkills.map((skill: Skill) => ({
            ...skill,
            proficiency: skill.level || 'intermediate',
          }));
          setSkills(skillsWithProficiency);
        }
      } catch (error) {
        console.error('Failed to fetch skills:', error);
      }
    },
    [targetUserId]
  );

  const fetchAchievements = useCallback(
    async (params?: {
      type?: string;
      category?: string;
      verified?: boolean;
      limit?: number;
      includeExpired?: boolean;
    }) => {
      if (!targetUserId) return;

      try {
        const response = await getUserAchievements(targetUserId, params);
        const data = response.data as any;
        console.log('Achievements API Response:', data);
        if (response.success && data) {
          setAchievements(data);

          // Convert badges to achievements format
          const badges = data.badges || [];
          const achievementsFromBadges: Achievement[] = badges.map(
            (badge: string, index: number) => ({
              id: `badge-${index}`,
              type: 'badge',
              title: badge
                .replace('_', ' ')
                .toLowerCase()
                .replace(/\b\w/g, (l) => l.toUpperCase()),
              description: `Earned ${badge} badge`,
              achievedAt: data.updatedAt,
              verified: true,
            })
          );

          setAchievements(achievementsFromBadges);
        }
      } catch (error) {
        console.error('Failed to fetch achievements:', error);
      }
    },
    [targetUserId]
  );

  const fetchPortfolio = useCallback(
    async (params?: {
      type?: string;
      category?: string;
      limit?: number;
      offset?: number;
      publicOnly?: boolean;
    }) => {
      if (!targetUserId) return;

      try {
        const response = await getUserPortfolio(targetUserId, params);
        console.log('Portfolio API Response:', response);
        if (response.success && response.data) {
          const data = response.data as any;
          setPortfolio(data.portfolioItems || []);
        }
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
      }
    },
    [targetUserId]
  );

  const fetchUserSummary = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const response = await getUserSummary(targetUserId);
      if (response.success) {
        setUserSummary(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user summary:', error);
    }
  }, [targetUserId]);

  const fetchReputation = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const response = await getUserReputation(targetUserId);
      console.log('Reputation API Response:', response);
      if (response.success && response.data) {
        const data = response.data as ReputationData;
        setReputation(data);
      }
    } catch (error) {
      console.error('Failed to fetch reputation:', error);
    }
  }, [targetUserId]);

  const fetchWorkStatistics = useCallback(
    async (params?: {
      startDate?: string;
      endDate?: string;
      groupBy?: string;
    }) => {
      if (!targetUserId) return;

      try {
        const response = await getWorkStatistics(targetUserId, params);
        if (response.success) {
          return response.data;
        }
      } catch (error) {
        console.error('Failed to fetch work statistics:', error);
      }
    },
    [targetUserId]
  );

  const verifyWorkRecord = useCallback(
    async (workRecordId: string, verified: boolean, verifierNote?: string) => {
      try {
        const response = await updateWorkRecordVerification(workRecordId, {
          verified,
          verifierNote,
        });
        return response;
      } catch (error) {
        console.error('Failed to verify work record:', error);
        throw error;
      }
    },
    []
  );

  const addWorkRecord = useCallback(async (data: any) => {
    try {
      const response = await createWorkRecord(data);
      return response;
    } catch (error) {
      console.error('Failed to create work record:', error);
      throw error;
    }
  }, []);

  const awardAchievement = useCallback(async (data: any) => {
    try {
      const response = await awardAchievementManually(data);
      return response;
    } catch (error) {
      console.error('Failed to award achievement:', error);
      throw error;
    }
  }, []);

  const removeAchievement = useCallback(
    async (achievementId: string, reason: string) => {
      try {
        const response = await revokeAchievement(achievementId, reason);
        return response;
      } catch (error) {
        console.error('Failed to revoke achievement:', error);
        throw error;
      }
    },
    []
  );

  useEffect(() => {
    if (targetUserId) {
      fetchWorkHistory();
      fetchWorkSummary();
      fetchSkills();
      fetchAchievements();
      fetchReputation();
      fetchUserSummary();
      fetchPortfolio();
    }
  }, [
    targetUserId,
    fetchWorkHistory,
    fetchWorkSummary,
    fetchSkills,
    fetchAchievements,
    fetchUserSummary,
    fetchPortfolio,
  ]);

  return {
    workHistory,
    workSummary,
    skills,
    achievements,
    portfolio,
    userSummary,
    reputation,
    loading,
    error,
    refresh: () => {
      fetchWorkHistory();
      fetchWorkSummary();
      fetchSkills();
      fetchAchievements();
      fetchReputation();
      fetchUserSummary();
      fetchPortfolio();
    },
    fetchWorkHistory,
    fetchWorkSummary,
    fetchSkills,
    fetchAchievements,
    fetchPortfolio,
    fetchUserSummary,
    fetchReputation,
    fetchWorkStatistics,
    verifyWorkRecord,
    addWorkRecord,
    awardAchievement,
    removeAchievement,
  };
}
