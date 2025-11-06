import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import GigDeliveriesClient from './GigDeliveriesClient';

interface Delivery {
  id: string;
  title: string;
  description: string;
  files: Array<{
    id: string;
    filename: string;
    url: string;
    size: number;
  }>;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  feedback?: string;
  reviewNotes?: string;
  createdAt: string;
  reviewedAt?: string;
  version: number;
  applicationId: string;
}

interface Application {
  id: string;
  applicantName: string;
  applicantType: 'user' | 'clan';
  applicantId: string;
  status: string;
  createdAt: string;
  quotedPrice?: number;
  estimatedTime?: string;
  deliveries: Delivery[];
  applicant?: {
    id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    profilePicture?: string;
  };
  clan?: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
}

interface Gig {
  id: string;
  title: string;
  description: string;
  status: string;
  brand?: {
    id: string;
    name: string;
    logo?: string;
  };
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  currentRole?: string;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Server-side data fetching
async function getGigData(gigId: string, token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/gig/${gigId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always fetch fresh data
      }
    );

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Failed to fetch gig data:', error);
    return null;
  }
}

async function getApplicationsWithDeliveries(gigId: string, token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/gig/${gigId}/applications-with-deliveries`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always fetch fresh data
      }
    );

    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Failed to fetch applications with deliveries:', error);
    return [];
  }
}

async function getUserData(token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    return null;
  }
}

export default async function GigDeliveriesPage({ params }: PageProps) {
  const resolvedParams = await params;
  const gigId = resolvedParams.id;
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  // Redirect if not authenticated
  if (!token) {
    redirect('/login');
  }

  // Fetch user data first to check authorization
  const user = await getUserData(token);
  if (!user) {
    redirect('/login');
  }

  // Fetch gig data
  const gig = await getGigData(gigId, token);
  if (!gig) {
    redirect('/my-gigs');
  }

  // Check if user is authorized (brand user or gig owner)
  const userType = user.currentRole === 'brand' ? 'brand' : 'creator';
  const isGigOwner = gig.brand?.id === user.id;
  const isBrandUser = userType === 'brand';
  const isAuthorized = isBrandUser || isGigOwner;

  if (!isAuthorized) {
    redirect('/dashboard');
  }

  // Fetch applications with deliveries
  const applications = await getApplicationsWithDeliveries(gigId, token);

  // Calculate statistics
  const totalDeliveries = applications.reduce(
    (sum: number, app: Application) => sum + app.deliveries.length,
    0
  );
  const pendingDeliveries = applications.reduce(
    (sum: number, app: Application) =>
      sum +
      app.deliveries.filter((d: Delivery) => d.status === 'PENDING').length,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Server-rendered Header */}
        <div className="mb-6">
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Delivery Reviews
            </h1>
            <p className="text-gray-600">{gig.title}</p>

            <div className="mt-4 flex space-x-6">
              <div className="text-sm">
                <span className="font-medium text-gray-700">
                  Total Deliveries:
                </span>
                <span className="ml-1 text-gray-900">{totalDeliveries}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-700">
                  Pending Review:
                </span>
                <span className="ml-1 font-medium text-orange-600">
                  {pendingDeliveries}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Client-side Interactive Components */}
        <GigDeliveriesClient
          gigId={gigId}
          initialGig={gig}
          initialApplications={applications}
          user={user}
        />
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const gigId = resolvedParams.id;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return {
        title: 'Delivery Reviews - 50Brains',
        description: 'Review private deliveries from creators',
      };
    }

    const gig = await getGigData(gigId, token);

    if (gig) {
      return {
        title: `Delivery Reviews - ${gig.title} | 50Brains`,
        description: `Review and manage private deliveries for "${gig.title}" from creators before public submission.`,
        robots: 'noindex, nofollow', // Private brand page
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  return {
    title: 'Delivery Reviews - 50Brains',
    description: 'Review private deliveries from creators',
    robots: 'noindex, nofollow',
  };
}
