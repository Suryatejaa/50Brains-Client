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
}

export interface Notification {
    id: string;
    type: 'SYSTEM' | 'ENGAGEMENT' | 'GIG' | 'PAYMENT' | 'CLAN' | 'MESSAGE' | 'REVIEW' | 'PROMOTION';
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