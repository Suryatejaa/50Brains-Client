'use client';
import { useState, useEffect, useRef } from 'react';
import { useNotificationBell } from '@/hooks/useNotificationBell';
import Link from 'next/link';

// Notification type icons
const notificationIcons = {
    gig_application: '',
    gig_accepted: '✅',
    gig_completed: '🎉',
    payment_received: '',
    clan_invite: '👥',
    clan_join_request: '',
    message: '💬',
    connection_request: '🤝',
    portfolio_comment: '💭',
    review_received: '⭐',
    system: '',
    promotion: '🎁'
};

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const {
        notifications,
        unreadCount,
        loading,
        error,
        handleMarkAsRead,
        handleMarkAllAsRead,
        refreshNotifications,
    } = useNotificationBell();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Auto-refresh when dropdown opens
    useEffect(() => {
        if (open) {
            refreshNotifications();
        }
    }, [open, refreshNotifications]);

    const getNotificationIcon = (type?: string) => {
        if (type && notificationIcons[type as keyof typeof notificationIcons]) {
            return notificationIcons[type as keyof typeof notificationIcons];
        }
        return '🔔';
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

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setOpen((v) => !v)}
                aria-label="Notifications"
            >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-lg z-50 border border-gray-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                        <span className="font-semibold text-gray-900">Notifications</span>
                        {unreadCount > 0 && (
                            <button
                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                onClick={handleMarkAllAsRead}
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                Loading...
                            </div>
                        ) : error ? (
                            <div className="p-4 text-center text-red-500">
                                <div className="text-sm">{error}</div>
                                <button
                                    onClick={refreshNotifications}
                                    className="mt-2 text-xs text-blue-600 hover:underline"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                <div className="text-sm">No notifications</div>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={async () => {
                                        if (!n.isRead) await handleMarkAsRead(n.id);
                                        if (n.actionUrl) {
                                            setOpen(false);
                                            window.location.href = n.actionUrl;
                                        }
                                    }}
                                >
                                    <div className="flex items-start space-x-3">
                                        <span className="text-lg flex-shrink-0">
                                            {getNotificationIcon(n.type)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-medium text-sm truncate ${!n.isRead ? 'text-gray-900' : 'text-gray-700'
                                                }`}>
                                                {n.title}
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                {n.message}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-2">
                                                {formatTimeAgo(n.createdAt)}
                                            </div>
                                        </div>
                                        {!n.isRead && (
                                            <div className="flex-shrink-0">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2 text-center border-t border-gray-200">
                        <Link
                            href="/notifications"
                            className="text-blue-600 text-sm hover:text-blue-800 hover:underline"
                            onClick={() => setOpen(false)}
                        >
                            View all notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
