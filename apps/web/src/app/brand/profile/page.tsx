'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSwitch } from '@/hooks/useRoleSwitch';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BrandProfile {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  verified: boolean;
  socialMedia?: {
    platform: string;
    handle: string;
    url: string;
  }[];
  createdAt: string;
  updatedAt: string;

  // Profile statistics
  stats?: {
    totalCampaigns: number;
    activeCampaigns: number;
    successfulCampaigns: number;
    totalSpent: number;
    averageRating: number;
    ratingCount: number;
  };
}

export default function BrandProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const { currentRole, getUserTypeForRole } = useRoleSwitch();
  const router = useRouter();
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<BrandProfile>>({});

  const userType = getUserTypeForRole(currentRole);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (userType !== 'brand') {
        router.push('/dashboard');
        return;
      }
      loadBrandProfile();
    }
  }, [isAuthenticated, user, userType]);

  const loadBrandProfile = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/brand/profile');

      if (response.success && response.data) {
        setProfile(response.data as BrandProfile);
        setEditForm(response.data as BrandProfile);
      }
    } catch (error) {
      console.error('Failed to load brand profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await apiClient.put('/api/brand/profile', editForm);

      if (response.success) {
        setProfile(response.data as BrandProfile);
        setIsEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const addSocialMedia = () => {
    setEditForm((prev) => ({
      ...prev,
      socialMedia: [
        ...(prev.socialMedia || []),
        { platform: '', handle: '', url: '' },
      ],
    }));
  };

  const updateSocialMedia = (index: number, field: string, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      socialMedia: prev.socialMedia?.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeSocialMedia = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      socialMedia: prev.socialMedia?.filter((_, i) => i !== index),
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="card-glass p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Please Sign In</h1>
          <p className="mb-6 text-gray-600">
            You need to be signed in to view your brand profile.
          </p>
          <Link href="/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (userType !== 'brand') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="card-glass p-8 text-center">
          <h1 className="mb-4 text-2xl font-bold">Access Denied</h1>
          <p className="mb-6 text-gray-600">
            This page is only available for brand accounts.
          </p>
          <Link href="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
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
          <p>Loading your brand profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2">
      <div className="mx-auto max-w-4xl px-2 sm:px-2 lg:px-2">
        {/* Header */}
        <div className="mb-2">
          <div className="items-left flex flex-col justify-between gap-1 md:flex-row lg:flex-row">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Brand Profile
              </h1>
              <p className="text-gray-600">
                Manage your brand information and public profile
              </p>
            </div>
            <div className="space-x-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary px-2 py-2"
                  >
                    ✏️ Edit Profile
                  </button>
                  <Link href="/dashboard" className="btn-secondary">
                    ← Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <button onClick={handleSaveProfile} className="btn-primary">
                    💾 Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm(profile || {});
                    }}
                    className="btn-secondary"
                  >
                    ❌ Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
          {/* Main Profile */}
          <div className="space-y-2 lg:col-span-2">
            {/* Basic Information */}
            <div className="card-glass p-2">
              <h2 className="mb-4 text-xl font-semibold">
                🏢 Basic Information
              </h2>

              {!isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    {profile?.logo ? (
                      <img
                        src={profile.logo}
                        alt={profile.name}
                        className="h-16 w-16 rounded-none object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-none bg-gray-200">
                        🏢
                      </div>
                    )}
                    <div>
                      <h3 className="flex items-center space-x-2 text-xl font-semibold">
                        <span>{profile?.name || 'Brand Name'}</span>
                        {profile?.verified && (
                          <span className="text-blue-500">✓</span>
                        )}
                      </h3>
                      <p className="text-gray-600">
                        {profile?.industry || 'Industry not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Company Size
                      </label>
                      <p className="text-gray-900">
                        {profile?.companySize || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Location
                      </label>
                      <p className="text-gray-900">
                        {profile?.location || 'Not specified'}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">
                        Website
                      </label>
                      <p className="text-gray-900">
                        {profile?.website ? (
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {profile.website}
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </p>
                    </div>
                  </div>

                  {profile?.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Description
                      </label>
                      <p className="whitespace-pre-wrap text-gray-900">
                        {profile.description}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Brand Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Industry
                      </label>
                      <select
                        value={editForm.industry || ''}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            industry: e.target.value,
                          }))
                        }
                        className="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Industry</option>
                        <option value="Technology">Technology</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Beauty">Beauty</option>
                        <option value="Food & Beverage">Food & Beverage</option>
                        <option value="Travel">Travel</option>
                        <option value="Fitness">Fitness</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Education">Education</option>
                        <option value="Finance">Finance</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Company Size
                      </label>
                      <select
                        value={editForm.companySize || ''}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            companySize: e.target.value,
                          }))
                        }
                        className="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-1000">201-1000 employees</option>
                        <option value="1000+">1000+ employees</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <input
                        type="text"
                        value={editForm.location || ''}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        className="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., San Francisco, CA"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Website
                      </label>
                      <input
                        type="url"
                        value={editForm.website || ''}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            website: e.target.value,
                          }))
                        }
                        className="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={editForm.description || ''}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full rounded-none border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell us about your brand..."
                    />
                  </div>
                </div>
              )}
            </div>
            {/* Social Media */}
            <div className="card-glass p-2">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xl font-semibold">📱 Social Media</h2>
                {isEditing && (
                  <button
                    onClick={addSocialMedia}
                    className="btn-secondary text-sm"
                  >
                    ➕ Add Platform
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="space-y-2">
                  {profile?.socialMedia && profile.socialMedia.length > 0 ? (
                    profile.socialMedia.map((social, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-none bg-gray-50 p-2"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{social.platform}</span>
                          <span className="text-gray-600">
                            @{social.handle}
                          </span>
                        </div>
                        <a
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Profile
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">
                      No social media profiles added
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {editForm.socialMedia?.map((social, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 gap-2 rounded-none border border-gray-200 p-2 md:grid-cols-3"
                    >
                      <select
                        value={social.platform}
                        onChange={(e) =>
                          updateSocialMedia(index, 'platform', e.target.value)
                        }
                        className="rounded-none border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Platform</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Twitter">Twitter</option>
                        <option value="Facebook">Facebook</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="TikTok">TikTok</option>
                        <option value="YouTube">YouTube</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Handle"
                        value={social.handle}
                        onChange={(e) =>
                          updateSocialMedia(index, 'handle', e.target.value)
                        }
                        className="rounded-none border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex space-x-2">
                        <input
                          type="url"
                          placeholder="Profile URL"
                          value={social.url}
                          onChange={(e) =>
                            updateSocialMedia(index, 'url', e.target.value)
                          }
                          className="flex-1 rounded-none border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => removeSocialMedia(index)}
                          className="rounded-none px-3 py-2 text-red-600 hover:bg-red-50"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!editForm.socialMedia ||
                    editForm.socialMedia.length === 0) && (
                    <p className="text-gray-500">
                      No social media profiles added
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-2">
            {/* Profile Statistics */}
            {profile?.stats && (
              <div className="card-glass p-2">
                <h3 className="mb-4 text-lg font-semibold">
                  📊 Profile Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Campaigns</span>
                    <span className="font-semibold">
                      {profile.stats.totalCampaigns}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Campaigns</span>
                    <span className="font-semibold text-blue-600">
                      {profile.stats.activeCampaigns}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-semibold text-green-600">
                      {profile.stats.totalCampaigns > 0
                        ? Math.round(
                            (profile.stats.successfulCampaigns /
                              profile.stats.totalCampaigns) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Spent</span>
                    <span className="font-semibold">
                      ${profile.stats.totalSpent.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-semibold">
                      {profile.stats.averageRating
                        ? `${profile.stats.averageRating.toFixed(1)}/5.0 ⭐`
                        : 'No ratings yet'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Status */}
            <div className="card-glass p-3">
              <h3 className="mb-4 text-lg font-semibold">✅ Profile Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Verified</span>
                  <span
                    className={`rounded px-2 py-1 text-sm ${
                      profile?.verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {profile?.verified ? '✓ Verified' : 'Not Verified'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Profile Complete</span>
                  <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
                    {profile && profile.name && profile.description
                      ? '✓ Complete'
                      : 'Incomplete'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="text-sm text-gray-600">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card-glass p-3">
              <h3 className="mb-4 text-lg font-semibold">🚀 Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/create-gig"
                  className="btn-secondary w-full text-center"
                >
                  ➕ Create New Campaign
                </Link>
                <Link
                  href="/my-gigs"
                  className="btn-secondary w-full text-center"
                >
                  📢 Manage Campaigns
                </Link>
                <Link
                  href="/influencers/search"
                  className="btn-secondary w-full text-center"
                >
                  🔍 Find Influencers
                </Link>
                <Link
                  href="/analytics"
                  className="btn-secondary w-full text-center"
                >
                  📊 View Analytics
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
