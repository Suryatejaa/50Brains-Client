// hooks/useGigs.ts - Custom hook for gig management across all roles

import { useState, useEffect, useCallback } from 'react';
import { GigAPI } from '@/lib/gig-api';
import type {
  Gig,
  CreateGigData,
  Application,
  CreateApplicationData,
  Submission,
  CreateSubmissionData,
  GigFilters,
  GigStats,
  GigBoostEvent,
  GigApiResponse,
} from '@/types/gig.types';

export interface UseGigsState {
  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  applying: boolean;
  submitting: boolean;

  // Data
  gigs: Gig[];
  myPostedGigs: Gig[];
  myDraftGigs: Gig[];
  myApplications: Application[];
  myActiveGigs: Gig[];
  myCompletedGigs: Gig[];
  gigStats: GigStats | null;

  // Single gig data
  currentGig: Gig | null;
  gigApplications: Application[];
  gigSubmissions: Submission[];
  gigBoosts: GigBoostEvent[];

  // Categories and skills
  categories: string[];
  popularSkills: string[];

  // Error state
  error: string | null;
}

export const useGigs = () => {
  const [state, setState] = useState<UseGigsState>({
    loading: false,
    creating: false,
    updating: false,
    deleting: false,
    applying: false,
    submitting: false,
    gigs: [],
    myPostedGigs: [],
    myDraftGigs: [],
    myApplications: [],
    myActiveGigs: [],
    myCompletedGigs: [],
    gigStats: null,
    currentGig: null,
    gigApplications: [],
    gigSubmissions: [],
    gigBoosts: [],
    categories: [],
    popularSkills: [],
    error: null,
  });

  // Helper function to update state
  const updateState = useCallback((updates: Partial<UseGigsState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Helper function to handle errors
  const handleError = useCallback(
    (error: any, operation: string) => {
      console.error(`Gig ${operation} error:`, error);
      updateState({
        error: error.message || `Failed to ${operation}`,
        loading: false,
        creating: false,
        updating: false,
        deleting: false,
        applying: false,
        submitting: false,
      });
    },
    [updateState]
  );

  // Public Gig Discovery
  const loadPublicGigs = useCallback(
    async (filters?: GigFilters) => {
      try {
        updateState({ loading: true, error: null });
        const result: GigApiResponse = await GigAPI.getAllGigs();
        console.log('API Response:', result);
        updateState({
          gigs: result.gigs || [],
          loading: false,
        });
        return result;
      } catch (error) {
        handleError(error, 'load public gigs');
        throw error;
      }
    },
    [updateState, handleError]
  );

  const searchGigs = useCallback(
    async (query: string, filters?: GigFilters) => {
      try {
        updateState({ loading: true, error: null });
        const result = await GigAPI.searchGigs(query, filters);
        updateState({
          gigs: result.gigs,
          loading: false,
        });
        return result;
      } catch (error) {
        handleError(error, 'search gigs');
        throw error;
      }
    },
    [updateState, handleError]
  );

  const loadFeaturedGigs = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });
      const gigs = await GigAPI.getFeaturedGigs();
      updateState({
        gigs,
        loading: false,
      });
      return gigs;
    } catch (error) {
      handleError(error, 'load featured gigs');
      throw error;
    }
  }, [updateState, handleError]);

  // Gig Management
  const createGig = useCallback(
    async (data: CreateGigData) => {
      try {
        updateState({ creating: true, error: null });
        const gig = await GigAPI.createGig(data);
        console.log('Created gig:', gig);
        updateState({
          currentGig: gig,
          myPostedGigs: [...state.myPostedGigs, gig],
          creating: false,
        });
        return gig;
      } catch (error) {
        console.log(error);
        handleError(error, 'create gig');
        throw error;
      }
    },
    [state.myPostedGigs, updateState, handleError]
  );

  const createDraftGig = useCallback(
    async (data: CreateGigData) => {
      try {
        updateState({ creating: true, error: null });
        const gig = await GigAPI.createDraftGig(data);
        updateState({
          currentGig: gig,
          myDraftGigs: [...state.myDraftGigs, gig],
          creating: false,
        });
        return gig;
      } catch (error) {
        handleError(error, 'create draft gig');
        throw error;
      }
    },
    [state.myDraftGigs, updateState, handleError]
  );

  const updateGig = useCallback(
    async (gigId: string, data: Partial<CreateGigData>) => {
      try {
        updateState({ updating: true, error: null });
        const gig = await GigAPI.updateGig(gigId, data);
        updateState({
          currentGig: gig,
          myPostedGigs: state.myPostedGigs.map((g) =>
            g.id === gigId ? gig : g
          ),
          updating: false,
        });
        return gig;
      } catch (error) {
        handleError(error, 'update gig');
        throw error;
      }
    },
    [state.myPostedGigs, updateState, handleError]
  );

  const deleteGig = useCallback(
    async (gigId: string) => {
      try {
        updateState({ deleting: true, error: null });
        await GigAPI.deleteGig(gigId);
        updateState({
          myPostedGigs: state.myPostedGigs.filter((g) => g.id !== gigId),
          myDraftGigs: state.myDraftGigs.filter((g) => g.id !== gigId),
          currentGig: state.currentGig?.id === gigId ? null : state.currentGig,
          deleting: false,
        });
      } catch (error) {
        handleError(error, 'delete gig');
        throw error;
      }
    },
    [
      state.myPostedGigs,
      state.myDraftGigs,
      state.currentGig,
      updateState,
      handleError,
    ]
  );

  const loadGig = useCallback(
    async (gigId: string) => {
      try {
        updateState({ loading: true, error: null });
        const gig = await GigAPI.getGig(gigId);
        updateState({
          currentGig: gig,
          loading: false,
        });
        return gig;
      } catch (error) {
        handleError(error, 'load gig');
        throw error;
      }
    },
    [updateState, handleError]
  );

  const publishGig = useCallback(
    async (gigId: string) => {
      try {
        updateState({ updating: true, error: null });
        const gig = await GigAPI.publishGig(gigId);
        updateState({
          currentGig: gig,
          myPostedGigs: state.myPostedGigs.map((g) =>
            g.id === gigId ? gig : g
          ),
          myDraftGigs: state.myDraftGigs.filter((g) => g.id !== gigId),
          updating: false,
        });
        return gig;
      } catch (error) {
        handleError(error, 'publish gig');
        throw error;
      }
    },
    [state.myPostedGigs, state.myDraftGigs, updateState, handleError]
  );

  const closeGig = useCallback(
    async (gigId: string) => {
      try {
        updateState({ updating: true, error: null });
        const gig = await GigAPI.closeGig(gigId);
        updateState({
          currentGig: gig,
          myPostedGigs: state.myPostedGigs.map((g) =>
            g.id === gigId ? gig : g
          ),
          updating: false,
        });
        return gig;
      } catch (error) {
        handleError(error, 'close gig');
        throw error;
      }
    },
    [state.myPostedGigs, updateState, handleError]
  );

  // My Data Loading - Updated for pagination
  const loadMyPostedGigs = useCallback(async (options?: {
    page?: number;
    limit?: number;
    status?: string[];
    search?: string;
    sortBy?: string;
    sort?: 'asc' | 'desc';
  }) => {
    try {
      updateState({ loading: true, error: null });
      const result = await GigAPI.getMyPostedGigs(options);
      updateState({
        myPostedGigs: result.gigs,
        loading: false,
      });
      return result;
    } catch (error) {
      handleError(error, 'load my posted gigs');
      throw error;
    }
  }, [updateState, handleError]);

  const loadMyDraftGigs = useCallback(async (options?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sort?: 'asc' | 'desc';
  }) => {
    try {
      updateState({ loading: true, error: null });
      const result = await GigAPI.getMyDraftGigs(options);
      updateState({
        myDraftGigs: result.gigs,
        loading: false,
      });
      return result;
    } catch (error) {
      handleError(error, 'load my draft gigs');
      throw error;
    }
  }, [updateState, handleError]);

  const loadMyApplications = useCallback(async (options?: {
    page?: number;
    limit?: number;
    status?: string[];
    search?: string;
    sortBy?: string;
    sort?: 'asc' | 'desc';
  }) => {
    try {
      updateState({ loading: true, error: null });
      const result = await GigAPI.getMyApplications(options);
      updateState({
        myApplications: result.applications,
        loading: false,
      });
      return result;
    } catch (error) {
      handleError(error, 'load my applications');
      throw error;
    }
  }, [updateState, handleError]);

  const loadMyActiveGigs = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });
      const gigs = await GigAPI.getMyActiveGigs();
      updateState({
        myActiveGigs: gigs,
        loading: false,
      });
      return gigs;
    } catch (error) {
      handleError(error, 'load my active gigs');
      throw error;
    }
  }, [updateState, handleError]);

  const loadMyCompletedGigs = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });
      const gigs = await GigAPI.getMyCompletedGigs();
      updateState({
        myCompletedGigs: gigs,
        loading: false,
      });
      return gigs;
    } catch (error) {
      handleError(error, 'load my completed gigs');
      throw error;
    }
  }, [updateState, handleError]);

  const loadMyGigStats = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });
      const stats = await GigAPI.getMyGigStats();
      updateState({
        gigStats: stats,
        loading: false,
      });
      return stats;
    } catch (error) {
      handleError(error, 'load my gig stats');
      throw error;
    }
  }, [updateState, handleError]);

  // Application Management
  const applyToGig = useCallback(
    async (gigId: string, data: CreateApplicationData) => {
      try {
        updateState({ applying: true, error: null });
        const application = await GigAPI.applyToGig(gigId, data);
        updateState({
          myApplications: [...state.myApplications, application],
          applying: false,
        });
        return application;
      } catch (error) {
        handleError(error, 'apply to gig');
        throw error;
      }
    },
    [state.myApplications, updateState, handleError]
  );

  const updateApplication = useCallback(
    async (applicationId: string, data: Partial<CreateApplicationData>) => {
      try {
        updateState({ updating: true, error: null });
        const application = await GigAPI.updateApplication(applicationId, data);
        updateState({
          myApplications: state.myApplications.map((a) =>
            a.id === applicationId ? application : a
          ),
          updating: false,
        });
        return application;
      } catch (error) {
        handleError(error, 'update application');
        throw error;
      }
    },
    [state.myApplications, updateState, handleError]
  );

  const withdrawApplication = useCallback(
    async (applicationId: string) => {
      try {
        updateState({ deleting: true, error: null });
        await GigAPI.withdrawApplication(applicationId);
        updateState({
          myApplications: state.myApplications.filter(
            (a) => a.id !== applicationId
          ),
          deleting: false,
        });
      } catch (error) {
        handleError(error, 'withdraw application');
        throw error;
      }
    },
    [state.myApplications, updateState, handleError]
  );

  const loadGigApplications = useCallback(
    async (gigId: string) => {
      try {
        updateState({ loading: true, error: null });
        const applications = await GigAPI.getGigApplications(gigId);
        updateState({
          gigApplications: applications,
          loading: false,
        });
        return applications;
      } catch (error) {
        handleError(error, 'load gig applications');
        throw error;
      }
    },
    [updateState, handleError]
  );

  const approveApplication = useCallback(
    async (applicationId: string) => {
      try {
        updateState({ updating: true, error: null });
        const application = await GigAPI.approveApplication(applicationId);
        updateState({
          gigApplications: state.gigApplications.map((a) =>
            a.id === applicationId ? application : a
          ),
          updating: false,
        });
        return application;
      } catch (error) {
        handleError(error, 'approve application');
        throw error;
      }
    },
    [state.gigApplications, updateState, handleError]
  );

  const rejectApplication = useCallback(
    async (applicationId: string, reason?: string) => {
      try {
        updateState({ updating: true, error: null });
        const application = await GigAPI.rejectApplication(
          applicationId,
          reason
        );
        updateState({
          gigApplications: state.gigApplications.map((a) =>
            a.id === applicationId ? application : a
          ),
          updating: false,
        });
        return application;
      } catch (error) {
        handleError(error, 'reject application');
        throw error;
      }
    },
    [state.gigApplications, updateState, handleError]
  );

  // Submission Management
  const createSubmission = useCallback(
    async (gigId: string, data: CreateSubmissionData) => {
      try {
        updateState({ submitting: true, error: null });
        const submission = await GigAPI.createSubmission(gigId, data);
        updateState({
          gigSubmissions: [...state.gigSubmissions, submission],
          submitting: false,
        });
        return submission;
      } catch (error) {
        handleError(error, 'create submission');
        throw error;
      }
    },
    [state.gigSubmissions, updateState, handleError]
  );

  const updateSubmission = useCallback(
    async (submissionId: string, data: Partial<CreateSubmissionData>) => {
      try {
        updateState({ updating: true, error: null });
        const submission = await GigAPI.updateSubmission(submissionId, data);
        updateState({
          gigSubmissions: state.gigSubmissions.map((s) =>
            s.id === submissionId ? submission : s
          ),
          updating: false,
        });
        return submission;
      } catch (error) {
        handleError(error, 'update submission');
        throw error;
      }
    },
    [state.gigSubmissions, updateState, handleError]
  );

  const loadGigSubmissions = useCallback(
    async (gigId: string) => {
      try {
        updateState({ loading: true, error: null });
        const submissions = await GigAPI.getGigSubmissions(gigId);
        updateState({
          gigSubmissions: submissions,
          loading: false,
        });
        return submissions;
      } catch (error) {
        handleError(error, 'load gig submissions');
        throw error;
      }
    },
    [updateState, handleError]
  );

  const approveSubmission = useCallback(
    async (submissionId: string, rating?: number, feedback?: string) => {
      try {
        updateState({ updating: true, error: null });
        const submission = await GigAPI.approveSubmission(
          submissionId,
          rating,
          feedback
        );
        updateState({
          gigSubmissions: state.gigSubmissions.map((s) =>
            s.id === submissionId ? submission : s
          ),
          updating: false,
        });
        return submission;
      } catch (error) {
        handleError(error, 'approve submission');
        throw error;
      }
    },
    [state.gigSubmissions, updateState, handleError]
  );

  const rejectSubmission = useCallback(
    async (submissionId: string, feedback: string) => {
      try {
        updateState({ updating: true, error: null });
        const submission = await GigAPI.rejectSubmission(
          submissionId,
          feedback
        );
        updateState({
          gigSubmissions: state.gigSubmissions.map((s) =>
            s.id === submissionId ? submission : s
          ),
          updating: false,
        });
        return submission;
      } catch (error) {
        handleError(error, 'reject submission');
        throw error;
      }
    },
    [state.gigSubmissions, updateState, handleError]
  );

  const requestRevision = useCallback(
    async (submissionId: string, feedback: string) => {
      try {
        updateState({ updating: true, error: null });
        const submission = await GigAPI.requestRevision(submissionId, feedback);
        updateState({
          gigSubmissions: state.gigSubmissions.map((s) =>
            s.id === submissionId ? submission : s
          ),
          updating: false,
        });
        return submission;
      } catch (error) {
        handleError(error, 'request revision');
        throw error;
      }
    },
    [state.gigSubmissions, updateState, handleError]
  );

  // Gig Boosting
  const boostGig = useCallback(
    async (gigId: string, amount: number, duration: number) => {
      try {
        updateState({ updating: true, error: null });
        const boostEvent = await GigAPI.boostGig(gigId, amount, duration);
        updateState({
          gigBoosts: [...state.gigBoosts, boostEvent],
          updating: false,
        });
        return boostEvent;
      } catch (error) {
        handleError(error, 'boost gig');
        throw error;
      }
    },
    [state.gigBoosts, updateState, handleError]
  );

  const loadGigBoosts = useCallback(
    async (gigId: string) => {
      try {
        updateState({ loading: true, error: null });
        const boosts = await GigAPI.getGigBoosts(gigId);
        updateState({
          gigBoosts: boosts,
          loading: false,
        });
        return boosts;
      } catch (error) {
        handleError(error, 'load gig boosts');
        throw error;
      }
    },
    [updateState, handleError]
  );

  // Categories and Skills
  const loadCategories = useCallback(async () => {
    try {
      const categories = await GigAPI.getCategories();
      updateState({ categories });
      return categories;
    } catch (error) {
      handleError(error, 'load categories');
      throw error;
    }
  }, [updateState, handleError]);

  const loadPopularSkills = useCallback(async () => {
    try {
      const skills = await GigAPI.getPopularSkills();
      updateState({ popularSkills: skills });
      return skills;
    } catch (error) {
      handleError(error, 'load popular skills');
      throw error;
    }
  }, [updateState, handleError]);

  // Load initial data
  useEffect(() => {
    loadCategories();
    loadPopularSkills();
  }, [loadCategories, loadPopularSkills]);

  return {
    // State
    ...state,

    // Public discovery
    loadPublicGigs,
    searchGigs,
    loadFeaturedGigs,

    // Gig management
    createGig,
    createDraftGig,
    updateGig,
    deleteGig,
    loadGig,
    publishGig,
    closeGig,

    // My data
    loadMyPostedGigs,
    loadMyDraftGigs,
    loadMyApplications,
    loadMyActiveGigs,
    loadMyCompletedGigs,
    loadMyGigStats,

    // Applications
    applyToGig,
    updateApplication,
    withdrawApplication,
    loadGigApplications,
    approveApplication,
    rejectApplication,

    // Submissions
    createSubmission,
    updateSubmission,
    loadGigSubmissions,
    approveSubmission,
    rejectSubmission,
    requestRevision,

    // Boosting
    boostGig,
    loadGigBoosts,

    // Categories and skills
    loadCategories,
    loadPopularSkills,
  };
};

export default useGigs;
