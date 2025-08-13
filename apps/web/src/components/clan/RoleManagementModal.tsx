// components/clan/RoleManagementModal.tsx
import React, { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import type { ClanMember } from '@/types/clan.types';

interface RoleManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: any; // Using any to avoid type conflicts between different ClanMember types
    currentUserRole: string;
    currentUserId: string;
    onRoleUpdate: (userId: string, roleData: { role: 'HEAD' | 'CO_HEAD' | 'ADMIN' | 'SENIOR_MEMBER' | 'MEMBER' | 'TRAINEE'; customRole?: string }) => Promise<void>;
}

const ROLE_HIERARCHY = {
    HEAD: 5,
    CO_HEAD: 4,
    ADMIN: 3,
    SENIOR_MEMBER: 2,
    MEMBER: 1,
    TRAINEE: 0
} as const;

const ROLE_DESCRIPTIONS = {
    HEAD: 'Clan Owner - Full control over clan',
    CO_HEAD: 'Deputy Leader - Can manage members below CO_HEAD level',
    ADMIN: 'Administrator - Can manage clan operations',
    SENIOR_MEMBER: 'Experienced member with some privileges',
    MEMBER: 'Regular clan member',
    TRAINEE: 'New member in training'
} as const;

export const RoleManagementModal: React.FC<RoleManagementModalProps> = ({
    isOpen,
    onClose,
    member,
    currentUserRole,
    currentUserId,
    onRoleUpdate
}) => {
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [customRole, setCustomRole] = useState<string>('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (member) {
            setSelectedRole(member.role);
            setCustomRole(member.customRole || '');
            setError('');
        }
    }, [member]);

    if (!isOpen || !member) return null;

    // Check if current user can manage this member's role
    const canManageRole = (): boolean => {
        // HEAD can change any role
        if (currentUserRole === 'HEAD') return true;

        // CO_HEAD can only change roles below CO_HEAD level
        if (currentUserRole === 'CO_HEAD') {
            return ROLE_HIERARCHY[member.role as keyof typeof ROLE_HIERARCHY] < ROLE_HIERARCHY.CO_HEAD;
        }

        // Other roles cannot change any roles
        return false;
    };

    // Get available roles based on current user's permissions
    const getAvailableRoles = (): string[] => {
        if (currentUserRole === 'HEAD') {
            // HEAD can assign any role, but only 1 HEAD allowed
            return ['CO_HEAD', 'ADMIN', 'SENIOR_MEMBER', 'MEMBER', 'TRAINEE'];
        }

        if (currentUserRole === 'CO_HEAD') {
            // CO_HEAD can only assign roles below CO_HEAD level
            return ['ADMIN', 'SENIOR_MEMBER', 'MEMBER', 'TRAINEE'];
        }

        return [];
    };

    // Check business rules
    const validateRoleChange = (newRole: string): string | null => {
        // Cannot change your own role
        if (member.userId === currentUserId) {
            return 'You cannot change your own role';
        }

        // Cannot demote HEAD (must transfer ownership first)
        if (member.role === 'HEAD' && newRole !== 'HEAD') {
            return 'Cannot demote clan HEAD. Transfer ownership first.';
        }

        // Cannot promote to HEAD via role change (must use transfer ownership)
        if (newRole === 'HEAD') {
            return 'Cannot promote to HEAD via role change. Use transfer ownership instead.';
        }

        // CO_HEAD restrictions
        if (currentUserRole === 'CO_HEAD') {
            // Cannot change HEAD or CO_HEAD roles
            if (member.role === 'HEAD' || member.role === 'CO_HEAD') {
                return 'CO_HEAD cannot change HEAD or CO_HEAD roles';
            }

            // Cannot promote to CO_HEAD
            if (newRole === 'CO_HEAD') {
                return 'CO_HEAD cannot promote members to CO_HEAD level';
            }
        }

        return null;
    };

    const handleRoleUpdate = async () => {
        if (!selectedRole) {
            setError('Please select a role');
            return;
        }

        const validationError = validateRoleChange(selectedRole);
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setIsUpdating(true);
            setError('');

            await onRoleUpdate(member.userId, {
                role: selectedRole as 'HEAD' | 'CO_HEAD' | 'ADMIN' | 'SENIOR_MEMBER' | 'MEMBER' | 'TRAINEE',
                customRole: customRole.trim() || undefined
            });

            toast.success('Member role updated successfully');
            onClose();
        } catch (error: any) {
            setError(error.message || 'Failed to update member role');
            toast.error('Failed to update member role');
        } finally {
            setIsUpdating(false);
        }
    };

    const availableRoles = getAvailableRoles();
    const canManage = canManageRole();

    return (
        <div className="fixed inset-0 max-h-screen lg:max-h-[70vh] bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Manage Member Role</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-2 space-y-2">
                    {/* Member Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">Member Information</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p><span className="font-medium">Name:</span> {member.user?.name || 'Unknown'}</p>
                            <p><span className="font-medium">Current Role:</span>
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${member.role === 'HEAD' ? 'bg-purple-100 text-purple-800' :
                                    member.role === 'CO_HEAD' ? 'bg-blue-100 text-blue-800' :
                                        member.role === 'ADMIN' ? 'bg-green-100 text-green-800' :
                                            member.role === 'SENIOR_MEMBER' ? 'bg-orange-100 text-orange-800' :
                                                member.role === 'MEMBER' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {member.role.replace('_', ' ')}
                                </span>
                            </p>
                            <p><span className="font-medium">Joined:</span> {new Date(member.joinedAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Permission Warning */}
                    {!canManage && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                                <span className="text-sm font-medium text-red-800">Insufficient Permissions</span>
                            </div>
                            <p className="text-sm text-red-600 mt-1">
                                You don't have permission to change this member's role.
                            </p>
                        </div>
                    )}

                    {/* Role Selection */}
                    {canManage && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Role *
                                </label>
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select a role</option>
                                    {availableRoles.map(role => (
                                        <option key={role} value={role}>
                                            {role.replace('_', ' ')} - {ROLE_DESCRIPTIONS[role as keyof typeof ROLE_DESCRIPTIONS]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                           

                            {/* Business Rules Info */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-blue-800 mb-2">Role Management Rules</h4>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    <li>• HEAD: Only 1 allowed per clan</li>
                                    <li>• CO_HEAD: Maximum 2 allowed per clan</li>
                                    <li>• Other roles: Unlimited</li>
                                    {currentUserRole === 'CO_HEAD' && (
                                        <li>• CO_HEAD can only change roles below CO_HEAD level</li>
                                    )}
                                </ul>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    {canManage && (
                        <button
                            onClick={handleRoleUpdate}
                            disabled={isUpdating || !selectedRole}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                        >
                            {isUpdating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircleIcon className="h-4 w-4" />
                                    <span>Update Role</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
