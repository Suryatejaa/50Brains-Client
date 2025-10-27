'use client';
import { useState, useEffect, useRef } from 'react';
import { useNotificationBell } from '@/components/NotificationProvider';
import Link from 'next/link';
import { Notification } from '@/types/notification.types';
import { BellIcon } from 'lucide-react';

// Priority colors
const priorityColors = {
    HIGH: 'border-l-red-500',
    MEDIUM: 'border-l-yellow-500',
    LOW: 'border-l-green-500'
};

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [optimisticUnreadCount, setOptimisticUnreadCount] = useState<number | null>(null);
    const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
    const [showDot, setShowDot] = useState(false);
    const dotTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const {
        notifications,
        unreadCount,
        loading,
        error,
        isConnected,
        connectionStatus,
        handleMarkAsRead,
        handleMarkAllAsRead,
        debouncedMarkAllAsRead,
        fetchNotifications,
        refreshNotifications,
        forceRefresh,
    } = useNotificationBell();

    // Use optimistic count if available, otherwise use real count
    const displayUnreadCount = optimisticUnreadCount !== null ? optimisticUnreadCount : unreadCount;

    // Handle count display logic: show "9+" for counts > 9, then change to dot after 1 second
    useEffect(() => {
        if (displayUnreadCount > 0) {
            // Clear any existing timeout
            if (dotTimeoutRef.current) {
                clearTimeout(dotTimeoutRef.current);
            }

            // Show "9+" immediately
            setShowDot(false);

            // Change to dot after 1 second
            dotTimeoutRef.current = setTimeout(() => {
                setShowDot(true);
            }, 2000);
        } else {
            // For counts <= 9, always show the number
            setShowDot(false);
            if (dotTimeoutRef.current) {
                clearTimeout(dotTimeoutRef.current);
                dotTimeoutRef.current = null;
            }
        }

        // Cleanup timeout on unmount
        return () => {
            if (dotTimeoutRef.current) {
                clearTimeout(dotTimeoutRef.current);
            }
        };
    }, [displayUnreadCount]);

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
            // Only refresh if WebSocket is not connected or no recent data
            if (!isConnected) {
                //console.log(('↻ Bell opened - refreshing (WebSocket disconnected)');
                forceRefresh();
            } else {
                //console.log(('🚫 Bell opened - skipping refresh (WebSocket connected)');
            }

            // Mark all notifications as read when opening the bell (just by viewing them)
            if (unreadCount > 0 && !isMarkingAsRead) {
                setIsMarkingAsRead(true);
                debouncedMarkAllAsRead();
                // Reset the marking state after a delay
                setTimeout(() => setIsMarkingAsRead(false), 300);
            }
        }
    }, [open, forceRefresh, unreadCount, debouncedMarkAllAsRead, isMarkingAsRead, isConnected]);

    // Debug WebSocket connection
    useEffect(() => {
        console.log('🔌 WebSocket Status:', { isConnected, connectionStatus });
        
        // Auto-reconnect if disconnected and we have a user
        if (!isConnected && connectionStatus === 'disconnected') {
            console.log('🔄 WebSocket disconnected, attempting reconnection...');
            // Attempt reconnection after a short delay
            const reconnectTimer = setTimeout(() => {
                if (!isConnected) {
                    console.log('🔄 Triggering force refresh to check for missed notifications');
                    forceRefresh();
                }
            }, 2000);
            
            return () => clearTimeout(reconnectTimer);
        }
    }, [isConnected, connectionStatus, forceRefresh]);

    // Periodic health check for WebSocket connection
    useEffect(() => {
        const healthCheckInterval = setInterval(() => {
            if (!isConnected && connectionStatus !== 'connecting') {
                console.log('🏥 Health check: WebSocket disconnected, forcing refresh');
                forceRefresh();
            }
        }, 10000); // Check every 10 seconds
        
        return () => clearInterval(healthCheckInterval);
    }, [isConnected, connectionStatus, forceRefresh]);

    // Reset optimistic count when real count changes
    useEffect(() => {
        if (optimisticUnreadCount !== null) {
            setOptimisticUnreadCount(null);
        }
    }, [unreadCount]);

    const getPriorityColor = (priority?: string) => {
        if (priority && priorityColors[priority as keyof typeof priorityColors]) {
            return priorityColors[priority as keyof typeof priorityColors];
        }
        return 'border-l-gray-300';
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

    const getActionUrl = (notification: Notification) => {
        // Generate action URLs based on notification type and metadata
        //console.log(('Generating action URL for notification:', notification.metadata);
        if (notification.metadata?.gigId) {
            return `/gig/${notification.metadata.gigId}`;
        }

        // Handle clan-specific notifications
        if (notification.type === 'CLAN' || notification.category === 'CLAN') {
            const clanId = notification.metadata?.clanId;

            // For join request notifications, take clan head to manage page
            if (clanId && (
                notification.title?.toLowerCase().includes('join request') ||
                notification.message?.toLowerCase().includes('join request') ||
                notification.metadata?.joinRequestId
            )) {
                return `/clan/${clanId}/manage`;
            }

            // For other clan notifications, take to clan detail page
            if (clanId) {
                return `/clan/${clanId}`;
            }

            // Fallback to clans page
            return '/clans';
        }

        switch (notification.type) {
            case 'GIG':
                return '/my/gigs';
            case 'PAYMENT':
                return '/credits/history';
            case 'MESSAGE':
                return '/messages';
            case 'REVIEW':
                return '/profile';
            default:
                return null;
        }
    };

    const handleBellClick = async () => {
        // Always force refresh when opening bell to catch any missed notifications
        console.log('🔔 Bell clicked - forcing refresh to catch missed notifications');
        await forceRefresh();
        
        // Mark all as read and clear UI immediately
        if (unreadCount > 0) {
            setOptimisticUnreadCount(0);
            setShowDot(false);
            await handleMarkAllAsRead();
        }
        setOpen((v) => !v);
    };



    return (
        <div className="relative" ref={dropdownRef} style={{ zIndex: 99999 }}>
            <button
                className="relative p-2  hover:bg-gray-100 rounded-full transition-colors"
                onClick={handleBellClick}
                aria-label="Notifications"
            >
                <span className="text-xl">
                    <BellIcon className="w-6 h-6" />
                </span>
                {displayUnreadCount > 0 && (
                    <>
                        {/* Show dot for counts > 9 after 1 second */}
                        {displayUnreadCount > 0 && showDot ? (
                            <span className="absolute top-0 right-0 sm:top-1 sm:right-1 bg-red-500 rounded-full h-3 w-3 flex items-center justify-center transition-all duration-300 ease-in-out">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            </span>
                        ) : (
                            /* Show count or "9+" for counts > 9 initially */
                            <span className="absolute top-0 right-0 sm:top-1 sm:right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium transition-all duration-300 ease-in-out">
                                {displayUnreadCount > 9 ? '9+' : displayUnreadCount}
                            </span>
                        )}
                    </>
                )}
                {!isConnected && connectionStatus !== 'connected' && (
                    <span className={`absolute -bottom-1 -right-1 rounded-full h-2 w-2 ${connectionStatus === 'error' || connectionStatus === 'failed' ? 'bg-red-400' :
                        connectionStatus === 'timeout' ? 'bg-yellow-400' :
                            connectionStatus === 'unavailable' ? 'bg-gray-400' :
                                connectionStatus === 'disabled' ? 'bg-blue-400' :
                                    'bg-gray-400'
                        }`}></span>
                )}
            </button>

            {open && (
                <div className="absolute -right-8 mt-2 w-80 bg-white shadow-xl rounded-lg border border-gray-200" style={{ zIndex: 999999 }}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                        <span className="font-semibold text-gray-900">Notifications</span>
                        <div className="flex items-center space-x-2">
                            {!isConnected && connectionStatus !== 'connected' && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {connectionStatus === 'error' ? 'Connection error' :
                                        connectionStatus === 'timeout' ? 'Connection timeout' :
                                            connectionStatus === 'failed' ? 'Connection failed' :
                                                connectionStatus === 'unavailable' ? 'WebSocket unavailable' :
                                                    connectionStatus === 'disabled' ? 'Using polling' :
                                                        'Reconnecting...'}
                                </span>
                            )}
                            {isConnected && connectionStatus === 'connected' && (
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                    Connected
                                </span>
                            )}
                        </div>
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
                                    onClick={() => {
                                        fetchNotifications();
                                        refreshNotifications();
                                    }}
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
                            notifications.map((notification) => {
                                const actionUrl = getActionUrl(notification);

                                return (
                                    <div
                                        key={notification.id}
                                        className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(notification.priority)} ${!notification.read ? 'bg-blue-50' : ''}`}
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (!notification.read) await handleMarkAsRead(notification.id);
                                            if (actionUrl) {
                                                setOpen(false);
                                                window.location.href = actionUrl;
                                            }
                                        }}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-1 min-w-0">
                                                <div className={`font-medium text-sm truncate ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </div>
                                                <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-2">
                                                    {formatTimeAgo(notification.createdAt)}
                                                </div>
                                            </div>
                                            {!notification.read && (
                                                <div className="flex-shrink-0">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
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
