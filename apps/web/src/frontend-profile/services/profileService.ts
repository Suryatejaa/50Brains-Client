// services/profileService.ts - Server-side data fetching
import { CompleteProfileData } from '../types/profile.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function getProfileData(
  userId: string
): Promise<CompleteProfileData | null> {
  try {
    // Fetch all profile data in parallel on the server
    const [
      userResponse,
      workHistoryResponse,
      analyticsResponse,
      reputationResponse,
    ] = await Promise.allSettled([
      fetch(`${API_BASE_URL}/api/user/public/users/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 }, // Cache for 60 seconds
      }),
      fetch(`${API_BASE_URL}/api/work-history/users/${userId}/summary`, {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }),
      fetch(`${API_BASE_URL}/api/analytics/user-insights/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 600 }, // Cache for 10 minutes
      }),
      fetch(`${API_BASE_URL}/api/reputation/users/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }),
    ]);

    // Process responses with fallbacks
    const userData =
      userResponse.status === 'fulfilled' && userResponse.value.ok
        ? await userResponse.value.json()
        : null;

    const workHistoryData =
      workHistoryResponse.status === 'fulfilled' && workHistoryResponse.value.ok
        ? await workHistoryResponse.value.json()
        : null;

    const analyticsData =
      analyticsResponse.status === 'fulfilled' && analyticsResponse.value.ok
        ? await analyticsResponse.value.json()
        : null;

    const reputationData =
      reputationResponse.status === 'fulfilled' && reputationResponse.value.ok
        ? await reputationResponse.value.json()
        : null;

    if (!userData || !userData.success) {
      return null;
    }

    return {
      user: userData.data.user || userData.data,
      // workHistory: workHistoryData?.success ? workHistoryData.data : null,
      analytics: analyticsData?.success ? analyticsData.data : null,
      // reputation: reputationData?.success ? reputationData.data : null,
    };
  } catch (error) {
    console.error('Server-side profile fetch error:', error);
    return null;
  }
}

export async function getCurrentUserProfile(): Promise<CompleteProfileData | null> {
  // This would need authentication context on the server
  // For now, return null and handle in client component
  return null;
}
