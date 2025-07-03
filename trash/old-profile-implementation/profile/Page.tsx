'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Camera,
  Upload,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Calendar,
  Award,
  Briefcase,
  GraduationCap,
  Star,
  Eye,
  EyeOff,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Facebook,
  AlertCircle,
  CheckCircle,
  Info,
  Settings,
  Shield,
  TrendingUp,
  Users,
  DollarSign,
  MessageCircle,
  Clock,
  Target,
  Zap,
  BarChart3,
  Trophy,
  BookOpen,
  Camera as CameraIcon,
  Video,
  Code,
  Palette,
  Music,
  Gamepad2,
  Megaphone,
  Monitor,
  Building,
  Factory,
  Store,
  Users2,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  Verified,
  Heart,
  Share2,
  Search,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useDataPersistence } from '../../hooks/useDataPersistence';
import { useProfileCompletion } from '../../hooks/useProfileCompletion';
import {
  UserAPI,
  UserProfile,
  UserRole,
  EducationEntry,
  ExperienceEntry,
} from '../../lib/user-api';

// Enhanced interface for comprehensive user analytics
interface UserAnalytics {
  profileViews: number;
  searchAppearances: number;
  lastViewedAt?: string;
  popularityScore: number;
  engagementScore: number;
  monthlyGrowth: number;
  totalConnections: number;
  responseRate: number;
  avgResponseTime: number;
  gigApplications: number;
  gigWinRate: number;
  averageProjectValue: number;
  clientRetentionRate: number;
  totalEarnings: number;
  completedGigs: number;
  activeGigs: number;
  averageRating: number;
  reviewCount: number;
  repeatClients: number;
}

// Enhanced role selection options with icons and descriptions
const AVAILABLE_ROLES = [
  {
    value: UserRole.INFLUENCER,
    label: 'Influencer',
    icon: TrendingUp,
    description: 'Content creator, social media influencer',
    color: 'purple',
  },
  {
    value: UserRole.BRAND,
    label: 'Brand',
    icon: Building,
    description: 'Company, agency, or brand representative',
    color: 'blue',
  },
  {
    value: UserRole.CREW,
    label: 'Crew',
    icon: Users2,
    description: 'Creative professional, freelancer',
    color: 'green',
  },
];

// Content categories for influencers
const CONTENT_CATEGORIES = [
  'Fashion & Style',
  'Beauty & Skincare',
  'Fitness & Health',
  'Food & Cooking',
  'Travel & Lifestyle',
  'Technology',
  'Gaming',
  'Music & Entertainment',
  'Art & Design',
  'Photography',
  'Business & Finance',
  'Education',
  'Parenting & Family',
  'Home & Decor',
  'Automotive',
  'Sports',
  'Comedy & Humor',
  'News & Politics',
  'Science & Nature',
  'Books & Literature',
];

// Industries for brands
const INDUSTRIES = [
  'Technology',
  'Fashion & Retail',
  'Food & Beverage',
  'Health & Wellness',
  'Entertainment',
  'Finance',
  'Education',
  'Travel & Tourism',
  'Automotive',
  'Real Estate',
  'Sports',
  'Beauty & Cosmetics',
  'E-commerce',
  'Media & Publishing',
  'Gaming',
  'Sustainability',
  'Healthcare',
  'Consulting',
  'Manufacturing',
  'Non-Profit',
];

// Crew skills categories
const CREW_SKILLS = [
  'Video Editing',
  'Photography',
  'Graphic Design',
  'Content Writing',
  'Social Media Management',
  'Animation',
  'Web Development',
  'UI/UX Design',
  'Copywriting',
  'SEO',
  'Digital Marketing',
  'Brand Strategy',
  'Project Management',
  'Voice Over',
  'Music Production',
  'Illustration',
  'Motion Graphics',
  '3D Modeling',
  'Sound Design',
  'Live Streaming',
];

// Company types for brands
const COMPANY_TYPES = ['STARTUP', 'SME', 'ENTERPRISE', 'AGENCY', 'NONPROFIT'];

// Experience levels
const EXPERIENCE_LEVELS = ['ENTRY', 'INTERMEDIATE', 'SENIOR', 'EXPERT'];

// Availability options
const AVAILABILITY_OPTIONS = [
  'FULL_TIME',
  'PART_TIME',
  'FREELANCE',
  'CONTRACT',
];

// Enhanced Profile Components
const RoleBasedProfileSections = ({
  profile,
  userRoles,
  isEditing,
  onUpdate,
}: {
  profile: UserProfile;
  userRoles: string[];
  isEditing: boolean;
  onUpdate: (field: string, value: any) => void;
}) => {
  const hasInfluencerRole = userRoles.includes('INFLUENCER');
  const hasBrandRole = userRoles.includes('BRAND');
  const hasCrewRole = userRoles.includes('CREW');

  return (
    <div className="space-y-6">
      {/* Influencer-Specific Section */}
      {hasInfluencerRole && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
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
                      (category, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                        >
                          {category}
                          <button
                            onClick={() => {
                              const updated = (
                                profile.contentCategories || []
                              ).filter((_, i) => i !== index);
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
                  {(profile.contentCategories || []).map((category, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                    >
                      {category}
                    </span>
                  ))}
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
                            {(count as number)?.toLocaleString() || count}
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
                                onUpdate(
                                  'audienceDemographics',
                                  newDemographics
                                );
                              }}
                              className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="0"
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-gray-600">
                      Gender Split (%)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Male', 'Female', 'Other'].map((gender) => (
                        <div key={gender}>
                          <label className="text-xs text-gray-500">
                            {gender}
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={
                              profile.audienceDemographics?.genderSplit?.[
                                gender
                              ] || ''
                            }
                            onChange={(e) => {
                              const newDemographics = {
                                ...profile.audienceDemographics,
                                genderSplit: {
                                  ...profile.audienceDemographics?.genderSplit,
                                  [gender]: parseInt(e.target.value) || 0,
                                },
                              };
                              onUpdate('audienceDemographics', newDemographics);
                            }}
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-gray-600">
                      Top Locations
                    </label>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {(profile.audienceDemographics?.topLocations || []).map(
                        (location, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800"
                          >
                            {location}
                            <button
                              onClick={() => {
                                const newLocations = (
                                  profile.audienceDemographics?.topLocations ||
                                  []
                                ).filter((_, i) => i !== index);
                                const newDemographics = {
                                  ...profile.audienceDemographics,
                                  topLocations: newLocations,
                                };
                                onUpdate(
                                  'audienceDemographics',
                                  newDemographics
                                );
                              }}
                              className="ml-2 text-purple-600 hover:text-purple-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        )
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Add location and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          const newLocations = [
                            ...(profile.audienceDemographics?.topLocations ||
                              []),
                            e.currentTarget.value.trim(),
                          ];
                          const newDemographics = {
                            ...profile.audienceDemographics,
                            topLocations: newLocations,
                          };
                          onUpdate('audienceDemographics', newDemographics);
                          e.currentTarget.value = '';
                        }
                      }}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                  {profile.audienceDemographics?.genderSplit &&
                    Object.keys(profile.audienceDemographics.genderSplit)
                      .length > 0 && (
                      <div>
                        <p className="mb-1 text-sm font-medium text-gray-700">
                          Gender Split
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(
                            profile.audienceDemographics.genderSplit
                          ).map(([gender, percentage]) => (
                            <span
                              key={gender}
                              className="rounded bg-green-50 px-2 py-1 text-sm text-gray-600"
                            >
                              {gender}: {String(percentage)}%
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  {profile.audienceDemographics?.topLocations &&
                    profile.audienceDemographics.topLocations.length > 0 && (
                      <div>
                        <p className="mb-1 text-sm font-medium text-gray-700">
                          Top Locations
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {profile.audienceDemographics.topLocations.map(
                            (location, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800"
                              >
                                {location}
                              </span>
                            )
                          )}
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
      )}

      {/* Brand-Specific Section */}
      {hasBrandRole && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
            <Briefcase className="mr-2 h-5 w-5 text-blue-500" />
            Brand Profile
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Company Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.companyName || ''}
                  onChange={(e) => onUpdate('companyName', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter company name"
                />
              ) : (
                <p className="text-gray-900">
                  {profile.companyName || 'Not specified'}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Industry
              </label>
              {isEditing ? (
                <select
                  value={profile.industry || ''}
                  onChange={(e) => onUpdate('industry', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="retail">Retail</option>
                  <option value="education">Education</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="automotive">Automotive</option>
                  <option value="real-estate">Real Estate</option>
                  <option value="food-beverage">Food & Beverage</option>
                  <option value="fashion">Fashion</option>
                </select>
              ) : (
                <p className="text-gray-900">
                  {profile.industry || 'Not specified'}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Company Type
              </label>
              {isEditing ? (
                <select
                  value={profile.companyType || ''}
                  onChange={(e) => onUpdate('companyType', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select type</option>
                  <option value="STARTUP">Startup</option>
                  <option value="SME">Small/Medium Enterprise</option>
                  <option value="ENTERPRISE">Enterprise</option>
                  <option value="AGENCY">Agency</option>
                  <option value="NONPROFIT">Non-Profit</option>
                </select>
              ) : (
                <p className="text-gray-900">
                  {profile.companyType || 'Not specified'}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Company Size
              </label>
              {isEditing ? (
                <select
                  value={profile.companySize || ''}
                  onChange={(e) => onUpdate('companySize', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              ) : (
                <p className="text-gray-900">
                  {profile.companySize || 'Not specified'}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Marketing Budget (Annual)
              </label>
              {isEditing ? (
                <select
                  value={profile.marketingBudget || ''}
                  onChange={(e) => onUpdate('marketingBudget', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select budget range</option>
                  <option value="UNDER_10K">Under $10,000</option>
                  <option value="10K_50K">$10,000 - $50,000</option>
                  <option value="50K_100K">$50,000 - $100,000</option>
                  <option value="100K_500K">$100,000 - $500,000</option>
                  <option value="500K_1M">$500,000 - $1M</option>
                  <option value="OVER_1M">Over $1M</option>
                </select>
              ) : (
                <p className="text-gray-900">
                  {profile.marketingBudget
                    ? profile.marketingBudget
                        .replace(/_/g, ' ')
                        .replace(/K/g, ',000')
                        .replace(/M/g, 'M')
                    : 'Not specified'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Crew-Specific Section */}
      {hasCrewRole && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
            <Users className="mr-2 h-5 w-5 text-green-500" />
            Crew Profile
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Experience Level
              </label>
              {isEditing ? (
                <select
                  value={profile.experienceLevel || ''}
                  onChange={(e) => onUpdate('experienceLevel', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select level</option>
                  <option value="ENTRY">Entry Level</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="SENIOR">Senior</option>
                  <option value="EXPERT">Expert</option>
                </select>
              ) : (
                <p className="text-gray-900">
                  {profile.experienceLevel || 'Not specified'}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Availability
              </label>
              {isEditing ? (
                <select
                  value={profile.availability || ''}
                  onChange={(e) => onUpdate('availability', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select availability</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="FREELANCE">Freelance</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              ) : (
                <p className="text-gray-900">
                  {profile.availability || 'Not specified'}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Hourly Rate ($)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={profile.hourlyRate || ''}
                  onChange={(e) =>
                    onUpdate('hourlyRate', parseInt(e.target.value) || 0)
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter hourly rate"
                />
              ) : (
                <p className="flex items-center text-gray-900">
                  <DollarSign className="mr-1 h-4 w-4" />
                  {profile.hourlyRate
                    ? `${profile.hourlyRate}/hour`
                    : 'Not specified'}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Crew Skills
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {(profile.crewSkills || []).map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
                      >
                        {skill}
                        <button
                          onClick={() => {
                            const updated = (profile.crewSkills || []).filter(
                              (_, i) => i !== index
                            );
                            onUpdate('crewSkills', updated);
                          }}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add skill and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const newSkills = [
                          ...(profile.crewSkills || []),
                          e.currentTarget.value.trim(),
                        ];
                        onUpdate('crewSkills', newSkills);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(profile.crewSkills || []).map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
                    >
                      {skill}
                    </span>
                  ))}
                  {(!profile.crewSkills || profile.crewSkills.length === 0) && (
                    <p className="text-gray-500">No skills specified</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileAnalytics = ({
  analytics,
}: {
  analytics: UserAnalytics | null;
}) => {
  if (!analytics) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold">Performance Analytics</h3>
        <p className="text-muted-foreground">Analytics data not available</p>
      </div>
    );
  }
  if (!analytics) return null;

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
        <TrendingUp className="mr-2 h-5 w-5 text-purple-500" />
        Profile Analytics
      </h3>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-blue-50 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {analytics.profileViews || 0}
          </div>
          <div className="text-sm text-gray-600">Profile Views</div>
        </div>
        <div className="rounded-lg bg-green-50 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {analytics.searchAppearances || 0}
          </div>
          <div className="text-sm text-gray-600">Search Results</div>
        </div>
        <div className="rounded-lg bg-purple-50 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {analytics.gigApplications || 0}
          </div>
          <div className="text-sm text-gray-600">Applications</div>
        </div>
        <div className="rounded-lg bg-yellow-50 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {analytics.averageRating?.toFixed(1) || '0.0'}
          </div>
          <div className="text-sm text-gray-600">Average Rating</div>
        </div>
      </div>
    </div>
  );
};

export default function EnhancedProfilePage() {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  // Profile completion tracking
  const { completionPercentage, incompleteSections, refetchProfile } =
    useProfileCompletion();

  // Add data persistence
  const { cachePageData, getPageData } = useDataPersistence();

  // Load cached data first, then fetch fresh data
  useEffect(() => {
    // Try to load from cache first
    const cachedProfile = getPageData('enhanced-profile');
    if (cachedProfile) {
      setProfileData(cachedProfile.profile);
      setAnalytics(cachedProfile.analytics);
      setIsLoading(false);
      console.log('📱 Enhanced Profile loaded from cache');
    }

    // Always fetch fresh data
    fetchAllProfileData();
  }, [getPageData]);

  const fetchAllProfileData = async () => {
    try {
      if (!profileData) {
        setIsLoading(true);
      }
      setError(null);

      // Fetch profile and analytics in parallel
      const [profileResponse, analyticsResponse] = await Promise.all([
        UserAPI.getCurrentProfile(),
        UserAPI.getUserAnalytics().catch(() => ({
          success: false,
          data: null,
        })), // Analytics optional
      ]);

      console.log('📡 Enhanced Profile API Response:', {
        profileResponse,
        analyticsResponse,
      });

      if (profileResponse.success && profileResponse.data) {
        setProfileData(profileResponse.data);

        if (analyticsResponse.success && analyticsResponse.data) {
          setAnalytics(analyticsResponse.data);
        }

        // Cache the combined data
        cachePageData('enhanced-profile', {
          profile: profileResponse.data,
          analytics: analyticsResponse.success ? analyticsResponse.data : null,
        });

        console.log('✅ Enhanced Profile data cached successfully');
      } else {
        setError('Failed to load profile data');
      }
    } catch (err) {
      console.error('Enhanced Profile fetch error:', err);
      // Only show error if no cached data is available
      if (!profileData) {
        setError('Failed to load profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfileField = (field: string, value: any) => {
    setProfileData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSave = async () => {
    if (!profileData) return;

    try {
      setSaving(true);
      setError(null);

      // Prepare different update requests based on data type
      const basicUpdate = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        displayName: profileData.displayName,
        bio: profileData.bio,
        phone: profileData.phone,
        website: profileData.website,
        location: profileData.location,
        timezone: profileData.timezone,
        currentRole: profileData.currentRole,
        skills: profileData.skills,
        portfolioUrl: profileData.portfolioUrl,
        isPublic: profileData.isPublic,
        allowMessages: profileData.allowMessages,
        showEmail: profileData.showEmail,
        showPhone: profileData.showPhone,
        showLocation: profileData.showLocation,
        allowDirectBooking: profileData.allowDirectBooking,
      };

      // Update basic profile
      const response = await UserAPI.updateProfile(basicUpdate);

      if (response.success && response.data) {
        setProfileData(response.data);

        // Update role-specific data
        const userRoles = user?.roles || [];

        if (userRoles.includes('INFLUENCER')) {
          await UserAPI.updateInfluencerInfo({
            contentCategories: profileData.contentCategories,
            primaryNiche: profileData.primaryNiche,
            primaryPlatform: profileData.primaryPlatform,
            followerCount: profileData.followerCount,
            engagementRate: profileData.engagementRate,
            audienceDemographics: profileData.audienceDemographics,
          });
        }

        if (userRoles.includes('BRAND')) {
          await UserAPI.updateBrandInfo({
            companyName: profileData.companyName,
            industry: profileData.industry,
            companyType: profileData.companyType,
            companySize: profileData.companySize,
            foundedYear: profileData.foundedYear,
            campaignTypes: profileData.campaignTypes,
            marketingBudget: profileData.marketingBudget,
            targetAudience: profileData.targetAudience,
          });
        }

        if (userRoles.includes('CREW')) {
          await UserAPI.updateCrewInfo({
            crewSkills: profileData.crewSkills,
            experienceLevel: profileData.experienceLevel,
            availability: profileData.availability,
            hourlyRate: profileData.hourlyRate,
            equipment: profileData.equipment,
            certifications: profileData.certifications,
            languages: profileData.languages,
          });
        }

        // Update social handles
        await UserAPI.updateSocialHandles({
          instagramHandle: profileData.instagramHandle,
          twitterHandle: profileData.twitterHandle,
          linkedinHandle: profileData.linkedinHandle,
          youtubeHandle: profileData.youtubeHandle,
          tiktokHandle: profileData.tiktokHandle,
          facebookHandle: profileData.facebookHandle,
          snapchatHandle: profileData.snapchatHandle,
        });

        // Clear cache to force fresh data
        cachePageData('enhanced-profile', null);

        // Refresh completion data
        await refetchProfile();

        setIsEditing(false);
        console.log('✅ Enhanced Profile saved successfully');
      } else {
        setError('Failed to save profile');
      }
    } catch (err: any) {
      setError('Failed to save profile');
      console.error('Enhanced Profile save error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (isLoading && !profileData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading your enhanced profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !profileData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="mx-auto max-w-md p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Failed to Load Profile
          </h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={fetchAllProfileData}
            className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <User className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    );
  }

  const userRoles = user?.roles || [];
  const isVerified =
    profileData.isEmailVerified && profileData.isProfileVerified;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug Tool - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="px-6 pt-6">
          <div className="rounded-lg border bg-gray-100 p-4">
            <h4 className="mb-2 font-semibold text-gray-700">Debug Info</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>User ID: {user?.id}</p>
              <p>Profile Data: {profileData ? 'Loaded' : 'Not loaded'}</p>
              <p>Completion: {completionPercentage}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Cover Photo Section */}
      <div className="relative h-80 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600">
        {profileData.coverPhoto ? (
          <img
            src={profileData.coverPhoto}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-white">
              <Camera className="mx-auto mb-4 h-16 w-16 opacity-50" />
              <p className="text-lg opacity-75">
                Add a cover photo to personalize your profile
              </p>
            </div>
          </div>
        )}

        {isEditing && (
          <button className="absolute bottom-4 right-4 flex items-center space-x-2 rounded-lg bg-black/50 px-4 py-2 text-white transition-colors hover:bg-black/60">
            <Upload className="h-4 w-4" />
            <span>Change Cover</span>
          </button>
        )}

        {/* Profile completion overlay */}
        {completionPercentage < 100 && (
          <div className="absolute left-4 top-4 rounded-lg bg-black/50 px-4 py-2 text-white">
            <div className="text-sm">
              Profile {completionPercentage}% complete
            </div>
            <div className="mt-1 h-1 w-32 rounded-full bg-white/30">
              <div
                className="h-1 rounded-full bg-white transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Profile Header */}
      <div className="relative px-6">
        <div className="relative -mt-20 flex flex-col items-center sm:flex-row sm:items-end sm:space-x-6">
          {/* Enhanced Profile Picture */}
          <div className="relative">
            <div className="h-40 w-40 overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-lg">
              {profileData.profilePicture ? (
                <img
                  src={profileData.profilePicture}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <User className="h-20 w-20 text-gray-400" />
                </div>
              )}
            </div>

            {/* Verification Badge */}
            {isVerified && (
              <div className="absolute -bottom-2 -right-2 rounded-full bg-green-500 p-2 text-white">
                <CheckCircle className="h-5 w-5" />
              </div>
            )}

            {isEditing && (
              <button className="absolute bottom-2 right-2 rounded-full bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600">
                <Camera className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Enhanced Profile Info */}
          <div className="mt-6 flex-1 text-center sm:mt-0 sm:text-left">
            <div className="flex flex-col items-center sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {profileData.displayName ||
                    `${profileData.firstName} ${profileData.lastName}`.trim() ||
                    'Anonymous User'}
                </h1>
                <p className="text-lg text-gray-600">
                  @{profileData.username || user?.email?.split('@')[0]}
                </p>

                {/* Role Badges */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {userRoles.map((role) => (
                    <span
                      key={role}
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        role === 'INFLUENCER'
                          ? 'bg-purple-100 text-purple-800'
                          : role === 'BRAND'
                            ? 'bg-blue-100 text-blue-800'
                            : role === 'CREW'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {role.toLowerCase().replace('_', ' ')}
                    </span>
                  ))}
                </div>

                {profileData.currentRole && (
                  <p className="mt-1 text-gray-600">
                    {profileData.currentRole}
                  </p>
                )}

                {profileData.location && (
                  <p className="mt-1 flex items-center text-gray-600">
                    <MapPin className="mr-1 h-4 w-4" />
                    {profileData.location}
                  </p>
                )}

                {/* Performance Metrics */}
                <div className="mt-3 flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="mr-1 h-4 w-4 text-yellow-500" />
                    {profileData.averageRating?.toFixed(1) || '0.0'} (
                    {profileData.reviewCount || 0} reviews)
                  </div>
                  <div className="text-sm text-gray-600">
                    {profileData.completedGigs || 0} projects completed
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex space-x-3 sm:mt-0">
                {isEditing ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center space-x-2 rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center space-x-2 rounded-lg bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion Suggestions */}
        {incompleteSections.length > 0 && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start">
              <Info className="mr-3 mt-0.5 h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-800">
                  Complete Your Profile
                </h3>
                <p className="mt-1 text-sm text-amber-700">
                  Add the following to improve your profile visibility:
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {incompleteSections.slice(0, 3).map((section) => (
                    <span
                      key={section.id}
                      className="inline-flex items-center rounded bg-amber-100 px-2 py-1 text-xs text-amber-800"
                    >
                      {section.title}
                    </span>
                  ))}
                  {incompleteSections.length > 3 && (
                    <span className="text-xs text-amber-700">
                      +{incompleteSections.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Tabs Navigation */}
      <div className="sticky top-0 z-10 mt-8 border-b border-gray-200 bg-white">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'experience', label: 'Experience', icon: Briefcase },
              { id: 'education', label: 'Education', icon: GraduationCap },
              { id: 'social', label: 'Social Media', icon: Instagram },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 border-b-2 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Enhanced Tab Content */}
      <div className="px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Bio Section */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                About
              </h3>
              {isEditing ? (
                <textarea
                  value={profileData.bio || ''}
                  onChange={(e) => updateProfileField('bio', e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell others about yourself, your expertise, and what makes you unique..."
                />
              ) : (
                <p className="whitespace-pre-wrap text-gray-700">
                  {profileData.bio || 'No bio provided yet.'}
                </p>
              )}
            </div>

            {/* Skills Section */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Skills & Expertise
              </h3>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {(profileData.skills || []).map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                      >
                        {skill}
                        <button
                          onClick={() => {
                            const updated = (profileData.skills || []).filter(
                              (_, i) => i !== index
                            );
                            updateProfileField('skills', updated);
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add skill and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const newSkills = [
                          ...(profileData.skills || []),
                          e.currentTarget.value.trim(),
                        ];
                        updateProfileField('skills', newSkills);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(profileData.skills || []).map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                  {(!profileData.skills || profileData.skills.length === 0) && (
                    <p className="text-gray-500">No skills added yet.</p>
                  )}
                </div>
              )}
            </div>

            {/* Role-Based Sections */}
            <RoleBasedProfileSections
              profile={profileData}
              userRoles={userRoles}
              isEditing={isEditing}
              onUpdate={updateProfileField}
            />

            {/* Contact Information */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone || ''}
                      onChange={(e) =>
                        updateProfileField('phone', e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="flex items-center text-gray-900">
                      <Phone className="mr-2 h-4 w-4" />
                      {profileData.phone || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profileData.website || ''}
                      onChange={(e) =>
                        updateProfileField('website', e.target.value)
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter website URL"
                    />
                  ) : (
                    <p className="flex items-center text-gray-900">
                      <Globe className="mr-2 h-4 w-4" />
                      {profileData.website ? (
                        <a
                          href={profileData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {profileData.website}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <ProfileAnalytics analytics={analytics} />
          </div>
        )}

        {/* Add other tab content here */}
        {activeTab !== 'overview' && activeTab !== 'analytics' && (
          <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
            <div className="text-gray-400">
              <Settings className="mx-auto mb-4 h-16 w-16" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
              </h3>
              <p className="text-gray-600">This section is coming soon...</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-red-500 px-6 py-3 text-white shadow-lg">
          <div className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
