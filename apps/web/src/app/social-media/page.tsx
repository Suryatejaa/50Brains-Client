'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface SocialAccount {
  id: string;
  platform: 'INSTAGRAM' | 'YOUTUBE' | 'TIKTOK' | 'TWITTER' | 'LINKEDIN';
  username: string;
  followerCount: number;
  isVerified: boolean;
  lastSyncedAt: string;
}

interface SocialAnalytics {
  totalFollowers: number;
  totalEngagement: number;
  totalPosts: number;
  averageEngagement: number;
  influencerTier: string;
}

export default function SocialMediaPage() {
  const { user, isAuthenticated } = useAuth();
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [analytics, setAnalytics] = useState<SocialAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSocialData();
    }
  }, [isAuthenticated, user]);

  const loadSocialData = async () => {
    try {
      setIsLoading(true);

      // Load social accounts and analytics
      const [accountsResponse, analyticsResponse] = await Promise.allSettled([
        apiClient.get(`/api/social-media/accounts/${user?.id}`),
        apiClient.get(`/api/social-media/analytics/${user?.id}`),
      ]);

      if (
        accountsResponse.status === 'fulfilled' &&
        accountsResponse.value.success
      ) {
        setSocialAccounts(
          Array.isArray(accountsResponse.value.data)
            ? accountsResponse.value.data
            : []
        );
      }

      if (
        analyticsResponse.status === 'fulfilled' &&
        analyticsResponse.value.success
      ) {
        setAnalytics(analyticsResponse.value.data as SocialAnalytics);
      }
    } catch (error) {
      console.error('Failed to load social media data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectPlatform = async (platform: string) => {
    try {
      setIsConnecting(true);
      setSelectedPlatform(platform);

      // In a real implementation, this would redirect to OAuth flow
      const response = await apiClient.post('/api/social-media/connect', {
        platform,
        userId: user?.id,
      });

      if (response.success) {
        // Refresh data after connection
        await loadSocialData();
      }
    } catch (error) {
      console.error(`Failed to connect ${platform}:`, error);
    } finally {
      setIsConnecting(false);
      setSelectedPlatform('');
    }
  };

  const disconnectPlatform = async (accountId: string) => {
    try {
      const response = await apiClient.delete(
        `/api/social-media/accounts/${accountId}`
      );

      if (response.success) {
        await loadSocialData();
      }
    } catch (error) {
      console.error('Failed to disconnect account:', error);
    }
  };

  const platforms = [
    { id: 'INSTAGRAM', name: 'Instagram', icon: '📸', color: 'bg-pink-500' },
    { id: 'YOUTUBE', name: 'YouTube', icon: '📺', color: 'bg-red-500' },
    { id: 'TIKTOK', name: 'TikTok', icon: '🎵', color: 'bg-black' },
    { id: 'TWITTER', name: 'Twitter', icon: '🐦', color: 'bg-blue-500' },
    { id: 'LINKEDIN', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="card-glass p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Please Sign In</h1>
          <p className="mb-6 text-gray-600">
            You need to be signed in to manage your social media accounts.
          </p>
          <Link href={'/login' as any} className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Social Media</h1>
              <p className="text-gray-600">
                Connect and manage your social media accounts
              </p>
            </div>
            <Link href={'/dashboard' as any} className="btn-secondary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="card-glass p-8 text-center">
            <div className="relative mb-2">
              {/* Spinning Circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-200 border-t-blue-500"></div>
              </div>

              {/* Brain Icon (or '50' Number) */}
              <div className="relative mx-auto flex h-10 w-10 items-center justify-center">
                <span className="text-md font-bold text-blue-600">50</span>
              </div>
            </div>
            <p>Loading your social media data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Analytics Overview */}
            {analytics && (
              <div className="card-glass p-3">
                <h2 className="mb-6 text-xl font-semibold">
                  📊 Analytics Overview
                </h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {analytics.totalFollowers.toLocaleString() ?? 0}
                    </div>
                    <div className="text-gray-600">Total Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {analytics.totalPosts.toLocaleString() ?? 0}
                    </div>
                    <div className="text-gray-600">Total Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {analytics.averageEngagement.toFixed(1)}%
                    </div>
                    <div className="text-gray-600">Avg Engagement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {analytics.influencerTier}
                    </div>
                    <div className="text-gray-600">Influencer Tier</div>
                  </div>
                </div>
              </div>
            )}

            {/* Connected Accounts */}
            <div className="card-glass p-3">
              <h2 className="mb-6 text-xl font-semibold">
                🔗 Connected Accounts
              </h2>

              {socialAccounts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {socialAccounts.map((account) => {
                    const platform = platforms.find(
                      (p) => p.id === account.platform
                    );
                    return (
                      <div
                        key={account.id}
                        className="flex items-center justify-between rounded-none border p-4"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`h-10 w-10 ${platform?.color} flex items-center justify-center rounded-none text-lg text-white`}
                          >
                            {platform?.icon}
                          </div>
                          <div>
                            <div className="font-semibold">
                              {platform?.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              @{account.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              {account.followerCount.toLocaleString() ?? 0} followers
                              {account.isVerified && ' ✓'}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => disconnectPlatform(account.id)}
                          className="btn-ghost btn-sm text-red-600 hover:bg-red-50"
                        >
                          Disconnect
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="mb-4 text-4xl">📱</div>
                  <h3 className="mb-2 text-lg font-semibold">
                    No Connected Accounts
                  </h3>
                  <p className="mb-6 text-gray-600">
                    Connect your social media accounts to start showcasing your
                    reach and engagement.
                  </p>
                </div>
              )}
            </div>

            {/* Available Platforms */}
            <div className="card-glass p-3">
              <h2 className="mb-6 text-xl font-semibold">
                ➕ Connect New Platform
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {platforms.map((platform) => {
                  const isConnected = socialAccounts.some(
                    (acc) => acc.platform === platform.id
                  );
                  const isConnectingThis =
                    isConnecting && selectedPlatform === platform.id;

                  return (
                    <button
                      key={platform.id}
                      onClick={() =>
                        !isConnected && connectPlatform(platform.id)
                      }
                      disabled={isConnected || isConnectingThis}
                      className={`rounded-none border-2 border-dashed p-4 text-center transition-all ${
                        isConnected
                          ? 'cursor-not-allowed border-green-300 bg-green-50'
                          : 'cursor-pointer border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      <div
                        className={`h-12 w-12 ${platform.color} mx-auto mb-2 flex items-center justify-center rounded-none text-xl text-white`}
                      >
                        {isConnectingThis ? '⏳' : platform.icon}
                      </div>
                      <div className="font-medium">{platform.name}</div>
                      <div className="text-sm text-gray-600">
                        {isConnected
                          ? 'Connected ✓'
                          : isConnectingThis
                            ? 'Connecting...'
                            : 'Click to connect'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Help Section */}
            <div className="rounded-none border border-blue-200 bg-blue-50 p-3">
              <h3 className="mb-2 text-lg font-semibold text-blue-900">
                💡 Why Connect Social Media?
              </h3>
              <ul className="space-y-1 text-blue-800">
                <li>• Showcase your audience size and engagement to brands</li>
                <li>• Get matched with relevant campaign opportunities</li>
                <li>• Track your performance across platforms</li>
                <li>• Build credibility with verified metrics</li>
                <li>• Access detailed analytics and insights</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
