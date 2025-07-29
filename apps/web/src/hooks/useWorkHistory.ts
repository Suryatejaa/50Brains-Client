import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
    getUserWorkHistory,
    getUserWorkSummary,
    getUserSkills,
    getUserAchievements,
    getWorkStatistics,
    getUserPortfolio,
    getUserSummary,
    testWorkHistoryEndpoints,
} from '@/lib/work-history-api';

interface WorkRecord {
    id: string;
    gigId: string;
    title: string;
    category: string;
    skills: string[];
    completedAt: string;
    clientRating: number;
    clientFeedback?: string;
    verified: boolean;
    status: string;
}

interface WorkSummary {
    totalProjects: number;
    completedProjects: number;
    averageRating: number;
    totalEarnings: number;
    verificationLevel: string;
    successRate: number;
}

interface Skill {
    skill: string;
    score: number;
    projectCount: number;
    proficiency: string;
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

interface PortfolioItem {
    id: string;
    title: string;
    description: string;
    type: string;
    category: string;
    mediaUrls: string[];
    isPublic: boolean;
    displayOrder: number;
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkHistory = useCallback(async (params?: {
        limit?: number;
        offset?: number;
        status?: string;
        category?: string;
    }) => {
        if (!targetUserId) return;

        try {
            setLoading(true);
            setError(null);
            console.log('Fetching work history for user:', targetUserId, 'with params:', params);
            const response = await getUserWorkHistory(targetUserId, params);
            console.log('Work history response:', response);

            if (response.success) {
                const data = response.data as { workHistory: WorkRecord[] };
                console.log('Work history data:', data);
                setWorkHistory(data.workHistory || []);
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
    }, [targetUserId]);

    const fetchWorkSummary = useCallback(async () => {
        if (!targetUserId) return;

        try {
            const response = await getUserWorkSummary(targetUserId);
            if (response.success) {
                const data = response.data as WorkSummary;
                setWorkSummary(data);
            }
        } catch (error) {
            console.error('Failed to fetch work summary:', error);
        }
    }, [targetUserId]);

    const fetchSkills = useCallback(async () => {
        if (!targetUserId) return;

        try {
            const response = await getUserSkills(targetUserId);
            if (response.success) {
                const data = response.data as { skills: Skill[] };
                setSkills(data.skills || []);
            }
        } catch (error) {
            console.error('Failed to fetch skills:', error);
        }
    }, [targetUserId]);

    const fetchAchievements = useCallback(async (params?: {
        type?: string;
        category?: string;
        verified?: boolean;
        limit?: number;
    }) => {
        if (!targetUserId) return;

        try {
            const response = await getUserAchievements(targetUserId, params);
            if (response.success) {
                const data = response.data as { achievements: Achievement[] };
                setAchievements(data.achievements || []);
            }
        } catch (error) {
            console.error('Failed to fetch achievements:', error);
        }
    }, [targetUserId]);

    const fetchPortfolio = useCallback(async (params?: {
        type?: string;
        category?: string;
        limit?: number;
        offset?: number;
        publicOnly?: boolean;
    }) => {
        if (!targetUserId) return;

        try {
            const response = await getUserPortfolio(targetUserId, params);
            if (response.success) {
                const data = response.data as { portfolioItems: PortfolioItem[] };
                setPortfolio(data.portfolioItems || []);
            }
        } catch (error) {
            console.error('Failed to fetch portfolio:', error);
        }
    }, [targetUserId]);

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

    useEffect(() => {
        if (targetUserId) {
            // Test endpoints to find the correct base URL
            testWorkHistoryEndpoints().then(workingEndpoint => {
                if (workingEndpoint) {
                    console.log('Found working endpoint:', workingEndpoint);
                }
            });

            fetchWorkHistory();
            fetchWorkSummary();
            fetchSkills();
            fetchAchievements();
            fetchPortfolio();
            fetchUserSummary();
        }
    }, [targetUserId, fetchWorkHistory, fetchWorkSummary, fetchSkills, fetchAchievements, fetchPortfolio, fetchUserSummary]);

    return {
        workHistory,
        workSummary,
        skills,
        achievements,
        portfolio,
        userSummary,
        loading,
        error,
        refresh: () => {
            fetchWorkHistory();
            fetchWorkSummary();
            fetchSkills();
            fetchAchievements();
            fetchPortfolio();
            fetchUserSummary();
        },
        fetchWorkHistory,
        fetchSkills,
        fetchAchievements,
        fetchPortfolio,
    };
}
