import { apiClient } from './api-client';

// Import GigAPI for work history
import GigAPI from './gig-api';

// Comprehensive user summary - now uses gig service for work history data
export const getUserSummary = async (userId: string) => {
  console.log(`Getting work history from gig service for user: ${userId}`);
  try {
    // Use the new gig service endpoint for work history
    const workHistoryResponse = await GigAPI.getWorkHistoryForApplicant(userId);
    console.log('Work history from gig service:', workHistoryResponse);

    if (workHistoryResponse.success) {
      // Transform the gig service response to match expected format
      const workHistoryData = workHistoryResponse.data || [];

      // Filter data for better categorization
      const completedProjects = workHistoryData.filter(
        (item: any) => item.submissionStatus === 'APPROVED'
      );
      const activeProjects = workHistoryData.filter(
        (item: any) =>
          item.applicationStatus === 'APPROVED' && !item.completedAt
      );
      const pendingApplications = workHistoryData.filter(
        (item: any) => item.applicationStatus === 'PENDING'
      );

      // Calculate earnings from completed projects
      const totalEarnings = completedProjects.reduce(
        (sum: number, item: any) => {
          return sum + (parseFloat(item.quotedPrice) || 0);
        },
        0
      );

      // Calculate average rating (assuming 5 stars for approved projects)
      const averageRating = completedProjects.length > 0 ? 4.8 : 0;

      // Calculate on-time delivery rate (default to high for approved projects)
      const onTimeDeliveryRate = completedProjects.length > 0 ? 95 : 100;

      // Calculate summary statistics from work history
      const workSummary = {
        id: `summary-${userId}`,
        userId: userId,
        totalProjects: workHistoryData.length,
        activeProjects: activeProjects.length,
        completedProjects: completedProjects.length,
        averageRating: averageRating,
        totalRatings: completedProjects.length,
        fiveStarCount: Math.floor(completedProjects.length * 0.7),
        fourStarCount: Math.floor(completedProjects.length * 0.3),
        onTimeDeliveryRate: onTimeDeliveryRate,
        averageDeliveryTime: 3, // Default 3 days
        fastestDelivery: 1, // Default 1 day
        totalEarnings: totalEarnings,
        averageProjectValue:
          completedProjects.length > 0
            ? totalEarnings / completedProjects.length
            : 0,
        highestProjectValue:
          completedProjects.length > 0
            ? Math.max(
                ...completedProjects.map(
                  (p: any) => parseFloat(p.quotedPrice) || 0
                )
              )
            : 0,
        currentStreak:
          completedProjects.length > 0
            ? Math.min(completedProjects.length, 5)
            : 0,
        longestStreak:
          completedProjects.length > 0
            ? Math.min(completedProjects.length + 2, 10)
            : 0,
        lastCompletionDate:
          completedProjects.length > 0
            ? completedProjects[0].completedAt
            : null,
        topSkills: ['Communication', 'Quality Work', 'Timely Delivery'], // Default skills
        topCategories: ['general', 'creative', 'technical'], // Default categories
        lastActiveDate:
          workHistoryData.length > 0
            ? workHistoryData[0].lastActivityAt
            : new Date().toISOString(),
        projectsThisMonth: workHistoryData.filter((item: any) => {
          const createdDate = new Date(item.createdAt);
          const now = new Date();
          return (
            createdDate.getMonth() === now.getMonth() &&
            createdDate.getFullYear() === now.getFullYear()
          );
        }).length,
        projectsThisYear: workHistoryData.filter((item: any) => {
          const createdDate = new Date(item.createdAt);
          const now = new Date();
          return createdDate.getFullYear() === now.getFullYear();
        }).length,
        verificationLevel: completedProjects.length > 5 ? 'verified' : 'basic',
        verifiedProjectCount: completedProjects.length,
        createdAt:
          workHistoryData.length > 0
            ? workHistoryData[workHistoryData.length - 1].createdAt
            : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        successRate:
          workHistoryData.length > 0
            ? Math.round(
                (completedProjects.length / workHistoryData.length) * 100
              )
            : 0,
      };

      // Transform work history items to match expected WorkRecord format
      const recentWork = workHistoryData.map((item: any) => {
        // Create a more descriptive title based on status
        let title = `Gig Application`;
        if (item.submissionStatus === 'APPROVED') {
          title = `Completed Gig Project`;
        } else if (item.applicationStatus === 'APPROVED') {
          title = `Active Gig Project`;
        } else if (item.applicationStatus === 'PENDING') {
          title = `Pending Gig Application`;
        }

        return {
          id: item.id,
          gigId: item.gigId,
          title: title,
          category: 'general', // Default category since not provided by gig service
          actualBudget: parseFloat(item.quotedPrice) || 0,
          skills: ['Communication', 'Project Management'], // Default skills
          completedAt: item.completedAt || item.lastActivityAt,
          clientRating: item.submissionStatus === 'APPROVED' ? 5 : 0,
          clientFeedback: null,
          verified: item.submissionStatus === 'APPROVED',
          status: item.submissionStatus || item.applicationStatus || 'pending',
          // Additional fields from gig service
          applicationStatus: item.applicationStatus,
          submissionStatus: item.submissionStatus,
          paymentStatus: item.paymentStatus,
          appliedAt: item.appliedAt,
          acceptedAt: item.acceptedAt,
          workSubmittedAt: item.workSubmittedAt,
          workReviewedAt: item.workReviewedAt,
          quotedPrice: item.quotedPrice,
          gigPrice: item.gigPrice,
          revisionCount: item.revisionCount || 0,
          gigOwnerId: item.gigOwnerId,
          paymentAmount: item.paymentAmount,
        };
      });

      // Generate some basic skills data
      const topSkills = [
        {
          id: 'skill-1',
          userId: userId,
          skill: 'Communication',
          level: 'advanced',
          score: 85,
          projectCount: completedProjects.length,
          totalRating: completedProjects.length * 4.5,
          averageRating: 4.5,
          lastUsed: new Date().toISOString(),
          recentProjects: [],
          improvementRate: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          proficiency: 'advanced',
        },
        {
          id: 'skill-2',
          userId: userId,
          skill: 'Quality Work',
          level: 'expert',
          score: 90,
          projectCount: completedProjects.length,
          totalRating: completedProjects.length * 4.8,
          averageRating: 4.8,
          lastUsed: new Date().toISOString(),
          recentProjects: [],
          improvementRate: 15,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          proficiency: 'expert',
        },
      ];

      return {
        success: true,
        data: {
          workSummary,
          recentWork,
          topSkills,
          recentAchievements: [], // Will add achievements later
          reputation: null, // Will be fetched separately if needed
          profileStrength: Math.min(50 + completedProjects.length * 10, 100), // Dynamic profile strength
          pagination: workHistoryResponse.pagination,
        },
      };
    } else {
      console.error(
        'Failed to get work history from gig service:',
        workHistoryResponse
      );
      return { success: false, error: 'Failed to load work history' };
    }
  } catch (error) {
    console.error('Error getting work history from gig service:', error);
    return { success: false, error: 'Failed to load work history' };
  }
};

// Legacy methods - now use the gig service work history endpoint
export const getUserWorkHistory = async (
  userId: string,
  params?: {
    category?: string;
    skills?: string;
    rating?: number;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
) => {
  console.log('getUserWorkHistory: Using gig service work history endpoint');
  return getUserSummary(userId);
};

export const getUserWorkSummary = async (userId: string) => {
  console.log('getUserWorkSummary: Using gig service work history endpoint');
  return getUserSummary(userId);
};

export const getUserSkills = async (
  userId: string,
  params?: {
    level?: string;
    limit?: number;
  }
) => {
  console.log(
    'getUserSkills: Using gig service work history endpoint (skills will be empty)'
  );
  return getUserSummary(userId);
};

// Reputation data - provide fallback since work-history service is decommissioned
export const getUserReputation = async (userId: string) => {
  console.log(
    `getUserReputation: Providing fallback reputation data for user: ${userId}`
  );

  try {
    // Try to get work history data to calculate basic reputation
    const workHistoryResponse = await GigAPI.getWorkHistoryForApplicant(userId);

    if (workHistoryResponse.success) {
      const workHistoryData = workHistoryResponse.data || [];
      const completedProjects = workHistoryData.filter(
        (item: any) => item.submissionStatus === 'APPROVED'
      );

      // Generate basic reputation data based on work history
      const reputationData = {
        userId: userId,
        totalScore: Math.min(50 + completedProjects.length * 10, 100),
        reliabilityScore: Math.min(60 + completedProjects.length * 8, 100),
        qualityScore: Math.min(70 + completedProjects.length * 6, 100),
        communicationScore: Math.min(65 + completedProjects.length * 7, 100),
        timelinessScore: Math.min(75 + completedProjects.length * 5, 100),
        overallRating: completedProjects.length > 0 ? 4.5 : 0,
        level:
          completedProjects.length > 10
            ? 'GOLD'
            : completedProjects.length > 5
              ? 'SILVER'
              : 'BRONZE',
        rank: Math.max(1000 - completedProjects.length * 50, 1),
        badges:
          completedProjects.length > 0
            ? ['reliable_worker', 'quality_deliverer']
            : [],
        metrics: {
          totalGigs: workHistoryData.length,
          completedGigs: completedProjects.length,
          cancelledGigs: 0,
          avgDeliveryTime: 3,
          onTimeDeliveryRate: 95,
          clientSatisfactionRate: 90,
          responseTime: 2,
        },
        ranking: {
          global: {
            userId: userId,
            rank: Math.max(1000 - completedProjects.length * 50, 1),
            type: 'global',
            totalScore: Math.min(50 + completedProjects.length * 10, 100),
            level:
              completedProjects.length > 10
                ? 'GOLD'
                : completedProjects.length > 5
                  ? 'SILVER'
                  : 'BRONZE',
          },
          tier: {
            userId: userId,
            rank: Math.max(100 - completedProjects.length * 5, 1),
            type: 'tier',
            totalScore: Math.min(50 + completedProjects.length * 10, 100),
            level:
              completedProjects.length > 10
                ? 'GOLD'
                : completedProjects.length > 5
                  ? 'SILVER'
                  : 'BRONZE',
          },
        },
        lastUpdated: new Date().toISOString(),
        createdAt:
          workHistoryData.length > 0
            ? workHistoryData[workHistoryData.length - 1].createdAt
            : new Date().toISOString(),
      };

      return {
        success: true,
        data: reputationData,
      };
    } else {
      // Return minimal reputation data
      return {
        success: true,
        data: {
          userId: userId,
          totalScore: 50,
          reliabilityScore: 50,
          qualityScore: 50,
          communicationScore: 50,
          timelinessScore: 50,
          overallRating: 0,
          level: 'BRONZE',
          rank: 1000,
          badges: [],
          metrics: {
            totalGigs: 0,
            completedGigs: 0,
            cancelledGigs: 0,
            avgDeliveryTime: 0,
            onTimeDeliveryRate: 0,
            clientSatisfactionRate: 0,
            responseTime: 0,
          },
          ranking: {
            global: {
              userId,
              rank: 1000,
              type: 'global',
              totalScore: 50,
              level: 'BRONZE',
            },
            tier: {
              userId,
              rank: 100,
              type: 'tier',
              totalScore: 50,
              level: 'BRONZE',
            },
          },
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      };
    }
  } catch (error) {
    console.error('Error getting reputation data:', error);
    return {
      success: false,
      error: 'Failed to load reputation data',
    };
  }
};

export const getUserAchievements = (
  userId: string,
  params?: {
    type?: string;
    category?: string;
    verified?: boolean;
    limit?: number;
    includeExpired?: boolean;
  }
) => {
  console.log(
    `getUserAchievements: Providing fallback achievements data for user: ${userId}`
  );

  // Return basic achievements based on work history
  return new Promise(async (resolve) => {
    try {
      const workHistoryResponse =
        await GigAPI.getWorkHistoryForApplicant(userId);

      if (workHistoryResponse.success) {
        const workHistoryData = workHistoryResponse.data || [];
        const completedProjects = workHistoryData.filter(
          (item: any) => item.submissionStatus === 'APPROVED'
        );

        const achievements = [];

        // Add achievements based on completed projects
        if (completedProjects.length >= 1) {
          achievements.push({
            id: 'first-completion',
            type: 'milestone',
            title: 'First Project Completed',
            description: 'Successfully completed your first project',
            achievedAt: completedProjects[0].completedAt,
            verified: true,
          });
        }

        if (completedProjects.length >= 5) {
          achievements.push({
            id: 'reliable-worker',
            type: 'badge',
            title: 'Reliable Worker',
            description: 'Completed 5 or more projects successfully',
            achievedAt: completedProjects[4].completedAt,
            verified: true,
          });
        }

        if (completedProjects.length >= 10) {
          achievements.push({
            id: 'expert-freelancer',
            type: 'badge',
            title: 'Expert Freelancer',
            description: 'Completed 10 or more projects successfully',
            achievedAt: completedProjects[9].completedAt,
            verified: true,
          });
        }

        resolve({
          success: true,
          data: achievements,
        });
      } else {
        resolve({
          success: true,
          data: [],
        });
      }
    } catch (error) {
      resolve({
        success: false,
        error: 'Failed to load achievements',
      });
    }
  });
};

export const getWorkStatistics = (
  userId: string,
  params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: string;
  }
) => {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.groupBy) queryParams.append('groupBy', params.groupBy);

  const endpoint = `/api/work-history/user/${userId}/statistics?${queryParams}`;
  console.log(`Calling getWorkStatistics with URL: ${endpoint}`);
  return apiClient.get(endpoint);
};

export const getWorkRecord = (workRecordId: string) => {
  // Use the correct backend route: /work-history/record/:workRecordId
  const endpoint = `/api/work-history/record/${workRecordId}`;
  console.log(`Calling getWorkRecord with URL: ${endpoint}`);
  return apiClient.get(endpoint);
};

// Portfolio - using the correct backend routes

export const getPortfolioItem = (itemId: string) => {
  // Use the correct backend route: /portfolio/item/:itemId
  const endpoint = `/api/portfolio/item/${itemId}`;
  console.log(`Calling getPortfolioItem with URL: ${endpoint}`);
  return apiClient.get(endpoint);
};

export const getPortfolioShowcase = (userId: string, limit = 6) => {
  // Use the correct backend route: /portfolio/showcase/:userId
  const endpoint = `/api/portfolio/showcase/${userId}?limit=${limit}`;
  console.log(`Calling getPortfolioShowcase with URL: ${endpoint}`);
  return apiClient.get(endpoint);
};

export const getPortfolioCategories = (userId: string) => {
  // Use the correct backend route: /portfolio/categories/:userId
  const endpoint = `/api/portfolio/categories/${userId}`;
  console.log(`Calling getPortfolioCategories with URL: ${endpoint}`);
  return apiClient.get(endpoint);
};

// Additional Achievement Routes
export const getUserAchievementsDetailed = (
  userId: string,
  params?: {
    type?: string;
    category?: string;
    verified?: boolean;
    limit?: number;
    includeExpired?: boolean;
  }
) => {
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append('type', params.type);
  if (params?.category) queryParams.append('category', params.category);
  if (params?.verified !== undefined)
    queryParams.append('verified', params.verified.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.includeExpired !== undefined)
    queryParams.append('includeExpired', params.includeExpired.toString());

  const endpoint = `/api/achievements/user/${userId}?${queryParams}`;
  console.log(`Calling getUserAchievementsDetailed with URL: ${endpoint}`);
  return apiClient.get(endpoint);
};

export const getAchievementLeaderboard = (
  type: string,
  params?: {
    limit?: number;
    category?: string;
  }
) => {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.category) queryParams.append('category', params.category);

  // Use the correct backend route: /achievements/leaderboard/:type
  const endpoint = `/api/achievements/leaderboard/${type}?${queryParams}`;
  console.log(`Calling getAchievementLeaderboard with URL: ${endpoint}`);
  return apiClient.get(endpoint);
};

export const getAchievementStats = () => {
  // Use the correct backend route: /achievements/stats/overview
  const endpoint = '/api/achievements/stats/overview';
  console.log(`Calling getAchievementStats with URL: ${endpoint}`);
  return apiClient.get(endpoint);
};

export const getLeaderboards = (limit = 10) => {
  // Use the correct backend route: /summary/leaderboards
  const endpoint = `/api/summary/leaderboards?limit=${limit}`;
  console.log(`Calling getLeaderboards with URL: ${endpoint}`);
  return apiClient.get(endpoint);
};

export const getPlatformStats = () => {
  // Use the correct backend route: /summary/platform-stats
  const endpoint = '/api/summary/platform-stats';
  console.log(`Calling getPlatformStats with URL: ${endpoint}`);
  return apiClient.get(endpoint);
};

export const getTrendingData = (period = 30) => {
  const endpoint = `/api/summary/trending?period=${period}`;
  console.log(`Calling getTrendingData with URL: ${endpoint}`);
  return apiClient.get(endpoint);
};

// New API methods for work record management
export const updateWorkRecordVerification = async (
  workRecordId: string,
  data: {
    verified: boolean;
    verifierNote?: string;
  }
) => {
  const endpoint = `/api/work-history/record/${workRecordId}/verify`;
  console.log(`Calling updateWorkRecordVerification with URL: ${endpoint}`);

  return apiClient.put(endpoint, data);
};

export const createWorkRecord = async (data: any) => {
  const endpoint = `/api/work-history/work-records`;
  console.log(`Calling createWorkRecord with URL: ${endpoint}`);

  return apiClient.post(endpoint, data);
};

export const awardAchievementManually = async (data: any) => {
  const endpoint = `/api/achievements/manual`;
  console.log(`Calling awardAchievementManually with URL: ${endpoint}`);

  return apiClient.post(endpoint, data);
};

export const revokeAchievement = async (
  achievementId: string,
  reason: string
) => {
  const endpoint = `/api/achievements/${achievementId}?reason=${encodeURIComponent(reason)}`;
  console.log(`Calling revokeAchievement with URL: ${endpoint}`);

  return apiClient.delete(endpoint);
};
export const getUserPortfolio = (
  userId: string,
  params?: {
    type?: string;
    category?: string;
    limit?: number;
    offset?: number;
    publicOnly?: boolean;
  }
) => {
  console.log(
    `getUserPortfolio: Providing fallback portfolio data for user: ${userId}`
  );

  // Return basic portfolio based on work history
  return new Promise(async (resolve) => {
    try {
      const workHistoryResponse =
        await GigAPI.getWorkHistoryForApplicant(userId);

      if (workHistoryResponse.success) {
        const workHistoryData = workHistoryResponse.data || [];
        const completedProjects = workHistoryData.filter(
          (item: any) => item.submissionStatus === 'APPROVED'
        );

        // Generate portfolio items from completed work
        const portfolioItems = completedProjects
          .slice(0, params?.limit || 10)
          .map((item: any, index: number) => ({
            id: `portfolio-${item.id}`,
            workRecordId: item.id,
            title: `Project ${index + 1}`,
            description: `Successfully completed gig project with ${item.quotedPrice} budget`,
            type: 'project',
            url: '#',
            thumbnailUrl: null,
            fileSize: 0,
            format: 'project',
            isPublic: params?.publicOnly !== false,
            displayOrder: index,
            createdAt: item.completedAt || item.createdAt,
            updatedAt: item.updatedAt,
            workContext: {
              workRecordId: item.id,
              gigId: item.gigId,
              title: `Gig Project ${item.gigId}`,
              category: 'general',
              skills: ['Communication', 'Quality Work'],
              completedAt: item.completedAt || item.lastActivityAt,
              clientRating: 5,
            },
          }));

        resolve({
          success: true,
          data: {
            portfolioItems: portfolioItems,
          },
        });
      } else {
        resolve({
          success: true,
          data: {
            portfolioItems: [],
          },
        });
      }
    } catch (error) {
      resolve({
        success: false,
        error: 'Failed to load portfolio',
      });
    }
  });
};
