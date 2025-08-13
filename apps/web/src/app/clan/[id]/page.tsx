/**
 * Clan Detail Page with Real-time WebSocket Integration
 * 
 * WebSocket Message Handling:
 * - Normalizes payload structure: checks payload.data.metadata.clanId and payload.data.data.clanId
 * - Extracts eventType from embedded.eventType || meta.eventType with fallback inference
 * - Filters messages by clan ID to only process relevant notifications
 * 
 * WebSocket Events Handled:
 * - clan.member.joined: Shows toast notification and refreshes member list
 * - clan.member.role_changed: Shows toast and refreshes data  
 * - clan.join_request.submitted: Notifies clan head of new requests
 * - clan.join_request.approved: Notifies user of approval
 * - clan.join_request.rejected: Notifies user of rejection
 * - clan.invitation.sent: Shows invitation sent notification
 * 
 * Fallback Event Inference:
 * - Uses title pattern matching when eventType is missing
 * - Only processes CLAN category notifications for fallback
 * 
 * Connection: ws://localhost:4009?userId={userId}
 * Auto-reconnection: 3 second delay on disconnect
 * Real-time activity feed: Updates activity tab with live events
 */

'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationContext } from '@/components/NotificationProvider';
import { clanApiClient } from '@/lib/clan-api';
import { getClanJoinStatus, getClanJoinButtonInfo, canManageClan } from '@/lib/clan-utils';
import { toast } from 'sonner';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ConfirmDialog from '@/frontend-profile/components/common/ConfirmDialog';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  EllipsisVerticalIcon,
  PhoneIcon,
  VideoCameraIcon,
  MagnifyingGlassIcon,
  FaceSmileIcon,
  PaperClipIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
  StarIcon,
  TrophyIcon,
  BriefcaseIcon,
  ChartBarIcon,
  UserIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  TrophyIcon as TrophyIconSolid
} from '@heroicons/react/24/solid';
import { useClan, useClanJoinRequests } from '@/hooks/useClans';
import { useClanGigWorkflow } from '@/hooks/useClanGigWorkflow';

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
  pendingJoinUserIds: string[];
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

interface ClanGig {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  deadline: string;
  requiredSkills: string[];
  assignedMembers: string[];
  createdAt: string;
  createdBy: string;
}

interface ActivityItem {
  id: string;
  type: 'member_joined' | 'gig_completed' | 'achievement' | 'announcement' | 'milestone';
  title: string;
  description: string;
  timestamp: string;
  actor: {
    name: string;
    avatar?: string;
  };
  metadata?: any;
}

export default function ClanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { notifications, isConnected } = useNotificationContext();

  const [clan, setClan] = useState<ClanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'activity' | 'members' | 'gigs' | 'leaderboard'>('activity');
  const [joinLoading, setJoinLoading] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [joinRequestsLoading, setJoinRequestsLoading] = useState(false);

  // Add the workflow hook to fetch gig assignments
  const { assignments, activeAssignments, loading: workflowLoading, fetchAssignments, error: workflowError } = useClanGigWorkflow(params.id as string);

  // Remove clan-specific WebSocket state since we're using the global one
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  // Swipe refs for mobile tab navigation
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const lastTouchXRef = useRef<number | null>(null);
  const lastTouchYRef = useRef<number | null>(null);
  const tabOrder: Array<'activity' | 'members' | 'gigs' | 'leaderboard'> = ['activity', 'members', 'gigs', 'leaderboard'];
  const [menuOpen, setMenuOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);

  // Ref to track processed notification IDs to prevent duplicate handling
  const processedNotificationIds = useRef<Set<string>>(new Set());
  // Track if we've already processed initial notifications to prevent welcome messages on refresh
  const hasProcessedInitialNotifications = useRef<boolean>(false);

  // Load processed notification IDs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`processedNotifications_${params.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        processedNotificationIds.current = new Set(parsed);
      }
    } catch (error) {
      console.error('Error loading processed notifications from localStorage:', error);
    }

    // Cleanup old processed notifications (older than 24 hours)
    const cleanupOldNotifications = () => {
      try {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        const currentProcessed = Array.from(processedNotificationIds.current);
        const filtered = currentProcessed.filter(id => {
          // Extract timestamp from notification ID if possible, or keep recent ones
          const timestamp = parseInt(id.split('-')[1] || '0');
          return timestamp > oneDayAgo;
        });

        if (filtered.length !== currentProcessed.length) {
          processedNotificationIds.current = new Set(filtered);
          localStorage.setItem(`processedNotifications_${params.id}`, JSON.stringify(filtered));
        }
      } catch (error) {
        console.error('Error cleaning up old notifications:', error);
      }
    };

    // Clean up every hour
    const cleanupInterval = setInterval(cleanupOldNotifications, 60 * 60 * 1000);

    return () => {
      clearInterval(cleanupInterval);
    };
  }, [params.id]);
  useEffect(() => {
    loadClanDetail();
  }, [params.id]);

  // Listen to global notifications for clan events
  useEffect(() => {
    if (!user?.id || !params.id) return;

    // Update connection status based on global notification connection
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');

    // Skip processing if we haven't loaded clan data yet
    if (!clan) return;

    // Process new notifications for this clan
    notifications.forEach(notification => {
      // Skip if already processed
      if (processedNotificationIds.current.has(notification.id)) return;

      // Only process clan notifications
      if (notification.category !== 'CLAN') return;

      // Skip notifications older than 5 minutes to prevent showing old messages on refresh
      const notificationTime = new Date(notification.createdAt || Date.now()).getTime();
      const currentTime = Date.now();
      if (currentTime - notificationTime > 5 * 60 * 1000) {
        // Mark old notifications as processed to avoid reprocessing
        processedNotificationIds.current.add(notification.id);
        return;
      }

      // Skip welcome messages if they're older than 1 minute to prevent showing on refresh
      const isWelcomeMessage = notification.title?.toLowerCase().includes('welcome to the clan');
      if (isWelcomeMessage && (currentTime - notificationTime > 1 * 60 * 1000)) {
        processedNotificationIds.current.add(notification.id);
        return;
      }

      // Skip notifications that were created before the user joined the clan
      if (clan && clan.createdAt) {
        const clanCreatedAt = new Date(clan.createdAt).getTime();
        if (notificationTime < clanCreatedAt) {
          processedNotificationIds.current.add(notification.id);
          return;
        }
      }

      // Check if notification is for this clan
      const clanId = notification.metadata?.clanId;
      if (!clanId || clanId !== params.id) return;

      // For join request notifications, also check if it's for the current user
      const isJoinRequestNotification = notification.title?.toLowerCase().includes('join request');
      const notificationUserId = notification.metadata?.applicantId || notification.metadata?.userId;

      // Process the notification if:
      // 1. It's not a join request notification (general clan notifications)
      // 2. It's a join request notification for the current user
      // 3. It's a join request notification and current user is clan head
      const shouldProcess = !isJoinRequestNotification ||
        notificationUserId === user?.id ||
        clan?.clanHeadId === user?.id;

      if (!shouldProcess) return;

      // Mark as processed
      processedNotificationIds.current.add(notification.id);

      // Save to localStorage to persist across page refreshes
      try {
        const processedArray = Array.from(processedNotificationIds.current);
        localStorage.setItem(`processedNotifications_${params.id}`, JSON.stringify(processedArray));
      } catch (error) {
        console.error('Error saving processed notifications to localStorage:', error);
      }

      // Extract event type
      const eventType =
        notification.metadata?.eventType ||
        inferClanEventFromNotification(notification);

      console.log('Processing clan notification:', {
        id: notification.id,
        eventType,
        title: notification.title,
        clanId,
        isForCurrentUser: notificationUserId === user?.id,
        isCurrentUserClanHead: clan?.clanHeadId === user?.id
      });

      handleClanEvent({ eventType, notification });
    });
  }, [notifications, isConnected, user?.id, params.id, clan]);

  // Helper function to infer clan event type from notification if eventType is missing
  const inferClanEventFromNotification = (notification: any): string | null => {
    // Optional fallback if eventType is absent; rely on category/title patterns
    if (notification?.category !== 'CLAN') return null;
    const title = (notification?.title || '').toLowerCase();

    if (title.includes('welcome to the clan')) return 'clan.member.joined';
    if (title.includes('role updated')) return 'clan.member.role_changed';
    if (title.includes('new join request')) return 'clan.join_request.submitted';
    if (title.includes('join request approved')) return 'clan.join_request.approved';
    if (title.includes('join request rejected')) return 'clan.join_request.rejected';
    if (title.includes('invitation')) return 'clan.invitation.sent';

    return null;
  };

  // Handle clan events from WebSocket
  const handleClanEvent = ({ eventType, notification }: { eventType: string | null; notification: any }) => {
    const { title, message, metadata, category } = notification;

    const effectiveType = eventType || inferClanEventFromNotification(notification);

    switch (effectiveType) {
      case 'clan.member.joined':
        toast.success(title || 'New member joined the clan');
        loadClanDetail(); // Refresh clan data to show new member
        addActivityItem({
          id: `act-${Date.now()}`,
          type: 'member_joined',
          title: 'New member joined',
          description: message || 'A new member has joined the clan',
          timestamp: new Date().toISOString(),
          actor: { name: 'System' }
        });
        break;

      case 'clan.member.role_changed':
        toast.info(title || 'Member role updated');
        loadClanDetail(); // Refresh to show updated roles
        addActivityItem({
          id: `act-${Date.now()}`,
          type: 'announcement',
          title: 'Role updated',
          description: message || 'A member role has been changed',
          timestamp: new Date().toISOString(),
          actor: { name: 'System' }
        });
        break;

      case 'clan.join_request.submitted':
        if (clan?.clanHeadId === user?.id) {
          toast.info(title || 'New join request received');
        }
        break;

      case 'clan.join_request.approved':
        toast.success(title || 'Join request approved');
        // Refresh clan data to update membership status and hide join button
        loadClanDetail();

        // Add activity for approved request
        addActivityItem({
          id: `act-${Date.now()}`,
          type: 'member_joined',
          title: 'Join request approved',
          description: message || 'Your join request has been approved',
          timestamp: new Date().toISOString(),
          actor: { name: 'System' }
        });
        break;

      case 'clan.join_request.rejected':
        toast.error(title || 'Join request rejected');
        // Refresh clan data to update request status
        loadClanDetail();

        // Add activity for rejected request
        addActivityItem({
          id: `act-${Date.now()}`,
          type: 'announcement',
          title: 'Join request rejected',
          description: message || 'Your join request has been rejected',
          timestamp: new Date().toISOString(),
          actor: { name: 'System' }
        });
        break;

      case 'clan.invitation.sent':
        toast.info(title || 'Invitation sent');
        break;

      default:
        // Ignore unrelated or non-clan notifications
        if (category === 'CLAN') {
          console.log('Unhandled clan notification:', notification);
        }
    }
  };

  // Add activity item to local state
  const addActivityItem = (activity: ActivityItem) => {
    setActivities(prev => [activity, ...prev.slice(0, 9)]); // Keep only last 10 activities
  };

  const loadClanDetail = async () => {
    try {
      setLoading(true);
      const response = await clanApiClient.getClan(params.id as string);
      if (response.success) {
        const clanData = response.data as ClanDetail;
        setClan(clanData);
        console.log('Clan data refreshed:', clanData);

        // Fetch join requests if user can manage the clan
        if (clanData.clanHeadId === user?.id ||
          clanData.members?.some((member: any) =>
            member.userId === user?.id &&
            ['HEAD', 'CO_HEAD', 'ADMIN'].includes(member.role)
          )) {
          loadJoinRequests();
        }
      } else {
        setError('Clan not found');
      }
    } catch (error) {
      console.error('Error loading clan:', error);
      setError('Failed to load clan details');
    } finally {
      setLoading(false);
    }
  };

  const loadJoinRequests = async () => {
    try {
      setJoinRequestsLoading(true);
      const response = await clanApiClient.getJoinRequests(params.id as string);
      if (response.success) {
        setJoinRequests((response.data as any) || []);
      }
    } catch (error) {
      console.error('Error loading join requests:', error);
    } finally {
      setJoinRequestsLoading(false);
    }
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    touchStartXRef.current = t.clientX;
    touchStartYRef.current = t.clientY;
    lastTouchXRef.current = t.clientX;
    lastTouchYRef.current = t.clientY;
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    lastTouchXRef.current = t.clientX;
    lastTouchYRef.current = t.clientY;
  };
  const handleTouchEnd = () => {
    const startX = touchStartXRef.current;
    const startY = touchStartYRef.current;
    const endX = lastTouchXRef.current ?? startX;
    const endY = lastTouchYRef.current ?? startY;
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    lastTouchXRef.current = null;
    lastTouchYRef.current = null;

    if (startX == null || startY == null || endX == null || endY == null) return;
    const dx = endX - startX;
    const dy = endY - startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const horizontalThreshold = 50;
    const verticalGuard = 40;

    if (absDx > horizontalThreshold && absDx > absDy && Math.abs(dy) < verticalGuard) {
      const currentIndex = tabOrder.indexOf(activeTab);
      if (dx < 0 && currentIndex < tabOrder.length - 1) {
        setActiveTab(tabOrder[currentIndex + 1]);
      } else if (dx > 0 && currentIndex > 0) {
        setActiveTab(tabOrder[currentIndex - 1]);
      }
    }
  };

  const handleJoinClan = async () => {
    if (!clan || !user) return;

    try {
      setJoinLoading(true);
      await clanApiClient.joinClan(clan.id);
      toast.success('Join request sent successfully!');
      await loadClanDetail(); // Refresh data
    } catch (error: any) {
      console.error('Error joining clan - Full error:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);

      // Handle different error response structures with more comprehensive checking
      let errorMessage = 'Failed to join clan';

      if (error.response?.data) {
        const data = error.response.data;
        errorMessage =
          data.error ||                         // Direct error field
          data.message ||                       // Message field
          data.details ||                       // Details field
          data.errorMessage ||                  // ErrorMessage field
          (typeof data === 'string' ? data : undefined) || // String response
          errorMessage;                         // Fallback
      } else if (error.message) {
        errorMessage = error.message;           // Error object message
      }

      console.error('Final error message:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeaveClan = async () => {
    if (!clan) return;
    try {
      setLeaveLoading(true);
      await clanApiClient.leaveClan(clan.id);
      setLeaveConfirmOpen(false);
      toast.success('You have left the clan');
      if (typeof window !== 'undefined') {
        window.location.href = '/clans?tab=my-clans';
      }
    } catch (error: any) {
      console.error('Error leaving clan - Full error:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);

      // Handle different error response structures with more comprehensive checking
      let errorMessage = 'Failed to leave clan';

      if (error.response?.data) {
        const data = error.response.data;
        errorMessage =
          data.error ||                         // Direct error field
          data.message ||                       // Message field
          data.details ||                       // Details field
          data.errorMessage ||                  // ErrorMessage field
          (typeof data === 'string' ? data : undefined) || // String response
          errorMessage;                         // Fallback
      } else if (error.message) {
        errorMessage = error.message;           // Error object message
      }

      console.error('Final error message:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setLeaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !clan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Clan Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The clan you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // console.log('Clan:', clan)
  // console.log('Current User:', user)
  // console.log('User ID:', user?.id)
  // console.log('Clan Head ID:', clan.clanHeadId)
  // console.log('Members:', clan.members)

  const isOwner = clan.clanHeadId === user?.id;

  // Check if user is a member by looking in the members array
  const isMemberInArray = clan.members?.some(member => member.userId === user?.id);

  // Check userMembership status (fallback)
  const isMemberByStatus = clan.userMembership?.status === 'member';

  // User is considered a member if they're the owner, in the members array, or have member status
  const isMember = isOwner || isMemberInArray || isMemberByStatus;
  const isAlreadyRequested = user?.id ? clan.pendingJoinUserIds.includes(user.id) : false;
  // console.log('Is Owner:', isOwner)
  // console.log('Is Member in Array:', isMemberInArray)
  // console.log('Is Member by Status:', isMemberByStatus)
  // console.log('Final isMember:', isMember)

  const canManage = isOwner || (isMemberInArray && ['HEAD', 'CO_HEAD', 'ADMIN'].includes(clan.members?.find(m => m.userId === user?.id)?.role || ''));

  const getRoleColor = (role: string) => {
    const colors = {
      'HEAD': 'bg-purple-100 text-purple-800',
      'CO_HEAD': 'bg-blue-100 text-blue-800',
      'ADMIN': 'bg-green-100 text-green-800',
      'SENIOR_MEMBER': 'bg-orange-100 text-orange-800',
      'MEMBER': 'bg-gray-100 text-gray-800',
      'TRAINEE': 'bg-yellow-100 text-yellow-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'OPEN': 'bg-green-100 text-green-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-gray-100 text-gray-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const timeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return formatDate(dateString);
  };
  console.log('Clan Detail:', clan);
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-1 py-1">
          <div className="flex items-center justify-between">
            {/* Left section */}
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <button
                onClick={() => router.back()}
                className="p-0 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
              </button>

              {/* Clan Avatar */}
              <div className="relative flex-shrink-0">
                <div className="h-10 w-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {clan.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {clan.isActive && (
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              {/* Clan Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-gray-900 truncate flex items-center space-x-2">
                  <span>{clan.name}</span>
                  {clan.isVerified && (
                    <CheckCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  )}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <UserGroupIcon className="h-4 w-4 flex-shrink-0" />
                  <span>{clan.memberCount} members</span>
                  {clan.visibility === 'PRIVATE' && (
                    <>
                      <span>•</span>
                      <span>Private</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right section */}
            <div className="relative flex items-center space-x-1 flex-shrink-0">
              {(isMember || canManage) && (
                <Link
                  href={`/clan/${clan.id}/gig-workflow`}
                  className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  <BriefcaseIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Workflow</span>
                </Link>
              )}
              <button
                onClick={() => setMenuOpen(prev => !prev)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <EllipsisVerticalIcon className="h-6 w-6 text-gray-600" />
                {/* Notification dot for pending join requests */}
                {joinRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 text-xs bg-red-500 rounded-full animate-pulse">{joinRequests.length}</span>
                )}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 z-50 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1">
                  {canManage && (
                    <Link
                      href={`/clan/${clan.id}/manage`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="inline-flex justify-between items-center space-x-2">
                        <Cog6ToothIcon className="h-4 w-4" />
                        <span>Manage Clan</span>
                        {joinRequests.length > 0 && (
                          <span className="h-4 w-4 text-center items-center text-xs bg-red-500 rounded-full animate-pulse">{joinRequests.length}</span>
                        )}
                      </span>
                    </Link>
                  )}
                  {!canManage && isMember && (
                    <button
                      onClick={() => { setMenuOpen(false); setLeaveConfirmOpen(true); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Leave Clan
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Leave confirmation dialog */}
        <ConfirmDialog
          isOpen={leaveConfirmOpen}
          title="Leave Clan"
          message="Are you sure you want to leave this clan? You will lose access to member-only content."
          confirmText="Leave"
          cancelText="Cancel"
          danger
          loading={leaveLoading}
          onConfirm={handleLeaveClan}
          onCancel={() => setLeaveConfirmOpen(false)}
        />
        {/* Active Gigs Notification Banner */}
        {activeAssignments && activeAssignments.length > 0 && (
          <div className="bg-green-50 border-b border-green-200 px-4 py-3">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    You have {activeAssignments.length} active gig{activeAssignments.length !== 1 ? 's' : ''}!
                  </span>
                </div>
                <Link
                  href={`/clan/${clan.id}/gig-workflow`}
                  className="text-sm text-green-700 hover:text-green-800 font-medium underline"
                >
                  Manage Workflow →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Clan Cover/Hero Section */}
        <div className="relative bg-gradient-to-br from-gray-300 to-gray-300 text-white">
          <div className="px-2 sm:px-2 py-2 sm:py-2">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 mb-2 max-w-2xl text-sm sm:text-base">
                  {clan.description || 'A community of talented professionals working together.'}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm">
                  <div className="flex items-center space-x-1">
                    <TrophyIconSolid className="h-4 w-4 text-gray-900 flex-shrink-0" />
                    <span className="text-gray-900">{clan.completedGigs} completed</span>
                  </div>
                  {activeAssignments && activeAssignments.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <BriefcaseIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-green-700 font-medium">{activeAssignments.length} active</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <StarIconSolid className="h-4 w-4 text-gray-900 flex-shrink-0" />
                    <span className="text-gray-900">{clan.averageRating?.toFixed(1) || '5.0'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ChartBarIcon className="h-4 w-4 text-gray-900 flex-shrink-0" />
                    <span className="text-gray-900">{formatCurrency(clan.totalRevenue || 0)} revenue</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {!isMember && !isAlreadyRequested && (
                <div className="sm:ml-4 flex-shrink-0">
                  <button
                    onClick={handleJoinClan}
                    disabled={joinLoading}
                    className="w-full sm:w-auto bg-white text-blue-600 px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
                  >
                    {joinLoading ? 'Joining...' : 'Join Clan'}
                  </button>
                </div>
              )}
              {isAlreadyRequested && (
                <div className="sm:ml-4 flex-shrink-0">
                  <span className="text-sm text-gray-500">You have already requested to join this clan.</span>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 sticky top-[73px] z-40">
          <div className="px-16 sm:px-0">
            <nav className="flex justify-between md:justify-center lg:justify-center overflow-x-auto">
              {[
                { id: 'activity', label: '', icon: ChartBarIcon },
                { id: 'members', label: '', icon: UserGroupIcon },
                { id: 'gigs', label: '', icon: BriefcaseIcon },
                { id: 'leaderboard', label: '', icon: TrophyIcon }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <tab.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div
          className="p-2 sm:p-2"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' :
                    connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  <span className="text-xs text-gray-500">
                    {connectionStatus === 'connected' ? 'Live' :
                      connectionStatus === 'connecting' ? 'Connecting' : 'Offline'}
                  </span>
                </div>
              </div>

              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map(activity => (
                    <div key={activity.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start space-x-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {activity.type === 'member_joined' && <UserIcon className="h-5 w-5 text-blue-600" />}
                          {activity.type === 'announcement' && <ChartBarIcon className="h-5 w-5 text-blue-600" />}
                          {activity.type === 'achievement' && <TrophyIcon className="h-5 w-5 text-yellow-600" />}
                          {activity.type === 'gig_completed' && <BriefcaseIcon className="h-5 w-5 text-green-600" />}
                          {activity.type === 'milestone' && <StarIcon className="h-5 w-5 text-purple-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{timeAgo(activity.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <ChartBarIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No recent activity</p>
                  <p className="text-sm">Activity will appear here as members interact with the clan.</p>
                  {connectionStatus === 'connected' && (
                    <p className="text-xs text-green-600 mt-2">🟢 Live updates enabled</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <h3 className="text-lg font-semibold text-gray-900">Members ({clan.memberCount})</h3>
                <div className="flex items-center space-x-1">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
                  />
                </div>
              </div>

              <div className="grid gap-0">
                {clan.members && clan.members.length > 0 ? clan.members.map(member => (
                  <div key={member.id} className="bg-white border-t border-gray-200 p-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0">
                      <div className="flex items-center space-x-2 cursor-pointer"
                        onClick={() => {
                          if (member.userId === user?.id)
                            router.push(`/profile`)
                          else
                            router.push(`/profile/${member.userId}`)
                        }}
                      >
                        <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserIcon className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 truncate">Name: {member.user?.name || member.displayName}</h4>
                          <div className="flex flex-row items-right sm:flex-row sm:items-right gap-2">
                            <span className={`inline-flex items-right px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)} w-fit`}>
                              {member.role.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-right sm:text-right text-gray-500">
                              {member.gigsParticipated} gigs • {member.reputation} reputation
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-gray-500">Joined {formatDate(member.joinedAt)}</p>
                        {member.status === 'ACTIVE' && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs">Active</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 text-gray-500">
                    <UserGroupIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No members to display</p>
                    <p className="text-sm">Members will appear here once they join the clan.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'gigs' && (
            <div className="space-y-4">
              <div className="flex flex-row sm:flex-row justify-between sm:items-center sm:justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-900">Clan Gigs</h3>
                <div className="flex items-center space-x-2">
                  {canManage && (
                    <button
                      className="bg-blue-600 text-white px-2 py-1 rounded-xs text-sm font-medium hover:bg-blue-700 transition-colors sm:w-auto"
                      onClick={() => {
                        router.push('/marketplace');
                      }}
                    >
                      Apply Gig
                    </button>
                  )}
                  {activeAssignments && activeAssignments.length > 0 && (
                    <Link
                      href={`/clan/${clan.id}/gig-workflow`}
                      className="bg-green-600 text-white px-2 py-1 rounded-xs text-sm font-medium hover:bg-green-700 transition-colors sm:w-auto"
                    >
                      Manage Workflow
                    </Link>
                  )}
                </div>
              </div>

              {workflowLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Debug Info:</p>
                    <button
                      onClick={() => fetchAssignments()}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      Refresh
                    </button>
                  </div>
                  <p>• Assignments loaded: {assignments?.length || 0}</p>
                  <p>• Active assignments: {activeAssignments?.length || 0}</p>
                  <p>• Workflow loading: {workflowLoading ? 'Yes' : 'No'}</p>
                  <p>• Error: {workflowError || 'None'}</p>
                  {assignments && assignments.length > 0 && (
                    <>
                      <p>• First assignment ID: {assignments[0].id}</p>
                      <p>• First assignment gig: {assignments[0].gig?.title || 'No title'}</p>
                      <p>• First assignment status: {assignments[0].status}</p>
                    </>
                  )}
                </div>
              )}

              {activeAssignments && activeAssignments.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        {activeAssignments.length} Active Gig{activeAssignments.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {activeAssignments.map(assignment => (
                    <div key={assignment.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {assignment.gig?.title || `Gig #${assignment.gigId.slice(-8)}`}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Status: <span className="font-medium text-green-600">{assignment.status}</span>
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                          </p>

                          {assignment.milestonePlanSnapshot && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700">Milestones:</p>
                              <div className="mt-2 space-y-1">
                                {assignment.milestonePlanSnapshot.map((milestone, index) => (
                                  <div key={index} className="text-sm text-gray-600">
                                    • {milestone.title} - ${milestone.amount}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="ml-4 flex flex-col space-y-2">
                          <Link
                            href={`/clan/${clan.id}/gig-workflow?gigId=${assignment.gigId}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            Manage Tasks
                          </Link>

                          <button
                            onClick={() => window.location.href = `/gig/${assignment.gigId}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Gig Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BriefcaseIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No active gigs</p>
                  <p className="text-sm">When your clan applications get approved, they'll appear here.</p>
                  {canManage && (
                    <button
                      className="mt-4 bg-blue-600 text-white px-3 py-1 rounded-xs text-sm font-medium hover:bg-blue-700 transition-colors"
                      onClick={() => {
                        router.push('/marketplace');
                      }}
                    >
                      Apply for Gigs
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Contributors</h3>
              <div className="text-center py-12 text-gray-500">
                <TrophyIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No leaderboard data</p>
                <p className="text-sm">Member rankings will appear here based on their contributions.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
