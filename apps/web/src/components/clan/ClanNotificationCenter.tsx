'use client';

import { useState } from 'react';
import { useClanNotifications } from '@/hooks/useClanNotifications';
import { BellIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { ClanWebSocketMessage } from '@/types/notification.types';

interface ClanNotificationCenterProps {
    className?: string;
    showBadge?: boolean;
}

export default function ClanNotificationCenter({ className = '', showBadge = true }: ClanNotificationCenterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const {
        clanNotifications,
        totalClanNotifications,
        hasClanNotifications,
        getClanNotificationsByType,
        markClanNotificationProcessed
    } = useClanNotifications();

    const handleNotificationClick = (notification: ClanWebSocketMessage) => {
        // Mark as processed
        markClanNotificationProcessed(notification.data.gigId);

        // Navigate based on notification type
        switch (notification.type) {
            case 'clan_gig_approved':
                // Navigate to clan workflow page
                window.location.href = `/clan/${notification.data.clanId}/gig-workflow?gigId=${notification.data.gigId}`;
                break;
            case 'clan_milestone_created':
            case 'clan_milestone_approved':
                // Navigate to clan workflow page with tasks tab
                window.location.href = `/clan/${notification.data.clanId}/gig-workflow?gigId=${notification.data.gigId}&tab=tasks`;
                break;
            case 'clan_task_assigned':
            case 'clan_task_status_updated':
                // Navigate to clan workflow page with dashboard tab
                window.location.href = `/clan/${notification.data.clanId}/gig-workflow?gigId=${notification.data.gigId}&tab=dashboard`;
                break;
            default:
                // Navigate to clan page
                window.location.href = `/clan/${notification.data.clanId}`;
        }

        setIsOpen(false);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'clan_gig_approved':
                return '🎉';
            case 'clan_milestone_created':
                return '📋';
            case 'clan_milestone_approved':
                return '✅';
            case 'clan_task_assigned':
                return '📝';
            case 'clan_task_status_updated':
                return '🔄';
            default:
                return '🏰';
        }
    };

    const getNotificationTitle = (notification: ClanWebSocketMessage) => {
        switch (notification.type) {
            case 'clan_gig_approved':
                return `Gig Approved: ${notification.data.gigTitle}`;
            case 'clan_milestone_created':
                return `New Milestone: ${notification.data.milestoneTitle}`;
            case 'clan_milestone_approved':
                return `Milestone Approved: ${notification.data.milestoneTitle}`;
            case 'clan_task_assigned':
                return `Task Assigned: ${notification.data.taskTitle}`;
            case 'clan_task_status_updated':
                return `Task Updated: ${notification.data.taskTitle}`;
            default:
                return 'Clan Notification';
        }
    };

    const getNotificationMessage = (notification: ClanWebSocketMessage) => {
        switch (notification.type) {
            case 'clan_gig_approved':
                return `Your clan's application for "${notification.data.gigTitle}" has been approved!`;
            case 'clan_milestone_created':
                return `New milestone "${notification.data.milestoneTitle}" created for gig "${notification.data.gigTitle}"`;
            case 'clan_milestone_approved':
                return `Milestone "${notification.data.milestoneTitle}" has been approved for gig "${notification.data.gigTitle}"`;
            case 'clan_task_assigned':
                return `You have been assigned task "${notification.data.taskTitle}" for gig "${notification.data.gigTitle}"`;
            case 'clan_task_status_updated':
                return `Task "${notification.data.taskTitle}" status updated to ${notification.data.newStatus}`;
            default:
                return 'You have a new clan notification';
        }
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now.getTime() - notificationTime.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    return (
        <div className={`relative ${className}`}>
            {/* Notification Bell */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Clan notifications"
            >
                <BellIcon className="h-6 w-6" />
                {showBadge && hasClanNotifications && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                        {totalClanNotifications > 9 ? '9+' : totalClanNotifications}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Clan Notifications</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto">
                        {clanNotifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                <div className="text-4xl mb-2">🏰</div>
                                <p>No clan notifications yet</p>
                                <p className="text-sm">You'll see real-time updates here</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {clanNotifications.map((notification, index) => (
                                    <div
                                        key={`${notification.type}-${notification.data.clanId}-${notification.data.gigId}-${index}`}
                                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 text-2xl">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {getNotificationTitle(notification)}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {getNotificationMessage(notification)}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-gray-400">
                                                        {formatTimeAgo(notification.data.createdAt || new Date().toISOString())}
                                                    </span>
                                                    <span className="text-xs text-blue-600 hover:text-blue-800">
                                                        View Details →
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {clanNotifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>{totalClanNotifications} notification{totalClanNotifications !== 1 ? 's' : ''}</span>
                                <button
                                    onClick={() => {
                                        // Clear all notifications
                                        setIsOpen(false);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Mark All Read
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
