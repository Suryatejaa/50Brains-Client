import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  SSRGigWrapper,
  generateGigMetadata,
} from '@/components/gig/ssr/SSRGigWrapper';
import { GigDetailClient } from './GigDetailClient';

// SSR data fetching - with credentials support
async function getGigData(gigId: string) {
  try {
    const baseURL =
      process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    console.log('🌐 SSR: Fetching gig data for:', gigId);

    // Try authenticated API call first with credentials
    const response = await fetch(`${baseURL}/api/gig/${gigId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Cookie: cookieStore.toString(), // Pass all cookies
      },
      credentials: 'include', // Include cookies
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ SSR: Successfully fetched gig data');
      return data.data || data;
    } else if (response.status === 404) {
      console.log('🚫 SSR: Gig not found (404)');
      return null; // Will trigger notFound()
    } else {
      console.log('⚠️ SSR: API call failed with status:', response.status);
      // For auth errors, return placeholder and let client handle
      return {
        id: gigId,
        title: 'Loading...',
        description: 'Loading gig details...',
        status: 'LOADING',
        _isSSRPlaceholder: true,
      };
    }
  } catch (error: any) {
    console.error('🚨 SSR: Error in getGigData:', error);
    // Return placeholder on error, let client handle
    return {
      id: gigId,
      title: 'Loading...',
      description: 'Loading gig details...',
      status: 'LOADING',
      _isSSRPlaceholder: true,
    };
  }
}

// Get user role for SSR - using server-side auth context
async function getUserRole() {
  try {
    // In server-side context, get auth from cookies
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    // Check if user is authenticated by looking for auth cookies
    const accessToken = cookieStore.get('access_token');
    if (!accessToken) {
      console.log('🔒 SSR: No access token found, user not authenticated');
      return null; // Not authenticated
    }

    // For SSR, try to get user role but don't fail if auth fails
    try {
      const baseURL =
        process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseURL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieStore.toString(), // Pass cookies for authentication
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const userData = await response.json();
        const user = userData.data || userData;

        // Determine primary role based on user data
        if (user.roles?.includes('BRAND')) return 'brand';
        if (user.roles?.includes('INFLUENCER')) return 'influencer';
        if (user.roles?.includes('CREW')) return 'crew';
        return null;
      } else {
        console.log('🔒 SSR: Failed to authenticate user:', response.status);
        return null;
      }
    } catch (error) {
      console.error('🚨 SSR: Failed to get current user:', error);
      return null;
    }
  } catch (error) {
    console.error('🚨 SSR: Failed to get user role:', error);
    return null;
  }
}

// Check if user owns the gig - real implementation
async function checkGigOwnership(gigData: any, userRole: string | null) {
  if (!userRole || !gigData) {
    console.log('🔒 SSR: No user role or gig data for ownership check');
    return false;
  }

  try {
    // Get current user ID to compare with gig owner
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    const accessToken = cookieStore.get('access_token');
    if (!accessToken) {
      console.log('🔒 SSR: No access token for ownership check');
      return false;
    }

    try {
      const baseURL =
        process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseURL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieStore.toString(), // Pass cookies for authentication
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const userData = await response.json();
        const user = userData.data || userData;

        // Check if current user ID matches the gig poster ID
        const isOwner =
          user.id === (gigData as any).postedById ||
          user.id === (gigData as any).posterId ||
          user.id === (gigData as any).brand?.id;

        console.log('🔍 SSR: Ownership check result:', isOwner);
        return isOwner;
      } else {
        console.log(
          '🔒 SSR: Failed to authenticate for ownership check:',
          response.status
        );
        return false;
      }
    } catch (error) {
      console.error(
        '🚨 SSR: Failed to get current user for ownership check:',
        error
      );
      return false;
    }
  } catch (error) {
    console.error('🚨 SSR: Failed to check gig ownership:', error);
    return false;
  }
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  // For SSR metadata, provide basic SEO without requiring API call
  // Client-side will handle dynamic updates if needed
  return {
    title: 'Gig Details | 50Brains',
    description:
      'View gig details and apply for opportunities on 50Brains platform.',
    openGraph: {
      title: 'Gig Details | 50Brains',
      description:
        'View gig details and apply for opportunities on 50Brains platform.',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: 'Gig Details | 50Brains',
      description:
        'View gig details and apply for opportunities on 50Brains platform.',
    },
  };
}

// Main SSR Page Component
export default async function GigDetailPageSSR({ params }: PageProps) {
  const { id: gigId } = await params;

  // Get SSR placeholder data and auth context
  const [gigData, userRole] = await Promise.all([
    getGigData(gigId),
    getUserRole(),
  ]);

  // Handle not found case
  if (gigData === null) {
    notFound();
  }

  // If no gigData, provide a minimal structure for SSR
  const ssrGigData = gigData || {
    id: gigId,
    title: 'Loading...',
    description: 'Loading gig details...',
    status: 'LOADING',
    _isSSRPlaceholder: true,
  };

  // Check ownership for SSR
  const isOwner = await checkGigOwnership(ssrGigData, userRole);

  return (
    <SSRGigWrapper
      gigId={gigId}
      gigData={ssrGigData}
      userRole={userRole}
      isOwner={isOwner}
    >
      {/* Progressive Enhancement - Client Component handles real data */}
      <GigDetailClient
        gigId={gigId}
        initialGigData={ssrGigData as any}
        userRole={userRole}
        isOwner={isOwner}
      />
    </SSRGigWrapper>
  );
}

// Static params generation for build optimization
export async function generateStaticParams() {
  // In a real implementation, you might pre-generate popular gig IDs
  // For now, return empty array to generate pages on-demand
  return [];
}

// Revalidate strategy for SSR
export const revalidate = 60; // Revalidate every 60 seconds
