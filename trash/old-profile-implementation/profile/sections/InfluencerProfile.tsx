import React from 'react';
import { TrendingUp, X } from 'lucide-react';
import { ProfileComponentProps } from '../types';

export const InfluencerProfile: React.FC<ProfileComponentProps> = ({
  profile,
  isEditing,
  onUpdate,
}) => {
  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm">
      <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
        <TrendingUp className="mr-2 h-5 w-5 text-purple-500" />
        Influencer Profile
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Primary Niche
          </label>
          {isEditing ? (
            <select
              value={profile.primaryNiche || ''}
              onChange={(e) => onUpdate('primaryNiche', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a niche</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="beauty">Beauty</option>
              <option value="fitness">Fitness</option>
              <option value="travel">Travel</option>
              <option value="tech">Technology</option>
              <option value="food">Food & Cooking</option>
              <option value="gaming">Gaming</option>
              <option value="fashion">Fashion</option>
              <option value="business">Business</option>
              <option value="education">Education</option>
            </select>
          ) : (
            <p className="capitalize text-gray-900">
              {profile.primaryNiche || 'Not specified'}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Primary Platform
          </label>
          {isEditing ? (
            <select
              value={profile.primaryPlatform || ''}
              onChange={(e) => onUpdate('primaryPlatform', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select platform</option>
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="twitter">Twitter</option>
              <option value="linkedin">LinkedIn</option>
              <option value="facebook">Facebook</option>
              <option value="twitch">Twitch</option>
            </select>
          ) : (
            <p className="capitalize text-gray-900">
              {profile.primaryPlatform || 'Not specified'}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Content Categories
          </label>
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {(profile.contentCategories || []).map(
                  (category: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                    >
                      {category}
                      <button
                        onClick={() => {
                          const updated = (
                            profile.contentCategories || []
                          ).filter((_: any, i: number) => i !== index);
                          onUpdate('contentCategories', updated);
                        }}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )
                )}
              </div>
              <input
                type="text"
                placeholder="Add category and press Enter"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    const newCategories = [
                      ...(profile.contentCategories || []),
                      e.currentTarget.value.trim(),
                    ];
                    onUpdate('contentCategories', newCategories);
                    e.currentTarget.value = '';
                  }
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(profile.contentCategories || []).map(
                (category: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                  >
                    {category}
                  </span>
                )
              )}
              {(!profile.contentCategories ||
                profile.contentCategories.length === 0) && (
                <p className="text-gray-500">No categories specified</p>
              )}
            </div>
          )}
        </div>

        {/* Follower Count Display */}
        {profile.followerCount &&
          Object.keys(profile.followerCount).length > 0 && (
            <div className="md:col-span-2">
              <h4 className="mb-2 text-sm font-medium text-gray-700">
                Follower Count
              </h4>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {Object.entries(profile.followerCount).map(
                  ([platform, count]) => (
                    <div
                      key={platform}
                      className="rounded-lg bg-gray-50 p-3 text-center"
                    >
                      <div className="text-sm capitalize text-gray-600">
                        {platform}
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {typeof count === 'number'
                          ? count.toLocaleString()
                          : String(count)}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        {/* Audience Demographics */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Audience Demographics
          </label>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-gray-600">
                  Age Groups (%)
                </label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {['13-17', '18-24', '25-34', '35-44', '45+'].map(
                    (ageGroup) => (
                      <div key={ageGroup}>
                        <label className="text-xs text-gray-500">
                          {ageGroup}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={
                            profile.audienceDemographics?.ageGroups?.[
                              ageGroup
                            ] || ''
                          }
                          onChange={(e) => {
                            const newDemographics = {
                              ...profile.audienceDemographics,
                              ageGroups: {
                                ...profile.audienceDemographics?.ageGroups,
                                [ageGroup]: parseInt(e.target.value) || 0,
                              },
                            };
                            onUpdate('audienceDemographics', newDemographics);
                          }}
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.audienceDemographics?.ageGroups &&
                Object.keys(profile.audienceDemographics.ageGroups).length >
                  0 && (
                  <div>
                    <p className="mb-1 text-sm font-medium text-gray-700">
                      Age Groups
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(
                        profile.audienceDemographics.ageGroups
                      ).map(([age, percentage]) => (
                        <span
                          key={age}
                          className="rounded bg-blue-50 px-2 py-1 text-sm text-gray-600"
                        >
                          {age}: {String(percentage)}%
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              {(!profile.audienceDemographics ||
                (!profile.audienceDemographics.ageGroups &&
                  !profile.audienceDemographics.genderSplit &&
                  (!profile.audienceDemographics.topLocations ||
                    profile.audienceDemographics.topLocations.length ===
                      0))) && (
                <p className="text-gray-500">
                  No audience demographics data available.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
