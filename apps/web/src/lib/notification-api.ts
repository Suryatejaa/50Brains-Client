import { apiClient } from './api-client';
import {
    Notification,
    NotificationResponse,
    NotificationCountResponse,
    NotificationPreferences,
    NotificationAnalytics
} from '@/types/notification.types';

// === USER NOTIFICATION ROUTES ===

/**
 * Get all notifications for a user with pagination and filtering
 */
export const getNotifications = async (
    userId: string,
    page = 1,
    limit = 20,
    type?: string,
    category?: string,
    read?: boolean
): Promise<NotificationResponse> => {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(type && { type }),
        ...(category && { category }),
        ...(read !== undefined && { read: read.toString() })
    });

    return apiClient.get(`/api/notification/${userId}?${params}`);
};

/**
 * Get only unread notifications for a user
 */
export const getUnreadNotifications = async (userId: string): Promise<NotificationResponse> =>
    apiClient.get(`/api/notification/unread/${userId}`);

/**
 * Get notification counts (total, unread) for a user
 */
export const getNotificationCounts = async (userId: string): Promise<NotificationCountResponse> =>
    apiClient.get(`/api/notification/count/${userId}`);

/**
 * Mark a specific notification as read
 */
export const markNotificationRead = async (id: string): Promise<{ success: boolean }> =>
    apiClient.patch(`/api/notification/mark-read/${id}`);

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsRead = async (userId: string): Promise<{ success: boolean }> =>
    apiClient.patch(`/api/notification/mark-all-read/${userId}`);

/**
 * Delete a specific notification
 */
export const deleteNotification = async (id: string): Promise<{ success: boolean }> =>
    apiClient.delete(`/api/notification/${id}`);

/**
 * Clear all notifications for a user
 */
export const clearAllNotifications = async (userId: string): Promise<{ success: boolean }> =>
    apiClient.delete(`/api/notification/clear/${userId}`);

// === NOTIFICATION PREFERENCES ===

/**
 * Get user notification preferences
 */
export const getUserPreferences = async (userId: string): Promise<{ success: boolean; data: NotificationPreferences }> =>
    apiClient.get(`/api/notification/preferences/${userId}`);

/**
 * Update user notification preferences
 */
export const updateUserPreferences = async (
    userId: string,
    preferences: Partial<NotificationPreferences>
): Promise<{ success: boolean; data: NotificationPreferences }> =>
    apiClient.put(`/api/notification/preferences/${userId}`, preferences);

// === ANALYTICS & REPORTING ===

/**
 * Get notification analytics for a user
 */
export const getUserAnalytics = async (userId: string): Promise<{ success: boolean; data: NotificationAnalytics }> =>
    apiClient.get(`/api/notification/analytics/${userId}`);

// === INTERNAL/ADMIN ROUTES ===

/**
 * Send a notification (internal use by other services)
 */
export const sendNotification = async (notificationData: {
    userId: string;
    type: string;
    category: string;
    title: string;
    message: string;
    metadata?: any;
    priority?: string;
}): Promise<{ success: boolean; data: Notification }> =>
    apiClient.post('/api/notification/', notificationData);

/**
 * Send bulk notifications
 */
export const sendBulkNotifications = async (notifications: Array<{
    userId: string;
    type: string;
    category: string;
    title: string;
    message: string;
    metadata?: any;
    priority?: string;
}>): Promise<{ success: boolean; data: { sent: number; failed: number } }> =>
    apiClient.post('/api/notification/bulk', { notifications });

/**
 * Preview an email template with sample data
 */
export const previewEmailTemplate = async (templateName: string): Promise<{ success: boolean; data: { html: string; text: string } }> =>
    apiClient.get(`/api/notification/preview/${templateName}`);

// === TESTING & DEBUGGING ===

/**
 * Test API Gateway connection
 */
export const testAPIGatewayConnection = async (): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await apiClient.get('/api/notification/health');
        return { success: true, message: 'API Gateway connection successful' };
    } catch (error: any) {
        console.error('API Gateway connection test failed:', error);
        return {
            success: false,
            message: `API Gateway connection failed: ${error.message || 'Unknown error'}`
        };
    }
};

/**
 * Test WebSocket connection via API Gateway
 */
export const testWebSocketConnection = async (userId: string): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        const wsUrl = `${baseUrl.replace('http://', 'ws://').replace('https://', 'wss://')}/api/notifications/ws?userId=${userId}`;

        const ws = new WebSocket(wsUrl);
        const timeout = setTimeout(() => {
            ws.close();
            resolve({ success: false, message: 'WebSocket connection timeout' });
        }, 5000);

        ws.onopen = () => {
            clearTimeout(timeout);
            ws.close();
            resolve({ success: true, message: 'WebSocket connection successful' });
        };

        ws.onerror = (error) => {
            clearTimeout(timeout);
            resolve({ success: false, message: `WebSocket connection error: ${error}` });
        };
    });
};

// === ALIAS FUNCTIONS FOR BACKWARD COMPATIBILITY ===

export const getUnreadCount = getNotificationCounts;
export const markAsRead = markNotificationRead;
export const markAllAsRead = markAllNotificationsRead;