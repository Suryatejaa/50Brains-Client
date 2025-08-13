'use client';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { useNotificationContext } from './NotificationProvider';
import { Notification } from '@/types/notification.types';

interface NotificationToastProps {
    enabled?: boolean;
}

export function NotificationToast({ enabled = true }: NotificationToastProps) {
    const { notifications, unreadCount, playNotificationSound } = useNotificationContext();
    const [lastNotificationCount, setLastNotificationCount] = useState(0);
    const lastProcessedId = useRef<string | null>(null);

    useEffect(() => {
        if (!enabled || notifications.length === 0) {
            console.log('🔔 NotificationToast: Disabled or no notifications');
            return;
        }

        // console.log('🔔 NotificationToast: Checking for new notifications...');
        // console.log('🔔 Current notifications count:', notifications.length);
        // console.log('🔔 Last processed ID:', lastProcessedId.current);

        // Get the most recent notification (first in the array)
        const mostRecentNotification = notifications[0];

        // console.log('🔔 Most recent notification:', mostRecentNotification?.title);
        // console.log('🔔 Most recent notification ID:', mostRecentNotification?.id);
        // console.log('🔔 Most recent notification read status:', mostRecentNotification?.read);

        // Check if this is a new notification we haven't processed yet
        if (mostRecentNotification &&
            mostRecentNotification.id !== lastProcessedId.current &&
            !mostRecentNotification.read) {

            // console.log('🔔 Showing toast for new notification:', mostRecentNotification.title);

            // Play sound for new notifications
            playNotificationSound();

            // Show toast
            toast(
                <div className="flex items-start space-x-3">
                    <span className="text-lg">
                        {mostRecentNotification.icon || '🔔'}
                    </span>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900">
                            {mostRecentNotification.title}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {mostRecentNotification.message}
                        </div>
                    </div>
                </div>,
                {
                    duration: 1500,
                    action: {
                        label: 'View',
                        onClick: () => {
                            // Navigate to notification or mark as read
                            handleNotificationClick(mostRecentNotification);
                        },
                    },
                    dismissible: true,
                    className: 'mt-10',
                }
            );

            // Mark this notification as processed
            lastProcessedId.current = mostRecentNotification.id;
            console.log('🔔 Updated lastProcessedId to:', lastProcessedId.current);
        } else {
            console.log('🔔 Skipping toast - notification already processed or read');
        }

        // Also handle the case where notifications are loaded initially
        if (notifications.length > lastNotificationCount) {
            console.log('🔔 Handling initial notification load...');
            const newNotifications = notifications.slice(0, notifications.length - lastNotificationCount);

            newNotifications.forEach((notification) => {
                if (!notification.read && notification.id !== lastProcessedId.current) {
                    console.log('🔔 Showing toast for loaded notification:', notification.title);

                    // Play sound for new notifications
                    playNotificationSound();

                    // Show toast
                    toast(
                        <div className="flex items-start space-x-3">
                            <span className="text-lg">
                                {notification.icon || '🔔'}
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900">
                                    {notification.title}
                                </div>
                                <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {notification.message}
                                </div>
                            </div>
                        </div>,
                        {
                            duration: 1500,
                            action: {
                                label: 'View',
                                onClick: () => {
                                    // Navigate to notification or mark as read
                                    handleNotificationClick(notification);
                                },
                            },
                            dismissible: true,
                            className: 'mt-10',
                        }
                    );

                    // Mark this notification as processed
                    lastProcessedId.current = notification.id;
                }
            });

            setLastNotificationCount(notifications.length);
        }
    }, [notifications, lastNotificationCount, enabled, playNotificationSound]);

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read and navigate if needed
        if (!notification.read) {
            // You can implement navigation logic here
            console.log('Notification clicked:', notification);
        }
    };

    return null; // This component doesn't render anything
}

// Hook for manual notification toasts
export function useNotificationToast() {
    const { markNotificationAsRead } = useNotificationContext();

    const showNotificationToast = (notification: Notification) => {
        toast(
            <div className="flex items-start space-x-3">
                <span className="text-lg">
                    {notification.icon || '🔔'}
                </span>
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900">
                        {notification.title}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                    </div>
                </div>
            </div>,
            {
                duration: 1500,
                action: {
                    label: 'Mark as read',
                    onClick: () => markNotificationAsRead(notification.id),
                },
                dismissible: true,
                className: 'mt-10',
            }
        );
    };

    return { showNotificationToast };
} 