'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'gig_application' | 'gig_accepted' | 'gig_completed' | 'payment_received' | 
        'clan_invite' | 'clan_join_request' | 'message' | 'connection_request' | 
        'portfolio_comment' | 'review_received' | 'system' | 'promotion';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any; // Additional data specific to notification type
  actionUrl?: string;
  actionText?: string;
  priority: 'low' | 'medium' | 'high';
  category: 'gigs' | 'clans' | 'social' | 'payments' | 'system';
}

interface NotificationsResponse {
  notifications: Notification[];
}

const notificationIcons = {
  gig_application: '💼',
  gig_accepted: '✅',
  gig_completed: '🎉',
  payment_received: '💰',
  clan_invite: '👥',
  clan_join_request: '📝',
  message: '💬',
  connection_request: '🤝',
  portfolio_comment: '💭',
  review_received: '⭐',
  system: '🔔',
  promotion: '🎁'
};

const categoryColors = {
  gigs: 'border-l-blue-500',
  clans: 'border-l-purple-500',
  social: 'border-l-green-500',
  payments: 'border-l-yellow-500',
  system: 'border-l-gray-500'
};

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuth();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'gigs' | 'clans' | 'social' | 'payments' | 'system'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated, filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filter !== 'all') {
        if (filter === 'unread') {
          params.append('unread', 'true');
        } else {
          params.append('category', filter);
        }
      }
      
      const response = await apiClient.get(`/api/notifications?${params}`);
      
      if (response.success) {
        const data = response.data as NotificationsResponse;
        setNotifications(data?.notifications || []);
      } else {
        setError('Failed to load notifications');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await apiClient.post('/api/notifications/mark-read', {
        notificationIds
      });
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notificationIds.includes(notif.id) 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setSelectedNotifications([]);
      }
    } catch (error: any) {
      alert('Failed to mark notifications as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await apiClient.post('/api/notifications/mark-all-read');
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
      }
    } catch (error: any) {
      alert('Failed to mark all notifications as read');
    }
  };

  const deleteNotifications = async (notificationIds: string[]) => {
    if (confirm(`Delete ${notificationIds.length} notification(s)?`)) {
      try {
        const params = new URLSearchParams();
        notificationIds.forEach(id => params.append('ids', id));
        const response = await apiClient.delete(`/api/notifications?${params}`);
        
        if (response.success) {
          setNotifications(prev => 
            prev.filter(notif => !notificationIds.includes(notif.id))
          );
          setSelectedNotifications([]);
        }
      } catch (error: any) {
        alert('Failed to delete notifications');
      }
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      await markAsRead([notification.id]);
    }
    
    // Navigate to action URL if available
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    const visibleNotificationIds = filteredNotifications.map(n => n.id);
    setSelectedNotifications(
      selectedNotifications.length === visibleNotificationIds.length 
        ? [] 
        : visibleNotificationIds
    );
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.category === filter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container min-h-screen pt-16">
          <div className="content-container py-8">
            <div className="mx-auto max-w-2xl">
              <div className="card-glass p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Please Sign In
                </h3>
                <p className="text-gray-600 mb-6">
                  You need to be signed in to view your notifications.
                </p>
                <Link href={"/auth/login" as any} className="btn-primary">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-heading mb-2 text-3xl font-bold">
                    Notifications
                  </h1>
                  <p className="text-muted">
                    {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                  </p>
                </div>
                
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="btn-ghost"
                  >
                    Mark All Read
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="card-glass p-4 mb-6">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All', count: notifications.length },
                  { key: 'unread', label: 'Unread', count: unreadCount },
                  { key: 'gigs', label: 'Gigs', count: notifications.filter(n => n.category === 'gigs').length },
                  { key: 'clans', label: 'Clans', count: notifications.filter(n => n.category === 'clans').length },
                  { key: 'social', label: 'Social', count: notifications.filter(n => n.category === 'social').length },
                  { key: 'payments', label: 'Payments', count: notifications.filter(n => n.category === 'payments').length },
                  { key: 'system', label: 'System', count: notifications.filter(n => n.category === 'system').length }
                ].map((filterOption) => (
                  <button
                    key={filterOption.key}
                    onClick={() => setFilter(filterOption.key as any)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filter === filterOption.key
                        ? 'bg-brand-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filterOption.label}
                    {filterOption.count > 0 && (
                      <span className="ml-1 text-xs">({filterOption.count})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="card-glass p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {selectedNotifications.length} notification(s) selected
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => markAsRead(selectedNotifications)}
                      className="btn-ghost-sm"
                    >
                      Mark Read
                    </button>
                    <button
                      onClick={() => deleteNotifications(selectedNotifications)}
                      className="btn-ghost-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="card-glass p-6 animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="card-glass p-8 text-center">
                <div className="mb-4">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-2xl">❌</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Error Loading Notifications
                  </h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                </div>
                
                <button
                  onClick={loadNotifications}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="card-glass p-8 text-center">
                <div className="mb-4">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-2xl">🔔</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                  </h3>
                  <p className="text-gray-600">
                    {filter === 'unread' 
                      ? "You're all caught up! No new notifications."
                      : "You'll see notifications here when you have activity."
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Select All */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === filteredNotifications.length}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Select All ({filteredNotifications.length})
                    </span>
                  </label>
                </div>

                {/* Notifications */}
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`card-glass border-l-4 ${categoryColors[notification.category]} ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    } hover:shadow-md transition-shadow`}
                  >
                    <div className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => handleSelectNotification(notification.id)}
                          className="mt-1 rounded"
                        />

                        {/* Icon */}
                        <div className="text-2xl">
                          {notificationIcons[notification.type] || '🔔'}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              
                              {/* Additional Data */}
                              {notification.data && (
                                <div className="mt-2 text-xs text-gray-500">
                                  {notification.data.gigTitle && (
                                    <span>Gig: {notification.data.gigTitle}</span>
                                  )}
                                  {notification.data.clanName && (
                                    <span>Clan: {notification.data.clanName}</span>
                                  )}
                                  {notification.data.amount && (
                                    <span>Amount: ${notification.data.amount}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="ml-4 text-right">
                              <p className="text-xs text-gray-500">
                                {timeAgo(notification.createdAt)}
                              </p>
                              
                              {notification.priority === 'high' && (
                                <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                                  High Priority
                                </span>
                              )}
                              
                              {!notification.isRead && (
                                <div className="mt-1">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Button */}
                          {(notification.actionUrl || notification.actionText) && (
                            <div className="mt-3">
                              <button
                                onClick={() => handleNotificationClick(notification)}
                                className="btn-primary-sm"
                              >
                                {notification.actionText || 'View Details'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Load More */}
            {filteredNotifications.length > 0 && filteredNotifications.length % 20 === 0 && (
              <div className="text-center mt-8">
                <button
                  onClick={loadNotifications}
                  className="btn-secondary"
                >
                  Load More Notifications
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
