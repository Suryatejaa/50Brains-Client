import { apiClient } from './api-client';

// Work History - using the summary endpoint for recent work data
export const getUserWorkHistory = (
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
  // Recent work is included in the summary endpoint
  const endpoint = `/api/summary/user/${userId}`;
  console.log(
    `Calling getUserWorkHistory (from summary) with URL: ${endpoint}`
  );
  return apiClient.get(endpoint);
};

export const getUserWorkSummary = (userId: string) => {
  // Use the actual working endpoint: /summary/user/:userId
  const endpoint = `/api/summary/user/${userId}`;
  console.log(`Calling getUserWorkSummary with URL: ${endpoint}`);
  return apiClient.get(endpoint);
};

// Add reputation API call
export const getUserReputation = (userId: string) => {
  const endpoint = `/api/reputation/${userId}`;
  console.log(`Calling getUserReputation with URL: ${endpoint}`);
  return apiClient.get(endpoint);
};

export const getUserSkills = (
  userId: string,
  params?: {
    level?: string;
    limit?: number;
  }
) => {
  // Skills are included in the summary endpoint
  const endpoint = `/api/summary/user/${userId}`;
  console.log(`Calling getUserSkills (from summary) with URL: ${endpoint}`);
  return apiClient.get(endpoint);
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
  // Achievements are in reputation data as badges
  const endpoint = `/api/reputation/${userId}`;
  console.log(
    `Calling getUserAchievements (from reputation) with URL: ${endpoint}`
  );
  return apiClient.get(endpoint);
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

// Summary - using the correct backend routes
export const getUserSummary = (userId: string) => {
  // Use the correct backend route: /summary/user/:userId
  const endpoint = `/api/summary/user/${userId}`;
  console.log(`Calling getUserSummary with URL: ${endpoint}`);
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
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append('type', params.type);
  if (params?.category) queryParams.append('category', params.category);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());
  if (params?.publicOnly !== undefined)
    queryParams.append('publicOnly', params.publicOnly.toString());

  // Use the correct backend route: /portfolio/user/:userId
  const endpoint = `/api/portfolio/user/${userId}?${queryParams}`;
  console.log(`Calling getUserPortfolio with URL: ${endpoint}`);
  return apiClient.get(endpoint);
};