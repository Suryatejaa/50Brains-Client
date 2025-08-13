// hooks/useClanGigWorkflow.ts
import { useState, useCallback, useEffect } from 'react';
import { clanApiClient } from '@/lib/clan-api';
import { GigAPI } from '@/lib/gig-api';
import type {
    GigAssignment,
    GigMilestone,
    GigTask,
    MemberAgreement
} from '@/types/gig.types';

export const useClanGigWorkflow = (clanId: string, gigId?: string) => {
    const [assignments, setAssignments] = useState<GigAssignment[]>([]);
    const [milestones, setMilestones] = useState<GigMilestone[]>([]);
    const [tasks, setTasks] = useState<GigTask[]>([]);
    const [memberAgreements, setMemberAgreements] = useState<MemberAgreement[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all gig assignments for the clan
    const fetchAssignments = useCallback(async () => {
        if (!clanId) return;

        try {
            setLoading(true);
            setError(null);
            console.log('🔍 Fetching gig assignments for clan:', clanId);
            const result = await clanApiClient.getClanGigAssignments(clanId);
            console.log('📊 Gig assignments result:', result);
            setAssignments(result.data as GigAssignment[] || []);
        } catch (err) {
            console.error('❌ Failed to fetch gig assignments:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch assignments');
        } finally {
            setLoading(false);
        }
    }, [clanId]);

    // Fetch milestones for a specific gig
    const fetchMilestones = useCallback(async () => {
        if (!gigId) return;

        try {
            setLoading(true);
            setError(null);
            const result = await GigAPI.getGigMilestones(gigId);
            setMilestones(result || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch milestones');
        } finally {
            setLoading(false);
        }
    }, [gigId]);

    // Fetch tasks for a specific gig
    const fetchTasks = useCallback(async () => {
        if (!gigId) return;

        try {
            setLoading(true);
            setError(null);
            const result = await GigAPI.getGigTasks(gigId);
            setTasks(result || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    }, [gigId]);

    // Fetch member agreements for a specific gig
    const fetchMemberAgreements = useCallback(async () => {
        if (!clanId || !gigId) return;

        try {
            setLoading(true);
            setError(null);
            const result = await clanApiClient.getClanMemberAgreements(clanId, gigId);
            setMemberAgreements(result.data as MemberAgreement[] || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch member agreements');
        } finally {
            setLoading(false);
        }
    }, [clanId, gigId]);

    // Auto-fetch data when dependencies change
    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    useEffect(() => {
        if (gigId) {
            fetchMilestones();
            fetchTasks();
            fetchMemberAgreements();
        }
    }, [gigId, fetchMilestones, fetchTasks, fetchMemberAgreements]);

    return {
        // State
        assignments,
        milestones,
        tasks,
        memberAgreements,
        loading,
        error,

        // Actions
        fetchAssignments,
        fetchMilestones,
        fetchTasks,
        fetchMemberAgreements,

        // Computed values
        activeAssignments: assignments.filter(a => a.status === 'ACTIVE'),
        completedAssignments: assignments.filter(a => a.status === 'COMPLETED'),
        pendingMilestones: milestones.filter(m => m.status === 'PENDING'),
        inProgressMilestones: milestones.filter(m => m.status === 'IN_PROGRESS'),
        submittedMilestones: milestones.filter(m => m.status === 'SUBMITTED'),
        approvedMilestones: milestones.filter(m => m.status === 'APPROVED'),
    };
};
