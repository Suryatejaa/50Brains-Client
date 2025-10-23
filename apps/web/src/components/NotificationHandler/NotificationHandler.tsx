import React, { useEffect } from 'react';
import { WebSocketManager } from '../../services/websocket/WebSocketManager';

interface NotificationHandlerProps {
    userId: string;
    onNotification?: (notification: any) => void;
}

export function NotificationHandler({ userId, onNotification }: NotificationHandlerProps) {
    // Get WebSocketManager instance
    const wsManager = WebSocketManager.getInstance();

    // Subscribe to notifications when component mounts
    useEffect(() => {
        const connectToNotifications = async () => {
            try {
                await wsManager.connect('notifications', { userId });
                //console.log(('🔔 NotificationHandler: Connected to notifications service');
            } catch (error) {
                console.error('❌ NotificationHandler: Failed to connect:', error);
            }
        };

        if (userId) {
            connectToNotifications();
        }

        // Cleanup on unmount
        return () => {
            wsManager.disconnect('notifications', { userId });
        };
    }, [userId, wsManager]);

    // Handle notification messages
    useEffect(() => {
        if (!userId) return;

        // Listen to notification events
        const unsubscribe = wsManager.on('notifications.notification', (message: any) => {
            //console.log(('🔔 Received notification:', message);
            onNotification?.(message);

            // You can show toast notifications here
            // toast.success(message.content);
        });

        return unsubscribe;
    }, [userId, wsManager, onNotification]);

    return null; // This component doesn't render anything
}
