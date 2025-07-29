import { apiClient } from './api-client';

// Create a separate API client for work-history service
// This allows us to use a different base URL if needed
const workHistoryApiClient = {
    baseURL: process.env.NEXT_PUBLIC_WORK_HISTORY_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',

    async get(endpoint: string) {
        const url = `${this.baseURL}${endpoint}`;
        console.log(`Work History API call: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies for auth
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
    }
};

// Test function to check different base URLs for work-history service
export const testWorkHistoryEndpoints = async () => {
    console.log('Testing work history endpoints with different base URLs...');

    // Test different possible base URLs
    const baseURLs = [
        'http://localhost:3000',
        'http://localhost:3001', // Common alternative port
        'http://localhost:3002', // Another common port
        'http://localhost:4000', // Another common port
        'http://localhost:5000', // Another common port
    ];

    const endpoints = [
        '/api/work-history/user/test',
        '/work-history/user/test',
        '/api/work-history-service/user/test',
    ];

    for (const baseURL of baseURLs) {
        console.log(`Testing base URL: ${baseURL}`);

        for (const endpoint of endpoints) {
            const fullURL = `${baseURL}${endpoint}`;
            console.log(`Testing: ${fullURL}`);

            try {
                const response = await fetch(fullURL, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();
                console.log(`Response from ${fullURL}:`, data);

                // If we get actual data (not service info), this might be the right endpoint
                if (data && !data.service && !data.version) {
                    console.log(`✅ Found working endpoint: ${fullURL}`);
                    return fullURL;
                }
            } catch (error) {
                console.error(`❌ Error from ${fullURL}:`, error);
            }
        }
    }

    console.log('❌ No working endpoints found');
    return null;
};

// Work History - using the correct backend routes
export const getUserWorkHistory = (userId: string, params?: {
    limit?: number;
    offset?: number;
    status?: string;
    category?: string;
}) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);

    // Use the correct backend route: /work-history/user/:userId
    const endpoint = `/api/work-history/user/${userId}?${queryParams}`;
    console.log(`Calling getUserWorkHistory with URL: ${endpoint}`);
    return workHistoryApiClient.get(endpoint);
};

export const getUserWorkSummary = (userId: string) => {
    // Use the correct backend route: /work-history/user/:userId/summary
    const endpoint = `/api/work-history/user/${userId}/summary`;
    console.log(`Calling getUserWorkSummary with URL: ${endpoint}`);
    return workHistoryApiClient.get(endpoint);
};

export const getUserSkills = (userId: string) => {
    // Use the correct backend route: /work-history/user/:userId/skills
    const endpoint = `/api/work-history/user/${userId}/skills`;
    console.log(`Calling getUserSkills with URL: ${endpoint}`);
    return workHistoryApiClient.get(endpoint);
};

export const getUserAchievements = (userId: string, params?: {
    type?: string;
    category?: string;
    verified?: boolean;
    limit?: number;
}) => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.verified !== undefined) queryParams.append('verified', params.verified.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    // Use the correct backend route: /work-history/user/:userId/achievements
    const endpoint = `/api/work-history/user/${userId}/achievements?${queryParams}`;
    console.log(`Calling getUserAchievements with URL: ${endpoint}`);
    return workHistoryApiClient.get(endpoint);
};

export const getWorkStatistics = (userId: string) => {
    // Use the correct backend route: /work-history/user/:userId/statistics
    const endpoint = `/api/work-history/user/${userId}/statistics`;
    console.log(`Calling getWorkStatistics with URL: ${endpoint}`);
    return workHistoryApiClient.get(endpoint);
};

export const getWorkRecord = (workRecordId: string) => {
    // Use the correct backend route: /work-history/record/:workRecordId
    const endpoint = `/api/work-history/record/${workRecordId}`;
    console.log(`Calling getWorkRecord with URL: ${endpoint}`);
    return workHistoryApiClient.get(endpoint);
};

// Portfolio - using the correct backend routes
export const getUserPortfolio = (userId: string, params?: {
    type?: string;
    category?: string;
    limit?: number;
    offset?: number;
    publicOnly?: boolean;
}) => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.publicOnly !== undefined) queryParams.append('publicOnly', params.publicOnly.toString());

    // Use the correct backend route: /portfolio/user/:userId
    const endpoint = `/api/portfolio/user/${userId}?${queryParams}`;
    console.log(`Calling getUserPortfolio with URL: ${endpoint}`);
    return workHistoryApiClient.get(endpoint);
};

export const getPortfolioItem = (itemId: string) => {
    // Use the correct backend route: /portfolio/item/:itemId
    const endpoint = `/api/portfolio/item/${itemId}`;
    console.log(`Calling getPortfolioItem with URL: ${endpoint}`);
    return workHistoryApiClient.get(endpoint);
};

export const getPortfolioShowcase = (userId: string, limit = 6) => {
    // Use the correct backend route: /portfolio/showcase/:userId
    const endpoint = `/api/portfolio/showcase/${userId}?limit=${limit}`;
    console.log(`Calling getPortfolioShowcase with URL: ${endpoint}`);
    return workHistoryApiClient.get(endpoint);
};

export const getPortfolioCategories = (userId: string) => {
    // Use the correct backend route: /portfolio/categories/:userId
    const endpoint = `/api/portfolio/categories/${userId}`;
    console.log(`Calling getPortfolioCategories with URL: ${endpoint}`);
    return workHistoryApiClient.get(endpoint);
};

// Achievements - using the correct backend routes
export const getUserAchievementsDetailed = (userId: string, params?: {
    type?: string;
    category?: string;
    verified?: boolean;
    limit?: number;
    includeExpired?: boolean;
}) => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.verified !== undefined) queryParams.append('verified', params.verified.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.includeExpired !== undefined) queryParams.append('includeExpired', params.includeExpired.toString());

    // Use the correct backend route: /achievements/user/:userId
    const endpoint = `/api/achievements/user/${userId}?${queryParams}`;
    console.log(`Calling getUserAchievementsDetailed with URL: ${endpoint}`);
    return workHistoryApiClient.get(endpoint);
};

export const getAchievementLeaderboard = (type: string, params?: {
    limit?: number;
    category?: string;
}) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);

    // Use the correct backend route: /achievements/leaderboard/:type
    const endpoint = `/api/achievements/leaderboard/${type}?${queryParams}`;
    console.log(`Calling getAchievementLeaderboard with URL: ${endpoint}`);
    return workHistoryApiClient.get(endpoint);
};

export const getAchievementStats = () => {
    // Use the correct backend route: /achievements/stats/overview
    const endpoint = '/api/achievements/stats/overview';
    console.log(`Calling getAchievementStats with URL: ${endpoint}`);
    return workHistoryApiClient.get(endpoint);
};

// Summary - using the correct backend routes
export const getUserSummary = (userId: string) => {
    // Use the correct backend route: /summary/user/:userId
    const endpoint = `/api/summary/user/${userId}`;
    console.log(`Calling getUserSummary with URL: ${endpoint}`);
    return workHistoryApiClient.get(endpoint);
};

export const getLeaderboards = (limit = 10) => {
    // Use the correct backend route: /summary/leaderboards
    const endpoint = `/api/summary/leaderboards?limit=${limit}`;
    console.log(`Calling getLeaderboards with URL: ${endpoint}`);
    return workHistoryApiClient.get(endpoint);
};

export const getPlatformStats = () => {
    // Use the correct backend route: /summary/platform-stats
    const endpoint = '/api/summary/platform-stats';
    console.log(`Calling getPlatformStats with URL: ${endpoint}`);
    return workHistoryApiClient.get(endpoint);
};

export const getTrendingData = (period = 30) => {
    // Use the correct backend route: /summary/trending
    const endpoint = `/api/summary/trending?period=${period}`;
    console.log(`Calling getTrendingData with URL: ${endpoint}`);
    return workHistoryApiClient.get(endpoint);
};