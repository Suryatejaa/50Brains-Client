'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import ConfirmDialog from '@/frontend-profile/components/common/ConfirmDialog';

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'INACTIVE';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  isBanned: boolean;
}

interface DialogState {
  isOpen: boolean;
  type: 'ban' | 'unban' | 'update-roles' | 'update-status' | null;
  userId: string | null;
  userName: string | null;
  currentRoles?: string[];
  currentStatus?: string;
  loading: boolean;
}

export default function AdminUsersPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<
    | 'all'
    | 'USER'
    | 'INFLUENCER'
    | 'BRAND'
    | 'CREW'
    | 'MODERATOR'
    | 'ADMIN'
    | 'SUPER_ADMIN'
  >('all');
  const [statusFilter, setStatusFilter] = useState<
    | 'all'
    | 'PENDING_VERIFICATION'
    | 'ACTIVE'
    | 'INACTIVE'
    | 'SUSPENDED'
    | 'BANNED'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    type: null,
    userId: null,
    userName: null,
    loading: false,
  });
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [allUsers, roleFilter, statusFilter, searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>('/api/user/admin/users');

      if (response.success) {
        setAllUsers((response.data as any)?.users || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...allUsers];

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.roles.includes(roleFilter));
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query) ||
          (user.firstName && user.firstName.toLowerCase().includes(query)) ||
          (user.lastName && user.lastName.toLowerCase().includes(query))
      );
    }

    setFilteredUsers(filtered);
  };

  const openDialog = (
    type: DialogState['type'],
    userId: string,
    userName: string,
    currentRoles?: string[],
    currentStatus?: string
  ) => {
    setDialog({
      isOpen: true,
      type,
      userId,
      userName,
      currentRoles,
      currentStatus,
      loading: false,
    });
    setInputValue('');
  };

  const closeDialog = () => {
    setDialog({
      isOpen: false,
      type: null,
      userId: null,
      userName: null,
      loading: false,
    });
    setInputValue('');
  };

  const handleConfirmAction = async () => {
    if (!dialog.userId || !dialog.type) return;

    setDialog((prev) => ({ ...prev, loading: true }));

    try {
      let response;

      switch (dialog.type) {
        case 'ban':
          response = await apiClient.post<any>(
            `/api/user/admin/users/${dialog.userId}/ban`,
            {}
          );
          if (response.success) {
            setAllUsers((prevUsers) =>
              prevUsers.map((user) =>
                user.id === dialog.userId ? { ...user, isBanned: true } : user
              )
            );
          }
          break;

        case 'unban':
          response = await apiClient.post<any>(
            `/api/user/admin/users/${dialog.userId}/unban`,
            {}
          );
          if (response.success) {
            setAllUsers((prevUsers) =>
              prevUsers.map((user) =>
                user.id === dialog.userId ? { ...user, isBanned: false } : user
              )
            );
          }
          break;

        case 'update-roles':
          if (!inputValue.trim()) {
            alert('Please enter at least one role');
            setDialog((prev) => ({ ...prev, loading: false }));
            return;
          }
          const newRoles = inputValue
            .split(',')
            .map((r) => r.trim().toUpperCase());
          response = await apiClient.patch<any>(
            `/api/user/admin/users/${dialog.userId}/roles`,
            { roles: newRoles }
          );
          if (response.success) {
            setAllUsers((prevUsers) =>
              prevUsers.map((user) =>
                user.id === dialog.userId ? { ...user, roles: newRoles } : user
              )
            );
          }
          break;

        case 'update-status':
          if (!inputValue.trim()) {
            alert('Please enter a status');
            setDialog((prev) => ({ ...prev, loading: false }));
            return;
          }
          const newStatus = inputValue.trim().toUpperCase() as any;
          response = await apiClient.patch<any>(
            `/api/user/admin/users/${dialog.userId}/status`,
            { status: newStatus }
          );
          if (response.success) {
            setAllUsers((prevUsers) =>
              prevUsers.map((user) =>
                user.id === dialog.userId
                  ? { ...user, status: newStatus }
                  : user
              )
            );
          }
          break;

        default:
          return;
      }

      if (response.success) {
        closeDialog();
      }
    } catch (error) {
      console.error('Failed to perform action:', error);
      alert('Failed to perform action. Please try again.');
    } finally {
      setDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const getDialogContent = () => {
    switch (dialog.type) {
      case 'ban':
        return {
          title: 'Ban User',
          message: `Are you sure you want to ban ${dialog.userName}? They will not be able to access the platform.`,
          confirmText: 'Ban User',
          danger: true,
        };
      case 'unban':
        return {
          title: 'Unban User',
          message: `Are you sure you want to unban ${dialog.userName}? They will regain access to the platform.`,
          confirmText: 'Unban User',
          danger: false,
        };
      case 'update-roles':
        return {
          title: 'Update User Roles',
          message: `Enter roles (comma-separated). Current: ${dialog.currentRoles?.join(', ')}\nAvailable: USER, BRAND, INFLUENCER, CREW, MODERATOR, ADMIN, SUPER_ADMIN`,
          confirmText: 'Update Roles',
          danger: false,
        };
      case 'update-status':
        return {
          title: 'Update User Status',
          message: `Enter new status. Current: ${dialog.currentStatus}\nAvailable: PENDING_VERIFICATION, ACTIVE, INACTIVE, SUSPENDED, BANNED`,
          confirmText: 'Update Status',
          danger: false,
        };
      default:
        return {
          title: '',
          message: '',
          confirmText: 'Confirm',
          danger: false,
        };
    }
  };

  const dialogContent = getDialogContent();

  const getRoleColors = (role: string): string => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-100 text-red-700';
      case 'ADMIN':
        return 'bg-orange-100 text-orange-700';
      case 'MODERATOR':
        return 'bg-yellow-100 text-yellow-700';
      case 'BRAND':
        return 'bg-blue-100 text-blue-700';
      case 'INFLUENCER':
        return 'bg-purple-100 text-purple-700';
      case 'CREW':
        return 'bg-cyan-100 text-cyan-700';
      case 'USER':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return 'border-green-500 bg-green-50 text-green-600';
      case 'PENDING_VERIFICATION':
        return 'border-yellow-500 bg-yellow-50 text-yellow-600';
      case 'INACTIVE':
        return 'border-gray-500 bg-gray-50 text-gray-600';
      case 'SUSPENDED':
        return 'border-orange-500 bg-orange-50 text-orange-600';
      case 'BANNED':
        return 'border-red-500 bg-red-50 text-red-600';
      default:
        return 'border-gray-500 bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-heading mb-4 text-2xl font-bold">
            User Management
          </h1>

          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="text"
              placeholder="Search by email, username, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field flex-1"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="input-field md:w-48"
            >
              <option value="all">All Roles</option>
              <option value="USER">User</option>
              <option value="BRAND">Brand</option>
              <option value="INFLUENCER">Influencer</option>
              <option value="CREW">Crew</option>
              <option value="MODERATOR">Moderator</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="input-field md:w-48"
            >
              <option value="all">All Status</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="BANNED">Banned</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="card-glass p-8 text-center">
            <div className="text-body">Loading users...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="card-glass p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-heading text-lg font-semibold">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.username}
                      </h3>
                      <span
                        className={`rounded-none border px-2 py-1 text-xs ${getStatusColor(user.status)}`}
                      >
                        {user.status}
                      </span>
                      {user.isBanned && (
                        <span className="rounded-none border border-red-500 bg-red-50 px-2 py-1 text-xs text-red-600">
                          🚫 BANNED
                        </span>
                      )}
                    </div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className={`rounded-none px-2 py-1 text-xs font-medium ${getRoleColors(role)}`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                    <div className="text-body space-y-1 text-sm">
                      <div>
                        <strong>Email:</strong> {user.email}
                        {user.emailVerified && ' ✅'}
                      </div>
                      <div>
                        <strong>Username:</strong> {user.username}
                      </div>
                      <div>
                        <strong>Joined:</strong>{' '}
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                      {user.lastLoginAt && (
                        <div>
                          <strong>Last Login:</strong>{' '}
                          {new Date(user.lastLoginAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        openDialog(
                          'update-roles',
                          user.id,
                          user.username,
                          user.roles
                        )
                      }
                      className="rounded-none border border-blue-500 bg-blue-50 px-3 py-1 text-sm text-blue-600 hover:bg-blue-100"
                    >
                      Edit Roles
                    </button>
                    <button
                      onClick={() =>
                        openDialog(
                          'update-status',
                          user.id,
                          user.username,
                          undefined,
                          user.status
                        )
                      }
                      className="rounded-none border border-purple-500 bg-purple-50 px-3 py-1 text-sm text-purple-600 hover:bg-purple-100"
                    >
                      Change Status
                    </button>
                    {user.isBanned ? (
                      <button
                        onClick={() =>
                          openDialog('unban', user.id, user.username)
                        }
                        className="rounded-none border border-green-500 bg-green-50 px-3 py-1 text-sm text-green-600 hover:bg-green-100"
                      >
                        Unban
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          openDialog('ban', user.id, user.username)
                        }
                        className="rounded-none border border-red-500 bg-red-50 px-3 py-1 text-sm text-red-600 hover:bg-red-100"
                      >
                        Ban
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="card-glass p-8 text-center">
                <div className="text-muted">No users found</div>
              </div>
            )}
          </div>
        )}

        {/* Stats Footer */}
        <div className="card-glass mt-8 p-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-heading text-2xl font-bold">
                {allUsers.length}
              </div>
              <div className="text-muted text-sm">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-heading text-2xl font-bold">
                {allUsers.filter((u) => u.status === 'ACTIVE').length}
              </div>
              <div className="text-muted text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-heading text-2xl font-bold">
                {allUsers.filter((u) => u.isBanned).length}
              </div>
              <div className="text-muted text-sm">Banned Users</div>
            </div>
            <div className="text-center">
              <div className="text-heading text-2xl font-bold">
                {allUsers.filter((u) => !u.emailVerified).length}
              </div>
              <div className="text-muted text-sm">Email Unverified</div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Confirm Dialog */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-50">
          {dialog.type === 'ban' || dialog.type === 'unban' ? (
            <ConfirmDialog
              isOpen={dialog.isOpen}
              title={dialogContent.title}
              message={dialogContent.message}
              confirmText={dialogContent.confirmText}
              cancelText="Cancel"
              onConfirm={handleConfirmAction}
              onCancel={closeDialog}
              danger={dialogContent.danger}
              loading={dialog.loading}
            />
          ) : dialog.type === 'update-roles' ||
            dialog.type === 'update-status' ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">
                  {dialogContent.title}
                </h2>
                <p className="mb-4 text-sm text-gray-700">
                  {dialog.type === 'update-roles'
                    ? 'Current roles: '
                    : 'Current status: '}
                  <strong>
                    {dialog.type === 'update-roles'
                      ? dialog.currentRoles?.join(', ')
                      : dialog.currentStatus}
                  </strong>
                </p>

                {dialog.type === 'update-roles' ? (
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Select Roles (hold Ctrl/Cmd for multiple)
                    </label>
                    <select
                      multiple
                      value={inputValue.split(',').filter((v) => v.trim())}
                      onChange={(e) => {
                        const selected = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        );
                        setInputValue(selected.join(','));
                      }}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      disabled={dialog.loading}
                      size={5}
                    >
                      <option value="USER">User</option>
                      <option value="BRAND">Brand</option>
                      <option value="INFLUENCER">Influencer</option>
                      <option value="CREW">Crew</option>
                      <option value="MODERATOR">Moderator</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>
                ) : (
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Select Status
                    </label>
                    <select
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      disabled={dialog.loading}
                    >
                      <option value="">-- Select Status --</option>                      
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="SUSPENDED">Suspended</option>
                      <option value="BANNED">Banned</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeDialog}
                    disabled={dialog.loading}
                    className="rounded border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    disabled={dialog.loading || !inputValue.trim()}
                    className="rounded border border-blue-500 bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                  >
                    {dialog.loading
                      ? 'Processing...'
                      : dialogContent.confirmText}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
