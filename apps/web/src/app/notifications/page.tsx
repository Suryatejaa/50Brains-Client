'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationContext } from '@/components/NotificationProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { Notification, NotificationPreferences } from '@/types/notification.types';
import { toast } from 'sonner';
import NotificationDebugger from '@/components/debug/NotificationDebugger';

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
    read: undefined as boolean | undefined
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
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

    if (confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      try {
        await clearAllNotificationsForUser();
      } catch (error) {
        console.error('Failed to clear notifications:', error);
      }
    }
  };

  const handleFilterChange = (key: string, value: string | boolean | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
      // Force immediate refresh to get latest notifications
      fetchNotifications();
      fetchCounts();

      // Mark all notifications as read when viewing the notifications page
      if (notifications.length > 0 && notifications.some(n => !n.read)) {
        markAllNotificationsAsRead();
      }
    }
  }, [user, fetchNotifications, fetchCounts, notifications, markAllNotificationsAsRead]);

  const handlePreferenceUpdate = async (updates: Partial<NotificationPreferences>) => {
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
      LOW: 'border-l-green-500 bg-green-50'
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900 mb-2">Please log in to view notifications</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-1 py-1">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-1 mb-1">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <div className="flex space-x-2">
              {/* <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="px-1 py-1 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Preferences
              </button>
              <button
                onClick={handleMarkAllAsRead}
                className="px-1 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
              >
                Mark all as read
              </button> */}
              <button
                onClick={() => {
                  fetchNotifications();
                  fetchCounts();
                }}
                className="px-1 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={handleClearAll}
                className="px-1 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
              className="px-1 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
              className="px-1 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              onChange={(e) => handleFilterChange('read', e.target.value === '' ? undefined : e.target.value === 'true')}
              className="px-1 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="false">Unread</option>
              <option value="true">Read</option>
            </select>
          </div>
        </div>

        {/* Preferences Panel */}
        {showPreferences && preferences && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Channels</h3>
                <div className="space-y-2">
                  {Object.entries({
                    email: 'Email',
                    push: 'Push Notifications',
                    sms: 'SMS',
                    inApp: 'In-App'
                  }).map(([key, label]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences?.[key as keyof NotificationPreferences] as boolean || false}
                        onChange={(e) => handlePreferenceUpdate({ [key]: e.target.checked })}
                        className="mr-2"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  {preferences?.categories && Object.entries(preferences.categories).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handlePreferenceUpdate({
                          categories: {
                            ...preferences.categories,
                            [key]: e.target.checked
                          }
                        })}
                        className="mr-2"
                      />
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <div className="text-gray-500">Loading notifications...</div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="text-red-500 mb-4">{error}</div>
              <button
                onClick={() => fetchNotifications()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500 mb-4">No notifications found</div>
              <div className="text-sm text-gray-400">You're all caught up!</div>
            </div>
          ) : (
            <>
              <div className="divide-y space-y-2 divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-1 border-l-4 ${getPriorityColor(notification.priority)} hover:bg-gray-50 transition-colors cursor-pointer`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* <span className="text-2xl flex-shrink-0">
                          {notification.icon || '🔔'}
                        </span> */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1 mb-1">
                            <h3 className={`font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                New
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${notification.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                              notification.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                              {notification.priority}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-1">{notification.message}</p>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <span>{formatTimeAgo(notification.createdAt)}</span>
                            <span>•</span>
                            <span className="capitalize">{notification.type.toLowerCase()}</span>
                            <span>•</span>
                            <span className="capitalize">{notification.category.toLowerCase()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-1">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
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
          <div className="mt-8">
            <NotificationDebugger />
          </div>
        )}
      </div>
    </div>
  );
}
