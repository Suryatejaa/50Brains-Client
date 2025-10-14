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

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationContext } from '@/components/NotificationProvider';
import { clanApiClient } from '@/lib/clan-api';
import { getClanJoinStatus, getClanJoinButtonInfo, canManageClan } from '@/lib/clan-utils';
import { toast } from 'sonner';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
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
  GlobeAltIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  TrophyIcon as TrophyIconSolid
} from '@heroicons/react/24/solid';
import { useClan, useClanJoinRequests } from '@/hooks/useClans';
import { CrownIcon, EyeIcon } from 'lucide-react';
import ClanChatAdvanced from '@/components/ClanChat/ClanChatAdvanced';


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
  headId: string;
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
  memberIds: string[];
  pendingRequests: string[];
  admins: string[];
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
  headId: string;
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





export default function ClanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  // Safely get notification context
  let notifications: any[] = [];
  let isConnected = false;

  try {
    const notificationContext = useNotificationContext();
    notifications = notificationContext.notifications || [];
    isConnected = notificationContext.isConnected || false;
  } catch (error) {
    console.error('Error accessing notification context:', error);
  }

  const [clan, setClan] = useState<ClanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'members' | 'gigs' | 'leaderboard'>('chat');
  const [joinLoading, setJoinLoading] = useState(false);

  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [joinRequestsLoading, setJoinRequestsLoading] = useState(false);
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState(0);
  const memberDetailsRef = useRef<any>([]);
  const [memberDetails, setMemberDetails] = useState<any>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showShareGigModal, setShowShareGigModal] = useState(false);
  const [sharedGigs, setSharedGigs] = useState<any[]>([]);
  const [sharedGigsLoading, setSharedGigsLoading] = useState(false);



  // Remove clan-specific WebSocket state since we're using the global one
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  // Fetch shared gigs
  const fetchSharedGigs = useCallback(async () => {
    if (!clan?.id) return;

    try {
      setSharedGigsLoading(true);
      const response = await clanApiClient.getSharedGigs(clan.id);
      if (response.success) {
        setSharedGigs((response.data as any)?.sharedGigs || []);
      }
    } catch (error) {
      console.error('Error fetching shared gigs:', error);
    } finally {
      setSharedGigsLoading(false);
    }
  }, [clan?.id]);

  // Load pending applications count for clan owners/admins
  const loadPendingApplicationsCount = async () => {
    if (!clan || !user) return;

    try {
      const response = await clanApiClient.getJoinRequests(params.id as string);
      if (response.success) {
        const requests = (response.data as any) || [];
        const pendingCount = requests.length;
        setPendingApplicationsCount(pendingCount);
      }
    } catch (error) {
      console.error('Error loading pending applications count:', error);
    }
  };

  // This function should only be called when the user explicitly requests to view join requests
  // (e.g., when navigating to the manage clan page), not automatically on clan load
  const loadJoinRequests = async () => {
    try {
      setJoinRequestsLoading(true);
      const response = await clanApiClient.getJoinRequests(params.id as string);
      if (response.success) {
        const requests = (response.data as any) || [];
        setJoinRequests(requests);
        // Count pending applications
        const pendingCount = requests.length;
        setPendingApplicationsCount(pendingCount);
      }
    } catch (error) {
      console.error('Error loading join requests:', error);
    } finally {
      setJoinRequestsLoading(false);
    }
  };

  // Swipe refs for mobile tab navigation
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const lastTouchXRef = useRef<number | null>(null);
  const lastTouchYRef = useRef<number | null>(null);
  const tabOrder: Array<'chat' | 'members' | 'gigs' | 'leaderboard'> = ['chat', 'members', 'gigs', 'leaderboard'];
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
    if (params.id && user?.id) {
      loadClanDetail();
    }
  }, [params.id, user?.id]);

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
        clan?.headId === user?.id;

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
        isCurrentUserClanHead: clan?.headId === user?.id
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
        break;

      case 'clan.member.role_changed':
        toast.info(title || 'Member role updated');
        loadClanDetail(); // Refresh to show updated roles
        break;

      case 'clan.join_request.submitted':
        if (clan?.headId === user?.id) {
          toast.info(title || 'New join request received');
        }
        break;

      case 'clan.join_request.approved':
        toast.success(title || 'Join request approved');
        // Refresh clan data to update membership status and hide join button
        loadClanDetail();
        break;

      case 'clan.join_request.rejected':
        toast.error(title || 'Join request rejected');
        // Refresh clan data to update request status
        loadClanDetail();
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




  const loadClanDetail = async () => {
    try {
      setLoading(true);
      const response = await clanApiClient.getClan(params.id as string);
      if (response.success) {
        const clanData = response.data as ClanDetail;
        console.log('Clan data loaded:', {
          memberIds: clanData.memberIds,
          pendingRequests: clanData.pendingRequests,
          userId: user?.id
        });
        setClan(clanData);

        // Note: Join requests are now loaded on-demand when user clicks to view them
        // This prevents unnecessary API calls and permission errors

        // Clear the array first to avoid duplicates
        memberDetailsRef.current = clanData.memberIds;


        loadMemberDetails();

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

  // Fetch shared gigs when clan loads
  useEffect(() => {
    if (clan?.id) {
      fetchSharedGigs();
    }
  }, [clan?.id, fetchSharedGigs]);

  // Load pending applications count when clan loads (for owners/admins)
  useEffect(() => {
    if (clan?.id && user?.id) {
      loadPendingApplicationsCount();
    }
  }, [clan?.id, user?.id]);

  const loadMemberDetails = async () => {
    try {
      const response = await apiClient.post('/api/public/profiles/internal/by-ids', {
        userIds: memberDetailsRef.current
      });
      setMemberDetails(response.data as any);
    } catch (error) {
      console.error('Error loading member details:', error);
    }
  };

  useEffect(() => {
    if (memberDetailsRef.current && memberDetailsRef.current.length > 0) {
      loadMemberDetails();
    }
  }, [memberDetailsRef.current]);

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
      toast.success('Join request sent successfully! The clan owner will review it.');
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
  // console.log('Clan Head ID:', clan.headId)
  // console.log('Members:', clan.members)

  const isOwner = clan.headId === user?.id;

  // Check if user is a member by looking in the memberIds array (array of user IDs)
  const isMemberInArray = clan.memberIds && Array.isArray(clan.memberIds) ?
    clan.memberIds.includes(user?.id || '') :
    false;

  // Check userMembership status (fallback)
  const isMemberByStatus = clan.userMembership?.status === 'member';

  // User is considered a member if they're the owner, in the members array, or have member status
  const isMember = isOwner || isMemberInArray || isMemberByStatus;
  // Check if user has already requested to join
  const isAlreadyRequested = user?.id && clan?.pendingRequests ?
    (Array.isArray(clan.pendingRequests) ?
      clan.pendingRequests.includes(user.id) :
      false) :
    false;

  const canManage = isOwner || (isMemberInArray && (clan.headId === user?.id || clan.admins?.includes(user?.id || '')));

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


  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-2 py-2">
          <div className="flex items-center justify-between">
            {/* Left section */}
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <button
                onClick={() => router.back()}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>

              {/* Clan Avatar */}
              <div className="relative flex-shrink-0">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm sm:text-lg">
                    {clan.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {clan.isActive && (
                  <div className="absolute -bottom-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              {/* Clan Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate flex items-center space-x-1 sm:space-x-2">
                  <span>{clan.name}</span>
                  {clan.isVerified && (
                    <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                  )}
                </h1>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <UserGroupIcon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>{clan.memberCount} members</span>
                  </div>
                  {canManage && pendingApplicationsCount > 0 && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                        <span className="inline-block mr-1 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-orange-500 rounded-full animate-pulse"></span>
                        <span className="hidden sm:inline">{pendingApplicationsCount} pending</span>
                        <span className="sm:hidden">{pendingApplicationsCount}</span>
                      </span>
                    </>
                  )}
                  {clan.visibility === 'PRIVATE' && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">Private</span>
                    </>
                  )}
                  {/* User Status Badge */}
                  {user?.id && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      {isOwner ? (
                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                          <CrownIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Owner</span>
                          <span className="sm:hidden">Owner</span>
                        </span>
                      ) : isMember ? (
                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Member</span>
                          <span className="sm:hidden">✅</span>
                        </span>
                      ) : isAlreadyRequested ? (
                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Pending</span>
                          <span className="sm:hidden">Pending</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Visitor</span>
                          <span className="sm:hidden">Visitor</span>
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right section */}
            <div className="relative flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={() => setMenuOpen(prev => !prev)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <EllipsisVerticalIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
              </button>
              {pendingApplicationsCount > 0 && (
                <span className="inline-flex items-center absolute right-1 top-1 px-1 py-0 h-2.5 w-2 text-xs font-medium bg-orange-500 text-orange-500 rounded-full border border-orange-500 animate-pulse">
                  {/* {pendingApplicationsCount} */}
                </span>
              )}
              {menuOpen && (
                <div className="absolute right-0 top-10 z-50 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1">
                  {canManage && (
                    <Link
                      href={`/clan/${clan.id}/manage`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="inline-flex justify-between items-center space-x-2 w-full">
                        <span className="inline-flex items-center space-x-2">
                          <Cog6ToothIcon className="h-4 w-4" />
                          <span>Manage Clan</span>
                        </span>
                        {pendingApplicationsCount > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded-full border border-orange-200">
                            {pendingApplicationsCount}
                          </span>
                        )}
                      </span>
                    </Link>
                  )}
                  {isMember && !isOwner && (
                    <button
                      onClick={() => { setMenuOpen(false); setLeaveConfirmOpen(true); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Leave Clan
                    </button>
                  )}
                  {!isMember && !isAlreadyRequested && (
                    <button
                      onClick={() => { setMenuOpen(false); handleJoinClan(); }}
                      className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                    >
                      Request to Join
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

              {/* Action Buttons */}

              {!isMember && !isAlreadyRequested && (
                <div className="sm:ml-4 flex-shrink-0">
                  <button
                    onClick={handleJoinClan}
                    disabled={joinLoading}
                    className="w-full sm:w-auto bg-white text-blue-600 px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
                  >
                    {joinLoading ? 'Sending Request...' : 'Request to Join'}
                  </button>
                </div>
              )}
              {isAlreadyRequested && (
                <div className="sm:ml-4 flex-shrink-0">
                  <div className="text-center">
                    <span className="text-sm text-gray-500 block mb-2">You have already requested to join this clan.</span>
                    <span className="text-xs text-gray-400">Please wait for approval from the clan owner.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200 sticky top-[65px] z-40">
          <div className="px-16 sm:px-0">
            <nav className="flex justify-between md:justify-center lg:justify-center overflow-x-auto">
              {[
                { id: 'chat', label: '', icon: ChatBubbleLeftIcon },
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
          className="p-0 sm:p-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {activeTab === 'chat' && (
            <div className="space-y-0 p-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Clan Chat</h3>
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

              {/* Real Clan Chat Interface */}
              {user && clan && (
                <div className="h-[calc(100vh-150px)] w-full">
                  <ClanChatAdvanced
                    userId={user.id}
                    clanId={clan.id}
                    clanName={clan.name}
                    memberDetails={memberDetails}
                  />
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
                {memberDetails && memberDetails.length > 0 ? memberDetails.map((member: any) => (
                  <div key={member.id} className="bg-white border-t border-gray-200 p-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0">
                      <div className="flex items-center space-x-2 cursor-pointer"
                        onClick={() => {
                          setSelectedMember(member);
                          setShowMemberModal(true);
                        }}
                      >
                        <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserIcon className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 truncate">{member.username || member.displayName}</h4>
                          <div className="flex flex-row items-right sm:flex-row sm:items-right gap-2">
                            {/* <span className={`inline-flex items-right px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member?.role)} w-fit`}> */}
                            {/* {member.role.replace('_', ' ')} */}
                            {/* </span> */}
                            <span className="text-sm text-right sm:text-right text-gray-500">
                              {member.gigsParticipated} gigs • {member.reputation} reputation
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-gray-500">Joined: {formatDate(member.createdAt)}</p>
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
                <h3 className="text-lg font-semibold text-gray-900">Gig Sharing</h3>
                <div className="flex items-center space-x-2">
                  <button
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      router.push('/marketplace');
                    }}
                  >
                    Browse Gigs
                  </button>
                </div>
              </div>

              {/* Gig Sharing Interface */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Shared Gigs</h3>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    onClick={() => setShowShareGigModal(true)}
                  >
                    Share New Gig
                  </button>
                </div>

                {sharedGigsLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4"></div>
                    <p className="text-sm">Loading shared gigs...</p>
                  </div>
                ) : sharedGigs.length > 0 ? (
                  <div className="space-y-3">
                    {sharedGigs.map((gig) => (
                      <div key={gig.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {gig.metadata?.gigTitle || 'Untitled Gig'}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {gig.metadata?.gigDescription || 'No description available'}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>Shared by {gig.user?.username || 'Unknown'}</span>
                              <span>{new Date(gig.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <a
                            href={gig.metadata?.gigUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Gig →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BriefcaseIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No Gigs Shared Yet</p>
                    <p className="text-sm">Be the first to share interesting gigs with your clan!</p>
                  </div>
                )}
              </div>
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

      {/* Member Details Modal */}
      {showMemberModal && selectedMember && (
        <div className="fixed inset-0 bg-black rounded-none bg-opacity-50 flex items-center justify-center z-50 p-1">
          <div className="bg-white rounded-lg max-w-md rounded-none w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-900">Member Details</h2>
                <button
                  onClick={() => {
                    setShowMemberModal(false);
                    setSelectedMember(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Member Avatar */}
              <div className="flex justify-center mb-2">
                <div className="h-20 w-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {(selectedMember.username || selectedMember.firstName || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Member Info */}
              <div className="space-y-2">
                {/* Basic Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Username:</span>
                      <span className="font-medium text-gray-900">{selectedMember.username || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-900">
                        {selectedMember.firstName && selectedMember.lastName
                          ? `${selectedMember.firstName} ${selectedMember.lastName}`
                          : selectedMember.firstName || selectedMember.lastName || 'Not set'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium text-gray-900">{selectedMember.location || 'Not set'}</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {selectedMember.bio && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Bio</h3>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedMember.bio}
                    </p>
                  </div>
                )}

                {/* Roles */}
                {selectedMember.roles && selectedMember.roles.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Roles</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.roles.map((role: string, index: number) => {
                        //filter out the role "USER" is not included  
                        if (role !== 'USER') {
                          console.log('role', role);
                          return (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                            >
                              {role}
                            </span>
                          )
                        }
                      })}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {(selectedMember.instagramHandle || selectedMember.twitterHandle || selectedMember.linkedinHandle || selectedMember.youtubeHandle || selectedMember.website) && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Social & Links</h3>
                    <div className="space-y-2 text-sm">
                      {selectedMember.website && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Website:</span>
                          <a
                            href={selectedMember.website.startsWith('http') ? selectedMember.website : `https://${selectedMember.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium"
                          >
                            Visit
                          </a>
                        </div>
                      )}
                      {selectedMember.instagramHandle && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Instagram:</span>
                          <span className="font-medium text-gray-900 cursor-pointer"
                            onClick={() => window.open(`https://www.instagram.com/${selectedMember.instagramHandle}`, '_blank')}
                          >@{selectedMember.instagramHandle}</span>
                        </div>
                      )}
                      {selectedMember.twitterHandle && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Twitter:</span>
                          <span className="font-medium text-gray-900 cursor-pointer"
                            onClick={() => window.open(`https://www.twitter.com/${selectedMember.twitterHandle}`, '_blank')}
                          >@{selectedMember.twitterHandle}</span>
                        </div>
                      )}
                      {selectedMember.linkedinHandle && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">LinkedIn:</span>
                          <span className="font-medium text-gray-900 cursor-pointer"
                            onClick={() => window.open(`https://www.linkedin.com/in/${selectedMember.linkedinHandle}`, '_blank')}
                          >@{selectedMember.linkedinHandle}</span>
                        </div>
                      )}
                      {selectedMember.youtubeHandle && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">YouTube:</span>
                          <span className="font-medium text-gray-900 cursor-pointer"
                            onClick={() => window.open(`https://www.youtube.com/${selectedMember.youtubeHandle}`, '_blank')}
                          >{selectedMember.youtubeHandle}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Member Since */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Member Since</h3>
                  <p className="text-sm text-gray-700">
                    {new Date(selectedMember.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Contact Settings */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Contact Settings</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Show contact info:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedMember.showContact
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}>
                      {selectedMember.showContact ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowMemberModal(false);
                    setSelectedMember(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowMemberModal(false);
                    setSelectedMember(null);
                    if (selectedMember.id === user?.id) {
                      router.push('/profile');
                    } else {
                      router.push(`/profile/${selectedMember.id}`);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Full Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Gig Modal */}
      {showShareGigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Share Gig with Clan</h2>
                <button
                  onClick={() => setShowShareGigModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const gigData = {
                  gigId: formData.get('gigId') as string,
                  gigTitle: formData.get('gigTitle') as string,
                  gigDescription: formData.get('gigDescription') as string,
                  gigUrl: formData.get('gigUrl') as string,
                };

                try {
                  const response = await clanApiClient.shareGig(clan!.id, gigData);
                  if (response.success) {
                    toast.success('Gig shared successfully!');
                    setShowShareGigModal(false);
                    fetchSharedGigs(); // Refresh the list
                  } else {
                    toast.error('Failed to share gig');
                  }
                } catch (error) {
                  console.error('Error sharing gig:', error);
                  toast.error('Failed to share gig');
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gig ID
                  </label>
                  <input
                    type="text"
                    name="gigId"
                    required
                    className="input w-full"
                    placeholder="Enter gig ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gig Title
                  </label>
                  <input
                    type="text"
                    name="gigTitle"
                    required
                    className="input w-full"
                    placeholder="Enter gig title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="gigDescription"
                    required
                    rows={3}
                    className="input w-full"
                    placeholder="Brief description of the gig"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gig URL
                  </label>
                  <input
                    type="url"
                    name="gigUrl"
                    required
                    className="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/gig/123"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowShareGigModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Share Gig
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
