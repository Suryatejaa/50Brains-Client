'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useClan, useClanJoinRequests } from '@/hooks/useClans';
import { clanApiClient } from '@/lib/clan-api';
import type { Clan, ClanMember as HookClanMember, ClanJoinRequest as HookClanJoinRequest } from '@/hooks/useClans';
import { toast } from 'sonner';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { RoleManagementModal } from '@/components/clan/RoleManagementModal';

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

  const { clan, loading: clanLoading, error: clanError, refetch: refetchClan } = useClan(clanId);
  const { requests: joinRequests, loading: joinRequestsLoading, refetch: refetchJoinRequests, approve, reject } = useClanJoinRequests(clanId);

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
      const response = await clanApiClient.updateMemberRole(clanId, userId, roleData);

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

  useEffect(() => {
    if (canManage && activeTab === 'applications') {
      refetchJoinRequests();
    }
  }, [canManage, activeTab, clanId, refetchJoinRequests]);

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
      case 'members':
        return <MembersTab clan={clan} members={members} onRoleUpdate={handleRoleUpdate} onOpenRoleModal={openRoleModal} />;
      case 'applications':
        return <ApplicationsTab clan={clan} joinRequests={joinRequests} loading={joinRequestsLoading} onAction={handleJoinRequestAction} />;
      case 'settings':
        return <SettingsTab clan={clan} />;
      default:
        return <MembersTab clan={clan} members={members} onRoleUpdate={handleRoleUpdate} onOpenRoleModal={openRoleModal} />;
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

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-1">
              <nav className="-mb-px flex justify-between lg:justify-start md:justify-start">
                {[
                  { id: 'members', label: 'Members', icon: '👥' },
                  { id: 'applications', label: 'Applications', icon: '📝', badge: joinRequests.filter(r => r.status === 'PENDING').length },
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
function MembersTab({ clan, members, onRoleUpdate, onOpenRoleModal }: {
  clan: ClanDetail | null;
  members: ClanMember[];
  onRoleUpdate: (userId: string, roleData: { role: 'HEAD' | 'CO_HEAD' | 'ADMIN' | 'SENIOR_MEMBER' | 'MEMBER' | 'TRAINEE'; customRole?: string }) => Promise<void>;
  onOpenRoleModal: (member: ClanMember) => void;
}) {
  const [filterRole, setFilterRole] = useState('all');

  const filteredMembers = filterRole === 'all'
    ? members
    : members.filter(member => member.role === filterRole);

  const roles = ['HEAD', 'CO_HEAD', 'ADMIN', 'SENIOR_MEMBER', 'MEMBER', 'TRAINEE'];

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Member Management</h2>
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
        {filteredMembers.map((member) => (
          <div key={member.id} className="card-glass p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                {member.user?.avatar ? (
                  <img src={member.user.avatar} alt={member.user.name} className="w-12 h-12 rounded-full" />
                ) : (
                  <span className="text-lg font-semibold text-gray-600">
                    {member.user?.name?.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{member.user?.name}</h3>
                <p className="text-sm text-gray-600">{member.role}</p>
                <p className="text-xs text-gray-500">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onOpenRoleModal(member)}
                className="btn-ghost text-sm hover:bg-blue-50 hover:text-blue-600"
              >
                Manage Role
              </button>
              <button className="btn-ghost text-sm text-red-600 hover:bg-red-50">Remove</button>
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
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Applications & Invites</h2>
        <button className="btn-primary p-1">Send Invite</button>
      </div>

      {joinRequests.map((request) => (
        <div key={request.id} className="card-glass p-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              {request.user?.avatar ? (
                <img src={request.user.avatar} alt={request.user?.name || 'Applicant'} className="w-12 h-12 rounded-full" />
              ) : (
                <span className="text-lg font-semibold text-gray-600">
                  {(request.user?.name || 'U').charAt(0)}
                </span>
              )}
            </div> */}
            <div>
              <h3 className="font-semibold text-gray-900">{request.user?.name || 'Applicant'}</h3>
              <p className="text-sm text-gray-600">{request.user?.email || ''}</p>
              <p className="text-xs text-gray-500">Submitted: {new Date((request as any).submittedAt || request.createdAt).toLocaleDateString()}</p>
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
                  className="btn-primary p-1 text-sm"
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

function SettingsTab({ clan }: { clan: ClanDetail | null }) {
  const [formData, setFormData] = useState({
    name: clan?.name || '',
    description: clan?.description || '',
    visibility: clan?.visibility || 'PUBLIC',
    isActive: clan?.isActive || true,
    maxMembers: clan?.maxMembers || 50,
    primaryCategory: clan?.primaryCategory || ''
  });
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Update form data when clan data changes
  useEffect(() => {
    if (clan) {
      setFormData({
        name: clan.name || '',
        description: clan.description || '',
        visibility: clan.visibility || 'PUBLIC',
        isActive: clan.isActive || true,
        maxMembers: clan.maxMembers || 50,
        primaryCategory: clan.primaryCategory || ''
      });
    }
  }, [clan]);

  // Track changes to enable/disable save button
  useEffect(() => {
    if (clan) {
      const hasChanged =
        formData.name !== (clan.name || '') ||
        formData.description !== (clan.description || '') ||
        formData.visibility !== (clan.visibility || 'PUBLIC') ||
        formData.isActive !== (clan.isActive || true) ||
        formData.maxMembers !== (clan.maxMembers || 50) ||
        formData.primaryCategory !== (clan.primaryCategory || '');

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
        visibility: formData.visibility as 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY',
        isActive: formData.isActive,
        maxMembers: formData.maxMembers,
        primaryCategory: formData.primaryCategory.trim()
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