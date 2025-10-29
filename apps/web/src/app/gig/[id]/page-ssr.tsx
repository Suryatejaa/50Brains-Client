import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  SSRGigWrapper,
  generateGigMetadata,
} from '@/components/gig/ssr/SSRGigWrapper';
import { GigDetailClient } from './GigDetailClient';

// Real SSR data fetching from backend API
async function getGigData(gigId: string) {
  try {
    // Create API client for server-side use
    const { createAPIClient } = await import('@50brains/api-client');
    const apiClient = createAPIClient({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
      timeout: 10000,
    });

    // Fetch gig data from the backend
    const response = await apiClient.gigs.getGigById(gigId);
    return response;
  } catch (error: any) {
    console.error('Failed to fetch gig data:', error);

    // Return null for 404 or other errors - this will trigger notFound()
    if (error?.statusCode === 404 || error?.status === 404) {
      return null;
    }

    // For other errors, also return null to trigger 404 page
    return null;
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
      return null; // Not authenticated
    }

    // For SSR, we'll get the role from the user profile API
    const { createAPIClient } = await import('@50brains/api-client');
    const apiClient = createAPIClient({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
      timeout: 10000,
    });

    try {
      const user = await apiClient.auth.getCurrentUser();
      // Determine primary role based on user data
      if (user.roles?.includes('BRAND' as any)) return 'brand';
      if (user.roles?.includes('INFLUENCER' as any)) return 'influencer';
      if (user.roles?.includes('CREW' as any)) return 'crew';
      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  } catch (error) {
    console.error('Failed to get user role:', error);
    return null;
  }
}

// Check if user owns the gig - real implementation
async function checkGigOwnership(gigData: any, userRole: string | null) {
  if (!userRole || !gigData) {
    return false;
  }

  try {
    // Get current user ID to compare with gig owner
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    const accessToken = cookieStore.get('access_token');
    if (!accessToken) {
      return false;
    }

    const { createAPIClient } = await import('@50brains/api-client');
    const apiClient = createAPIClient({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
      timeout: 10000,
    });

    try {
      const user = await apiClient.auth.getCurrentUser();

      // Check if current user ID matches the gig poster ID
      return (
        user.id === (gigData as any).postedById ||
        user.id === (gigData as any).posterId ||
        user.id === (gigData as any).brand?.id
      );
    } catch (error) {
      console.error('Failed to get current user for ownership check:', error);
      return false;
    }
  } catch (error) {
    console.error('Failed to check gig ownership:', error);
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
  const gigData = await getGigData(id);

  if (!gigData) {
    return {
      title: 'Gig Not Found | 50Brains',
      description: 'The requested gig could not be found.',
    };
  }

  return generateGigMetadata(gigData);
}

// Main SSR Page Component
export default async function GigDetailPageSSR({ params }: PageProps) {
  const { id: gigId } = await params;

  // Fetch data server-side
  const [gigData, userRole] = await Promise.all([
    getGigData(gigId),
    getUserRole(),
  ]);

  // Handle not found
  if (!gigData) {
    notFound();
  }

  // Check ownership
  const isOwner = await checkGigOwnership(gigData, userRole);

  return (
    <SSRGigWrapper
      gigId={gigId}
      gigData={gigData}
      userRole={userRole}
      isOwner={isOwner}
    >
      {/* Progressive Enhancement - Client Component */}
      <GigDetailClient
        gigId={gigId}
        initialGigData={gigData as any}
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
