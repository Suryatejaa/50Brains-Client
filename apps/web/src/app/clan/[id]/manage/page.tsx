'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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

interface ClanJoinRequest {
  id: string;
  clanId: string;
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message?: string;
  portfolioUrls?: string[];
  skills?: string[];
  availability?: string;
  expectedContribution?: string;
  submittedAt: string;
  respondedAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    reputationScore?: number;
    totalGigs?: number;
    completedGigs?: number;
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
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const clanId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);

  const [clan, setClan] = useState<ClanDetail | null>(null);
  const [clanLoading, setClanLoading] = useState(true);
  const [clanError, setClanError] = useState<string | null>(null);
  const [joinRequests, setJoinRequests] = useState<ClanJoinRequest[]>([]);
  const [joinRequestsLoading, setJoinRequestsLoading] = useState(false);

  // Check if user has permission to manage this clan
  const canManage = clan && user && (clan.clanHeadId === user.id ||
    clan.members?.some(member =>
      member.userId === user.id &&
      ['HEAD', 'CO_HEAD', 'ADMIN'].includes(member.role)
    ));

  // Set active tab from URL parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType;
    if (tabParam && ['overview', 'members', 'applications', 'gigs', 'credits', 'settings', 'logs'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const loadClanDetail = async () => {
    if (!clanId) return;

    try {
      setClanLoading(true);
      setClanError(null);

      const response = await apiClient.get(`/api/clan/${clanId}`);

      if (response.success) {
        setClan(response.data as ClanDetail);
      } else {
        setClanError('Failed to load clan details');
      }
    } catch (error: any) {
      console.error('Error loading clan:', error);
      setClanError(error.message || 'Failed to load clan details');
    } finally {
      setClanLoading(false);
    }
  };

  const loadJoinRequests = async () => {
    if (!clanId || !canManage) return;

    try {
      setJoinRequestsLoading(true);
      const response = await apiClient.get(`/api/clan/${clanId}/join-requests`);

      if (response.success) {
        setJoinRequests((response.data as any).joinRequests || []);
      }
    } catch (error: any) {
      console.error('Error loading join requests:', error);
    } finally {
      setJoinRequestsLoading(false);
    }
  };

  const handleJoinRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const response = await apiClient.post(`/api/clan/${clanId}/join-requests/${requestId}/${action}`);

      if (response.success) {
        // Reload join requests
        await loadJoinRequests();
        // Reload clan details to update member count
        await loadClanDetail();
      }
    } catch (error: any) {
      console.error(`Error ${action}ing join request:`, error);
    }
  };

  useEffect(() => {
    loadClanDetail();
  }, [clanId]);

  useEffect(() => {
    if (canManage && activeTab === 'applications') {
      loadJoinRequests();
    }
  }, [canManage, activeTab, clanId]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900 mb-2">Please log in to manage clans</div>
        </div>
      </div>
    );
  }

  if (clanLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-16">
          <div className="content-container py-8">
            <div className="mx-auto max-w-6xl">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (clanError || !clan) {
    return notFound();
  }

  if (!canManage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-16">
          <div className="content-container py-8">
            <div className="mx-auto max-w-6xl">
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-900 mb-2">Access Denied</div>
                <div className="text-gray-600 mb-4">You don't have permission to manage this clan.</div>
                <Link href={`/clan/${clanId}`} className="btn-primary">
                  View Clan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const members = clan.members || [];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab clan={clan} members={members} />;
      case 'members':
        return <MembersTab clan={clan} members={members} />;
      case 'applications':
        return <ApplicationsTab clan={clan} joinRequests={joinRequests} loading={joinRequestsLoading} onAction={handleJoinRequestAction} />;
      case 'gigs':
        return <GigsTab clan={clan} />;
      case 'credits':
        return <CreditsTab clan={clan} />;
      case 'settings':
        return <SettingsTab clan={clan} />;
      case 'logs':
        return <LogsTab clan={clan} />;
      default:
        return <OverviewTab clan={clan} members={members} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{clan.name}</h1>
                  <p className="text-gray-600">Clan Management</p>
                </div>
                <Link href={`/clan/${clanId}`} className="btn-secondary">
                  View Public Page
                </Link>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview', icon: '📊' },
                  { id: 'members', label: 'Members', icon: '👥' },
                  { id: 'applications', label: 'Applications', icon: '📝', badge: joinRequests.filter(r => r.status === 'PENDING').length },
                  { id: 'gigs', label: 'Gigs', icon: '🎯' },
                  { id: 'credits', label: 'Credits', icon: '💰' },
                  { id: 'settings', label: 'Settings', icon: '⚙️' },
                  { id: 'logs', label: 'Logs', icon: '📋' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.badge && tab.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {renderTabContent()}
            </div>
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

function ApplicationsTab({ clan, joinRequests, loading, onAction }: { clan: ClanDetail | null; joinRequests: ClanJoinRequest[]; loading: boolean; onAction: (requestId: string, action: 'approve' | 'reject') => Promise<void> }) {
  if (!clan) return null;

  if (loading && joinRequests.length === 0) {
    return (
      <div className="card-glass p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading applications...</p>
      </div>
    );
  }

  if (joinRequests.length === 0) {
    return (
      <div className="card-glass p-6 text-center">
        <div className="text-4xl mb-4">📝</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Applications Yet
        </h3>
        <p className="text-gray-600 mb-4">
          When users request to join your clan, their applications will appear here.
        </p>
        <button className="btn-primary">Invite Members</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Applications & Invites</h2>
        <button className="btn-primary">Send Invite</button>
      </div>

      {joinRequests.map((request) => (
        <div key={request.id} className="card-glass p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              {request.user.avatar ? (
                <img src={request.user.avatar} alt={request.user.name} className="w-12 h-12 rounded-full" />
              ) : (
                <span className="text-lg font-semibold text-gray-600">
                  {request.user.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{request.user.name}</h3>
              <p className="text-sm text-gray-600">{request.user.email}</p>
              <p className="text-xs text-gray-500">Submitted: {new Date(request.submittedAt).toLocaleDateString()}</p>
              {request.message && (
                <p className="text-sm text-gray-600 mt-1">Message: {request.message}</p>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            {request.status === 'PENDING' && (
              <>
                <button
                  onClick={() => onAction(request.id, 'approve')}
                  className="btn-success text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => onAction(request.id, 'reject')}
                  className="btn-error text-sm"
                >
                  Reject
                </button>
              </>
            )}
            {request.status === 'APPROVED' && (
              <span className="text-sm text-green-600">Approved</span>
            )}
            {request.status === 'REJECTED' && (
              <span className="text-sm text-red-600">Rejected</span>
            )}
          </div>
        </div>
      ))}
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