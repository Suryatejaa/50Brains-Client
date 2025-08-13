export interface NotificationMetadata {
    [key: string]: any;
    isLogin?: boolean;
    loginAt?: string;
    loginMethod?: string;
    gigId?: string;
    category?: string;
    budgetRange?: string;
    roleRequired?: string;
    // Clan join request metadata
    clanId?: string;
    clanName?: string;
    applicantId?: string;
    applicantName?: string;
    joinRequestId?: string;
    joinRequestMessage?: string;
    joinRequestStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
    eventType?: string; // For clan events like 'clan.member.joined', 'clan.join_request.submitted', etc.
    // Clan gig workflow metadata
    gigTitle?: string;
    applicationId?: string;
    memberCount?: number;
    milestoneCount?: number;
    totalAmount?: number;
    assignedAt?: string;
    memberId?: string;
    memberRole?: string;
    gigOwnerId?: string;
    // Milestone metadata
    milestoneId?: string;
    milestoneTitle?: string;
    milestoneAmount?: number;
    dueAt?: string;
    deliverables?: string[];
    approvedAt?: string;
    feedback?: string;
    payoutSplit?: any;
    // Task metadata
    taskId?: string;
    taskTitle?: string;
    taskDescription?: string;
    estimatedHours?: number;
    dueDate?: string;
    oldStatus?: string;
    newStatus?: string;
}

export interface Notification {
    id: string;
    type: 'SYSTEM' | 'ENGAGEMENT' | 'GIG' | 'PAYMENT' | 'CLAN' | 'MESSAGE' | 'REVIEW' | 'PROMOTION' | 'CLAN_GIG_APPROVED' | 'CLAN_MILESTONE_CREATED' | 'CLAN_MILESTONE_APPROVED' | 'CLAN_TASK_ASSIGNED' | 'CLAN_TASK_UPDATED';
    category: 'USER' | 'GIG' | 'PAYMENT' | 'CLAN' | 'MESSAGE' | 'REVIEW' | 'PROMOTION';
    title: string;
    message: string;
    icon?: string; // Server-provided icon
    metadata?: NotificationMetadata;
    read: boolean;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    createdAt: string;
    readAt: string | null;
}

export interface NotificationCounts {
    total: number;
    unread: number;
    read: number;
}

export interface NotificationPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface NotificationResponse {
    success: boolean;
    data: {
        notifications: Notification[];
        pagination: NotificationPagination;
    };
}

export interface NotificationCountResponse {
    success: boolean;
    data: NotificationCounts;
}

export interface NotificationPreferences {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
    categories: {
        system: boolean;
        engagement: boolean;
        gig: boolean;
        payment: boolean;
        clan: boolean;
        message: boolean;
        review: boolean;
        promotion: boolean;
    };
}

export interface NotificationAnalytics {
    totalNotifications: number;
    readNotifications: number;
    unreadNotifications: number;
    averageReadTime: number;
    mostActiveDay: string;
    mostActiveHour: number;
    categoryBreakdown: {
        [key: string]: number;
    };
}

// Legacy interface for backward compatibility
export interface LegacyNotification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    actionUrl?: string;
    type?: string;
    category?: string;
    priority?: 'low' | 'medium' | 'high';
}

// Clan-specific notification interfaces
export interface ClanGigApprovedNotification {
    type: 'clan_gig_approved';
    data: {
        gigId: string;
        gigTitle: string;
        clanId: string;
        gigOwnerId: string;
        applicationId: string;
        memberCount: number;
        milestoneCount: number;
        totalAmount: number;
        assignedAt: string;
    };
}

export interface ClanMemberNotification {
    type: 'clan_gig_approved_member_notification';
    data: {
        gigId: string;
        gigTitle: string;
        clanId: string;
        clanName: string;
        memberId: string;
        memberRole: string;
        gigOwnerId: string;
        applicationId: string;
        milestoneCount: number;
        totalAmount: number;
        assignedAt: string;
    };
}

export interface ClanMilestoneNotification {
    type: 'clan_milestone_created' | 'clan_milestone_approved';
    data: {
        gigId: string;
        gigTitle: string;
        milestoneId: string;
        milestoneTitle: string;
        milestoneAmount: number;
        clanId: string;
        dueAt?: string;
        deliverables?: string[];
        approvedAt?: string;
        feedback?: string;
        payoutSplit?: any;
        createdAt: string;
    };
}

export interface ClanTaskNotification {
    type: 'clan_task_assigned' | 'clan_task_status_updated';
    data: {
        gigId: string;
        gigTitle: string;
        taskId: string;
        taskTitle: string;
        taskDescription?: string;
        clanId: string;
        estimatedHours?: number;
        deliverables?: string[];
        dueDate?: string;
        milestoneId?: string;
        oldStatus?: string;
        newStatus?: string;
        createdAt: string;
    };
}

export type ClanWebSocketMessage =
    | ClanGigApprovedNotification
    | ClanMemberNotification
    | ClanMilestoneNotification
    | ClanTaskNotification; 