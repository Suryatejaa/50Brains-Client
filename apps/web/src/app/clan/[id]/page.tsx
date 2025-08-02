'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { clanApiClient } from '@/lib/clan-api';
import { getClanJoinStatus, getClanJoinButtonInfo, canManageClan } from '@/lib/clan-utils';
import { toast } from 'sonner';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface ClanMember {
  id: string;
  userId: string;
  clanId: string;
  role: 'HEAD' | 'CO_HEAD' | 'ADMIN' | 'SENIOR_MEMBER' | 'MEMBER' | 'TRAINEE';
  customRole?: string;
  permissions: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  isCore: boolean;
  gigsParticipated: number;
  revenueGenerated: number;
  contributionScore: number;
  joinedAt: string;
  lastActiveAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  // Legacy fields for backward compatibility
  firstName?: string;
  lastName?: string;
  displayName?: string;
  profilePicture?: string;
  skills: string[];
  reputation: number;
  completedProjects: number;
  isOwner: boolean;
  isAdmin: boolean;
}

interface ClanProject {
  id: string;
  title: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  budget: number;
  deadline: string;
  membersInvolved: string[];
  completionPercentage: number;
}

interface ClanDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  tagline?: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
  isActive: boolean;
  isVerified: boolean;
  clanHeadId: string;
  email?: string;
  website?: string;
  instagramHandle?: string;
  twitterHandle?: string;
  linkedinHandle?: string;
  requiresApproval: boolean;
  isPaidMembership: boolean;
  membershipFee?: number;
  maxMembers: number;
  primaryCategory?: string;
  categories: string[];
  skills: string[];
  location?: string;
  timezone?: string;
  totalGigs: number;
  completedGigs: number;
  totalRevenue: number;
  averageRating: number;
  reputationScore: number;
  portfolioImages: string[];
  portfolioVideos: string[];
  showcaseProjects: string[];
  createdAt: string;
  updatedAt: string;
  _count: {
    members: number;
    portfolio: number;
    reviews: number;
  };
  memberCount: number;
  portfolioCount: number;
  reviewCount: number;
  score: number;
  scoreBreakdown?: {
    activity: number;
    reputation: number;
    performance: number;
    growth: number;
    portfolio: number;
    social: number;
    total: number;
  };
  rank?: number;
  analytics?: {
    profileViews: number;
    searchAppearances: number;
    contactClicks: number;
    gigApplications: number;
    gigWinRate: number;
    averageProjectValue: number;
    clientRetentionRate: number;
    memberGrowthRate: number;
    memberRetentionRate: number;
    teamProductivity: number;
    marketRanking: number;
    categoryRanking?: number;
    localRanking?: number;
    socialEngagement: number;
    referralCount: number;
  };
  members: ClanMember[];
  portfolio: any[];
  reviews: any[];
  // Additional properties for UI
  userMembership?: {
    status: 'member' | 'pending' | 'none';
    role?: string;
  };
  canJoin?: boolean;
  recentProjects?: ClanProject[];
  requirements?: string[];
  joinRequests?: number;
}

export interface Clan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  tagline?: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
  isVerified: boolean;
  isActive: boolean;
  clanHeadId: string;
  userMembership?: {
    status: 'pending' | 'member' | 'rejected';
    role: 'admin' | 'member';
  };
  email?: string;
  website?: string;
  instagramHandle?: string;
  twitterHandle?: string;
  linkedinHandle?: string;
  requiresApproval: boolean;
  isPaidMembership: boolean;
  membershipFee?: number;
  maxMembers: number;
  primaryCategory?: string;
  categories: string[];
  skills: string[];
  location?: string;
  timezone?: string;
  totalGigs: number;
  completedGigs: number;
  totalRevenue: number;
  averageRating: number;
  reputationScore: number;
  portfolioImages?: string[];
  portfolioVideos?: string[];
  showcaseProjects?: string[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    members: number;
    portfolio: number;
    reviews: number;
  };
  memberCount: number;
  members?: ClanMember[];
  portfolio?: any[];
  reviews?: any[];
  analytics?: any;
  // New fields from the updated API response
  calculatedScore?: number;
  rank?: number;
  reputation?: {
    averageScore: number;
    totalScore: number;
    tier: string;
    rank: number | null;
  };
  stats?: {
    totalGigs: number;
    completedGigs: number;
    successRate: number;
    avgProjectValue: number;
    recentActivity: string;
  };
  featured?: {
    topMembers: Array<{
      userId: string;
      role: string;
      contributionScore: number;
      gigsParticipated: number;
    }>;
    recentPortfolio: any[];
  };
}

interface PageProps {
  params: { id: string };
}

export default function ClanDetailPage({ params }: PageProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [clan, setClan] = useState<ClanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'projects' | 'requirements'>('overview');
  const [joinLoading, setJoinLoading] = useState(false);
  console.log(clan);
  useEffect(() => {
    loadClanDetail();
  }, [params.id]);

  const loadClanDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await clanApiClient.getClan(params.id);

      if (response.success) {
        setClan(response.data as ClanDetail);
      } else {
        setError('Clan not found');
      }
    } catch (error: any) {
      if (error.status === 404) {
        notFound();
      } else {
        setError(error.message || 'Failed to load clan details');
      }
    } finally {
      setLoading(false);
    }
  };
  const handleJoinClan = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login' as any);
      return;
    }

    try {
      setJoinLoading(true);

      // Use the new join request endpoint
      const response = await clanApiClient.joinClan(params.id, {
        message: `Hi! I'd like to join your clan. I'm excited to collaborate and contribute to your team.`
      });

      if (response.success) {
        toast.success('Join request sent successfully! The clan leader will review your request.');
        // Refresh clan data to show updated membership status
        loadClanDetail();
      } else {
        toast.error('Failed to send join request. Please try again.');
      }
    } catch (error: any) {
      console.error('Error joining clan:', error);
      toast.error(error.message || 'Failed to send join request');
    } finally {
      setJoinLoading(false);
    }
  };

  // Use utility functions for join logic
  const joinStatus = getClanJoinStatus(clan as Clan, user);
  const joinButtonInfo = getClanJoinButtonInfo(joinStatus);
  const canManage = canManageClan(clan as Clan, user);

  const handleRequestToJoinClan = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login' as any);
      return;
    }
    try {
      setJoinLoading(true);
      const response = await clanApiClient.joinClan(params.id, {
        message: `Hi! I'd like to join your clan. I'm excited to collaborate and contribute to your team.`
      });

      if (response.success) {
        toast.success('Join request sent successfully! The clan leader will review your request.');
        loadClanDetail();
      } else {
        toast.error('Failed to send join request. Please try again.');
      }
    } catch (error: any) {
      console.error('Error requesting to join clan:', error);
      toast.error(error.message || 'Failed to send join request');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeaveClan = async () => {
    if (confirm('Are you sure you want to leave this clan?')) {
      try {
        const response = await clanApiClient.leaveClan(params.id);

        if (response.success) {
          toast.success('Successfully left the clan.');
          loadClanDetail();
        } else {
          toast.error('Failed to leave clan. Please try again.');
        }
      } catch (error: any) {
        console.error('Error leaving clan:', error);
        toast.error(error.message || 'Failed to leave clan');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatEarnings = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  const getStatusBadge = (status: ClanProject['status']) => {
    const badges = {
      planning: 'bg-blue-100 text-blue-700',
      active: 'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700'
    };

    return `px-2 py-1 rounded text-xs font-medium ${badges[status]}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-16">
          <div className="content-container py-8">
            <div className="mx-auto max-w-6xl">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="card-glass p-3">
                      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-1">
                    <div className="card-glass p-3">
                      <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !clan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-16">
          <div className="content-container py-8">
            <div className="mx-auto max-w-6xl">
              <div className="card-glass p-8 text-center">
                <div className="mb-4">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-none bg-red-100 flex items-center justify-center">
                    <span className="text-2xl">❌</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {error || 'Clan not found'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    The clan you're looking for doesn't exist or has been removed.
                  </p>
                </div>

                <Link href="/clans/browse" className="btn-primary">
                  Browse Other Clans
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-1">
        <div className="content-container py-1">
          <div className="mx-auto max-w-6xl">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <Link href="/clans" className="hover:text-brand-primary">
                Clans
              </Link>
              <span>›</span>
              <Link href="/clans/browse" className="hover:text-brand-primary">
                Browse
              </Link>
              <span>›</span>
              <span className="text-gray-900">{clan.name}</span>
            </nav>

            {/* Header */}
            <div className="card-glass p-1 mb-1">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-col items-start space-x-1 mb-2">
                    <div className="flex flex-row items-center space-x-1">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {clan.name}
                      </h1>
                      {clan.visibility === 'PRIVATE' && (
                        <span className="px-1 py-1 bg-yellow-100 text-yellow-700 rounded-none text-sm font-medium">
                          Private
                        </span>
                      )}
                    </div>
                    <div className="flex flex-row items-center space-x-1">
                      {/* Button for manage clan */}
                      {clan.clanHeadId === user?.id && (
                        <Link href={`/clan/${clan.id}/manage` as any} className="btn-secondary">
                          Manage Clan
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    {clan.location && <span>📍 {clan.location}</span>}
                    {clan.timezone && <span>⏰ {clan.timezone}</span>}
                  </div>
                  <div className="flex items-center space-x-2 border-b border-gray-500 pb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {clan.primaryCategory}
                    </span>
                    <span>📅 Created {formatDate(clan.createdAt)}</span>
                  </div>

                  <p className="text-gray-700 text-lg mb-4">
                    {clan.description}
                  </p>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-none">
                      <p className="text-2xl font-bold text-gray-900">{clan.memberCount}/{clan.maxMembers}</p>
                      <p className="text-sm text-gray-600">Members</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-none">
                      <p className="text-2xl font-bold text-green-600">{formatEarnings(clan.totalRevenue)}</p>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-none">
                      <p className="text-2xl font-bold text-blue-600">{clan.completedGigs}</p>
                      <p className="text-sm text-gray-600">Completed Gigs</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-none">
                      <div className="flex justify-center mb-1">
                        {renderStars(clan.averageRating)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {clan.averageRating.toFixed(1)} Rating
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-1 lg:mt-0 lg:ml-1 flex flex-col space-y-1">
                  {joinStatus.isMember ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-green-600">
                        <span>✓</span>
                        <span className="text-sm font-medium">Member</span>
                      </div>
                      <button
                        onClick={handleLeaveClan}
                        className="btn-danger w-full"
                      >
                        Leave Clan
                      </button>
                      {canManage && (
                        <Link href={`/clan/${clan.id}/manage` as any} className="btn-secondary w-full text-center">
                          Manage Clan
                        </Link>
                      )}
                    </div>
                  ) : joinStatus.hasPendingRequest ? (
                    <div className="text-center">
                      <div className="flex items-center space-x-2 text-yellow-600 mb-2">
                        <span>⏳</span>
                        <span className="text-sm font-medium">Request Pending</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Your join request is being reviewed by the clan leader
                      </p>
                    </div>
                  ) : joinStatus.canRequestToJoin ? (
                    <button
                      onClick={handleRequestToJoinClan}
                      disabled={joinLoading}
                      className="btn-primary w-full"
                    >
                      {joinLoading ? 'Sending Request...' : joinButtonInfo.text}
                    </button>
                  ) : joinStatus.canJoin ? (
                    <button
                      onClick={handleJoinClan}
                      disabled={joinLoading}
                      className="btn-primary w-full"
                    >
                      {joinLoading ? 'Joining...' : joinButtonInfo.text}
                    </button>
                  ) : (
                    <div className="text-center">
                      {/* <p className="text-red-600 font-medium">Cannot Join</p> */}
                      <p className="text-sm text-gray-600">
                        {joinStatus.reason}
                      </p>
                    </div>
                  )}

                  <button
                    className="btn-secondary w-full"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(window.location.href);
                        toast.success('Clan link copied to clipboard');
                      } catch (err) {
                        // fallback: alert if clipboard API is not available
                        alert('Clan link copied to clipboard');
                      }
                    }}
                  >
                    📥Share Clan
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-1">
              <nav className="flex space-x-1 border-b border-gray-200">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'members', label: `Members (${clan.memberCount})` },
                  { id: 'projects', label: `Projects (${clan.totalGigs})` },
                  { id: 'requirements', label: 'Requirements' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                      ? 'border-brand-primary text-brand-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
              <div className="lg:col-span-2">
                {activeTab === 'overview' && (
                  <div className="space-y-1">
                    {/* About */}
                    <div className="card-glass p-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Clan</h3>
                      <p className="text-gray-700 whitespace-pre-line">
                        {clan.description}
                      </p>
                      {clan.tagline && (
                        <p className="text-gray-600 italic mt-2">"{clan.tagline}"</p>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="card-glass p-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Expertise</h3>
                      <div className="flex flex-wrap gap-2">
                        {clan.skills.map((skill) => (
                          <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-none text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="card-glass p-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {clan.categories.map((category) => (
                          <span key={category} className="px-3 py-1 bg-green-100 text-green-700 rounded-none text-sm">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Showcase Projects */}
                    {clan.showcaseProjects && clan.showcaseProjects.length > 0 && (
                      <div className="card-glass p-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Showcase Projects</h3>
                        <div className="space-y-2">
                          {clan.showcaseProjects.map((project, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-none">
                              <p className="text-gray-700 font-medium">{project}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Portfolio */}
                    {(clan.portfolioImages && clan.portfolioImages.length > 0) ||
                      (clan.portfolioVideos && clan.portfolioVideos.length > 0) ? (
                      <div className="card-glass p-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio</h3>
                        {clan.portfolioImages && clan.portfolioImages.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-md font-medium text-gray-700 mb-2">Images</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {clan.portfolioImages.map((image, index) => (
                                <div key={index} className="aspect-video bg-gray-200 rounded-none flex items-center justify-center">
                                  <img src={image} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover rounded-none" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {clan.portfolioVideos && clan.portfolioVideos.length > 0 && (
                          <div>
                            <h4 className="text-md font-medium text-gray-700 mb-2">Videos</h4>
                            <div className="space-y-2">
                              {clan.portfolioVideos.map((video, index) => (
                                <div key={index} className="aspect-video bg-gray-200 rounded-none flex items-center justify-center">
                                  <video src={video} controls className="w-full h-full object-cover rounded-none" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* Recent Projects */}
                    <div className="card-glass p-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h3>
                      {clan.recentProjects?.length === 0 ? (
                        <p className="text-gray-600">No recent projects</p>
                      ) : (
                        <div className="space-y-4">
                          {clan.recentProjects?.map((project) => (
                            <div key={project.id} className="border border-gray-200 rounded-none p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-gray-900">{project.title}</h4>
                                <span className={getStatusBadge(project.status)}>
                                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Budget:</span> {formatEarnings(project.budget)}
                                </div>
                                <div>
                                  <span className="font-medium">Deadline:</span> {formatDate(project.deadline)}
                                </div>
                                <div>
                                  <span className="font-medium">Progress:</span> {project.completionPercentage}%
                                </div>
                              </div>

                              {project.status === 'active' && (
                                <div className="mt-2">
                                  <div className="w-full bg-gray-200 rounded-none h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-none transition-all"
                                      style={{ width: `${project.completionPercentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'members' && (
                  <div className="card-glass p-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Clan Members</h3>
                    <div className="space-y-4">
                      {clan.members.length === 0 ? (
                        <p className="text-gray-600 text-center py-8">No members yet</p>
                      ) : (
                        clan.members.map((member) => (
                          <div key={member.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-none">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-none flex items-center justify-center text-white font-semibold">
                              {member.profilePicture ? (
                                <img
                                  src={member.profilePicture}
                                  alt="Member"
                                  className="w-12 h-12 rounded-none object-cover"
                                />
                              ) : (
                                (member.firstName || member.displayName || 'U')[0]?.toUpperCase()
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900">
                                  {member.displayName ||
                                    `${member.firstName || ''} ${member.lastName || ''}`.trim() ||
                                    'Anonymous User'}
                                </h4>
                                {member.isOwner && (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                                    👑 Owner
                                  </span>
                                )}
                                {member.isAdmin && !member.isOwner && (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                    Admin
                                  </span>
                                )}
                              </div>

                              <div className="text-sm text-gray-600">
                                <p className="capitalize">{member.role}</p>
                                <p>Joined {formatDate(member.joinedAt)} • {member.completedProjects} projects completed</p>
                              </div>

                              {member.skills?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {member.skills.slice(0, 3).map((skill) => (
                                    <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                      {skill}
                                    </span>
                                  ))}
                                  {member.skills.length > 3 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                      +{member.skills.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                ⭐ {member.reputation?.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-600">Reputation                            </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'projects' && (
                  <div className="card-glass p-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">All Projects</h3>
                    {clan.recentProjects?.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="mx-auto mb-4 h-16 w-16 rounded-none bg-gray-100 flex items-center justify-center">
                          <span className="text-2xl">📋</span>
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h4>
                        <p className="text-gray-600 mb-4">
                          This clan hasn't started any projects yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {clan.recentProjects?.map((project) => (
                          <div key={project.id} className="border border-gray-200 rounded-none p-4">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
                              <span className={getStatusBadge(project.status)}>
                                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                              <div>
                                <span className="text-gray-600">Budget:</span>
                                <div className="font-semibold text-green-600">{formatEarnings(project.budget)}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Deadline:</span>
                                <div className="font-medium">{formatDate(project.deadline)}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Progress:</span>
                                <div className="font-medium">{project.completionPercentage}%</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Team Size:</span>
                                <div className="font-medium">{project.membersInvolved.length} members</div>
                              </div>
                            </div>

                            {project.status === 'active' && (
                              <div className="mb-3">
                                <div className="w-full bg-gray-200 rounded-none h-3">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-none transition-all"
                                    style={{ width: `${project.completionPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex -space-x-2">
                                {project.membersInvolved.slice(0, 5).map((memberId, index) => {
                                  const member = clan.members.find(m => m.id === memberId);
                                  return (
                                    <div key={memberId} className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-none flex items-center justify-center text-white text-xs font-semibold border-2 border-white">
                                      {member?.profilePicture ? (
                                        <img
                                          src={member.profilePicture}
                                          alt="Member"
                                          className="w-8 h-8 rounded-none object-cover"
                                        />
                                      ) : (
                                        (member?.firstName || 'U')[0]?.toUpperCase()
                                      )}
                                    </div>
                                  );
                                })}
                                {project.membersInvolved.length > 5 && (
                                  <div className="w-8 h-8 bg-gray-400 rounded-none flex items-center justify-center text-white text-xs font-semibold border-2 border-white">
                                    +{project.membersInvolved.length - 5}
                                  </div>
                                )}
                              </div>

                              <button className="btn-ghost-sm">
                                View Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'requirements' && (
                  <div className="card-glass p-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Joining Requirements</h3>
                    {clan.requirements?.length === 0 ? (
                      <p className="text-gray-600">No specific requirements</p>
                    ) : (
                      <ul className="space-y-3">
                        {clan.requirements?.map((requirement, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <span className="text-green-500 mt-1">✓</span>
                            <span className="text-gray-700">{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="space-y-1">
                  {/* Clan Leader */}
                  <div className="card-glass p-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Clan Leader</h3>
                    <div className="flex items-center space-x-3"
                      onClick={() => {
                        if (clan.clanHeadId && clan.clanHeadId !== user?.id) {
                          router.push(`/profile/${clan.clanHeadId}`);
                        } else if (clan.clanHeadId === user?.id) {
                          router.push(`/profile`);
                        } else {
                          toast.error('Clan leader profile not available');
                        }
                      }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-none flex items-center justify-center text-white font-semibold">
                        {clan.clanHeadId ? (
                          <img
                            src={clan.clanHeadId}
                            alt="Owner"
                            className="w-12 h-12 rounded-none object-cover"
                          />
                        ) : (
                          'U'
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {clan.clanHeadId || 'Anonymous User'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          ⭐ {clan.clanHeadId?.toLocaleString()} reputation
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="card-glass p-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Performance</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Score</span>
                        <span className="font-semibold text-green-600">
                          {clan.score?.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Gigs</span>
                        <span className="font-semibold text-blue-600">
                          {clan.totalGigs}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Avg. Rating</span>
                        <div className="flex items-center space-x-1">
                          {renderStars(clan.averageRating)}
                          <span className="text-sm text-gray-600">
                            ({clan.averageRating.toFixed(1)})
                          </span>
                        </div>
                      </div>
                      {clan.rank && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Rank</span>
                          <span className="font-semibold text-purple-600">
                            #{clan.rank}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Analytics */}
                  {clan.analytics && (
                    <div className="card-glass p-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">Analytics</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Profile Views</span>
                          <span className="font-semibold text-blue-600">
                            {clan.analytics.profileViews}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Market Ranking</span>
                          <span className="font-semibold text-purple-600">
                            #{clan.analytics.marketRanking}
                          </span>
                        </div>
                        {clan.analytics.categoryRanking && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Category Rank</span>
                            <span className="font-semibold text-green-600">
                              #{clan.analytics.categoryRanking}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Social Engagement</span>
                          <span className="font-semibold text-orange-600">
                            {clan.analytics.socialEngagement}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Join Requests (for clan head) */}
                  {clan.clanHeadId === user?.id && clan.joinRequests && clan.joinRequests > 0 && (
                    <div className="card-glass p-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">Pending Requests</h3>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-brand-primary mb-2">
                          {clan.joinRequests}
                        </p>
                        <p className="text-sm text-gray-600 mb-4">
                          Join requests waiting for approval
                        </p>
                        <Link
                          href={`/clan/${clan.id}/manage` as any}
                          className="btn-primary w-full text-center"
                        >
                          Review Requests
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
