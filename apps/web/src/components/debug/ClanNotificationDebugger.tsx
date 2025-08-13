'use client';

import { useState } from 'react';
import { useClanNotifications } from '@/hooks/useClanNotifications';
import { useNotifications } from '@/hooks/useNotifications';
import { testClanWebSocketConnection } from '@/lib/notification-api';

export default function ClanNotificationDebugger() {
    const [testClanId, setTestClanId] = useState('test-clan-123');
    const [testUserId, setTestUserId] = useState('test-user-456');
    const [testResult, setTestResult] = useState<string>('');

    const {
        clanChannels,
        clanNotifications,
        totalClanNotifications,
        hasClanNotifications,
        getUserClanIds,
        subscribeToUserClans,
        unsubscribeFromClans
    } = useClanNotifications();

    const {
        isConnected,
        connectionStatus,
        clanChannels: mainClanChannels,
        clanNotifications: mainClanNotifications
    } = useNotifications();

    const testWebSocketConnection = async () => {
        try {
            setTestResult('Testing WebSocket connection...');
            const result = await testClanWebSocketConnection(testUserId, testClanId);
            setTestResult(`${result.success ? '✅' : '❌'} ${result.message}`);
        } catch (error) {
            setTestResult(`❌ Error: ${error}`);
        }
    };

    const simulateClanNotification = () => {
        // This would typically come from the WebSocket
        const mockNotification = {
            type: 'clan_gig_approved',
            data: {
                gigId: 'test-gig-123',
                gigTitle: 'Test Gig Title',
                clanId: testClanId,
                gigOwnerId: 'test-owner-789',
                applicationId: 'test-app-456',
                memberCount: 3,
                milestoneCount: 2,
                totalAmount: 5000,
                assignedAt: new Date().toISOString(),
                createdAt: new Date().toISOString()
            }
        };

        // Simulate receiving a WebSocket message
        console.log('🏰 Simulating clan notification:', mockNotification);
        setTestResult('✅ Simulated clan notification sent to console');
    };

    const clearTestResult = () => {
        setTestResult('');
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Clan Notification Debugger</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Connection Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Connection Status</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>WebSocket Connected:</span>
                            <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                                {isConnected ? '✅ Yes' : '❌ No'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Connection Status:</span>
                            <span className="font-medium">{connectionStatus}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Clan Channels:</span>
                            <span className="font-medium">{clanChannels.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Clan Notifications:</span>
                            <span className="font-medium">{totalClanNotifications}</span>
                        </div>
                    </div>
                </div>

                {/* Test Controls */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Test Controls</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Test Clan ID:
                            </label>
                            <input
                                type="text"
                                value={testClanId}
                                onChange={(e) => setTestClanId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="Enter clan ID to test"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Test User ID:
                            </label>
                            <input
                                type="text"
                                value={testUserId}
                                onChange={(e) => setTestUserId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="Enter user ID to test"
                            />
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={testWebSocketConnection}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                            >
                                Test WebSocket
                            </button>
                            <button
                                onClick={simulateClanNotification}
                                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                            >
                                Simulate Notification
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Test Results */}
            {testResult && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Test Result:</span>
                        <button
                            onClick={clearTestResult}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                    <p className="text-sm mt-1">{testResult}</p>
                </div>
            )}

            {/* Clan Channels */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Active Clan Channels</h3>
                {clanChannels.length === 0 ? (
                    <p className="text-gray-500 text-sm">No clan channels subscribed</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {clanChannels.map((channel, index) => (
                            <div
                                key={index}
                                className="p-2 bg-white rounded border text-xs font-mono"
                            >
                                {channel}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Clan Notifications */}
            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Recent Clan Notifications</h3>
                {clanNotifications.length === 0 ? (
                    <p className="text-gray-500 text-sm">No clan notifications received</p>
                ) : (
                    <div className="space-y-2">
                        {clanNotifications.slice(0, 5).map((notification, index) => (
                            <div
                                key={index}
                                className="p-3 bg-white rounded border text-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">{notification.type}</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(notification.data.createdAt || Date.now()).toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                    Clan: {notification.data.clanId} | Gig: {notification.data.gigTitle}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex space-x-3">
                <button
                    onClick={subscribeToUserClans}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Subscribe to User Clans
                </button>
                <button
                    onClick={() => {
                        const clanIds = getUserClanIds();
                        if (clanIds.length > 0) {
                            unsubscribeFromClans(clanIds);
                        }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                    Unsubscribe from All Clans
                </button>
            </div>

            {/* Debug Info */}
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Debug Information</h3>
                <div className="text-xs space-y-1">
                    <div>User Clan IDs: {JSON.stringify(getUserClanIds())}</div>
                    <div>Main Hook Clan Channels: {mainClanChannels.length}</div>
                    <div>Main Hook Clan Notifications: {mainClanNotifications.length}</div>
                    <div>Hook Clan Channels: {clanChannels.length}</div>
                    <div>Hook Clan Notifications: {clanNotifications.length}</div>
                </div>
            </div>
        </div>
    );
}
