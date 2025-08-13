// hooks/useGigApplication.ts
import { useState, useCallback } from 'react';
import { GigAPI } from '@/lib/gig-api';
import type { Application, CreateApplicationData } from '@/types/gig.types';

export const useGigApplication = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const applyToGig = useCallback(async (
        gigId: string,
        data: CreateApplicationData
    ): Promise<Application | null> => {
        setLoading(true);
        setError(null);

        try {
            const result = await GigAPI.applyToGig(gigId, data);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to apply to gig');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createMilestone = useCallback(async (
        gigId: string,
        data: {
            title: string;
            description?: string;
            dueAt: string;
            amount: number;
            deliverables: string[];
        }
    ) => {
        setLoading(true);
        setError(null);

        try {
            const result = await GigAPI.createMilestone(gigId, data);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create milestone');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const submitMilestone = useCallback(async (
        gigId: string,
        milestoneId: string,
        data: {
            deliverables: string[];
            notes?: string;
        }
    ) => {
        setLoading(true);
        setError(null);

        try {
            const result = await GigAPI.submitMilestone(gigId, milestoneId, data);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit milestone');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const approveMilestone = useCallback(async (
        gigId: string,
        milestoneId: string,
        data: {
            feedback?: string;
        }
    ) => {
        setLoading(true);
        setError(null);

        try {
            const result = await GigAPI.approveMilestone(gigId, milestoneId, data);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to approve milestone');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createTask = useCallback(async (
        gigId: string,
        data: {
            title: string;
            description?: string;
            assigneeUserId: string;
            milestoneId?: string;
            estimatedHours?: number;
            deliverables: string[];
        }
    ) => {
        setLoading(true);
        setError(null);

        try {
            const result = await GigAPI.createTask(gigId, data);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create task');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateTask = useCallback(async (
        gigId: string,
        taskId: string,
        data: {
            title?: string;
            description?: string;
            assigneeUserId?: string;
            status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
            estimatedHours?: number;
            actualHours?: number;
            deliverables?: string[];
            notes?: string;
        }
    ) => {
        setLoading(true);
        setError(null);

        try {
            const result = await GigAPI.updateTask(gigId, taskId, data);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update task');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        applyToGig,
        createMilestone,
        submitMilestone,
        approveMilestone,
        createTask,
        updateTask,
        loading,
        error,
        clearError,
    };
};
