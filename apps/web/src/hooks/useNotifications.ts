import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import {
    getNotifications,
    getNotificationCounts,
    getUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getUserPreferences,
    updateUserPreferences,
    getUserAnalytics,
    subscribeToClanChannels,
    unsubscribeFromClanChannels,
    getClanNotificationChannels
} from '@/lib/notification-api';
import type {
    Notification,
    NotificationCounts,
    NotificationPreferences,
    NotificationAnalytics,
    ClanWebSocketMessage
} from '@/types/notification.types';

interface UseNotificationsOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
    initialLimit?: number;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
    const {
        autoRefresh = true,
        refreshInterval = 3000,
        initialLimit = 20
    } = options;

    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [counts, setCounts] = useState<NotificationCounts>({ total: 0, unread: 0, read: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
    const [analytics, setAnalytics] = useState<NotificationAnalytics | null>(null);

    // WebSocket state
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 5;

    // Clan notification state
    const [clanChannels, setClanChannels] = useState<string[]>([]);
    const [clanNotifications, setClanNotifications] = useState<ClanWebSocketMessage[]>([]);

    // Real-time polling interval (fallback)
    const pollingInterval = useRef<NodeJS.Timeout | null>(null);
    const lastNotificationCount = useRef(0);
    const lastUnreadCount = useRef(0);
    const lastWebSocketUpdate = useRef<number>(0); // Track when we last received WebSocket data
    const lastFetchTime = useRef<number>(0); // Track when we last fetched data
    const isInitialized = useRef<boolean>(false); // Track if we've done initial fetch
    const processedNotificationIds = useRef<Set<string>>(new Set()); // Track processed notification IDs

    // Helper functions for clan notifications
    const getClanNotificationTitle = useCallback((data: ClanWebSocketMessage): string => {
        switch (data.type) {
            case 'clan_gig_approved':
                return `🎉 Gig Approved: ${data.data.gigTitle}`;
            case 'clan_milestone_created':
                return `📋 New Milestone: ${data.data.milestoneTitle}`;
            case 'clan_milestone_approved':
                return `✅ Milestone Approved: ${data.data.milestoneTitle}`;
            case 'clan_task_assigned':
                return `📝 Task Assigned: ${data.data.taskTitle}`;
            case 'clan_task_status_updated':
                return `🔄 Task Updated: ${data.data.taskTitle}`;
            default:
                return 'Clan Notification';
        }
    }, []);

    const getClanNotificationMessage = useCallback((data: ClanWebSocketMessage): string => {
        switch (data.type) {
            case 'clan_gig_approved':
                return `Your clan's application for "${data.data.gigTitle}" has been approved!`;
            case 'clan_milestone_created':
                return `New milestone "${data.data.milestoneTitle}" created for gig "${data.data.gigTitle}"`;
            case 'clan_milestone_approved':
                return `Milestone "${data.data.milestoneTitle}" has been approved for gig "${data.data.gigTitle}"`;
            case 'clan_task_assigned':
                return `You have been assigned task "${data.data.taskTitle}" for gig "${data.data.gigTitle}"`;
            case 'clan_task_status_updated':
                return `Task "${data.data.taskTitle}" status updated to ${data.data.newStatus}`;
            default:
                return 'You have a new clan notification';
        }
    }, []);

    // Core WebSocket connection logic
    const connect = useCallback(() => {
        if (!user?.id) {
            console.error('User ID is required for WebSocket connection');
            return;
        }

        // Prevent multiple connection attempts
        if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) {
            console.log('WebSocket already connected or connecting, skipping...', wsRef.current.readyState);
            return;
        }

        // Clean up any existing connection first
        if (wsRef.current) {
            console.log('Cleaning up existing WebSocket connection');
            wsRef.current.close();
            wsRef.current = null;
        }

        // Don't attempt WebSocket if we're in a browser environment that doesn't support it
        if (typeof window === 'undefined' || typeof WebSocket === 'undefined') {
            console.log('WebSocket not available, using polling only');
            setConnectionStatus('unavailable');
            return;
        }

        try {
            // Use API Gateway for WebSocket connection
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
            const wsUrl = `${baseUrl.replace('http://', 'ws://').replace('https://', 'wss://')}/api/notifications/ws`;
            const fullWsUrl = `${wsUrl}?userId=${user.id}`;

            console.log('🔌 Connecting to WebSocket via API Gateway:', fullWsUrl);
            wsRef.current = new WebSocket(fullWsUrl);

            // Set connection timeout
            const connectionTimeout = setTimeout(() => {
                if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
                    console.log('WebSocket connection timeout, falling back to polling');
                    wsRef.current.close();
                    setConnectionStatus('timeout');
                }
            }, 10000); // Increased to 10 second timeout

            wsRef.current.onopen = () => {
                clearTimeout(connectionTimeout);
                setIsConnected(true);
                setConnectionStatus('connected');
                reconnectAttemptsRef.current = 0;
                console.log('✅ WebSocket connected for user:', user.id);

                // Stop polling when WebSocket connects
                if (pollingInterval.current) {
                    clearInterval(pollingInterval.current);
                    pollingInterval.current = null;
                    console.log('🚫 Stopped polling - WebSocket now active');
                }

                // Request initial sync of counts when WebSocket connects
                // This helps prevent count discrepancies after page refresh
                setTimeout(() => {
                    if (!isInitialized.current) {
                        console.log('🔄 Requesting initial notification sync');
                        fetchCounts();
                        fetchNotifications();
                        isInitialized.current = true;
                    }
                }, 500); // Small delay to ensure WebSocket is fully ready
            };

            wsRef.current.onmessage = (event) => {
                console.log('🔌 Raw WebSocket message received:');
                console.log('📦 Event data type:', typeof event.data);
                console.log('📦 Event data:', event.data);
                console.log('📦 Event data instanceof Blob:', event.data instanceof Blob);

                try {
                    let messageData;

                    // Handle different message types
                    if (event.data instanceof Blob) {
                        console.log('📦 Processing Blob message...');
                        // If it's a Blob, convert to text first
                        const reader = new FileReader();
                        reader.onload = () => {
                            try {
                                const text = reader.result as string;
                                console.log('📦 Blob text content:', text);
                                const data = JSON.parse(text);
                                console.log('📦 Parsed Blob data:', data);
                                handleWebSocketMessage(data);
                            } catch (error) {
                                console.error('❌ Error parsing Blob message:', error);
                                console.error('❌ Blob text was:', reader.result);
                            }
                        };
                        reader.readAsText(event.data);
                        return;
                    } else if (typeof event.data === 'string') {
                        console.log('📦 Processing string message:', event.data);
                        // If it's already a string, parse it directly
                        messageData = JSON.parse(event.data);
                    } else {
                        console.log('📦 Processing other data type, converting to string...');
                        // For other data types, try to convert to string first
                        messageData = JSON.parse(String(event.data));
                    }

                    console.log('📦 Final parsed message data:', messageData);
                    handleWebSocketMessage(messageData);
                } catch (error) {
                    console.error('❌ Error parsing WebSocket message:', error);
                    console.error('❌ Raw message data:', event.data);
                    console.error('❌ Message data type:', typeof event.data);
                }
            };

            // Helper function to handle parsed WebSocket messages
            const handleWebSocketMessage = (data: any) => {
                console.log('🎯 === WebSocket Message Handler ===');
                console.log('🎯 Full data object:', JSON.stringify(data, null, 2));
                console.log('🎯 Data type:', data.type);
                console.log('🎯 Data keys:', Object.keys(data));

                // Mark that we received real-time data
                lastWebSocketUpdate.current = Date.now();
                console.log('🎯 Updated lastWebSocketUpdate to:', new Date().toISOString());

                // Handle clan-specific WebSocket messages
                if (data.type && data.type.startsWith('clan_')) {
                    console.log('🏰 === CLAN NOTIFICATION MESSAGE ===');
                    console.log('🏰 Clan notification data:', JSON.stringify(data, null, 2));

                    // Add to clan notifications
                    setClanNotifications(prev => {
                        const newNotification = data as ClanWebSocketMessage;
                        // Check for duplicates
                        const isDuplicate = prev.some(n =>
                            n.type === newNotification.type &&
                            n.data.gigId === newNotification.data.gigId &&
                            n.data.clanId === newNotification.data.clanId
                        );

                        if (isDuplicate) {
                            console.log('🚫 Duplicate clan notification detected, skipping');
                            return prev;
                        }

                        console.log('✅ Adding new clan notification:', newNotification.type);
                        return [newNotification, ...prev];
                    });

                    // Show browser notification for clan events
                    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                        const title = getClanNotificationTitle(data);
                        const message = getClanNotificationMessage(data);

                        new Notification(title, {
                            body: message,
                            icon: '/favicon.ico',
                            tag: `clan-${data.type}-${data.data.clanId}`
                        });
                    }

                    // Play notification sound
                    playNotificationSound();

                    // Update notification counts for clan events
                    setUnreadCount(prev => prev + 1);
                    setCounts(prev => ({ ...prev, unread: prev.unread + 1 }));

                    return; // Don't process clan notifications as regular notifications
                }

                if (data.type === 'notification') {
                    console.log('🔔 === NOTIFICATION MESSAGE ===');
                    console.log('🔔 Notification data:', JSON.stringify(data.data, null, 2));
                    console.log('🔔 Notification ID:', data.data?.id);
                    console.log('🔔 Notification title:', data.data?.title);
                    console.log('🔔 Notification message:', data.data?.message);

                    // Filter out test or dummy notifications
                    if (!data.data.id || data.data.title?.includes('test') || data.data.title?.includes('dummy')) {
                        console.log('🚫 Filtering out test/dummy WebSocket notification:', data.data.title);
                        return;
                    }

                    // Enhanced duplicate detection using Set
                    if (processedNotificationIds.current.has(data.data.id)) {
                        console.log('🚫 Notification already processed recently:', data.data.id);
                        return;
                    }

                    // Mark this notification as processed
                    processedNotificationIds.current.add(data.data.id);
                    console.log('✅ Marked notification as processed:', data.data.id);

                    // Clean up old IDs (keep only last 100 to prevent memory leaks)
                    if (processedNotificationIds.current.size > 100) {
                        const idsArray = Array.from(processedNotificationIds.current);
                        processedNotificationIds.current = new Set(idsArray.slice(-50)); // Keep last 50
                        console.log('🧹 Cleaned up processed notification IDs cache');
                    }

                    // Check for duplicate notifications in current state
                    setNotifications(prev => {
                        console.log('🔔 Current notifications count:', prev.length);
                        console.log('🔔 Checking for duplicate ID in current state:', data.data.id);

                        const isDuplicate = prev.some(n => n.id === data.data.id);
                        if (isDuplicate) {
                            console.log('🚫 Duplicate notification detected in state, skipping:', data.data.id);
                            return prev;
                        }
                        console.log('✅ Adding new notification to state:', data.data.id);
                        console.log('✅ New notifications count will be:', prev.length + 1);

                        // DON'T update counts here - wait for server to send updated counts
                        // The server should send a 'counts' message after sending the notification
                        console.log('⏳ Waiting for server count update instead of optimistic update');

                        // If server doesn't send counts automatically, request them after a short delay
                        setTimeout(() => {
                            console.log('🔄 Requesting updated counts from server');
                            fetchCounts();
                        }, 1000);

                        return [data.data, ...prev];
                    });

                    // Show browser notification if permission granted
                    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                        console.log('🔔 Showing browser notification');
                        new Notification(data.data.title, {
                            body: data.data.message,
                            icon: '/favicon.ico',
                            tag: data.data.id // Prevent duplicate notifications
                        });
                    }

                    // Play notification sound
                    console.log('🔔 Playing notification sound');
                    playNotificationSound();

                    // No need to delay polling since it's disabled when WebSocket is connected
                } else if (data.type === 'connection') {
                    console.log('🔗 === CONNECTION MESSAGE ===');
                    console.log('🔗 Connection message:', data.message);
                    console.log('🔗 Full connection data:', JSON.stringify(data, null, 2));
                } else if (data.type === 'counts') {
                    console.log('📊 === COUNTS UPDATE MESSAGE ===');
                    console.log('📊 Server counts:', JSON.stringify(data.data, null, 2));
                    console.log('📊 Previous local unread count:', unreadCount);
                    console.log('📊 New server unread count:', data.data.unread);

                    // Use server counts as the authoritative source
                    setCounts(data.data);
                    setUnreadCount(data.data.unread);

                    console.log('✅ Updated counts from server - this is the authoritative count');
                } else if (data.type === 'count_update') {
                    // Alternative message type for count updates
                    console.log('📊 === COUNT UPDATE MESSAGE (alternative) ===');
                    console.log('📊 Server count:', data.count);
                    console.log('📊 Previous local unread count:', unreadCount);

                    if (typeof data.count === 'number') {
                        setUnreadCount(data.count);
                        setCounts(prev => ({
                            ...prev,
                            unread: data.count
                        }));
                        console.log('✅ Updated unread count from server:', data.count);
                    }
                } else if (data.type === 'error') {
                    console.error('❌ === ERROR MESSAGE ===');
                    console.error('❌ WebSocket server error:', data.message);
                    console.error('❌ Full error data:', JSON.stringify(data, null, 2));
                    setConnectionStatus('error');
                } else {
                    console.log('❓ === UNKNOWN MESSAGE TYPE ===');
                    console.log('❓ Unknown message type:', data.type);
                    console.log('❓ Full unknown data:', JSON.stringify(data, null, 2));
                }
            };

            wsRef.current.onclose = (event) => {
                clearTimeout(connectionTimeout);
                setIsConnected(false);
                setConnectionStatus('disconnected');
                console.log('WebSocket disconnected:', event.code, event.reason);

                // Handle different close codes more gracefully
                if (event.code === 1006) {
                    console.log('⚠️ WebSocket closed with code 1006 (abnormal closure) - likely server-side issue');
                    console.log('⚠️ This is usually caused by server restart or connection timeout');
                }

                // Only attempt to reconnect if wsRef.current is still valid (not manually disconnected)
                // and for unexpected disconnections (not manual disconnects)
                const shouldReconnect = wsRef.current !== null && // Not manually disconnected
                    event.code !== 1000 && // Normal closure
                    event.code !== 1001 && // Going away
                    event.code !== 1005 && // No status received
                    reconnectAttemptsRef.current < maxReconnectAttempts &&
                    !reconnectTimeoutRef.current &&
                    user?.id; // Make sure user is still available

                if (shouldReconnect) {
                    reconnectAttemptsRef.current++;
                    // Use exponential backoff with longer delays to reduce server load
                    const delay = Math.min(2000 * Math.pow(2, reconnectAttemptsRef.current - 1), 60000);

                    console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectTimeoutRef.current = null;
                        if (user?.id && wsRef.current !== null) { // Double check conditions
                            console.log('🔄 Attempting reconnection...');
                            connect();
                        }
                    }, delay);
                } else if (event.code === 1000) {
                    console.log('WebSocket closed normally by user');
                } else {
                    console.log('WebSocket connection failed permanently, using polling fallback');
                    setConnectionStatus('failed');

                    // Restart polling when WebSocket fails permanently
                    if (autoRefresh && !pollingInterval.current) {
                        pollingInterval.current = setInterval(() => {
                            console.log('📊 Polling for updates (WebSocket failed)');
                            fetchNotifications();
                            fetchCounts();
                        }, refreshInterval);
                        console.log('🔄 Started polling fallback due to WebSocket failure');
                    }
                }
            };

            wsRef.current.onerror = (error) => {
                clearTimeout(connectionTimeout);
                console.error('WebSocket error:', error);
                setConnectionStatus('error');

                // Don't attempt to reconnect on error, let the onclose handler deal with it
                console.log('WebSocket error occurred, will handle in onclose');
            };

        } catch (error) {
            console.error('Error creating WebSocket connection:', error);
            setConnectionStatus('error');
        }
    }, [user?.id]);

    const disconnect = useCallback(() => {
        console.log('🔌 Disconnecting WebSocket...');

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (wsRef.current) {
            // Set to null first to prevent onclose from triggering reconnection
            const ws = wsRef.current;
            wsRef.current = null;

            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close(1000, 'User disconnected');
            }
        }

        setIsConnected(false);
        setConnectionStatus('disconnected');
        reconnectAttemptsRef.current = 0;

        console.log('✅ WebSocket disconnected cleanly');
    }, []);

    // Fetch notifications with pagination and filtering
    const fetchNotifications = useCallback(async (
        page = 1,
        limit = initialLimit,
        type?: string,
        category?: string,
        read?: boolean
    ) => {
        if (!user) return { success: false, data: { notifications: [], pagination: null } };

        // If WebSocket is connected and working, don't fetch unless this is the initial load
        if (isConnected && isInitialized.current) {
            const timeSinceLastWebSocketUpdate = Date.now() - lastWebSocketUpdate.current;
            if (timeSinceLastWebSocketUpdate < 10000) { // If we got WebSocket data in last 10 seconds
                console.log('🚫 Skipping fetch - WebSocket is active');
                return { success: true, data: { notifications, pagination: null } };
            }
        }

        // Prevent rapid consecutive fetches
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchTime.current;
        if (timeSinceLastFetch < 2000 && isInitialized.current) { // Minimum 2 seconds between fetches
            console.log('🚫 Skipping fetch - too soon since last fetch');
            return { success: true, data: { notifications, pagination: null } };
        }

        if (loading) {
            console.log('🚫 Skipping fetch - already loading');
            return { success: true, data: { notifications, pagination: null } };
        }

        try {
            setLoading(true);
            setError(null);
            lastFetchTime.current = now;

            console.log('📥 Fetching notifications...', { page, limit, type, category, read });
            const res = await getNotifications(user.id, page, limit, type, category, read);

            if (res.success) {
                console.log('✅ Fetched notifications:', res.data.notifications.length, 'notifications');

                // Filter out any test or dummy notifications
                const validNotifications = res.data.notifications.filter(notification => {
                    // Skip notifications without proper IDs or that look like test data
                    if (!notification.id || notification.title?.includes('test') || notification.title?.includes('dummy')) {
                        console.log('🚫 Filtering out test/dummy notification:', notification.title);
                        return false;
                    }
                    return true;
                });

                setNotifications(validNotifications);
                isInitialized.current = true;
                return { ...res, data: { ...res.data, notifications: validNotifications } };
            } else {
                setError('Failed to load notifications');
                return { success: false, data: { notifications: [], pagination: null } };
            }
        } catch (error: any) {
            setError(error.message || 'Failed to load notifications');
            return { success: false, data: { notifications: [], pagination: null } };
        } finally {
            setLoading(false);
        }
    }, [user, initialLimit, isConnected, notifications, loading]);

    // Fetch unread notifications only
    const fetchUnreadNotifications = useCallback(async () => {
        if (!user) return { success: false, data: { notifications: [], pagination: null } };

        // If WebSocket is connected and working, don't fetch unless this is the initial load
        if (isConnected && isInitialized.current) {
            const timeSinceLastWebSocketUpdate = Date.now() - lastWebSocketUpdate.current;
            if (timeSinceLastWebSocketUpdate < 10000) { // If we got WebSocket data in last 10 seconds
                console.log('🚫 Skipping unread fetch - WebSocket is active');
                return { success: true, data: { notifications, pagination: null } };
            }
        }

        // Prevent rapid consecutive fetches
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchTime.current;
        if (timeSinceLastFetch < 2000 && isInitialized.current) { // Minimum 2 seconds between fetches
            console.log('🚫 Skipping unread fetch - too soon since last fetch');
            return { success: true, data: { notifications, pagination: null } };
        }

        try {
            lastFetchTime.current = now;
            const res = await getUnreadNotifications(user.id);
            if (res.success) {
                setNotifications(res.data.notifications);
                isInitialized.current = true;
                return res;
            }
            return { success: false, data: { notifications: [], pagination: null } };
        } catch (error: any) {

            console.error('Failed to fetch unread notifications:', error);
            return { success: false, data: { notifications: [], pagination: null } };
        }
    }, [user, isConnected, notifications]);

    // Fetch notification counts
    const fetchCounts = useCallback(async () => {
        if (!user) return;

        // If WebSocket is connected and working, don't fetch counts unless this is the initial load
        if (isConnected && isInitialized.current) {
            const timeSinceLastWebSocketUpdate = Date.now() - lastWebSocketUpdate.current;
            if (timeSinceLastWebSocketUpdate < 10000) { // If we got WebSocket data in last 10 seconds
                console.log('🚫 Skipping counts fetch - WebSocket is active');
                return;
            }
        }

        // Prevent rapid consecutive fetches
        const now = Date.now();
        const timeSinceLastFetch = now - lastFetchTime.current;
        if (timeSinceLastFetch < 2000 && isInitialized.current) { // Minimum 2 seconds between fetches
            console.log('🚫 Skipping counts fetch - too soon since last fetch');
            return;
        }

        try {
            lastFetchTime.current = now;
            const res = await getNotificationCounts(user.id);
            if (res.success) {
                // Only update counts if no recent WebSocket update
                const timeSinceLastWsUpdate = Date.now() - lastWebSocketUpdate.current;
                if (timeSinceLastWsUpdate > 2000 || !isConnected) {
                    console.log('📊 Updating counts from API:', res.data);
                    setCounts(res.data);
                    setUnreadCount(res.data.unread);
                } else {
                    console.log('🚫 Skipping count update - recent WebSocket data');
                }
                isInitialized.current = true;

                // Check for new notifications (for real-time feel)
                if (res.data.unread > lastNotificationCount.current) {
                    console.log('🔔 New notification detected!', res.data.unread, 'unread');
                    playNotificationSound();
                }
                lastNotificationCount.current = res.data.unread;
            }
        } catch (error) {
            console.error('Failed to fetch notification counts:', error);
        }
    }, [user, isConnected]);

    // Fetch user preferences
    const fetchPreferences = useCallback(async () => {
        if (!user) return;

        try {
            const res = await getUserPreferences(user.id);
            if (res.success) {
                setPreferences(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch preferences:', error);
        }
    }, [user]);

    // Fetch analytics
    const fetchAnalytics = useCallback(async () => {
        if (!user) return;

        try {
            const res = await getUserAnalytics(user.id);
            if (res.success) {
                setAnalytics(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        }
    }, [user]);

    // Play notification sound
    const playNotificationSound = () => {
        try {
            const audio = new Audio('/sounds/notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => {
                console.log('Notification received!');
            });
        } catch (error) {
            console.log('Notification received!');
        }
    };

    // Mark notification as read
    const markNotificationAsRead = useCallback(async (id: string) => {
        try {
            await markAsRead(id);
            // Optimistic update
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
            // Refresh counts
            fetchCounts();
            return { success: true };
        } catch (error) {
            console.error('Failed to mark as read:', error);
            return { success: false, error };
        }
    }, [fetchCounts]);

    // Mark all notifications as read
    const markAllNotificationsAsRead = useCallback(async () => {
        if (!user) return { success: false };

        try {
            console.log('📖 Marking all notifications as read...');

            // Optimistic update - immediate UI feedback
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );
            setUnreadCount(0);
            setCounts(prev => ({ ...prev, unread: 0 }));

            // API call
            await markAllAsRead(user.id);
            console.log('✅ Marked all notifications as read in backend');

            return { success: true };
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            return { success: false, error };
        }
    }, [user]);

    // Debounced mark all as read to prevent rapid calls
    const debouncedMarkAllAsRead = useCallback(() => {
        let timeoutId: NodeJS.Timeout;

        return () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                console.log('📝 Debounced mark all as read triggered');
                markAllNotificationsAsRead();
            }, 500); // 500ms debounce to prevent rapid calls
        };
    }, [markAllNotificationsAsRead]);

    // Delete notification
    const deleteNotificationById = useCallback(async (id: string) => {
        try {
            await deleteNotification(id);
            // Optimistic update
            setNotifications(prev => prev.filter(n => n.id !== id));
            // Refresh counts
            fetchCounts();
            return { success: true };
        } catch (error) {
            console.error('Failed to delete notification:', error);
            return { success: false, error };
        }
    }, [fetchCounts]);

    // Clear all notifications
    const clearAllNotificationsForUser = useCallback(async () => {
        if (!user) return { success: false };

        try {
            console.log('🗑️ Clearing all notifications...');

            // Optimistic update
            setNotifications([]);
            setUnreadCount(0);
            setCounts({ total: 0, unread: 0, read: 0 });

            // API call
            await clearAllNotifications(user.id);
            console.log('✅ Cleared all notifications from API');

            return { success: true };
        } catch (error) {
            console.error('Failed to clear notifications:', error);
            return { success: false, error };
        }
    }, [user]);

    // Update preferences
    const updateUserNotificationPreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
        if (!user) return { success: false };

        try {
            const res = await updateUserPreferences(user.id, updates);
            if (res.success) {
                setPreferences(res.data);
                return { success: true, data: res.data };
            }
            return { success: false };
        } catch (error) {
            console.error('Failed to update preferences:', error);
            return { success: false, error };
        }
    }, [user]);

    // Start real-time polling (fallback when WebSocket is not available)
    const startPolling = useCallback(() => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
        }

        // Don't do initial fetch immediately - give WebSocket a chance to connect
        // Only fetch if WebSocket fails to connect after a reasonable time
        const initialFetchDelay = setTimeout(() => {
            if (!isConnected && !isInitialized.current) {
                console.log('📥 Initial fetch - WebSocket not connected after delay');
                fetchNotifications();
                fetchCounts();
                fetchPreferences();
                fetchAnalytics();
            } else {
                console.log('✅ WebSocket connected - skipping initial fetch');
                // Still fetch preferences and analytics as they're not real-time
                fetchPreferences();
                fetchAnalytics();
            }
        }, 2000); // Give WebSocket 2 seconds to connect

        // Only poll when WebSocket is NOT connected
        if (autoRefresh && !isConnected) {
            pollingInterval.current = setInterval(() => {
                console.log('📊 Polling for updates (WebSocket disconnected)');
                fetchNotifications();
                fetchCounts();
            }, refreshInterval);

            console.log(`Started polling every ${refreshInterval}ms (WebSocket disconnected)`);
        } else if (isConnected) {
            console.log('🚫 Polling disabled - using WebSocket real-time updates');
        }

        // Clean up the initial fetch timeout when component unmounts
        return () => clearTimeout(initialFetchDelay);
    }, [fetchNotifications, fetchCounts, fetchPreferences, fetchAnalytics, autoRefresh, refreshInterval, isConnected]);

    // Delay the next polling cycle (only needed when WebSocket is disconnected)
    const delayNextPoll = useCallback(() => {
        // Only restart polling if WebSocket is disconnected
        if (!isConnected && pollingInterval.current) {
            clearInterval(pollingInterval.current);

            setTimeout(() => {
                if (autoRefresh && !isConnected) {
                    pollingInterval.current = setInterval(() => {
                        console.log('📊 Polling for updates (WebSocket disconnected)');
                        fetchNotifications();
                        fetchCounts();
                    }, refreshInterval);

                    console.log('🔄 Resumed polling after delay (WebSocket disconnected)');
                }
            }, 3000);
        } else {
            console.log('� No polling delay needed - WebSocket is connected');
        }
    }, [autoRefresh, refreshInterval, isConnected, fetchNotifications, fetchCounts]);

    // Stop polling
    const stopPolling = useCallback(() => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
        }
    }, []);

    // Manual refresh function
    const refresh = useCallback(() => {
        console.log('🔄 Manual refresh triggered');
        // Always allow manual refresh
        lastWebSocketUpdate.current = 0; // Reset WebSocket timestamp to allow polling
        lastFetchTime.current = 0; // Reset fetch timing to allow immediate fetch
        isInitialized.current = false; // Allow re-initialization

        // Clear existing state to prevent stale data
        setNotifications([]);
        setUnreadCount(0);
        setCounts({ total: 0, unread: 0, read: 0 });

        fetchNotifications();
        fetchCounts();
        fetchPreferences();
        fetchAnalytics();
    }, [fetchNotifications, fetchCounts, fetchPreferences, fetchAnalytics]);

    // Force refresh function
    const forceRefresh = useCallback(() => {
        // Always allow force refresh
        lastWebSocketUpdate.current = 0; // Reset WebSocket timestamp to allow polling
        lastFetchTime.current = 0; // Reset fetch timing to allow immediate fetch
        isInitialized.current = false; // Allow re-initialization
        fetchNotifications();
        fetchCounts();
    }, [fetchNotifications, fetchCounts]);

    // Handle focus events (when user returns to tab)
    const handleFocus = useCallback(() => {
        if (user) {
            // If WebSocket is connected, no need to fetch on focus
            if (isConnected) {
                console.log('🚫 Skipping focus fetch - WebSocket is active');
                return;
            }

            // Only fetch if enough time has passed since last fetch
            const now = Date.now();
            const timeSinceLastFetch = now - lastFetchTime.current;
            if (timeSinceLastFetch < 5000) { // Minimum 5 seconds between focus fetches
                console.log('🚫 Skipping focus fetch - too soon since last fetch');
                return;
            }

            console.log('🔍 Window focused - refreshing notifications');
            lastFetchTime.current = now;
            fetchCounts();
            fetchNotifications();
        }
    }, [user, fetchCounts, fetchNotifications, isConnected]);

    // Handle visibility change events
    const handleVisibilityChange = useCallback(() => {
        if (user && !document.hidden) {
            // If WebSocket is connected, no need to fetch on visibility change
            if (isConnected) {
                console.log('🚫 Skipping visibility fetch - WebSocket is active');
                return;
            }

            // Only fetch if enough time has passed since last fetch
            const now = Date.now();
            const timeSinceLastFetch = now - lastFetchTime.current;
            if (timeSinceLastFetch < 5000) { // Minimum 5 seconds between visibility fetches
                console.log('🚫 Skipping visibility fetch - too soon since last fetch');
                return;
            }

            console.log('👁️ Page visible - refreshing notifications');
            lastFetchTime.current = now;
            fetchCounts();
            fetchNotifications();
        }
    }, [user, fetchCounts, fetchNotifications, isConnected]);

    // Subscribe to clan notification channels
    const subscribeToClanNotifications = useCallback(async (clanIds: string[]) => {
        if (!user?.id || clanIds.length === 0) return;

        try {
            console.log('🏰 Subscribing to clan notification channels:', clanIds);
            const result = await subscribeToClanChannels(user.id, clanIds);

            if (result.success) {
                // Update clan channels state
                const newChannels = clanIds.flatMap(clanId => [
                    `clan:${clanId}:gig_approved`,
                    `clan:${clanId}:milestone_created`,
                    `clan:${clanId}:milestone_approved`,
                    `clan:${clanId}:member:${user.id}:task_assigned`,
                    `clan:${clanId}:member:${user.id}:task_updated`
                ]);

                setClanChannels(prev => Array.from(new Set([...prev, ...newChannels])));
                console.log('✅ Successfully subscribed to clan channels');
            } else {
                console.error('❌ Failed to subscribe to clan channels:', result.message);
            }
        } catch (error) {
            console.error('❌ Error subscribing to clan channels:', error);
        }
    }, [user?.id]);

    // Unsubscribe from clan notification channels
    const unsubscribeFromClanNotifications = useCallback(async (clanIds: string[]) => {
        if (!user?.id || clanIds.length === 0) return;

        try {
            console.log('🏰 Unsubscribing from clan notification channels:', clanIds);
            const result = await unsubscribeFromClanChannels(user.id, clanIds);

            if (result.success) {
                // Remove channels from state
                const channelsToRemove = clanIds.flatMap(clanId => [
                    `clan:${clanId}:gig_approved`,
                    `clan:${clanId}:milestone_created`,
                    `clan:${clanId}:milestone_approved`,
                    `clan:${clanId}:member:${user.id}:task_assigned`,
                    `clan:${clanId}:member:${user.id}:task_updated`
                ]);

                setClanChannels(prev => prev.filter(channel => !channelsToRemove.includes(channel)));
                console.log('✅ Successfully unsubscribed from clan channels');
            } else {
                console.error('❌ Failed to unsubscribe from clan channels:', result.message);
            }
        } catch (error) {
            console.error('❌ Error unsubscribing from clan channels:', error);
        }
    }, [user?.id]);

    // Get current clan notification channels
    const fetchClanNotificationChannels = useCallback(async () => {
        if (!user?.id) return;

        try {
            const result = await getClanNotificationChannels(user.id);
            if (result.success) {
                setClanChannels(result.data.channels);
            }
        } catch (error) {
            console.error('❌ Error fetching clan notification channels:', error);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user?.id) {
            console.log('🚀 Initializing notifications for user:', user.id);

            // Connect to WebSocket first
            connect();

            // Start polling as fallback
            startPolling();

            // Add event listeners for focus and visibility
            window.addEventListener('focus', handleFocus);
            document.addEventListener('visibilitychange', handleVisibilityChange);
        } else {
            console.log('🛑 No user found, disconnecting notifications');
            disconnect();
            stopPolling();
        }

        return () => {
            console.log('🧹 Cleaning up notifications');
            disconnect();
            stopPolling();
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user?.id]); // Only depend on user.id to prevent unnecessary re-connections

    return {
        // State
        notifications,
        unreadCount,
        counts,
        loading,
        error,
        preferences,
        analytics,
        isConnected,
        connectionStatus,
        clanChannels,
        clanNotifications,

        // Actions
        fetchNotifications,
        fetchUnreadNotifications,
        fetchCounts,
        fetchPreferences,
        fetchAnalytics,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        debouncedMarkAllAsRead,
        deleteNotificationById,
        clearAllNotificationsForUser,
        updateUserNotificationPreferences,
        refresh,
        forceRefresh,
        startPolling,
        stopPolling,
        connect,
        disconnect,
        subscribeToClanNotifications,
        unsubscribeFromClanNotifications,
        fetchClanNotificationChannels,

        // Utilities
        playNotificationSound,
    };
} 