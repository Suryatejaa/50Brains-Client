// Create: /app/instagram-demo/page.tsx

'use client';

import { useState } from 'react';

export default function InstagramDemoPage() {
  const [connected, setConnected] = useState(false);

  // MOCK DATA (not real API)
  const mockCreatorData = {
    username: '@sample_creator',
    profile_picture: '/placeholder-avatar.jpg',
    followers_count: 45230,
    media_count: 342,
    // Mock insights data
    insights: {
      impressions: 125000,
      reach: 85000,
      engagement_rate: 4.2,
      profile_views: 3500,
    },
    recent_media: [
      {
        id: '1',
        image_url: '/sample-post-1.jpg',
        likes: 2341,
        comments: 87,
        impressions: 15420,
      },
      // Add 2-3 more sample posts
    ],
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-6 text-3xl font-bold">
        Instagram Account Connection Demo
      </h1>

      {/* Step 1: Connect Button */}
      {!connected ? (
        <div className="rounded-lg border-2 border-dashed p-8 text-center">
          <h2 className="mb-4 text-xl">
            Connect Your Instagram Business Account
          </h2>
          <button
            onClick={() => setConnected(true)}
            className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-white"
          >
            Connect with Instagram
          </button>
          <p className="mt-4 text-sm text-gray-500">
            We'll access your Instagram insights to verify your account metrics
          </p>
        </div>
      ) : (
        /* Step 2: Show Mock Data */
        <div className="space-y-6">
          {/* Profile Info */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
              <div>
                <h2 className="text-2xl font-bold">
                  {mockCreatorData.username}
                </h2>
                <p className="text-gray-600">Instagram Business Account ✓</p>
              </div>
            </div>
          </div>
          {/* Metrics Dashboard */}
          <div className="grid grid-cols-4 gap-4">
            <MetricCard
              label="Followers"
              value={mockCreatorData.followers_count.toLocaleString()}
            />
            <MetricCard
              label="Reach"
              value={mockCreatorData.insights.reach.toLocaleString()}
            />
            <MetricCard
              label="Impressions"
              value={mockCreatorData.insights.impressions.toLocaleString()}
            />
            <MetricCard
              label="Engagement Rate"
              value={`${mockCreatorData.insights.engagement_rate}%`}
            />
          </div>
          {/* Authenticity Score (Your fraud detection) */}
          <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6">
            <h3 className="mb-2 text-xl font-bold">
              Authenticity Score: 87/100 ✓
            </h3>
            <p className="text-gray-700">
              This account shows authentic engagement patterns and real follower
              interaction.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Engagement rate: 4.2% (Healthy)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Reach-to-follower ratio: 1.88 (Good)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Consistent posting activity</span>
              </div>
            </div>
          </div>
          {/* Recent Posts */}
          <div>
            <h3 className="mb-4 text-xl font-bold">Recent Posts Performance</h3>
            <div className="grid grid-cols-3 gap-4">
              {mockCreatorData.recent_media.map((post) => (
                <div
                  key={post.id}
                  className="overflow-hidden rounded-lg border"
                >
                  <div className="h-48 bg-gradient-to-br from-purple-300 to-pink-300" />
                  <div className="p-3 text-sm">
                    <p>❤️ {post.likes.toLocaleString()} likes</p>
                    <p>💬 {post.comments} comments</p>
                    <p>👁️ {post.impressions.toLocaleString()} views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          // Add to same demo page
          <div className="mt-8 border-t pt-8">
            <h2 className="mb-4 text-2xl font-bold">
              Select Instagram Business Page
            </h2>
            <p className="mb-4 text-gray-600">
              Choose which Instagram account to connect:
            </p>

            {/* Mock page list */}
            <div className="space-y-2">
              <div className="cursor-pointer rounded border p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
                  <div>
                    <p className="font-semibold">Sample Business Page</p>
                    <p className="text-sm text-gray-500">
                      @sample_business • Instagram Business Account
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              * Using pages_show_list permission to find Instagram accounts
              connected to Facebook Pages
            </p>
          </div>
          // Add to your demo page
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold">Select Facebook Page</h2>
            <p className="mb-4 text-gray-600">
              Choose the Facebook Page connected to your Instagram Business
              account:
            </p>

            {/* Mock Pages List */}
            <div className="space-y-3">
              <div className="cursor-pointer rounded-lg border p-4 hover:bg-blue-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 font-bold text-white">
                    SB
                  </div>
                  <div>
                    <p className="font-semibold">Sample Business Page</p>
                    <p className="text-sm text-gray-500">
                      Instagram: @sample_creator • 45K followers
                    </p>
                  </div>
                  <div className="ml-auto">
                    <button className="rounded bg-blue-600 px-4 py-2 text-white">
                      Connect
                    </button>
                  </div>
                </div>
              </div>

              {/* Another example page without Instagram */}
              <div className="rounded-lg border p-4 opacity-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-400 font-bold text-white">
                    MP
                  </div>
                  <div>
                    <p className="font-semibold">My Personal Page</p>
                    <p className="text-sm text-gray-500">
                      No Instagram account connected
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              * We only access the list of Pages you manage to help you find
              your Instagram Business account. No Page content is accessed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
