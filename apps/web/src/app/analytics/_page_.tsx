import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { CheckCircleIcon, CreditCardIcon, DollarSignIcon } from 'lucide-react';
import { FileTextIcon } from 'lucide-react';
import { UsersIcon } from 'lucide-react';
import { MegaphoneIcon } from 'lucide-react';
import { EyeIcon } from 'lucide-react';

interface AnalyticsData {
  // Common analytics
  profileViews: number;
  profileViewsChange: number;

  // Creator analytics
  totalApplications?: number;
  acceptedApplications?: number;
  completedCampaigns?: number;
  totalEarnings?: number;
  averageRating?: number;

  // Brand analytics
  totalCampaigns?: number;
  activeCampaigns?: number;
  totalSpent?: number;
  averageCampaignCost?: number;
  successfulCampaigns?: number;

  // Social media analytics
  totalFollowers?: number;
  totalPosts?: number;
  averageEngagement?: number;
  influencerTier?: string;

  // Time series data
  weeklyData?: Array<{
    date: string;
    views: number;
    applications?: number;
    campaigns?: number;
  }>;
}

export default function AnalyticsPage() {
  // Temporarily disable analytics page
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="card-glass p-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">Analytics Coming Soon</h1>
        <p className="mb-6 text-gray-600">
          Analytics feature is currently under development.
        </p>
        <Link href="/dashboard" className="btn-primary">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
