'use client';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { useNotificationContext } from './NotificationProvider';
import { Notification } from '@/types/notification.types';

interface NotificationToastProps {
  enabled?: boolean;
}

export function NotificationToast({ enabled = true }: NotificationToastProps) {
  const { notifications, unreadCount, playNotificationSound } =
    useNotificationContext();
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  const lastProcessedId = useRef<string | null>(null);
  const [shownNotifications, setShownNotifications] = useState<Set<string>>(
    new Set()
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load shown notifications from sessionStorage on mount
  useEffect(() => {
    const storedShownNotifications =
      sessionStorage.getItem('shownNotifications');
    if (storedShownNotifications) {
      setShownNotifications(new Set(JSON.parse(storedShownNotifications)));
    }

    // Mark initial load as complete after a brief delay
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Save shown notifications to sessionStorage
  useEffect(() => {
    if (shownNotifications.size > 0) {
      sessionStorage.setItem(
        'shownNotifications',
        JSON.stringify(Array.from(shownNotifications))
      );
    }
  }, [shownNotifications]);

  useEffect(() => {
    if (!enabled || notifications.length === 0) {
      console.log('🔔 NotificationToast: Disabled or no notifications');
      return;
    }

    // Skip showing toasts during initial load to prevent spam on refresh
    if (isInitialLoad) {
      // console.log('🔔 NotificationToast: Skipping toasts during initial load');
      return;
    }

    // console.log('🔔 NotificationToast: Checking for new notifications...');
    // console.log('🔔 Current notifications count:', notifications.length);
    // console.log('🔔 Last processed ID:', lastProcessedId.current);

    // Get the most recent notification (first in the array)
    const mostRecentNotification = notifications[0];

    // console.log('🔔 Most recent notification:', mostRecentNotification?.title);
    // console.log('🔔 Most recent notification ID:', mostRecentNotification?.id);
    // console.log(
    //   '🔔 Most recent notification read status:',
    //   mostRecentNotification?.read
    // );

    // Check if this is a new notification we haven't processed yet
    if (
      mostRecentNotification &&
      mostRecentNotification.id !== lastProcessedId.current &&
      !mostRecentNotification.read &&
      !shownNotifications.has(mostRecentNotification.id)
    ) {
      console.log(
        '🔔 Showing toast for new notification:',
        mostRecentNotification.title
      );

      // Play sound for new notifications
      playNotificationSound();

      // Show toast
      toast(
        <div className="flex items-start space-x-3">
          <span className="text-lg">{mostRecentNotification.icon || '🔔'}</span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900">
              {mostRecentNotification.title}
            </div>
            <div className="mt-1 line-clamp-2 text-xs text-gray-600">
              {mostRecentNotification.message}
            </div>
          </div>
        </div>,
        {
          duration: 2500, // Increased duration for better visibility
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

      // Mark this notification as processed and shown
      lastProcessedId.current = mostRecentNotification.id;
      setShownNotifications(
        (prev) => new Set(Array.from(prev).concat(mostRecentNotification.id))
      );
      console.log('🔔 Updated lastProcessedId to:', lastProcessedId.current);
    } else {
      console.log('🔔 Skipping toast - notification already processed or read');
    }
  }, [
    notifications,
    enabled,
    playNotificationSound,
    isInitialLoad,
    shownNotifications,
  ]);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read and navigate if needed
    if (!notification.read) {
      // You can implement navigation logic here
      //console.log(('Notification clicked:', notification);
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
        <span className="text-lg">{notification.icon || '🔔'}</span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-gray-900">
            {notification.title}
          </div>
          <div className="mt-1 line-clamp-2 text-xs text-gray-600">
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
