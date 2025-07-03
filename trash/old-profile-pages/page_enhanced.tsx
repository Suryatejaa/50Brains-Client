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
  Crown,
  Badge,
  Heart,
  Share2,
  Download,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDataPersistence } from '@/hooks/useDataPersistence';
import {
  UserAPI,
  UserProfile,
  UserRole,
  UserAnalytics,
  EducationEntry,
  ExperienceEntry,
} from '@/lib/user-api';

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
];

// Social platforms with follower tracking
const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: Instagram, color: 'pink' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, color: 'red' },
  { key: 'tiktok', label: 'TikTok', icon: Video, color: 'black' },
  { key: 'twitter', label: 'Twitter', icon: Twitter, color: 'blue' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'blue' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, color: 'blue' },
];

// Company sizes for brands
const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-1000 employees',
  '1000+ employees',
];

// Marketing budget ranges
const MARKETING_BUDGETS = [
  '$1K - $5K per month',
  '$5K - $20K per month',
  '$20K - $100K per month',
  '$100K+ per month',
];

// Enhanced Analytics Component
const ProfileAnalytics = ({ analytics }: { analytics: UserAnalytics }) => {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
        <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
        Profile Analytics
      </h3>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg bg-blue-50 p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {analytics.profileViews}
          </div>
          <div className="text-sm text-gray-600">Profile Views</div>
        </div>
        <div className="rounded-lg bg-green-50 p-3 text-center">
          <div className="text-2xl font-bold text-green-600">
            {analytics.searchAppearances}
          </div>
          <div className="text-sm text-gray-600">Search Results</div>
        </div>
        <div className="rounded-lg bg-purple-50 p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {analytics.profileViewsThisMonth}
          </div>
          <div className="text-sm text-gray-600">Views This Month</div>
        </div>
        <div className="rounded-lg bg-orange-50 p-3 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {analytics.messagingStats.responseRate}%
          </div>
          <div className="text-sm text-gray-600">Response Rate</div>
        </div>
      </div>

      {analytics.gigStats.totalCompleted > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-lg bg-yellow-50 p-3 text-center">
            <div className="text-xl font-bold text-yellow-600">
              {analytics.applicationsSent}
            </div>
            <div className="text-sm text-gray-600">Gig Applications</div>
          </div>
          <div className="rounded-lg bg-indigo-50 p-3 text-center">
            <div className="text-xl font-bold text-indigo-600">
              {analytics.gigStats.successRate}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
          <div className="rounded-lg bg-pink-50 p-3 text-center">
            <div className="text-xl font-bold text-pink-600">
              {analytics.gigStats.averageRating}/5
            </div>
            <div className="text-sm text-gray-600">Avg. Rating</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Role Selector Component
const RoleSelector = ({
  userRoles,
  onRoleToggle,
  isEditing,
}: {
  userRoles: UserRole[];
  onRoleToggle: (role: UserRole) => void;
  isEditing: boolean;
}) => {
  if (!isEditing) {
    return (
      <div className="flex flex-wrap gap-2">
        {userRoles.map((role) => {
          const roleInfo = AVAILABLE_ROLES.find((r) => r.value === role);
          if (!roleInfo) return null;
          const IconComponent = roleInfo.icon;

          return (
            <span
              key={role}
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-${roleInfo.color}-100 text-${roleInfo.color}-800`}
            >
              <IconComponent className="mr-1 h-4 w-4" />
              {roleInfo.label}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {AVAILABLE_ROLES.map((role) => {
        const IconComponent = role.icon;
        const isSelected = userRoles.includes(role.value);

        return (
          <div
            key={role.value}
            onClick={() => onRoleToggle(role.value)}
            className={`flex cursor-pointer items-center rounded-lg border p-3 transition-all ${
              isSelected
                ? `border-${role.color}-300 bg-${role.color}-50`
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div
              className={`mr-3 rounded-lg p-2 ${
                isSelected ? `bg-${role.color}-100` : 'bg-gray-100'
              }`}
            >
              <IconComponent
                className={`h-5 w-5 ${
                  isSelected ? `text-${role.color}-600` : 'text-gray-600'
                }`}
              />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{role.label}</div>
              <div className="text-sm text-gray-500">{role.description}</div>
            </div>
            {isSelected && (
              <CheckCircle className={`h-5 w-5 text-${role.color}-600`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function EnhancedProfilePage() {
  const { user } = useAuth();
  const { getCache, setCache } = useDataPersistence();

  // Core state
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);

  // Enhanced state for new features
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [followerCounts, setFollowerCounts] = useState<Record<string, number>>(
    {}
  );
  const [newSkill, setNewSkill] = useState('');
  const [newEducation, setNewEducation] = useState<Partial<EducationEntry>>({});
  const [newExperience, setNewExperience] = useState<Partial<ExperienceEntry>>(
    {}
  );

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Try to load from cache first
        const cachedProfile = getCache('user-profile');
        if (cachedProfile) {
          setProfileData(cachedProfile);
        }

        // Fetch fresh data
        const response = await UserAPI.getCurrentProfile();
        if (response.success && response.data) {
          setProfileData(response.data);
          setCache({
            key: 'user-profile',
            data: response.data,
            ttl: 30 * 60 * 1000,
          }); // Cache for 30 minutes
        }

        // Load analytics if available
        const analyticsResponse = await UserAPI.getUserAnalytics();
        if (analyticsResponse.success && analyticsResponse.data) {
          setAnalytics(analyticsResponse.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
        console.error('Profile load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, getCache, setCache]);

  // Update profile field
  const updateProfileField = (field: string, value: any) => {
    if (!profileData) return;

    setProfileData((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };

  // Toggle user role
  const handleRoleToggle = (role: UserRole) => {
    if (!profileData) return;

    const currentRoles = profileData.roles || [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];

    updateProfileField('roles', newRoles);
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!profileData) return;

    setIsSaving(true);
    setError(null);

    try {
      // Prepare basic profile update
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

        // Update role-specific data if roles changed
        const userRoles = profileData.roles || [];

        if (userRoles.includes(UserRole.INFLUENCER)) {
          await UserAPI.updateInfluencerInfo({
            contentCategories: profileData.contentCategories,
            primaryNiche: profileData.primaryNiche,
            primaryPlatform: profileData.primaryPlatform,
            followerCount: profileData.followerCount,
            engagementRate: profileData.engagementRate,
            audienceDemographics: profileData.audienceDemographics,
          });
        }

        if (userRoles.includes(UserRole.BRAND)) {
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

        if (userRoles.includes(UserRole.CREW)) {
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

        // Update social media handles
        await UserAPI.updateSocialHandles({
          instagramHandle: profileData.instagramHandle,
          twitterHandle: profileData.twitterHandle,
          linkedinHandle: profileData.linkedinHandle,
          youtubeHandle: profileData.youtubeHandle,
          tiktokHandle: profileData.tiktokHandle,
          facebookHandle: profileData.facebookHandle,
          snapchatHandle: profileData.snapchatHandle,
        });

        // Save to cache
        setCache({
          key: 'user-profile',
          data: response.data,
          ttl: 30 * 60 * 1000,
        });
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
      console.error('Profile save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Add skill
  const addSkill = () => {
    if (!newSkill.trim() || !profileData) return;

    const currentSkills = profileData.skills || [];
    if (!currentSkills.includes(newSkill.trim())) {
      updateProfileField('skills', [...currentSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  // Remove skill
  const removeSkill = (index: number) => {
    if (!profileData) return;

    const currentSkills = profileData.skills || [];
    updateProfileField(
      'skills',
      currentSkills.filter((_, i) => i !== index)
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Profile Not Found
          </h2>
          <p className="text-gray-600">
            Unable to load your profile information.
          </p>
        </div>
      </div>
    );
  }

  const userRoles = profileData.roles || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Cover Photo Section */}
          <div className="relative h-48 overflow-hidden rounded-b-xl bg-gradient-to-r from-blue-500 to-purple-600 md:h-64">
            {profileData.coverPhoto && (
              <img
                src={profileData.coverPhoto}
                alt="Cover"
                className="h-full w-full object-cover"
              />
            )}
            {isEditing && (
              <button className="absolute right-4 top-4 rounded-lg bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-70">
                <Camera className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Profile Info Section */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
              {/* Profile Picture */}
              <div className="relative -mt-16 mb-4 md:mb-0">
                <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-lg">
                  {profileData.profilePicture ? (
                    <img
                      src={profileData.profilePicture}
                      alt={profileData.displayName || 'Profile'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-2 right-2 rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Profile Details */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    {isEditing ? (
                      <div className="mb-2 space-y-2">
                        <input
                          type="text"
                          value={profileData.displayName || ''}
                          onChange={(e) =>
                            updateProfileField('displayName', e.target.value)
                          }
                          className="border-b-2 border-gray-300 bg-transparent text-2xl font-bold outline-none focus:border-blue-500"
                          placeholder="Display Name"
                        />
                        <input
                          type="text"
                          value={profileData.currentRole || ''}
                          onChange={(e) =>
                            updateProfileField('currentRole', e.target.value)
                          }
                          className="border-b border-gray-300 bg-transparent text-lg text-gray-600 outline-none focus:border-blue-500"
                          placeholder="Current Role/Title"
                        />
                      </div>
                    ) : (
                      <div className="mb-2">
                        <h1 className="text-2xl font-bold text-gray-900">
                          {profileData.displayName ||
                            `${profileData.firstName} ${profileData.lastName}`.trim() ||
                            'Unknown User'}
                        </h1>
                        {profileData.currentRole && (
                          <p className="text-lg text-gray-600">
                            {profileData.currentRole}
                          </p>
                        )}
                      </div>
                    )}

                    {/* User Roles */}
                    <div className="mb-4">
                      <RoleSelector
                        userRoles={userRoles}
                        onRoleToggle={handleRoleToggle}
                        isEditing={isEditing}
                      />
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 text-yellow-500" />
                        {profileData.averageRating?.toFixed(1) || '0.0'} (
                        {profileData.reviewCount || 0} reviews)
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="mr-1 h-4 w-4" />
                        {profileData.completedGigs || 0} projects completed
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4" />
                        {profileData.location || 'Location not set'}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex space-x-3 md:mt-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSaving ? (
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex items-center rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit Profile
                        </button>
                        <button className="flex items-center rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200">
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: User },
              { key: 'experience', label: 'Experience', icon: Briefcase },
              { key: 'portfolio', label: 'Portfolio', icon: Award },
              { key: 'analytics', label: 'Analytics', icon: BarChart3 },
              { key: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center border-b-2 py-4 text-sm font-medium ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <IconComponent className="mr-2 h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column - Main Content */}
            <div className="space-y-6 lg:col-span-2">
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
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {(profileData.skills || []).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(index)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add a skill"
                      />
                      <button
                        onClick={addSkill}
                        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
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
                    {(!profileData.skills ||
                      profileData.skills.length === 0) && (
                      <p className="text-gray-500">No skills added yet.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Role-Based Sections */}
              {userRoles.includes(UserRole.INFLUENCER) && (
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
                          value={profileData.primaryNiche || ''}
                          onChange={(e) =>
                            updateProfileField('primaryNiche', e.target.value)
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a niche</option>
                          {CONTENT_CATEGORIES.map((category) => (
                            <option
                              key={category}
                              value={category.toLowerCase()}
                            >
                              {category}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="capitalize text-gray-900">
                          {profileData.primaryNiche || 'Not specified'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Primary Platform
                      </label>
                      {isEditing ? (
                        <select
                          value={profileData.primaryPlatform || ''}
                          onChange={(e) =>
                            updateProfileField(
                              'primaryPlatform',
                              e.target.value
                            )
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select platform</option>
                          {SOCIAL_PLATFORMS.map((platform) => (
                            <option key={platform.key} value={platform.key}>
                              {platform.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="capitalize text-gray-900">
                          {profileData.primaryPlatform || 'Not specified'}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Content Categories
                      </label>
                      {isEditing ? (
                        <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                          {CONTENT_CATEGORIES.map((category) => {
                            const isSelected = (
                              profileData.contentCategories || []
                            ).includes(category);
                            return (
                              <button
                                key={category}
                                type="button"
                                onClick={() => {
                                  const current =
                                    profileData.contentCategories || [];
                                  const updated = isSelected
                                    ? current.filter((c) => c !== category)
                                    : [...current, category];
                                  updateProfileField(
                                    'contentCategories',
                                    updated
                                  );
                                }}
                                className={`rounded-full px-3 py-1 text-sm ${
                                  isSelected
                                    ? 'border border-purple-300 bg-purple-100 text-purple-800'
                                    : 'border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {category}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {(profileData.contentCategories || []).map(
                            (category, index) => (
                              <span
                                key={index}
                                className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800"
                              >
                                {category}
                              </span>
                            )
                          )}
                          {(!profileData.contentCategories ||
                            profileData.contentCategories.length === 0) && (
                            <p className="text-gray-500">
                              No categories selected
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Follower Count Section */}
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Follower Count by Platform
                      </label>
                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                          {SOCIAL_PLATFORMS.map((platform) => {
                            const IconComponent = platform.icon;
                            return (
                              <div
                                key={platform.key}
                                className="flex items-center space-x-2"
                              >
                                <IconComponent
                                  className={`h-4 w-4 text-${platform.color}-500`}
                                />
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={
                                    profileData.followerCount?.[platform.key] ||
                                    ''
                                  }
                                  onChange={(e) => {
                                    const current =
                                      profileData.followerCount || {};
                                    updateProfileField('followerCount', {
                                      ...current,
                                      [platform.key]:
                                        parseInt(e.target.value) || 0,
                                    });
                                  }}
                                  className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                          {SOCIAL_PLATFORMS.map((platform) => {
                            const IconComponent = platform.icon;
                            const count =
                              profileData.followerCount?.[platform.key];
                            if (!count) return null;
                            return (
                              <div
                                key={platform.key}
                                className="flex items-center space-x-2"
                              >
                                <IconComponent
                                  className={`h-4 w-4 text-${platform.color}-500`}
                                />
                                <span className="text-sm">
                                  {count.toLocaleString()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {userRoles.includes(UserRole.BRAND) && (
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                    <Building className="mr-2 h-5 w-5 text-blue-500" />
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
                          value={profileData.companyName || ''}
                          onChange={(e) =>
                            updateProfileField('companyName', e.target.value)
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter company name"
                        />
                      ) : (
                        <p className="text-gray-900">
                          {profileData.companyName || 'Not specified'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Industry
                      </label>
                      {isEditing ? (
                        <select
                          value={profileData.industry || ''}
                          onChange={(e) =>
                            updateProfileField('industry', e.target.value)
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select industry</option>
                          {INDUSTRIES.map((industry) => (
                            <option key={industry} value={industry}>
                              {industry}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-gray-900">
                          {profileData.industry || 'Not specified'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Company Size
                      </label>
                      {isEditing ? (
                        <select
                          value={profileData.companySize || ''}
                          onChange={(e) =>
                            updateProfileField('companySize', e.target.value)
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select size</option>
                          {COMPANY_SIZES.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-gray-900">
                          {profileData.companySize || 'Not specified'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Marketing Budget
                      </label>
                      {isEditing ? (
                        <select
                          value={profileData.marketingBudget || ''}
                          onChange={(e) =>
                            updateProfileField(
                              'marketingBudget',
                              e.target.value
                            )
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select budget range</option>
                          {MARKETING_BUDGETS.map((budget) => (
                            <option key={budget} value={budget}>
                              {budget}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-gray-900">
                          {profileData.marketingBudget || 'Not specified'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {userRoles.includes(UserRole.CREW) && (
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                    <Users2 className="mr-2 h-5 w-5 text-green-500" />
                    Crew Profile
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Experience Level
                      </label>
                      {isEditing ? (
                        <select
                          value={profileData.experienceLevel || ''}
                          onChange={(e) =>
                            updateProfileField(
                              'experienceLevel',
                              e.target.value
                            )
                          }
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
                          {profileData.experienceLevel || 'Not specified'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Availability
                      </label>
                      {isEditing ? (
                        <select
                          value={profileData.availability || ''}
                          onChange={(e) =>
                            updateProfileField('availability', e.target.value)
                          }
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
                          {profileData.availability || 'Not specified'}
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
                          value={profileData.hourlyRate || ''}
                          onChange={(e) =>
                            updateProfileField(
                              'hourlyRate',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter hourly rate"
                        />
                      ) : (
                        <p className="text-gray-900">
                          {profileData.hourlyRate
                            ? `$${profileData.hourlyRate}/hour`
                            : 'Not specified'}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Crew Skills
                      </label>
                      {isEditing ? (
                        <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                          {CREW_SKILLS.map((skill) => {
                            const isSelected = (
                              profileData.crewSkills || []
                            ).includes(skill);
                            return (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => {
                                  const current = profileData.crewSkills || [];
                                  const updated = isSelected
                                    ? current.filter((s) => s !== skill)
                                    : [...current, skill];
                                  updateProfileField('crewSkills', updated);
                                }}
                                className={`rounded-full px-3 py-1 text-sm ${
                                  isSelected
                                    ? 'border border-green-300 bg-green-100 text-green-800'
                                    : 'border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {skill}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {(profileData.crewSkills || []).map(
                            (skill, index) => (
                              <span
                                key={index}
                                className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
                              >
                                {skill}
                              </span>
                            )
                          )}
                          {(!profileData.crewSkills ||
                            profileData.crewSkills.length === 0) && (
                            <p className="text-gray-500">No skills selected</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

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

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.location || ''}
                        onChange={(e) =>
                          updateProfileField('location', e.target.value)
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter location"
                      />
                    ) : (
                      <p className="flex items-center text-gray-900">
                        <MapPin className="mr-2 h-4 w-4" />
                        {profileData.location || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Timezone
                    </label>
                    {isEditing ? (
                      <select
                        value={profileData.timezone || ''}
                        onChange={(e) =>
                          updateProfileField('timezone', e.target.value)
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select timezone</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">
                          Pacific Time
                        </option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Paris">Paris</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                        <option value="Asia/Kolkata">India</option>
                      </select>
                    ) : (
                      <p className="flex items-center text-gray-900">
                        <Clock className="mr-2 h-4 w-4" />
                        {profileData.timezone || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Media Handles */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Social Media Profiles
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {SOCIAL_PLATFORMS.map((platform) => {
                    const IconComponent = platform.icon;
                    const handleKey =
                      `${platform.key}Handle` as keyof UserProfile;
                    return (
                      <div key={platform.key}>
                        <label className="mb-2 block flex items-center text-sm font-medium text-gray-700">
                          <IconComponent
                            className={`mr-2 h-4 w-4 text-${platform.color}-500`}
                          />
                          {platform.label}
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={(profileData[handleKey] as string) || ''}
                            onChange={(e) =>
                              updateProfileField(handleKey, e.target.value)
                            }
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`@${platform.key}handle`}
                          />
                        ) : (
                          <p className="text-gray-900">
                            {(profileData[handleKey] as string) ||
                              'Not connected'}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Analytics Widget */}
              {analytics && <ProfileAnalytics analytics={analytics} />}

              {/* Verification Status */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Verification Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="text-sm">Email Verified</span>
                    </div>
                    {profileData.isEmailVerified ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="text-sm">Profile Verified</span>
                    </div>
                    {profileData.isProfileVerified ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50">
                    <div className="flex items-center">
                      <Download className="mr-3 h-4 w-4 text-gray-500" />
                      <span className="text-sm">Download Profile PDF</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                  <button className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50">
                    <div className="flex items-center">
                      <ExternalLink className="mr-3 h-4 w-4 text-gray-500" />
                      <span className="text-sm">View Public Profile</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                  <button className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50">
                    <div className="flex items-center">
                      <Share2 className="mr-3 h-4 w-4 text-gray-500" />
                      <span className="text-sm">Share Profile Link</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content can be added here */}
        {activeTab === 'experience' && (
          <div className="py-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Experience & Education
            </h3>
            <p className="text-gray-500">This section is under development</p>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="py-12 text-center">
            <Award className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Portfolio & Work
            </h3>
            <p className="text-gray-500">This section is under development</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="py-12 text-center">
            <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Detailed Analytics
            </h3>
            <p className="text-gray-500">This section is under development</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="py-12 text-center">
            <Settings className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Profile Settings
            </h3>
            <p className="text-gray-500">This section is under development</p>
          </div>
        )}
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-red-500 px-6 py-3 text-white shadow-lg">
          <div className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
