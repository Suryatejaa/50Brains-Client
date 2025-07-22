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
        apiClient.get(`/api/social-media/analytics/${user?.id}`)
      ]);

      if (accountsResponse.status === 'fulfilled' && accountsResponse.value.success) {
        setSocialAccounts(Array.isArray(accountsResponse.value.data) ? accountsResponse.value.data : []);
      }

      if (analyticsResponse.status === 'fulfilled' && analyticsResponse.value.success) {
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
        userId: user?.id
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
      const response = await apiClient.delete(`/api/social-media/accounts/${accountId}`);
      
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to manage your social media accounts.</p>
          <Link href={"/login" as any} className="btn-primary">
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
              <p className="text-gray-600">Connect and manage your social media accounts</p>
            </div>
            <Link href={"/dashboard" as any} className="btn-secondary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="card-glass p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading your social media data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Analytics Overview */}
            {analytics && (
              <div className="card-glass p-3">
                <h2 className="text-xl font-semibold mb-6">📊 Analytics Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{analytics.totalFollowers.toLocaleString()}</div>
                    <div className="text-gray-600">Total Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{analytics.totalPosts.toLocaleString()}</div>
                    <div className="text-gray-600">Total Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{analytics.averageEngagement.toFixed(1)}%</div>
                    <div className="text-gray-600">Avg Engagement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{analytics.influencerTier}</div>
                    <div className="text-gray-600">Influencer Tier</div>
                  </div>
                </div>
              </div>
            )}

            {/* Connected Accounts */}
            <div className="card-glass p-3">
              <h2 className="text-xl font-semibold mb-6">🔗 Connected Accounts</h2>
              
              {socialAccounts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {socialAccounts.map((account) => {
                    const platform = platforms.find(p => p.id === account.platform);
                    return (
                      <div key={account.id} className="border rounded-none p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${platform?.color} rounded-none flex items-center justify-center text-white text-lg`}>
                            {platform?.icon}
                          </div>
                          <div>
                            <div className="font-semibold">{platform?.name}</div>
                            <div className="text-sm text-gray-600">@{account.username}</div>
                            <div className="text-sm text-gray-500">
                              {account.followerCount.toLocaleString()} followers
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
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📱</div>
                  <h3 className="text-lg font-semibold mb-2">No Connected Accounts</h3>
                  <p className="text-gray-600 mb-6">Connect your social media accounts to start showcasing your reach and engagement.</p>
                </div>
              )}
            </div>

            {/* Available Platforms */}
            <div className="card-glass p-3">
              <h2 className="text-xl font-semibold mb-6">➕ Connect New Platform</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {platforms.map((platform) => {
                  const isConnected = socialAccounts.some(acc => acc.platform === platform.id);
                  const isConnectingThis = isConnecting && selectedPlatform === platform.id;
                  
                  return (
                    <button
                      key={platform.id}
                      onClick={() => !isConnected && connectPlatform(platform.id)}
                      disabled={isConnected || isConnectingThis}
                      className={`p-4 rounded-none border-2 border-dashed text-center transition-all ${
                        isConnected 
                          ? 'border-green-300 bg-green-50 cursor-not-allowed' 
                          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                      }`}
                    >
                      <div className={`w-12 h-12 ${platform.color} rounded-none flex items-center justify-center text-white text-xl mx-auto mb-2`}>
                        {isConnectingThis ? '⏳' : platform.icon}
                      </div>
                      <div className="font-medium">{platform.name}</div>
                      <div className="text-sm text-gray-600">
                        {isConnected ? 'Connected ✓' : isConnectingThis ? 'Connecting...' : 'Click to connect'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-none p-3">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Why Connect Social Media?</h3>
              <ul className="text-blue-800 space-y-1">
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
