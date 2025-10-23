// hooks/useClanGigPlan.ts
import { useState, useCallback } from 'react';
import { clanApiClient } from '@/lib/clan-api';
import { isFeatureEnabled } from '@/utils/feature-flags';
import type {
  MemberAgreement,
  CreateClanGigPlanRequest,
  ClanWorkPackage,
  CreateClanTaskRequest,
  UpdateClanTaskRequest,
} from '@/types/clan.types';

export const useClanGigPlan = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Early return with disabled functionality if clans are not enabled
  if (!isFeatureEnabled('CLANS_ENABLED')) {
    return {
      createGigPlan: async () => null,
      createClanTask: async () => null,
      updateClanTask: async () => null,
      getClanTasks: async () => null,
      getClanGigAssignments: async () => null,
      getClanMemberAgreements: async () => null,
      loading: false,
      error: null,
      clearError: () => {},
    };
  }

  const createGigPlan = useCallback(
    async (
      clanId: string,
      gigId: string,
      data: CreateClanGigPlanRequest
    ): Promise<MemberAgreement[] | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await clanApiClient.createClanGigPlan(
          clanId,
          gigId,
          data
        );
        return result.data as MemberAgreement[];
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to create gig plan'
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createClanTask = useCallback(
    async (
      clanId: string,
      gigId: string,
      data: CreateClanTaskRequest
    ): Promise<ClanWorkPackage | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await clanApiClient.createClanTask(clanId, gigId, data);
        return result.data as ClanWorkPackage;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to create clan task'
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateClanTask = useCallback(
    async (
      clanId: string,
      gigId: string,
      taskId: string,
      data: UpdateClanTaskRequest
    ): Promise<ClanWorkPackage | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await clanApiClient.updateClanTask(
          clanId,
          gigId,
          taskId,
          data
        );
        return result.data as ClanWorkPackage;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update clan task'
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getClanTasks = useCallback(
    async (
      clanId: string,
      gigId: string
    ): Promise<ClanWorkPackage[] | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await clanApiClient.getClanTasks(clanId, gigId);
        return result.data as ClanWorkPackage[];
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch clan tasks'
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getClanGigAssignments = useCallback(async (clanId: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await clanApiClient.getClanGigAssignments(clanId);
      return result.data;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch clan gig assignments'
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getClanMemberAgreements = useCallback(
    async (
      clanId: string,
      gigId: string
    ): Promise<MemberAgreement[] | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await clanApiClient.getClanMemberAgreements(
          clanId,
          gigId
        );
        return result.data as MemberAgreement[];
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch member agreements'
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createGigPlan,
    createClanTask,
    updateClanTask,
    getClanTasks,
    getClanGigAssignments,
    getClanMemberAgreements,
    loading,
    error,
    clearError,
  };
};
