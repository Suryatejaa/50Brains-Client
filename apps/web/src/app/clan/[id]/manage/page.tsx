'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
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
}

interface ClanDetail {
  id: string;
  name: string;
  slug: string;
  description?: string;
  tagline?: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
  isVerified: boolean;
  isActive: boolean;
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
  members?: ClanMember[];
  portfolio?: any[];
  reviews?: any[];
  analytics?: any;
  score: number;
  scoreBreakdown?: any;
  rank?: number;
}

type TabType = 'overview' | 'members' | 'applications' | 'gigs' | 'credits' | 'settings' | 'logs';

export default function ClanManagePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const clanId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);

  const [clan, setClan] = useState<ClanDetail | null>(null);
  const [clanLoading, setClanLoading] = useState(true);
  const [clanError, setClanError] = useState<string | null>(null);

  // Check if user has permission to manage this clan
  const canManage = clan && user && (clan.clanHeadId === user.id ||
    clan.members?.some(member =>
      member.userId === user.id &&
      ['HEAD', 'CO_HEAD', 'ADMIN'].includes(member.role)
    ));

  const loadClanDetail = async () => {
    try {
      setClanLoading(true);
      setClanError(null);

      const response = await apiClient.get(`/api/clan/${clanId}`);

      if (response.success) {
        setClan(response.data as ClanDetail);
      } else {
        setClanError('Clan not found');
      }
    } catch (error: any) {
      if (error.status === 404) {
        notFound();
      } else {
        setClanError(error.message || 'Failed to load clan details');
      }
    } finally {
      setClanLoading(false);
    }
  };

  useEffect(() => {
    loadClanDetail();
  }, [clanId]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (clan && !canManage) {
      router.push(`/clan/${clanId}`);
      return;
    }
  }, [isAuthenticated, clan, canManage, clanId, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-16">
          <div className="content-container py-8">
            <div className="mx-auto max-w-2xl">
              <div className="card-glass p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Please Sign In
                </h3>
                <p className="text-gray-600 mb-6">
                  You need to be signed in to manage clans.
                </p>
                <Link href="/login" className="btn-primary">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (clanLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-16">
          <div className="content-container py-8">
            <div className="card-glass p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading clan management...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (clanError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-16">
          <div className="content-container py-8">
            <div className="card-glass p-8 text-center">
              <div className="mb-4">
                <div className="mx-auto mb-4 h-16 w-16 rounded-none bg-red-100 flex items-center justify-center">
                  <span className="text-2xl">❌</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Error Loading Clan
                </h3>
                <p className="text-gray-600 mb-6">{clanError}</p>
              </div>
              <button onClick={() => window.location.reload()} className="btn-primary">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!clan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-16">
          <div className="content-container py-8">
            <div className="card-glass p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Clan Not Found
              </h3>
              <p className="text-gray-600 mb-6">
                The clan you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Link href="/clans" className="btn-primary">
                Browse Clans
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-16">
          <div className="content-container py-8">
            <div className="card-glass p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Access Denied
              </h3>
              <p className="text-gray-600 mb-6">
                You don't have permission to manage this clan.
              </p>
              <Link href={`/clan/${clanId}`} className="btn-primary">
                View Clan
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'members', label: 'Members', icon: '👥' },
    { id: 'applications', label: 'Applications', icon: '🪪' },
    { id: 'gigs', label: 'Gigs', icon: '🎯' },
    { id: 'credits', label: 'Credits', icon: '💰' },
    { id: 'settings', label: 'Settings', icon: '🛠️' },
    { id: 'logs', label: 'Logs', icon: '🔔' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab clan={clan} members={clan?.members || []} />;
      case 'members':
        return <MembersTab clan={clan} members={clan?.members || []} />;
      case 'applications':
        return <ApplicationsTab clan={clan} />;
      case 'gigs':
        return <GigsTab clan={clan} />;
      case 'credits':
        return <CreditsTab clan={clan} />;
      case 'settings':
        return <SettingsTab clan={clan} />;
      case 'logs':
        return <LogsTab clan={clan} />;
      default:
        return <OverviewTab clan={clan} members={clan?.members || []} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-1">
        <div className="content-container py-1">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
            <Link href="/clans" className="hover:text-brand-primary">
              Clans
            </Link>
            <span>›</span>
            <Link href="/clans/browse" className="hover:text-brand-primary">
              Browse
            </Link>
            <span>›</span>
            <Link href={`/clan/${clanId}`} className="hover:text-brand-primary">
              {clan.name}
            </Link>
            <span>›</span>
            <span className="text-gray-900">Manage</span>
          </nav>

          {/* Header */}
          <div className="mb-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-heading mb-2 text-3xl font-bold">
                  Clan Management
                </h1>
                <p className="text-muted">
                  Manage {clan.name} - Control panel for clan operations
                </p>
              </div>
              <div className="flex space-x-2">
                <Link href={`/clan/${clanId}`} className="btn-ghost">
                  View Clan
                </Link>
                <button className="btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-1">
            <div className="flex flex-wrap gap-1 border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center space-x-2 ${activeTab === tab.id
                    ? 'bg-brand-primary text-white'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="card-glass p-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab Components
function OverviewTab({ clan, members }: { clan: ClanDetail | null; members: ClanMember[] }) {
  if (!clan) return null;

  const stats = [
    { label: 'Total Members', value: clan.memberCount || members.length, icon: '👥' },
    { label: 'Total Gigs', value: clan.totalGigs, icon: '🎯' },
    { label: 'Completed Gigs', value: clan.completedGigs, icon: '✅' },
    { label: 'Total Revenue', value: `$${clan.totalRevenue}`, icon: '💰' },
    { label: 'Reputation Score', value: clan.reputationScore, icon: '📈' },
    { label: 'Average Rating', value: `${clan.averageRating}/5`, icon: '⭐' },
  ];

  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-bold text-gray-900">Clan Overview</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-1">
        {stats.map((stat) => (
          <div key={stat.label} className="card-glass p-1">
            <div className="flex items-center space-x-1">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
        <button className="btn-primary p-1 text-center">
          <div className="text-2xl mb-2">👥</div>
          <div className="font-semibold">
            <div>Invite Members</div>
            <div className="text-sm text-gray-300">Add new members to your clan</div>
          </div>
        </button>
        <button className="btn-secondary p-1 text-center">
          <div className="text-2xl mb-2">🎯</div>
          <div className="font-semibold">
            <div>Create Gig</div>
            <div className="text-sm text-gray-600">Post a new gig for your clan</div>
          </div>
        </button>
        <button className="btn-secondary p-1 text-center">
          <div className="text-2xl mb-2">💰</div>
          <div className="font-semibold">
            <div>Manage Credits</div>
            <div className="text-sm text-gray-600">View and manage clan credits</div>
          </div>
        </button>
      </div>
    </div>
  );
}

function MembersTab({ clan, members }: { clan: ClanDetail | null; members: ClanMember[] }) {
  const [filterRole, setFilterRole] = useState('all');

  const filteredMembers = filterRole === 'all'
    ? members
    : members.filter(member => member.role === filterRole);

  const roles = ['HEAD', 'CO_HEAD', 'ADMIN', 'SENIOR_MEMBER', 'MEMBER', 'TRAINEE'];

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Member Management</h2>
        <button className="btn-primary">Invite Member</button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="input"
        >
          <option value="all">All Roles</option>
          {roles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      {/* Members List */}
      <div className="space-y-4">
        {filteredMembers.map((member) => (
          <div key={member.id} className="card-glass p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                {member.user.avatar ? (
                  <img src={member.user.avatar} alt={member.user.name} className="w-12 h-12 rounded-full" />
                ) : (
                  <span className="text-lg font-semibold text-gray-600">
                    {member.user.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{member.user.name}</h3>
                <p className="text-sm text-gray-600">{member.role}</p>
                <p className="text-xs text-gray-500">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="btn-ghost text-sm">Promote</button>
              <button className="btn-ghost text-sm text-red-600">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApplicationsTab({ clan }: { clan: ClanDetail | null }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Applications & Invites</h2>
        <button className="btn-primary">Send Invite</button>
      </div>

      <div className="card-glass p-6 text-center">
        <div className="text-4xl mb-4">🪪</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Applications Yet
        </h3>
        <p className="text-gray-600 mb-4">
          When users request to join your clan, their applications will appear here.
        </p>
        <button className="btn-primary">Invite Members</button>
      </div>
    </div>
  );
}

function GigsTab({ clan }: { clan: ClanDetail | null }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gig Management</h2>
        <button className="btn-primary">Create Gig</button>
      </div>

      <div className="card-glass p-6 text-center">
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Active Gigs
        </h3>
        <p className="text-gray-600 mb-4">
          Create gigs for your clan members to work on together.
        </p>
        <button className="btn-primary">Create First Gig</button>
      </div>
    </div>
  );
}

function CreditsTab({ clan }: { clan: ClanDetail | null }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Credits & Contributions</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-glass p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Total Gigs</h3>
          <p className="text-2xl font-bold text-brand-primary">{clan?.totalGigs || 0}</p>
        </div>
        <div className="card-glass p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-600">${clan?.totalRevenue || 0}</p>
        </div>
        <div className="card-glass p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Reputation Score</h3>
          <p className="text-2xl font-bold text-gray-600">{clan?.reputationScore || 0}</p>
        </div>
      </div>

      <div className="card-glass p-6 text-center">
        <div className="text-4xl mb-4">💰</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Credit Activity
        </h3>
        <p className="text-gray-600 mb-4">
          Credit transactions and contributions will appear here.
        </p>
        <button className="btn-primary">Request Credits</button>
      </div>
    </div>
  );
}

function SettingsTab({ clan }: { clan: ClanDetail | null }) {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-bold text-gray-900">Clan Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clan Name
            </label>
            <input
              type="text"
              defaultValue={clan?.name || ''}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              defaultValue={clan?.description || ''}
              rows={3}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visibility
            </label>
            <select defaultValue={clan?.visibility || 'PUBLIC'} className="input w-full">
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
              <option value="INVITE_ONLY">Invite Only</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Advanced Settings</h3>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="isActive" defaultChecked={clan?.isActive} />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active clan
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Members
            </label>
            <input
              type="number"
              defaultValue={clan?.maxMembers || 50}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Category
            </label>
            <input
              type="text"
              defaultValue={clan?.primaryCategory || ''}
              className="input w-full"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
        <button className="btn-error">
          Delete Clan
        </button>
      </div>
    </div>
  );
}

function LogsTab({ clan }: { clan: ClanDetail | null }) {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-bold text-gray-900">Activity Logs</h2>

      <div className="card-glass p-6 text-center">
        <div className="text-4xl mb-4">🔔</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Recent Activity
        </h3>
        <p className="text-gray-600 mb-4">
          Clan activity logs will appear here as members join, leave, and perform actions.
        </p>
      </div>
    </div>
  );
} 