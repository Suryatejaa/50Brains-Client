import { apiClient } from './api-client';

export const getNotifications = (userId: string, limit = 10) =>
    apiClient.get(`/api/notification/${userId}?limit=${limit}`);

export const getUnreadNotifications = (userId: string) =>
    apiClient.get(`/api/notification/unread/${userId}`);

export const getNotificationCount = (userId: string) =>
    apiClient.get(`/api/notification/count/${userId}`);

export const markNotificationRead = (id: string) =>
    apiClient.patch(`/api/notification/mark-read/${id}`);

export const markAllNotificationsRead = (userId: string) =>
    apiClient.patch(`/api/notification/mark-all-read/${userId}`);

export const deleteNotification = (id: string) =>
    apiClient.delete(`/api/notification/${id}`);

export const clearAllNotifications = (userId: string) =>
    apiClient.delete(`/api/notification/clear/${userId}`);

// Alias functions for consistency
export const getUnreadCount = getNotificationCount;
export const markAsRead = markNotificationRead;
export const markAllAsRead = markAllNotificationsRead;