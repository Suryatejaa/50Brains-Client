'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationContext } from '@/components/NotificationProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Notification,
  NotificationPreferences,
} from '@/types/notification.types';
import { toast } from 'sonner';
import NotificationDebugger from '@/components/debug/NotificationDebugger';
import { RefreshCcwIcon } from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use notification context for better state management
  const {
    notifications,
    unreadCount,
    loading,
    error,
    preferences,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotificationById,
    clearAllNotificationsForUser,
    updateUserNotificationPreferences,
    fetchCounts,
  } = useNotificationContext();

  const [showPreferences, setShowPreferences] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    read: undefined as boolean | undefined,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const getNotificationActionUrl = (notification: Notification) => {
    // Handle specific notification types with metadata
    if (notification.metadata?.gigId) {
      return `/gig/${notification.metadata.gigId}`;
    }

    if (notification.metadata?.applicationId) {
      return `/applications?status=pending`;
    }

    if (notification.metadata?.paymentId) {
      return `/credits/history`;
    }

    if (notification.metadata?.messageId) {
      return `/messages`;
    }

    if (notification.metadata?.reviewId) {
      return `/profile`;
    }

    // Handle clan join requests
    if (notification.metadata?.clanId && notification.metadata?.joinRequestId) {
      return `/clan/${notification.metadata.clanId}/manage?tab=applications`;
    }

    if (notification.metadata?.clanId) {
      return `/clan/${notification.metadata.clanId}`;
    }

    // Handle general notification types
    switch (notification.type) {
      case 'SYSTEM':
        if (notification.metadata?.isLogin) {
          return `/profile`;
        }
        return `/dashboard`;

      case 'ENGAGEMENT':
        if (notification.category === 'GIG') {
          return `/my/gigs`;
        }
        return `/dashboard`;

      case 'GIG':
        if (notification.category === 'USER') {
          return `/applications?status=pending`;
        }
        return `/my/gigs`;

      case 'PAYMENT':
        return `/credits/history`;

      case 'CLAN':
        // Handle different clan notification types
        if (notification.metadata?.joinRequestId) {
          return `/clan/${notification.metadata.clanId}/manage?tab=applications`;
        }
        if (notification.metadata?.clanId) {
          return `/clan/${notification.metadata.clanId}`;
        }
        return `/clans`;

      case 'MESSAGE':
        return `/messages`;

      case 'REVIEW':
        return `/profile`;

      case 'PROMOTION':
        return `/dashboard`;

      default:
        return `/dashboard`;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read immediately when clicked
      if (!notification.read) {
        await markNotificationAsRead(notification.id);
      }

      // Navigate to appropriate page
      const actionUrl = getNotificationActionUrl(notification);
      router.push(actionUrl as any);
    } catch (error) {
      console.error('Failed to handle notification click:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotificationById(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleClearAll = async () => {
    if (!user) return;

    if (
      confirm(
        'Are you sure you want to clear all notifications? This action cannot be undone.'
      )
    ) {
      try {
        await clearAllNotificationsForUser();
      } catch (error) {
        console.error('Failed to clear notifications:', error);
      }
    }
  };

  const handleFilterChange = (
    key: string,
    value: string | boolean | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page - handled by context
  };

  const handlePageChange = (page: number) => {
    // setPagination(prev => ({ ...prev, page })); // handled by context
  };

  // Refresh notifications when filters change
  useEffect(() => {
    if (user) {
      fetchNotifications(
        1, // page
        20, // limit
        filters.type || undefined,
        filters.category || undefined,
        filters.read
      );
    }
  }, [user, filters, fetchNotifications]);

  // Force refresh when page loads
  useEffect(() => {
    if (user) {
      console.log(
        '🔄 Notifications page loaded - force refreshing to catch missed notifications'
      );
      // Force immediate refresh to get latest notifications
      fetchNotifications();
      fetchCounts();

      // Mark all notifications as read when viewing the notifications page
      if (notifications.length > 0 && notifications.some((n) => !n.read)) {
        markAllNotificationsAsRead();
      }
    }
  }, [
    user,
    fetchNotifications,
    fetchCounts,
    notifications,
    markAllNotificationsAsRead,
  ]);

  // Add periodic refresh to catch missed notifications
  useEffect(() => {
    if (!user) return;

    const missedNotificationCheck = setInterval(() => {
      console.log('🔎 Periodic check for missed notifications');
      fetchNotifications();
      fetchCounts();
    }, 15000); // Check every 15 seconds

    return () => clearInterval(missedNotificationCheck);
  }, [user, fetchNotifications, fetchCounts]);

  const handlePreferenceUpdate = async (
    updates: Partial<NotificationPreferences>
  ) => {
    if (!user) return;

    try {
      await updateUserNotificationPreferences(updates);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const getPriorityColor = (priority?: string) => {
    const colors: { [key: string]: string } = {
      HIGH: 'border-l-red-500 bg-red-50',
      MEDIUM: 'border-l-yellow-500 bg-yellow-50',
      LOW: 'border-l-green-500 bg-green-50',
    };
    return colors[priority || ''] || 'border-l-gray-300';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-2 text-xl font-semibold text-gray-900">
            Please log in to view notifications
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-1 py-1">
        {/* Header */}
        <div className="mb-1 rounded-lg bg-white p-1 shadow-sm">
          <div className="mb-1 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  fetchNotifications();
                  fetchCounts();
                }}
                className="rounded-md px-1 py-1 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
              >
                <RefreshCcwIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-1 md:grid-cols-3">
            <select
              value={filters.type}
              onChange={(e) =>
                handleFilterChange('type', e.target.value || undefined)
              }
              className="rounded-md border border-gray-300 px-1 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="SYSTEM">System</option>
              <option value="ENGAGEMENT">Engagement</option>
              <option value="GIG">Gig</option>
              <option value="PAYMENT">Payment</option>
              <option value="CLAN">Clan</option>
              <option value="MESSAGE">Message</option>
              <option value="REVIEW">Review</option>
              <option value="PROMOTION">Promotion</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) =>
                handleFilterChange('category', e.target.value || undefined)
              }
              className="rounded-md border border-gray-300 px-1 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="USER">User</option>
              <option value="GIG">Gig</option>
              <option value="PAYMENT">Payment</option>
              <option value="CLAN">Clan</option>
              <option value="MESSAGE">Message</option>
              <option value="REVIEW">Review</option>
              <option value="PROMOTION">Promotion</option>
            </select>

            <select
              value={filters.read === undefined ? '' : filters.read.toString()}
              onChange={(e) =>
                handleFilterChange(
                  'read',
                  e.target.value === '' ? undefined : e.target.value === 'true'
                )
              }
              className="rounded-md border border-gray-300 px-1 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="false">Unread</option>
              <option value="true">Read</option>
            </select>
          </div>
        </div>

        {/* Preferences Panel */}
        {showPreferences && preferences && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Notification Preferences
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 font-medium text-gray-900">Channels</h3>
                <div className="space-y-2">
                  {Object.entries({
                    email: 'Email',
                    push: 'Push Notifications',
                    sms: 'SMS',
                    inApp: 'In-App',
                  }).map(([key, label]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          (preferences?.[
                            key as keyof NotificationPreferences
                          ] as boolean) || false
                        }
                        onChange={(e) =>
                          handlePreferenceUpdate({ [key]: e.target.checked })
                        }
                        className="mr-2"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-3 font-medium text-gray-900">Categories</h3>
                <div className="space-y-2">
                  {preferences?.categories &&
                    Object.entries(preferences.categories).map(
                      ([key, value]) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) =>
                              handlePreferenceUpdate({
                                categories: {
                                  ...preferences.categories,
                                  [key]: e.target.checked,
                                },
                              })
                            }
                            className="mr-2"
                          />
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </label>
                      )
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="rounded-lg bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
              <div className="text-gray-500">Loading notifications...</div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="mb-4 text-red-500">{error}</div>
              <button
                onClick={() => fetchNotifications()}
                className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mb-4 text-gray-500">No notifications found</div>
              <div className="text-sm text-gray-400">You're all caught up!</div>
            </div>
          ) : (
            <>
              <div className="space-y-2 divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-l-4 p-1 ${getPriorityColor(notification.priority)} cursor-pointer transition-colors hover:bg-gray-50`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex flex-1 items-start space-x-4">
                        {/* <span className="text-2xl flex-shrink-0">
                          {notification.icon || '🔔'}
                        </span> */}
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center space-x-1">
                            <h3
                              className={`font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}
                            >
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                New
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                notification.priority === 'HIGH'
                                  ? 'bg-red-100 text-red-800'
                                  : notification.priority === 'MEDIUM'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {notification.priority}
                            </span>
                          </div>
                          <p className="mb-1 text-gray-600">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <span>{formatTimeAgo(notification.createdAt)}</span>
                            <span>•</span>
                            <span className="capitalize">
                              {String(notification.type || '').toLowerCase()}
                            </span>
                            <span>•</span>
                            <span className="capitalize">
                              {String(
                                notification.category || ''
                              ).toLowerCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-1 flex items-center space-x-1">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                          className="text-sm font-medium text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {/* Pagination is handled by the context, so we just display the current page */}
              {/* <div className="px-1 py-1 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} notifications
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-1 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-1 py-1 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md">
                      {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="px-1 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div> */}
            </>
          )}
        </div>
        {/* Debug Section - Only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8">{/* <NotificationDebugger /> */}</div>
        )}
      </div>
    </div>
  );
}
