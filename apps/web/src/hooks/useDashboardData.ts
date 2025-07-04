'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';

// Influencer Dashboard Data Types
export interface InfluencerDashboardData {
  contentMetrics: {
    totalFollowers: number;
    growthRate: number;
    averageEngagement: number;
    topPlatforms: string[];
    avgEngagementRate: number;
    monthlyReach: number;
    connectedPlatforms: number;
    topPerformingPlatform: string;
  };
  earningsMetrics: {
    monthlyEarnings: number;
    totalEarnings: number;
    avgGigPayment: number;
    pendingPayments: number;
  };
  campaignMetrics: {
    activeCollaborations: number;
    completedCampaigns: number;
    pendingApplications: number;
    successRate: number;
    averageRating: number;
  };
  socialPlatforms: Array<{
    platform: string;
    followers: number;
    engagement: number;
    verified: boolean;
    growth: number;
    posts: number;
  }>;
  recentCampaigns: Array<{
    id: string;
    title: string;
    brand: string;
    status: string;
    payment: number;
    deadline: string;
  }>;
  upcomingDeadlines: Array<{
    campaignId: string;
    title: string;
    deadline: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  influencerTier: {
    current: string;
    score: number;
    nextTier: string;
    progress: number;
  };
  recommendations: {
    growthTips: string[];
    trendingHashtags: string[];
  };
}

// Crew Dashboard Data Types
export interface CrewDashboardData {
  projectMetrics: {
    activeProjects: number;
    completedProjects: number;
    pendingBids: number;
    successRate: number;
    onTimeDelivery: number;
    avgProjectValue: number;
  };
  businessMetrics: {
    monthlyRevenue: number;
    totalRevenue: number;
    avgHourlyRate: number;
    clientSatisfaction: number;
    utilizationRate: number;
    clientRetentionRate: number;
    repeatClientPercentage: number;
    avgProjectDuration: number;
    profitMargin: number;
  };
  skillMetrics: {
    totalSkills: number;
    expertiseLevel: string;
    certifications: number;
    endorsements: number;
    hourlyRate: number;
    equipmentCount: number;
    specializations: string[];
  };
  recentProjects: Array<{
    id: string;
    title: string;
    client: string;
    status: string;
    value: number;
    deadline: string;
    budget: number;
    completion: number;
  }>;
  clientHistory: Array<{
    id: string;
    name: string;
    projectsCompleted: number;
    projectsCount: number;
    totalValue: number;
    rating: number;
    lastProject: string;
  }>;
  equipmentPortfolio: Array<{
    category: string;
    value: number;
    items: string[];
  }>;
  upcomingMilestones: Array<{
    projectId: string;
    title: string;
    milestone: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  opportunities?: {
    matchedProjects: Array<{
      id: string;
      title: string;
      match: number;
    }>;
    skillRecommendations: string[];
    marketDemand: string[];
  };
}

// Influencer Dashboard Hook
export const useInfluencerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<InfluencerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInfluencerData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Use REAL API endpoints that actually exist
      const [
        profileResponse,
        applicationsResponse,
        reputationResponse,
        socialResponse,
        workHistoryResponse,
        gigsResponse,
      ] = await Promise.allSettled([
        apiClient.get('/api/user/profile'),
        apiClient.get('/api/my/applications'),
        apiClient.get('/api/reputation/profile'),
        apiClient.get('/api/social-media/analytics'),
        apiClient.get('/api/work-history/profile/summary'),
        apiClient.get('/api/gig/feed?limit=5'),
      ]);

      // Extract real data with safer property access
      const profile =
        profileResponse.status === 'fulfilled'
          ? (profileResponse.value.data as any)
          : null;
      const applicationsData =
        applicationsResponse.status === 'fulfilled'
          ? (applicationsResponse.value.data as any)
          : null;
      const reputation =
        reputationResponse.status === 'fulfilled'
          ? (reputationResponse.value.data as any)
          : null;
      const socialData =
        socialResponse.status === 'fulfilled'
          ? (socialResponse.value.data as any)
          : null;
      const workHistory =
        workHistoryResponse.status === 'fulfilled'
          ? (workHistoryResponse.value.data as any)
          : null;
      const gigs =
        gigsResponse.status === 'fulfilled'
          ? (gigsResponse.value.data as any)
          : null;

      // Calculate metrics from real data with safe access
      const applications =
        applicationsData?.applications || applicationsData || [];
      const activeApps = Array.isArray(applications)
        ? applications.filter((app: any) => app.status === 'ACCEPTED')
        : [];
      const pendingApps = Array.isArray(applications)
        ? applications.filter((app: any) => app.status === 'PENDING')
        : [];
      const completedApps = Array.isArray(applications)
        ? applications.filter((app: any) => app.status === 'COMPLETED')
        : [];

      // Safe property access for social media handles
      const socialHandles =
        profile?.socialMediaHandles || profile?.socialMedia || [];
      const totalFollowers = Array.isArray(socialHandles)
        ? socialHandles.reduce(
            (total: number, handle: any) =>
              total + (handle.followers || handle.followerCount || 0),
            0
          )
        : 0;

      // Construct dashboard data with REAL calculations
      const dashboardData: InfluencerDashboardData = {
        contentMetrics: {
          totalFollowers: totalFollowers,
          growthRate: socialData?.growthRate || socialData?.growth || 0,
          averageEngagement:
            socialData?.avgEngagement || socialData?.engagement || 0,
          topPlatforms: Array.isArray(socialHandles)
            ? socialHandles.map((handle: any) => handle.platform)
            : [],
          avgEngagementRate:
            socialData?.avgEngagement || socialData?.engagement || 0,
          monthlyReach: socialData?.monthlyReach || socialData?.reach || 0,
          connectedPlatforms: Array.isArray(socialHandles)
            ? socialHandles.length
            : 0,
          topPerformingPlatform:
            Array.isArray(socialHandles) && socialHandles.length > 0
              ? socialHandles[0]?.platform
              : '',
        },
        earningsMetrics: {
          monthlyEarnings:
            workHistory?.monthlyEarnings || workHistory?.earnings?.monthly || 0,
          totalEarnings:
            workHistory?.totalEarnings || workHistory?.earnings?.total || 0,
          avgGigPayment:
            workHistory?.avgPayment || workHistory?.averageGigValue || 0,
          pendingPayments:
            workHistory?.pendingPayments || workHistory?.pending || 0,
        },
        campaignMetrics: {
          activeCollaborations: activeApps.length,
          completedCampaigns: completedApps.length,
          pendingApplications: pendingApps.length,
          successRate:
            applications.length > 0
              ? Math.round((completedApps.length / applications.length) * 100)
              : 0,
          averageRating:
            reputation?.averageRating ||
            reputation?.rating ||
            reputation?.score ||
            0,
        },
        socialPlatforms: Array.isArray(socialHandles)
          ? socialHandles.map((handle: any) => ({
              platform: handle.platform || '',
              followers: handle.followers || handle.followerCount || 0,
              engagement: handle.engagement || handle.engagementRate || 0,
              verified: handle.verified || false,
              growth: handle.growthRate || handle.growth || 0,
              posts: handle.postsCount || handle.posts || 0,
            }))
          : [],
        recentCampaigns: activeApps.slice(0, 5).map((app: any) => ({
          id: app.id || '',
          title: app.gig?.title || app.title || '',
          brand: app.gig?.createdBy?.username || app.brand || '',
          status: app.status || '',
          payment: app.quotedPrice || app.payment || 0,
          deadline: app.gig?.deadline || app.deadline || '',
        })),
        upcomingDeadlines: activeApps
          .filter((app: any) => app.gig?.deadline || app.deadline)
          .slice(0, 3)
          .map((app: any) => {
            const deadline = app.gig?.deadline || app.deadline;
            const daysUntilDeadline = deadline
              ? Math.ceil(
                  (new Date(deadline).getTime() - Date.now()) /
                    (24 * 60 * 60 * 1000)
                )
              : 0;
            return {
              campaignId: app.gigId || app.id || '',
              title: app.gig?.title || app.title || '',
              deadline: deadline || '',
              priority:
                daysUntilDeadline <= 3
                  ? 'high'
                  : daysUntilDeadline <= 7
                    ? 'medium'
                    : ('low' as 'high' | 'medium' | 'low'),
            };
          }),
        influencerTier: {
          current: reputation?.tier || reputation?.level || '',
          score: reputation?.totalScore || reputation?.score || 0,
          nextTier: reputation?.nextTier || reputation?.nextLevel || '',
          progress: reputation?.progressToNext || reputation?.progress || 0,
        },
        recommendations: {
          growthTips:
            socialData?.recommendations?.tips || socialData?.tips || [],
          trendingHashtags:
            socialData?.trendingHashtags || socialData?.hashtags || [],
        },
      };

      setData(dashboardData);
    } catch (err) {
      console.error('Error fetching influencer dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchInfluencerData();
  };

  useEffect(() => {
    if (user) {
      fetchInfluencerData();
    }
  }, [user]);

  return { data, loading, error, refresh };
};

// Crew Dashboard Hook
export const useCrewDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<CrewDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCrewData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Use REAL API endpoints that actually exist for crew
      const [
        profileResponse,
        applicationsResponse,
        reputationResponse,
        workHistoryResponse,
        gigsResponse,
        portfolioResponse,
      ] = await Promise.allSettled([
        apiClient.get('/api/user/profile'),
        apiClient.get('/api/my/applications'),
        apiClient.get('/api/reputation/profile'),
        apiClient.get('/api/work-history/profile/summary'),
        apiClient.get('/api/gig/feed?limit=5'),
        apiClient.get('/api/work-history/profile'),
      ]);

      // Extract real data with safer property access
      const profile =
        profileResponse.status === 'fulfilled'
          ? (profileResponse.value.data as any)
          : null;
      const applicationsData =
        applicationsResponse.status === 'fulfilled'
          ? (applicationsResponse.value.data as any)
          : null;
      const reputation =
        reputationResponse.status === 'fulfilled'
          ? (reputationResponse.value.data as any)
          : null;
      const workHistory =
        workHistoryResponse.status === 'fulfilled'
          ? (workHistoryResponse.value.data as any)
          : null;
      const gigs =
        gigsResponse.status === 'fulfilled'
          ? (gigsResponse.value.data as any)
          : null;
      const portfolio =
        portfolioResponse.status === 'fulfilled'
          ? (portfolioResponse.value.data as any)
          : null;

      // Calculate metrics from real data with safe access
      const applications =
        applicationsData?.applications || applicationsData || [];
      const activeProjects = Array.isArray(applications)
        ? applications.filter((app: any) => app.status === 'ACCEPTED')
        : [];
      const pendingBids = Array.isArray(applications)
        ? applications.filter((app: any) => app.status === 'PENDING')
        : [];
      const completedProjects = Array.isArray(applications)
        ? applications.filter((app: any) => app.status === 'COMPLETED')
        : [];

      // Safe property access for crew-specific data
      const crewSkills = profile?.crewSkills || profile?.skills || [];
      const equipmentOwned =
        profile?.equipmentOwned || profile?.equipment || [];

      // Construct crew dashboard data with ONLY real server data
      const dashboardData: CrewDashboardData = {
        projectMetrics: {
          activeProjects: activeProjects.length,
          completedProjects: completedProjects.length,
          pendingBids: pendingBids.length,
          successRate:
            applications.length > 0
              ? Math.round(
                  (completedProjects.length / applications.length) * 100
                )
              : 0,
          onTimeDelivery:
            workHistory?.onTimeDelivery || workHistory?.completionRate || 0,
          avgProjectValue:
            workHistory?.avgProjectValue || workHistory?.averagePayment || 0,
        },
        businessMetrics: {
          monthlyRevenue:
            workHistory?.monthlyRevenue || workHistory?.earnings?.monthly || 0,
          totalRevenue:
            workHistory?.totalRevenue || workHistory?.earnings?.total || 0,
          avgHourlyRate: profile?.hourlyRate || profile?.rate || 0,
          clientSatisfaction:
            reputation?.clientSatisfaction || reputation?.rating || 0,
          utilizationRate: workHistory?.utilizationRate || 0,
          clientRetentionRate: workHistory?.clientRetentionRate || 0,
          repeatClientPercentage: workHistory?.repeatClientPercentage || 0,
          avgProjectDuration: workHistory?.avgProjectDuration || 0,
          profitMargin: workHistory?.profitMargin || 0,
        },
        skillMetrics: {
          totalSkills: Array.isArray(crewSkills) ? crewSkills.length : 0,
          expertiseLevel: profile?.experienceLevel || '',
          certifications:
            profile?.certifications?.length ||
            portfolio?.certifications?.length ||
            0,
          endorsements:
            reputation?.endorsements || reputation?.reviews?.length || 0,
          hourlyRate: profile?.hourlyRate || profile?.rate || 0,
          equipmentCount: Array.isArray(equipmentOwned)
            ? equipmentOwned.length
            : 0,
          specializations: Array.isArray(crewSkills)
            ? crewSkills.slice(0, 5)
            : [],
        },
        recentProjects: activeProjects.slice(0, 5).map((app: any) => ({
          id: app.id || '',
          title: app.gig?.title || app.title || '',
          client: app.gig?.createdBy?.username || app.client || '',
          status: app.status || '',
          value: app.quotedPrice || app.payment || 0,
          deadline: app.gig?.deadline || app.deadline || '',
          budget: app.quotedPrice || app.payment || 0,
          completion: app.progress || 0,
        })),
        clientHistory: (workHistory?.clients || [])
          .slice(0, 5)
          .map((client: any) => ({
            id: client.id || '',
            name: client.name || client.clientName || '',
            projectsCompleted: client.projectsCompleted || client.projects || 0,
            projectsCount: client.projectsCompleted || client.projects || 0,
            totalValue: client.totalValue || client.revenue || 0,
            rating: client.rating || 0,
            lastProject: client.lastProject || client.lastProjectDate || '',
          })),
        equipmentPortfolio: Array.isArray(equipmentOwned)
          ? equipmentOwned.reduce((acc: any[], eq: any) => {
              const category = eq.category || 'Other';
              let existing = acc.find((item) => item.category === category);
              if (!existing) {
                existing = { category, value: 0, items: [] };
                acc.push(existing);
              }
              if (eq.name || eq.equipment) {
                existing.items.push(eq.name || eq.equipment);
              }
              if (eq.value) {
                existing.value += eq.value;
              }
              return acc;
            }, [])
          : [],
        upcomingMilestones: activeProjects
          .filter((app: any) => app.gig?.deadline || app.deadline)
          .slice(0, 3)
          .map((app: any) => {
            const deadline = app.gig?.deadline || app.deadline;
            const daysUntilDeadline = deadline
              ? Math.ceil(
                  (new Date(deadline).getTime() - Date.now()) /
                    (24 * 60 * 60 * 1000)
                )
              : 0;
            return {
              projectId: app.gigId || app.id || '',
              title: app.gig?.title || app.title || '',
              milestone: app.milestone || '',
              dueDate: deadline || '',
              priority:
                daysUntilDeadline <= 3
                  ? 'high'
                  : daysUntilDeadline <= 7
                    ? 'medium'
                    : ('low' as 'high' | 'medium' | 'low'),
            };
          }),
        opportunities: {
          matchedProjects: (gigs?.gigs || []).slice(0, 3).map((gig: any) => ({
            id: gig.id || '',
            title: gig.title || '',
            match: gig.matchPercentage || 0,
          })),
          skillRecommendations: gigs?.skillRecommendations || [],
          marketDemand: gigs?.marketDemand || [],
        },
      };

      setData(dashboardData);
    } catch (err) {
      console.error('Error fetching crew dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchCrewData();
  };

  useEffect(() => {
    if (user) {
      fetchCrewData();
    }
  }, [user]);

  return { data, loading, error, refresh };
};
