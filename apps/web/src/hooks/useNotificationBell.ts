import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} from '@/lib/notification-api';

interface Notification {
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

export function useNotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Real-time polling interval
    const pollingInterval = useRef<NodeJS.Timeout | null>(null);
    const lastNotificationCount = useRef(0);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);
            const res = await getNotifications(user.id, 10);

            if (res.success) {
                const newNotifications = (res.data as { notifications?: Notification[] }).notifications || [];
                setNotifications(newNotifications);

                // Check for new notifications (for real-time feel)
                if (newNotifications.length > lastNotificationCount.current) {
                    // You could add a toast notification here
                    console.log('New notifications received!');
                }
                lastNotificationCount.current = newNotifications.length;
            } else {
                setError('Failed to load notifications');
            }
        } catch (error: any) {
            setError(error.message || 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, [user]);

    const fetchUnreadCount = useCallback(async () => {
        if (!user) return;

        try {
            const res = await getUnreadCount(user.id);
            if (res.success) {
                const newCount = (res.data as { unread?: number }).unread || 0;
                setUnreadCount(newCount);

                // Real-time notification sound/alert for new notifications
                if (newCount > 0 && newCount > lastNotificationCount.current) {
                    // Play notification sound
                    playNotificationSound();
                }
            }
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, [user]);

    // Play notification sound
    const playNotificationSound = () => {
        try {
            const audio = new Audio('/sounds/notification.mp3'); // Add your sound file
            audio.volume = 0.3;
            audio.play().catch(() => {
                // Fallback: use browser's built-in notification sound
                console.log('Notification received!');
            });
        } catch (error) {
            console.log('Notification received!');
        }
    };

    // Start real-time polling
    const startPolling = useCallback(() => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
        }

        // Initial fetch
        fetchNotifications();
        fetchUnreadCount();

        // Poll every 30 seconds for real-time updates
        pollingInterval.current = setInterval(() => {
            fetchNotifications();
            fetchUnreadCount();
        }, 30000); // 30 seconds
    }, [fetchNotifications, fetchUnreadCount]);

    // Stop polling
    const stopPolling = useCallback(() => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
        }
    }, []);

    useEffect(() => {
        if (user) {
            startPolling();
        } else {
            stopPolling();
        }

        return () => {
            stopPolling();
        };
    }, [user, startPolling, stopPolling]);

    // Manual refresh function
    const refreshNotifications = useCallback(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, [fetchNotifications, fetchUnreadCount]);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead(id);
            // Optimistic update
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
            // Refresh counts
            fetchUnreadCount();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user) return;

        try {
            await markAllAsRead(user.id);
            // Optimistic update
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        error,
        handleMarkAsRead,
        handleMarkAllAsRead,
        refreshNotifications,
        startPolling,
        stopPolling,
    };
}