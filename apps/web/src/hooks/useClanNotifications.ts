import { useEffect, useCallback } from 'react';
import { useNotifications } from './useNotifications';
import { useClans } from './useClans';
import { useMyClans } from './useClans';

/**
 * Hook for managing clan-specific notifications
 * Automatically subscribes to clan notification channels based on user's clan memberships
 */
export function useClanNotifications() {
    const {
        clanChannels,
        clanNotifications,
        subscribeToClanNotifications,
        unsubscribeFromClanNotifications,
        fetchClanNotificationChannels
    } = useNotifications();

    const { clans: publicClans } = useClans();
    const { clans: myClans } = useMyClans();

    // Get all clan IDs the user is associated with
    const getUserClanIds = useCallback(() => {
        const allClans = [...(myClans || []), ...(publicClans || [])];
        return allClans.map(clan => clan.id);
    }, [myClans, publicClans]);

    // Subscribe to notifications for all user's clans
    const subscribeToUserClans = useCallback(async () => {
        const clanIds = getUserClanIds();
        if (clanIds.length > 0) {
            console.log('🏰 Subscribing to notifications for clans:', clanIds);
            await subscribeToClanNotifications(clanIds);
        }
    }, [getUserClanIds, subscribeToClanNotifications]);

    // Unsubscribe from notifications for specific clans
    const unsubscribeFromClans = useCallback(async (clanIds: string[]) => {
        if (clanIds.length > 0) {
            console.log('🏰 Unsubscribing from notifications for clans:', clanIds);
            await unsubscribeFromClanNotifications(clanIds);
        }
    }, [unsubscribeFromClanNotifications]);

    // Get clan notifications filtered by clan ID
    const getClanNotificationsByClan = useCallback((clanId: string) => {
        return clanNotifications.filter(notification => notification.data.clanId === clanId);
    }, [clanNotifications]);

    // Get clan notifications filtered by gig ID
    const getClanNotificationsByGig = useCallback((gigId: string) => {
        return clanNotifications.filter(notification => notification.data.gigId === gigId);
    }, [clanNotifications]);

    // Get clan notifications filtered by type
    const getClanNotificationsByType = useCallback((type: string) => {
        return clanNotifications.filter(notification => notification.type === type);
    }, [clanNotifications]);

    // Get unread clan notification count
    const getUnreadClanNotificationCount = useCallback(() => {
        return clanNotifications.length; // All clan notifications are considered unread until processed
    }, [clanNotifications]);

    // Mark clan notification as processed (remove from list)
    const markClanNotificationProcessed = useCallback((notificationId: string) => {
        // This would typically update the backend, but for now we'll just remove from local state
        // In a real implementation, you'd call an API to mark it as read/processed
        console.log('🏰 Marking clan notification as processed:', notificationId);
    }, []);

    // Auto-subscribe to clan notifications when clans change
    useEffect(() => {
        const clanIds = getUserClanIds();
        if (clanIds.length > 0) {
            subscribeToUserClans();
        }

        return () => {
            // Cleanup: unsubscribe from all clan channels
            if (clanIds.length > 0) {
                unsubscribeFromClans(clanIds);
            }
        };
    }, [getUserClanIds, subscribeToUserClans, unsubscribeFromClans]);

    return {
        // State
        clanChannels,
        clanNotifications,

        // Actions
        subscribeToUserClans,
        unsubscribeFromClans,
        fetchClanNotificationChannels,

        // Filtering
        getClanNotificationsByClan,
        getClanNotificationsByGig,
        getClanNotificationsByType,

        // Utilities
        getUserClanIds,
        getUnreadClanNotificationCount,
        markClanNotificationProcessed,

        // Computed values
        totalClanNotifications: clanNotifications.length,
        hasClanNotifications: clanNotifications.length > 0,
    };
}
