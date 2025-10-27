'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import type {
  Notification,
  NotificationCounts,
  NotificationPreferences,
  NotificationAnalytics,
} from '@/types/notification.types';

interface NotificationContextType {
  // State
  notifications: Notification[];
  unreadCount: number;
  counts: NotificationCounts;
  loading: boolean;
  error: string | null;
  preferences: NotificationPreferences | null;
  analytics: NotificationAnalytics | null;
  isConnected: boolean;
  connectionStatus: string;

  // Actions
  fetchNotifications: (
    page?: number,
    limit?: number,
    type?: string,
    category?: string,
    read?: boolean
  ) => Promise<any>;
  fetchUnreadNotifications: () => Promise<any>;
  fetchCounts: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  markNotificationAsRead: (
    id: string
  ) => Promise<{ success: boolean; error?: any }>;
  markAllNotificationsAsRead: () => Promise<{ success: boolean; error?: any }>;
  debouncedMarkAllAsRead: () => void;
  deleteNotificationById: (
    id: string
  ) => Promise<{ success: boolean; error?: any }>;
  clearAllNotificationsForUser: () => Promise<{
    success: boolean;
    error?: any;
  }>;
  updateUserNotificationPreferences: (
    updates: Partial<NotificationPreferences>
  ) => Promise<{ success: boolean; data?: any; error?: any }>;
  refresh: () => void;
  forceRefresh: () => void;
  startPolling: () => void;
  stopPolling: () => void;
  connect: () => void;
  disconnect: () => void;

  // Utilities
  playNotificationSound: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
  autoRefresh?: boolean;
  refreshInterval?: number;
  initialLimit?: number;
}

export function NotificationProvider({
  children,
  autoRefresh = true,
  refreshInterval = 2000, // Reduced from 3000 to 2000 (2 seconds) for faster missed notification detection
  initialLimit = 20,
}: NotificationProviderProps) {
  const context = useNotifications();

  return (
    <NotificationContext.Provider
      value={{
        // State
        notifications: context.notifications,
        unreadCount: context.unreadCount,
        counts: context.counts,
        loading: context.loading,
        error: context.error,
        preferences: context.preferences,
        analytics: context.analytics,
        isConnected: context.isConnected,
        connectionStatus: context.connectionStatus,

        // Actions
        fetchNotifications: context.fetchNotifications,
        fetchUnreadNotifications: context.fetchUnreadNotifications,
        fetchCounts: context.fetchCounts,
        fetchPreferences: context.fetchPreferences,
        fetchAnalytics: context.fetchAnalytics,
        markNotificationAsRead: context.markNotificationAsRead,
        markAllNotificationsAsRead: context.markAllNotificationsAsRead,
        debouncedMarkAllAsRead: context.debouncedMarkAllAsRead,
        deleteNotificationById: context.deleteNotificationById,
        clearAllNotificationsForUser: context.clearAllNotificationsForUser,
        updateUserNotificationPreferences:
          context.updateUserNotificationPreferences,
        refresh: context.refresh,
        forceRefresh: context.forceRefresh,
        startPolling: context.startPolling,
        stopPolling: context.stopPolling,
        connect: context.connect,
        disconnect: context.disconnect,

        // Utilities
        playNotificationSound: context.playNotificationSound,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotificationContext must be used within a NotificationProvider'
    );
  }
  return context;
}

// Convenience hooks for specific use cases
export function useNotificationBell() {
  const context = useNotificationContext();

  if (!context) {
    throw new Error(
      'useNotificationBell must be used within a NotificationProvider'
    );
  }

  return {
    notifications: context.notifications,
    unreadCount: context.unreadCount,
    loading: context.loading,
    error: context.error,
    isConnected: context.isConnected,
    connectionStatus: context.connectionStatus,
    handleMarkAsRead: context.markNotificationAsRead,
    handleMarkAllAsRead: context.markAllNotificationsAsRead,
    debouncedMarkAllAsRead: context.debouncedMarkAllAsRead,
    refreshNotifications: context.fetchCounts,
    fetchNotifications: context.fetchNotifications,
    forceRefresh: context.forceRefresh,
  };
}

export function useNotificationPreferences() {
  const context = useNotificationContext();
  return {
    preferences: context.preferences,
    updatePreferences: context.updateUserNotificationPreferences,
    fetchPreferences: context.fetchPreferences,
  };
}

export function useNotificationAnalytics() {
  const context = useNotificationContext();
  return {
    analytics: context.analytics,
    fetchAnalytics: context.fetchAnalytics,
  };
}
