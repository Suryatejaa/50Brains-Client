import { Clan } from '@/hooks/useClans';

export interface ClanJoinStatus {
  canJoin: boolean;
  canRequestToJoin: boolean;
  isMember: boolean;
  isClanHead: boolean;
  hasPendingRequest: boolean;
  reason?: string;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
}

/**
 * Comprehensive logic to determine if a user can join a clan
 * @param clan - The clan object
 * @param user - The current user
 * @returns ClanJoinStatus object with all join-related flags
 */
export function getClanJoinStatus(clan: Clan | null, user: User | null): ClanJoinStatus {
  const defaultStatus: ClanJoinStatus = {
    canJoin: false,
    canRequestToJoin: false,
    isMember: false,
    isClanHead: false,
    hasPendingRequest: false,
    reason: 'No clan or user data available'
  };

  if (!clan || !user) {
    return defaultStatus;
  }

  // Check if user is already a member
  const isAlreadyMember = clan.members?.some(member => member.userId === user.id) || false;

  // Check if user is the clan head
  const isClanHead = clan.headId === user.id;

  // Check if user has pending join request
  const hasPendingRequest = clan.userMembership?.status === 'pending' || false;

  // Check if clan is active
  const isClanActive = clan.isActive;

  // Check if clan is full
  const isClanFull = clan.memberCount >= clan.maxMembers;

  // Check clan visibility
  const isPublic = clan.visibility === 'PUBLIC';
  const isPrivate = clan.visibility === 'PRIVATE';
  const isInviteOnly = clan.visibility === 'INVITE_ONLY';

  // Check if clan requires approval
  const requiresApproval = clan.requiresApproval;

  // Determine join permissions
  let canJoin = false;
  let canRequestToJoin = false;
  let reason = '';

  // User cannot join if already a member
  if (isAlreadyMember) {
    reason = 'You are already a member of this clan';
  }
  // User cannot join if they are the clan head
  else if (isClanHead) {
    reason = 'You are the clan head and cannot join your own clan';
  }
  // User cannot join if clan is inactive
  else if (!isClanActive) {
    reason = 'This clan is currently inactive';
  }
  // User cannot join if clan is full
  else if (isClanFull) {
    reason = 'This clan is full and cannot accept new members';
  }
  // User cannot join private clans
  else if (isPrivate) {
    reason = 'This clan is private and requires an invitation to join';
  }
  // User can request to join invite-only clans
  else if (isInviteOnly) {
    canRequestToJoin = true;
    reason = 'This clan is invite-only. You can request to join.';
  }
  // User can join public clans that don't require approval
  else if (isPublic && !requiresApproval) {
    canJoin = true;
    reason = 'You can join this public clan directly';
  }
  // User can request to join public clans that require approval
  else if (isPublic && requiresApproval) {
    canRequestToJoin = true;
    reason = 'This clan requires approval. You can request to join.';
  }
  // User has pending request
  else if (hasPendingRequest) {
    reason = 'You have a pending join request for this clan';
  }
  // Default case
  else {
    reason = 'Unable to join this clan at this time';
  }

  return {
    canJoin,
    canRequestToJoin,
    isMember: isAlreadyMember,
    isClanHead,
    hasPendingRequest,
    reason
  };
}

/**
 * Get the appropriate button text and action for clan join functionality
 * @param joinStatus - The clan join status object
 * @returns Object with button text and action type
 */
export function getClanJoinButtonInfo(joinStatus: ClanJoinStatus) {
  if (joinStatus.isMember) {
    return {
      text: 'Leave Clan',
      action: 'leave',
      variant: 'danger' as const
    };
  }

  if (joinStatus.hasPendingRequest) {
    return {
      text: 'Request Pending',
      action: 'pending',
      variant: 'disabled' as const
    };
  }

  if (joinStatus.canJoin) {
    return {
      text: 'Join Clan',
      action: 'join',
      variant: 'primary' as const
    };
  }

  if (joinStatus.canRequestToJoin) {
    return {
      text: 'Request to Join',
      action: 'request',
      variant: 'secondary' as const
    };
  }

  return {
    text: 'Cannot Join',
    action: 'none',
    variant: 'disabled' as const
  };
}

/**
 * Check if a user can manage a clan (head, co-head, or admin)
 * @param clan - The clan object
 * @param user - The current user
 * @returns boolean indicating if user can manage the clan
 */
export function canManageClan(clan: Clan | null, user: User | null): boolean {
  if (!clan || !user) return false;

  // Clan head can always manage
  if (clan.headId === user.id) return true;

  // Check if user is a member with management role
  const member = clan.members?.find(m => m.userId === user.id);
  if (!member) return false;

  // Co-head, admin, and senior members can manage
  return ['CO_HEAD', 'ADMIN', 'SENIOR_MEMBER'].includes(member.role);
}

/**
 * Get the user's role in the clan
 * @param clan - The clan object
 * @param user - The current user
 * @returns The user's role or null if not a member
 */
export function getUserClanRole(clan: Clan | null, user: User | null): string | null {
  if (!clan || !user) return null;

  const member = clan.members?.find(m => m.userId === user.id);
  return member?.role || null;
} 