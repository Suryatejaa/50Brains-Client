'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { DashboardHeader } from '../shared/DashboardHeader';
import { MetricCard } from '../shared/MetricCard';
import { QuickActionsGrid } from '../shared/QuickActions';

interface ClanDashboardData {
  clanInfo: {
    id: string;
    name: string;
    description: string;
    memberCount: number;
    totalReputation: number;
    level: string;
    createdAt: string;
  };
  members: Array<{
    id: string;
    name: string;
    avatar: string;
    role: string;
    reputation: number;
    joinedAt: string;
    status: 'active' | 'inactive';
  }>;
  rankings: {
    position: number;
    totalClans: number;
    category: string;
    monthlyRank: number;
  };
  projects: {
    active: Array<{
      id: string;
      title: string;
      status: string;
      deadline: string;
      participants: number;
    }>;
    completed: number;
    totalEarnings: number;
  };
  activities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
  invitations: Array<{
    id: string;
    recipientEmail: string;
    status: 'pending' | 'accepted' | 'rejected';
    sentAt: string;
  }>;
}

export const ClanDashboard: React.FC = () => {
  const { user } = useAuth();
  const [clanData, setClanData] = useState<ClanDashboardData | null>(null);
  const [userClanId, setUserClanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClanDashboardData();
  }, []);

  const loadClanDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // First, get user's clan membership
      const membershipResponse = await apiClient.get(
        `/api/clan/user/${user.id}/membership`
      );

      if (!membershipResponse.success || !(membershipResponse.data as any)?.clanId) {
        setError('You are not currently a member of any clan.');
        setLoading(false);
        return;
      }

      const clanId = (membershipResponse.data as { clanId: string }).clanId;
      setUserClanId(clanId);

      const [
        clanInfoResponse,
        membersResponse,
        rankingsResponse,
        projectsResponse,
        activitiesResponse,
        invitationsResponse,
      ] = await Promise.allSettled([
        apiClient.get(`/api/clan/${clanId}`),
        apiClient.get(`/api/members/${clanId}`),
        apiClient.get(`/api/rankings/clan/${clanId}`),
        apiClient.get(`/api/clan/${clanId}/projects`),
        apiClient.get(`/api/clan/${clanId}/activities?limit=10`),
        apiClient.get(`/api/clan/${clanId}/invitations`),
      ]);

      const data: ClanDashboardData = {
        clanInfo:
          clanInfoResponse.status === 'fulfilled' &&
          clanInfoResponse.value.success
            ? (clanInfoResponse.value.data as ClanDashboardData['clanInfo'])
            : {
                id: '',
                name: 'Unknown Clan',
                description: '',
                memberCount: 0,
                totalReputation: 0,
                level: 'Bronze',
                createdAt: '',
              },

        members:
          membersResponse.status === 'fulfilled' &&
          membersResponse.value.success
            ? (membersResponse.value.data as ClanDashboardData['members'])
            : [],

        rankings:
          rankingsResponse.status === 'fulfilled' &&
          rankingsResponse.value.success
            ? (rankingsResponse.value.data as ClanDashboardData['rankings'])
            : {
                position: 0,
                totalClans: 0,
                category: 'General',
                monthlyRank: 0,
              },

        projects:
          projectsResponse.status === 'fulfilled' &&
          projectsResponse.value.success
            ? (projectsResponse.value.data as ClanDashboardData['projects'])
            : { active: [], completed: 0, totalEarnings: 0 },

        activities:
          activitiesResponse.status === 'fulfilled' &&
          activitiesResponse.value.success
            ? (activitiesResponse.value.data as ClanDashboardData['activities'])
            : [],

        invitations:
          invitationsResponse.status === 'fulfilled' &&
          invitationsResponse.value.success
            ? (invitationsResponse.value.data as ClanDashboardData['invitations'])
            : [],
      };

      setClanData(data);
    } catch (error) {
      console.error('Failed to load clan dashboard data:', error);
      setError('Failed to load clan dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      href: `/clan/${userClanId}/invite`,
      icon: '➕',
      label: 'Invite Members',
      description: 'Grow your clan',
      permission: 'clan.manage',
    },
    {
      href: `/clan/${userClanId}/projects/create`,
      icon: '🚀',
      label: 'Start Project',
      description: 'Create collaboration',
      permission: 'clan.manage',
    },
    {
      href: `/clan/${userClanId}/settings`,
      icon: '⚙️',
      label: 'Clan Settings',
      description: 'Manage clan',
      permission: 'clan.manage',
    },
    {
      href: `/clan/${userClanId}/analytics`,
      icon: '📈',
      label: 'Analytics',
      description: 'View performance',
    },
    {
      href: '/clans/browse',
      icon: '🔍',
      label: 'Browse Clans',
      description: 'Discover others',
    },
    {
      href: `/clan/${userClanId}/treasury`,
      icon: '💰',
      label: 'Treasury',
      description: 'Manage funds',
      permission: 'clan.manage',
    },
    {
      href: `/clan/${userClanId}/achievements`,
      icon: '🏆',
      label: 'Achievements',
      description: 'View badges',
    },
    {
      href: '/clan/marketplace',
      icon: '🛒',
      label: 'Clan Market',
      description: 'Team projects',
    },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="card-glass p-8 text-center">
            <span className="mb-4 block text-4xl">👥</span>
            <h2 className="text-heading mb-2 text-xl font-semibold">
              No Clan Found
            </h2>
            <p className="text-muted mb-4">{error}</p>
            <div className="space-x-4">
              <button
                onClick={() => (window.location.href = '/clans/browse')}
                className="btn-primary"
              >
                Browse Clans
              </button>
              <button
                onClick={() => (window.location.href = '/clans/create')}
                className="btn-secondary"
              >
                Create Clan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader
          title={`${clanData?.clanInfo?.name || 'Clan'} Dashboard`}
          subtitle="Manage your clan and collaborate with fellow creators"
        />

        {/* Clan Overview */}
        <div className="card-glass mb-8 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-heading text-xl font-bold">
                {clanData?.clanInfo?.name}
              </h2>
              <p className="text-muted">
                {clanData?.clanInfo?.description || 'No description available'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-accent text-2xl font-bold">
                {clanData?.clanInfo?.level || 'Bronze'}
              </div>
              <div className="text-muted text-sm">Clan Level</div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Members"
            value={clanData?.members?.length || 0}
            icon="👥"
            loading={loading}
            onClick={() =>
              (window.location.href = `/clan/${userClanId}/members`)
            }
          />
          <MetricCard
            title="Clan Rank"
            value={`#${clanData?.rankings?.position || 'N/A'}`}
            icon="🏆"
            loading={loading}
            onClick={() => (window.location.href = '/clan/rankings')}
          />
          <MetricCard
            title="Active Projects"
            value={clanData?.projects?.active?.length || 0}
            icon="🚀"
            loading={loading}
            onClick={() =>
              (window.location.href = `/clan/${userClanId}/projects`)
            }
          />
          <MetricCard
            title="Total Reputation"
            value={clanData?.clanInfo?.totalReputation || 0}
            icon="⭐"
            loading={loading}
          />
        </div>

        {/* Dashboard Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Member Management */}
          <div className="card-glass p-6">
            <h3 className="text-heading mb-6 text-lg font-semibold">
              👥 Active Members
            </h3>

            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                    <div className="flex-1">
                      <div className="mb-1 h-3 w-3/4 rounded bg-gray-300"></div>
                      <div className="h-2 w-1/2 rounded bg-gray-300"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {clanData?.members?.slice(0, 5).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-white">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-body text-sm font-medium">
                          {member.name}
                        </div>
                        <div className="text-muted text-xs">{member.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-heading text-sm font-semibold">
                        {member.reputation}
                      </div>
                      <div
                        className={`text-xs ${member.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}
                      >
                        {member.status}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="py-4 text-center">
                    <span className="mb-2 block text-2xl">👥</span>
                    <p className="text-muted">No members found</p>
                  </div>
                )}

                {clanData?.members && clanData.members.length > 5 && (
                  <div className="border-t pt-2">
                    <button
                      onClick={() =>
                        (window.location.href = `/clan/${userClanId}/members`)
                      }
                      className="text-accent w-full text-sm hover:underline"
                    >
                      View All Members ({clanData.members.length})
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Projects */}
          <div className="card-glass p-6">
            <h3 className="text-heading mb-6 text-lg font-semibold">
              🚀 Active Projects
            </h3>

            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded border border-gray-200 p-3">
                    <div className="mb-2 h-3 w-3/4 rounded bg-gray-300"></div>
                    <div className="h-2 w-1/2 rounded bg-gray-300"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {clanData?.projects?.active?.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                  >
                    <h4 className="text-body mb-2 font-medium">
                      {project.title}
                    </h4>
                    <div className="text-muted space-y-1 text-xs">
                      <div>
                        Status:{' '}
                        <span className="capitalize">{project.status}</span>
                      </div>
                      <div>Participants: {project.participants}</div>
                      <div>
                        Deadline:{' '}
                        {new Date(project.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="py-4 text-center">
                    <span className="mb-2 block text-2xl">🚀</span>
                    <p className="text-muted mb-3">No active projects</p>
                    <button
                      onClick={() =>
                        (window.location.href = `/clan/${userClanId}/projects/create`)
                      }
                      className="btn-primary text-sm"
                    >
                      Start Project
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <div className="card-glass p-6">
            <h3 className="text-heading mb-6 text-lg font-semibold">
              ⚡ Recent Activities
            </h3>

            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="h-6 w-6 rounded bg-gray-300"></div>
                    <div className="flex-1">
                      <div className="mb-1 h-3 w-3/4 rounded bg-gray-300"></div>
                      <div className="h-2 w-1/2 rounded bg-gray-300"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {clanData?.activities?.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 text-sm"
                  >
                    <span className="text-lg">
                      {activity.type === 'member_joined'
                        ? '👋'
                        : activity.type === 'project_completed'
                          ? '✅'
                          : activity.type === 'achievement_earned'
                            ? '🏆'
                            : '📝'}
                    </span>
                    <div className="flex-1">
                      <div className="text-body">{activity.description}</div>
                      <div className="text-muted text-xs">
                        {new Date(activity.timestamp).toLocaleDateString()} •{' '}
                        {activity.user}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="py-4 text-center">
                    <span className="mb-2 block text-2xl">⚡</span>
                    <p className="text-muted">No recent activities</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Clan Performance & Invitations */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card-glass p-6">
            <h3 className="text-heading mb-6 text-lg font-semibold">
              📊 Clan Performance
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-body">Global Ranking</span>
                <span className="text-heading font-semibold">
                  #{clanData?.rankings?.position || 'N/A'} of{' '}
                  {clanData?.rankings?.totalClans || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body">Monthly Rank</span>
                <span className="text-heading font-semibold">
                  #{clanData?.rankings?.monthlyRank || 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body">Completed Projects</span>
                <span className="text-heading font-semibold">
                  {clanData?.projects?.completed || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body">Total Earnings</span>
                <span className="text-heading font-semibold text-green-600">
                  ${clanData?.projects?.totalEarnings || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="card-glass p-6">
            <h3 className="text-heading mb-6 text-lg font-semibold">
              💌 Pending Invitations
            </h3>

            <div className="space-y-3">
              {clanData?.invitations
                ?.filter((inv) => inv.status === 'pending')
                .map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-body">
                      {invitation.recipientEmail}
                    </span>
                    <span className="text-xs text-yellow-600">Pending</span>
                  </div>
                )) || (
                <div className="py-4 text-center">
                  <span className="mb-2 block text-2xl">💌</span>
                  <p className="text-muted">No pending invitations</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActionsGrid actions={quickActions} title="Clan Management" />
      </div>
    </div>
  );
};
