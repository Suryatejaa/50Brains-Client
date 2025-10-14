'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useClan, useClanJoinRequests } from '@/hooks/useClans';
import { clanApiClient } from '@/lib/clan-api';
import { apiClient } from '@/lib/api-client';
import type { Clan, ClanMember as HookClanMember, ClanJoinRequest as HookClanJoinRequest } from '@/hooks/useClans';
import { toast } from 'sonner';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { RoleManagementModal } from '@/components/clan/RoleManagementModal';
import { useQuery } from '@tanstack/react-query';


type ClanMember = HookClanMember;

type ClanJoinRequest = HookClanJoinRequest;

type ClanDetail = Clan;

type TabType = 'overview' | 'members' | 'applications' | 'gigs' | 'credits' | 'settings' | 'logs';

export default function ClanManagePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const clanId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);

  // Role management modal state
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ClanMember | null>(null);
  const [memberDetails, setMemberDetails] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const { clan, loading: clanLoading, error: clanError, refetch: refetchClan } = useClan(clanId);
  const { requests: joinRequestsIds, loading: joinRequestsIdsLoading, refetch: refetchJoinRequests, approve, reject } = useClanJoinRequests(clanId);

  // Debug logging
  console.log('Hook data - joinRequestsIds:', joinRequestsIds);
  console.log('Current pendingCount state:', pendingCount);

  // Check if user has permission to manage this clan
  const canManage = clan && user && (
    clan.headId === user.id ||
    (Array.isArray((clan as any).admins) && (clan as any).admins.some((admin: string) => admin === user.id))
  );

  // Fetch member details for join requests (since joinRequestsIds only contains user IDs)
  const fetchMemberDetails = async () => {
    try {
      // Only fetch if there are join requests with userIds
      const userIds = joinRequestsIds
        .map((request: any) => request.userId || request)
        .filter(Boolean);

      console.log('Fetching member details for userIds:', userIds);

      if (userIds.length === 0) {
        setMemberDetails([]);
        return;
      }

      const response = await apiClient.post('/api/public/profiles/internal/by-ids', {
        userIds: userIds,
      });

      console.log('response getClanMemberDetails', response);
      if (response.success && response.data) {
        setMemberDetails(response.data as any);
      } else {
        console.warn('Failed to fetch member details:', response);
        setMemberDetails([]);
      }
    } catch (error) {
      console.error('Error fetching member details:', error);
      // Handle specific error types
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as any).statusCode;
        if (statusCode === 400) {
          console.warn('Bad request - possibly invalid userIds');
        } else if (statusCode === 403) {
          console.warn('Access denied to member profiles');
        }
      }
      setMemberDetails([]);
    }
  };



  // Set active tab from URL parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType;
    if (tabParam && ['overview', 'members', 'applications', 'gigs', 'credits', 'settings', 'logs'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleJoinRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const ok = action === 'approve' ? await approve(requestId) : await reject(requestId);
      if (ok) {
        await refetchClan();
        await refetchJoinRequests();
        toast.success(`Join request ${action}ed successfully`);
        try {
          router.refresh();
        } catch { }
        if (action === 'approve' && typeof window !== 'undefined') {
          window.location.reload();
        }
      }
    } catch (error: any) {
      console.error(`Error ${action}ing join request:`, error);
    }
  };

  const handleRoleUpdate = async (userId: string, roleData: { role: 'HEAD' | 'CO_HEAD' | 'ADMIN' | 'SENIOR_MEMBER' | 'MEMBER' | 'TRAINEE'; customRole?: string }) => {
    try {
      setLoading(true);
      // Map extended roles to API-accepted roles
      let apiRole: 'ADMIN' | 'MEMBER' | 'OWNER';
      switch (roleData.role) {
        case 'HEAD':
          apiRole = 'OWNER';
          break;
        case 'CO_HEAD':
        case 'ADMIN':
          apiRole = 'ADMIN';
          break;
        case 'SENIOR_MEMBER':
        case 'MEMBER':
        case 'TRAINEE':
        default:
          apiRole = 'MEMBER';
          break;
      }
      const response = await clanApiClient.updateMemberRole(clanId, userId, {
        role: apiRole,
        customRole: roleData.customRole,
      });

      if (response.success) {
        await refetchClan();
        toast.success('Member role updated successfully');
        setRoleModalOpen(false);
        setSelectedMember(null);
      } else {
        throw new Error(response.message || 'Failed to update member role');
      }
    } catch (error: any) {
      console.error('Error updating member role:', error);
      toast.error(error.message || 'Failed to update member role');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const openRoleModal = (member: ClanMember) => {
    setSelectedMember(member);
    setRoleModalOpen(true);
  };

  // useClan already fetches on mount
  console.log('joinRequestsIds', joinRequestsIds);
  console.log('memberDetails', memberDetails);
  useEffect(() => {
    if (canManage && activeTab === 'applications') {
      // Only fetch join requests if user has permission
      try {
        console.log('refetching join requests');
        refetchJoinRequests();
      } catch (error) {
        console.error('Error fetching join requests:', error);
        // Don't show error to user if it's a permission issue
        if (error && typeof error === 'object' && 'statusCode' in error) {
          const statusCode = (error as any).statusCode;
          if (statusCode === 400 || statusCode === 403) {
            console.warn('User not authorized to view join requests');
          }
        }
      }
    }
  }, [canManage, activeTab, clanId, refetchJoinRequests]);

  // Fetch member details when join requests change
  useEffect(() => {
    if (canManage && joinRequestsIds && joinRequestsIds.length > 0) {
      fetchMemberDetails();
    }
  }, [canManage, joinRequestsIds]);

  // Calculate pending count from joinRequestsIds
  useEffect(() => {
    console.log('Calculating pending count from joinRequestsIds:', joinRequestsIds);

    if (joinRequestsIds && Array.isArray(joinRequestsIds)) {
      // Handle different data structures that the hook might return
      let pendingCount = 0;

      if (joinRequestsIds.length > 0) {
        const firstRequest = joinRequestsIds[0];
        console.log('First request structure:', firstRequest);

        // Check if it's an array of user IDs (strings)
        if (typeof firstRequest === 'string') {
          // If it's just user IDs, assume all are pending
          pendingCount = joinRequestsIds.length;
          console.log('joinRequestsIds is array of user IDs, count:', pendingCount);
        }
        // Check if it has a status field
        else if (firstRequest && typeof firstRequest === 'object' && 'status' in firstRequest) {
          const pendingReqsCount = joinRequestsIds.filter((r: any) => r && typeof r === 'object' && r.status === 'PENDING');
          pendingCount = pendingReqsCount.length;
          console.log('joinRequestsIds has status field, pending count:', pendingCount);
        }
        // If it's an array of objects but no status field, assume all are pending
        else if (firstRequest && typeof firstRequest === 'object') {
          pendingCount = joinRequestsIds.length;
          console.log('joinRequestsIds is array of objects without status, assuming all pending, count:', pendingCount);
        }
      }

      console.log('Final pending count:', pendingCount);
      setPendingCount(pendingCount);
    } else {
      console.log('Setting pending count to 0');
      setPendingCount(0);
    }
  }, [joinRequestsIds]);

  // Fetch join requests when component mounts and user has permission
  useEffect(() => {
    if (canManage && joinRequestsIds.length === 0) {
      console.log('Fetching join requests on mount...');
      refetchJoinRequests();
    }
  }, [canManage, refetchJoinRequests, joinRequestsIds.length]);

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
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-16">
          <div className="content-container py-8">
            <div className="mx-auto max-w-6xl">
              <div className="text-center card-glass p-8">
                <div className="text-4xl mb-4">🚫</div>
                <div className="text-xl font-semibold text-gray-900 mb-2">Clan Not Found</div>
                <div className="text-gray-600 mb-4">We couldn't load this clan. It may have been removed or you may not have access.</div>
                <div className="flex gap-3 justify-center">
                  <Link href={`/clan/${clanId}`} className="btn-secondary">View Public Page</Link>
                  <Link href="/clans" className="btn-primary">Browse Clans</Link>
                </div>
              </div>
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
        return <OverviewTab clan={clan} pendingCount={pendingCount} />;
      case 'members':
        return <MembersTab clan={clan} members={members} pendingCount={pendingCount} onRoleUpdate={handleRoleUpdate} onOpenRoleModal={openRoleModal} />;
      case 'applications':
        return <ApplicationsTab clan={clan} joinRequestsIds={joinRequestsIds} memberDetails={memberDetails} loading={joinRequestsIdsLoading} onAction={handleJoinRequestAction} />;
      case 'settings':
        return <SettingsTab clan={clan} />;
      default:
        return <OverviewTab clan={clan} pendingCount={pendingCount} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-1">
        <div className="content-container py-1">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => router.back()}
                    className="p-0 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                  >
                    <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                  </button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{clan.name}</h1>
                    <p className="text-gray-600">Clan Management</p>
                  </div>
                </div>
                <Link href={`/clan/${clanId}`} className="btn-secondary p-1">
                  View Clan
                </Link>
              </div>
            </div>

            {/* Summary Section */}
            {pendingCount > 0 && (
              <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="inline-block h-3 w-3 bg-orange-500 rounded-full animate-pulse"></span>
                    <span className="text-orange-800 font-medium">
                      {pendingCount} pending application{pendingCount !== 1 ? 's' : ''} require{pendingCount !== 1 ? '' : 's'} your attention
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="text-orange-700 hover:text-orange-900 text-sm font-medium underline"
                  >
                    Review Applications →
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-1">
              <nav className="-mb-px flex justify-between lg:justify-start md:justify-start">
                {[
                  { id: 'overview', label: 'Overview', icon: '📊' },
                  { id: 'members', label: 'Members', icon: '👥' },
                  { id: 'applications', label: 'Applications', icon: '📝', badge: pendingCount },
                  { id: 'settings', label: 'Settings', icon: '⚙️' },
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
                    {tab.badge && tab.badge > 0 ? (
                      <span className="bg-red-500 w-4 h-4 text-white text-center flex items-center justify-center text-xs rounded-full">
                        {tab.badge}
                      </span>
                    ) : (
                      <span className="w-4 h-4"></span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div>
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Role Management Modal */}
      <RoleManagementModal
        isOpen={roleModalOpen}
        onClose={() => {
          setRoleModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        currentUserRole={clan?.members?.find(m => m.userId === user?.id)?.role || 'MEMBER'}
        currentUserId={user?.id || ''}
        onRoleUpdate={handleRoleUpdate}
      />
    </div>
  );
}

// Tab Components
function OverviewTab({ clan, pendingCount }: { clan: ClanDetail | null; pendingCount: number }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Clan Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-glass p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Clan Details</h3>
          <p><strong>Name:</strong> {clan?.name}</p>
          <p><strong>Description:</strong> {clan?.description}</p>
          <p><strong>Visibility:</strong> {clan?.visibility}</p>
          <p><strong>Members:</strong> {clan?.members?.length || 0}</p>
          <p><strong>Pending Applications:</strong> {pendingCount}</p>
        </div>
        <div className="card-glass p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h3>
          <p><strong>Email:</strong> {clan?.email}</p>
          <p><strong>Website:</strong> {clan?.website}</p>
          <p><strong>Instagram:</strong> {clan?.instagramHandle}</p>
          <p><strong>Twitter:</strong> {clan?.twitterHandle}</p>
          <p><strong>LinkedIn:</strong> {clan?.linkedinHandle}</p>
        </div>
      </div>
    </div>
  );
}

function ApplicationsTab({ clan, joinRequestsIds, memberDetails, loading, onAction }: {
  clan: ClanDetail | null;
  joinRequestsIds: any[];
  memberDetails: any[];
  loading: boolean;
  onAction: (requestId: string, action: 'approve' | 'reject') => Promise<void>;
}) {
  // Since joinRequestsIds is an array of user ID strings, all are pending
  const pendingCount = joinRequestsIds.length;
  console.log('Join requests (user IDs):', joinRequestsIds);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-gray-900">Join Applications</h2>
          {pendingCount > 0 && (
            <span className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full border border-orange-200">
              <span className="inline-block mr-2 h-3 w-3 bg-orange-500 rounded-full animate-pulse"></span>
              {pendingCount} pending application{pendingCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      ) : joinRequestsIds.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications</h3>
          <p className="text-gray-600">No one has requested to join this clan yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {joinRequestsIds.map((userId) => {
            const userDetails = memberDetails.find(user => user.id === userId);

            return (
              <div key={userId} className="card-glass p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    {userDetails?.profilePicture ? (
                      <img src={userDetails.profilePicture} alt={userDetails.username || 'Applicant'} className="w-12 h-12 rounded-full" />
                    ) : (
                      <span className="text-lg font-semibold text-gray-600">
                        {userDetails?.username
                          ? userDetails.username.charAt(0).toUpperCase()
                          : userId.charAt(0).toUpperCase()
                        }
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {userDetails?.firstName && userDetails?.lastName
                        ? `${userDetails.firstName} ${userDetails.lastName}`
                        : userDetails?.username || userDetails?.email || `User ${userId}`
                      }
                    </h3>
                    <p className="text-sm text-gray-600">{userDetails?.email || `ID: ${userId}`}</p>
                    <p className="text-xs text-gray-500">Status: Pending Review</p>
                    {userDetails?.location && (
                      <p className="text-xs text-gray-500">📍 {userDetails.location}</p>
                    )}
                    {userDetails?.roles && userDetails.roles.length > 0 && (
                      <p className="text-xs text-gray-500">🎭 {userDetails.roles.join(', ')}</p>
                    )}
                    {!userDetails && (
                      <p className="text-xs text-gray-400">⚠️ User details not available</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onAction(userId, 'approve')}
                    className="btn-primary p-2 text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onAction(userId, 'reject')}
                    className="btn-error text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MembersTab({ clan, members, pendingCount, onRoleUpdate, onOpenRoleModal }: {
  clan: ClanDetail | null;
  members: ClanMember[];
  pendingCount: number;
  onRoleUpdate: (userId: string, roleData: { role: 'HEAD' | 'CO_HEAD' | 'ADMIN' | 'SENIOR_MEMBER' | 'MEMBER' | 'TRAINEE'; customRole?: string }) => Promise<void>;
  onOpenRoleModal: (member: ClanMember) => void;
}) {
  const [filterRole, setFilterRole] = useState('all');

  const filteredMembers = filterRole === 'all'
    ? members
    : members.filter(member => member.role === filterRole);

  const roles = ['OWNER', 'HEAD', 'CO_HEAD', 'ADMIN', 'SENIOR_MEMBER', 'MEMBER', 'TRAINEE'];
  const [memberDetails, setMemberDetails] = useState<any[]>([]);
  const [loadingMemberDetails, setLoadingMemberDetails] = useState(false);

  // Fetch member details when members change
  useEffect(() => {
    const fetchMemberDetails = async () => {
      if (members.length === 0) {
        setMemberDetails([]);
        return;
      }

      try {
        setLoadingMemberDetails(true);
        const userIds = members.map(member => member.userId);

        console.log('Fetching member details for userIds:', userIds);

        const response = await apiClient.post('/api/public/profiles/internal/by-ids', {
          userIds: userIds,
        });

        console.log('Member details response:', response);
        if (response.success && response.data) {
          setMemberDetails(response.data as any);
        } else {
          console.warn('Failed to fetch member details:', response);
          setMemberDetails([]);
        }
      } catch (error) {
        console.error('Error fetching member details:', error);
        setMemberDetails([]);
      } finally {
        setLoadingMemberDetails(false);
      }
    };

    fetchMemberDetails();
  }, [members]);
  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-gray-900">Member Management</h2>
          {pendingCount > 0 && (
            <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-200">
              <span className="inline-block mr-1 h-2 w-2 bg-orange-500 rounded-full animate-pulse"></span>
              {pendingCount} pending
            </span>
          )}
        </div>
        <button className="btn-primary p-1">(+) Invite</button>
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
        {filteredMembers.map((member) => {
          // Find user details for this member
          const userDetails = memberDetails.find(user => user.id === member.userId);

          return (
            <div key={member.id} className="card-glass p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {userDetails?.profilePicture ? (
                    <img src={userDetails.profilePicture} alt={userDetails.username || 'Member'} className="w-12 h-12 rounded-full" />
                  ) : (
                    <span className="text-lg font-semibold text-gray-600">
                      {userDetails?.username
                        ? userDetails.username.charAt(0).toUpperCase()
                        : member.userId.charAt(0).toUpperCase()
                      }
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {userDetails?.firstName && userDetails?.lastName
                      ? `${userDetails.firstName} ${userDetails.lastName}`
                      : userDetails?.username || userDetails?.email || `User ${member.userId}`
                    }
                  </h3>
                  <p className="text-sm text-gray-600">{userDetails?.email || `ID: ${member.userId}`}</p>
                  <p className="text-xs text-gray-500">Role: {member.role}</p>
                  <p className="text-xs text-gray-500">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                  {userDetails?.location && (
                    <p className="text-xs text-gray-500">📍 {userDetails.location}</p>
                  )}
                  {userDetails?.roles && userDetails.roles.length > 0 && (
                    <p className="text-xs text-gray-500">🎭 {userDetails.roles.join(', ')}</p>
                  )}
                  {!userDetails && (
                    <p className="text-xs text-gray-400">⚠️ User details not available</p>
                  )}
                </div>
              </div>
              {member.role !== 'HEAD' && <div className="flex space-x-2">
                <button
                  onClick={() => onOpenRoleModal(member)}
                  className="btn-ghost text-sm hover:bg-blue-50 hover:text-blue-600"
                >
                  Manage Role
                </button>
                <button className="btn-ghost text-sm text-red-600 hover:bg-red-50">Remove</button>
              </div>}
            </div>
          );
        })}
      </div>

      {/* Loading state for member details */}
      {loadingMemberDetails && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading member details...</p>
        </div>
      )}
    </div>
  );
}

function SettingsTab({ clan }: { clan: ClanDetail | null }) {
  const [formData, setFormData] = useState({
    name: clan?.name || '',
    description: clan?.description || '',
    tagline: clan?.tagline || '',
    visibility: clan?.visibility || 'PUBLIC',
    isActive: clan?.isActive || true,
    email: clan?.email || '',
    website: clan?.website || '',
    instagramHandle: clan?.instagramHandle || '',
    twitterHandle: clan?.twitterHandle || '',
    linkedinHandle: clan?.linkedinHandle || '',
    requiresApproval: clan?.requiresApproval || true,
    isPaidMembership: clan?.isPaidMembership || false,
    membershipFee: clan?.membershipFee || 0,
    maxMembers: clan?.maxMembers || 50,
    primaryCategory: clan?.primaryCategory || '',
    categories: clan?.categories || [],
    skills: clan?.skills || [],
    location: clan?.location || '',
    timezone: clan?.timezone || '',
    portfolioImages: clan?.portfolioImages || [],
    portfolioVideos: clan?.portfolioVideos || [],
    showcaseProjects: clan?.showcaseProjects || []
  });
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Update form data when clan data changes
  useEffect(() => {
    if (clan) {
      setFormData({
        name: clan.name || '',
        description: clan.description || '',
        tagline: clan.tagline || '',
        visibility: clan.visibility || 'PUBLIC',
        isActive: clan.isActive || true,
        email: clan.email || '',
        website: clan.website || '',
        instagramHandle: clan.instagramHandle || '',
        twitterHandle: clan.twitterHandle || '',
        linkedinHandle: clan.linkedinHandle || '',
        requiresApproval: clan.requiresApproval || true,
        isPaidMembership: clan.isPaidMembership || false,
        membershipFee: clan.membershipFee || 0,
        maxMembers: clan.maxMembers || 50,
        primaryCategory: clan.primaryCategory || '',
        categories: clan.categories || [],
        skills: clan.skills || [],
        location: clan.location || '',
        timezone: clan.timezone || '',
        portfolioImages: clan.portfolioImages || [],
        portfolioVideos: clan.portfolioVideos || [],
        showcaseProjects: clan.showcaseProjects || []
      });
    }
  }, [clan]);

  // Track changes to enable/disable save button
  useEffect(() => {
    if (clan) {
      const hasChanged =
        formData.name !== (clan.name || '') ||
        formData.description !== (clan.description || '') ||
        formData.tagline !== (clan.tagline || '') ||
        formData.visibility !== (clan.visibility || 'PUBLIC') ||
        formData.isActive !== (clan.isActive || true) ||
        formData.email !== (clan.email || '') ||
        formData.website !== (clan.website || '') ||
        formData.instagramHandle !== (clan.instagramHandle || '') ||
        formData.twitterHandle !== (clan.twitterHandle || '') ||
        formData.linkedinHandle !== (clan.linkedinHandle || '') ||
        formData.requiresApproval !== (clan.requiresApproval || true) ||
        formData.isPaidMembership !== (clan.isPaidMembership || false) ||
        formData.membershipFee !== (clan.membershipFee || 0) ||
        formData.maxMembers !== (clan.maxMembers || 50) ||
        formData.primaryCategory !== (clan.primaryCategory || '') ||
        JSON.stringify(formData.categories) !== JSON.stringify(clan.categories || []) ||
        JSON.stringify(formData.skills) !== JSON.stringify(clan.skills || []) ||
        formData.location !== (clan.location || '') ||
        formData.timezone !== (clan.timezone || '') ||
        JSON.stringify(formData.portfolioImages) !== JSON.stringify(clan.portfolioImages || []) ||
        JSON.stringify(formData.portfolioVideos) !== JSON.stringify(clan.portfolioVideos || []) ||
        JSON.stringify(formData.showcaseProjects) !== JSON.stringify(clan.showcaseProjects || []);

      setHasChanges(hasChanged);
    }
  }, [formData, clan]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    if (!clan?.id || !hasChanges) return;

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Clan name is required');
      return;
    }

    if (formData.maxMembers < 1 || formData.maxMembers > 1000) {
      toast.error('Max members must be between 1 and 1000');
      return;
    }

    try {
      setSaving(true);

      // Prepare update data
      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        tagline: formData.tagline.trim(),
        visibility: formData.visibility as 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY',
        isActive: formData.isActive,
        email: formData.email.trim(),
        website: formData.website.trim(),
        instagramHandle: formData.instagramHandle.trim(),
        twitterHandle: formData.twitterHandle.trim(),
        linkedinHandle: formData.linkedinHandle.trim(),
        requiresApproval: formData.requiresApproval,
        isPaidMembership: formData.isPaidMembership,
        membershipFee: formData.membershipFee,
        maxMembers: formData.maxMembers,
        primaryCategory: formData.primaryCategory.trim(),
        categories: formData.categories,
        skills: formData.skills,
        location: formData.location.trim(),
        timezone: formData.timezone,
        portfolioImages: formData.portfolioImages,
        portfolioVideos: formData.portfolioVideos,
        showcaseProjects: formData.showcaseProjects
      };

      console.log('Updating clan with data:', updateData);

      // Make PUT request using clan API client
      const response = await clanApiClient.updateClan(clan.id, updateData);

      if (response.success) {
        toast.success('Clan settings updated successfully!');
        setHasChanges(false);

        // Refresh the clan data to show updated values
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error('Failed to update clan settings');
      }
    } catch (error: any) {
      console.error('Error updating clan settings:', error);
      toast.error(error.message || 'Failed to update clan settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Clan Settings</h2>
        <button
          onClick={handleSaveSettings}
          disabled={!hasChanges || saving}
          className={`btn-primary px-6 py-2 ${!hasChanges || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clan Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="input w-full"
              placeholder="Enter clan name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="input w-full"
              placeholder="Describe your clan's purpose and goals"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tagline
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => handleInputChange('tagline', e.target.value)}
              className="input w-full"
              placeholder="A short, catchy tagline for your clan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visibility
            </label>
            <select
              value={formData.visibility}
              onChange={(e) => handleInputChange('visibility', e.target.value)}
              className="input w-full"
            >
              <option value="PUBLIC">Public - Anyone can see and join</option>
              <option value="PRIVATE">Private - Visible but requires approval</option>
              <option value="INVITE_ONLY">Invite Only - Hidden from public</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="input w-full"
              placeholder="clan@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="input w-full"
              placeholder="https://example.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram Handle
              </label>
              <input
                type="text"
                value={formData.instagramHandle}
                onChange={(e) => handleInputChange('instagramHandle', e.target.value)}
                className="input w-full"
                placeholder="clanhandle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Twitter Handle
              </label>
              <input
                type="text"
                value={formData.twitterHandle}
                onChange={(e) => handleInputChange('twitterHandle', e.target.value)}
                className="input w-full"
                placeholder="clanhandle"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn Handle
            </label>
            <input
              type="text"
              value={formData.linkedinHandle}
              onChange={(e) => handleInputChange('linkedinHandle', e.target.value)}
              className="input w-full"
              placeholder="clanhandle"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Advanced Settings</h3>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active clan (members can join and participate)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Members
            </label>
            <input
              type="number"
              value={formData.maxMembers}
              onChange={(e) => handleInputChange('maxMembers', parseInt(e.target.value) || 50)}
              min="1"
              max="1000"
              className="input w-full"
              placeholder="Maximum number of members"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="requiresApproval"
              checked={formData.requiresApproval}
              onChange={(e) => handleInputChange('requiresApproval', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="requiresApproval" className="text-sm font-medium text-gray-700">
              Require approval for new members
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPaidMembership"
              checked={formData.isPaidMembership}
              onChange={(e) => handleInputChange('isPaidMembership', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isPaidMembership" className="text-sm font-medium text-gray-700">
              Paid membership required
            </label>
          </div>

          {formData.isPaidMembership && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Membership Fee ($)
              </label>
              <input
                type="number"
                value={formData.membershipFee}
                onChange={(e) => handleInputChange('membershipFee', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="input w-full"
                placeholder="0.00"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="input w-full"
              placeholder="City, Country"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="input w-full"
            >
              <option value="">Select timezone</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Asia/Shanghai">Shanghai (CST)</option>
              <option value="Australia/Sydney">Sydney (AEST)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Category
            </label>
            <input
              type="text"
              value={formData.primaryCategory}
              onChange={(e) => handleInputChange('primaryCategory', e.target.value)}
              className="input w-full"
              placeholder="e.g., Design, Development, Marketing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['Technology', 'Design', 'Content Creation', 'Video Production', 'Photography', 'Marketing', 'Music', 'Gaming', 'Fitness', 'Food', 'Travel', 'Fashion', 'Beauty', 'Education', 'Business'].map((category) => (
                <label key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleInputChange('categories', [...formData.categories, category]);
                      } else {
                        handleInputChange('categories', formData.categories.filter(c => c !== category));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.skills.map((skill, index) => (
                <span
                  key={`skill-${skill}-${index}`}
                  className="bg-brand-primary/10 text-brand-primary px-2 py-1 rounded text-sm flex items-center gap-1"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleInputChange('skills', formData.skills.filter((_, i) => i !== index))}
                    className="text-brand-primary hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a skill"
                className="input flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const skill = (e.target as HTMLInputElement).value.trim();
                    if (skill && !formData.skills.includes(skill)) {
                      handleInputChange('skills', [...formData.skills, skill]);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  const skill = input.value.trim();
                  if (skill && !formData.skills.includes(skill)) {
                    handleInputChange('skills', [...formData.skills, skill]);
                    input.value = '';
                  }
                }}
                className="btn-secondary px-4"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Portfolio Images (URLs)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.portfolioImages.map((image, index) => (
                <span
                  key={`portfolio-image-${index}-${image}`}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1"
                >
                  Image {index + 1}
                  <button
                    type="button"
                    onClick={() => handleInputChange('portfolioImages', formData.portfolioImages.filter((_, i) => i !== index))}
                    className="text-blue-800 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                className="input flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const url = (e.target as HTMLInputElement).value.trim();
                    if (url) {
                      handleInputChange('portfolioImages', [...formData.portfolioImages, url]);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  const url = input.value.trim();
                  if (url) {
                    handleInputChange('portfolioImages', [...formData.portfolioImages, url]);
                    input.value = '';
                  }
                }}
                className="btn-secondary px-4"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Portfolio Videos (URLs)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.portfolioVideos.map((video, index) => (
                <span
                  key={`portfolio-video-${index}-${video}`}
                  className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm flex items-center gap-1"
                >
                  Video {index + 1}
                  <button
                    type="button"
                    onClick={() => handleInputChange('portfolioVideos', formData.portfolioVideos.filter((_, i) => i !== index))}
                    className="text-green-800 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/video.mp4"
                className="input flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const url = (e.target as HTMLInputElement).value.trim();
                    if (url) {
                      handleInputChange('portfolioVideos', [...formData.portfolioVideos, url]);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  const url = input.value.trim();
                  if (url) {
                    handleInputChange('portfolioVideos', [...formData.portfolioVideos, url]);
                    input.value = '';
                  }
                }}
                className="btn-secondary px-4"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Showcase Projects
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.showcaseProjects.map((project, index) => (
                <span
                  key={`showcase-project-${index}-${project}`}
                  className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm flex items-center gap-1"
                >
                  {project}
                  <button
                    type="button"
                    onClick={() => handleInputChange('showcaseProjects', formData.showcaseProjects.filter((_, i) => i !== index))}
                    className="text-purple-800 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Project name"
                className="input flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const project = (e.target as HTMLInputElement).value.trim();
                    if (project) {
                      handleInputChange('showcaseProjects', [...formData.showcaseProjects, project]);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  const project = input.value.trim();
                  if (project) {
                    handleInputChange('showcaseProjects', [...formData.showcaseProjects, project]);
                    input.value = '';
                  }
                }}
                className="btn-secondary px-4"
              >
                Add
              </button>
            </div>
          </div>

          {hasChanges && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                You have unsaved changes. Click "Save Changes" to apply them.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-6 mt-8">
        <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800 mb-3">
            Deleting a clan is permanent and cannot be undone. All members will be removed and all data will be lost.
          </p>
          <button className="btn-error">
            Delete Clan
          </button>
        </div>
      </div>
    </div>
  );
}

function LogsTab({ clan }: { clan: ClanDetail | null }) {
  return (
    <div>
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