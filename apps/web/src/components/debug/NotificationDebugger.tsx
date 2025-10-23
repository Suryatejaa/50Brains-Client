'use client';
import { useState } from 'react';
import { useNotificationBell } from '@/components/NotificationProvider';
import { testAPIGatewayConnection, testWebSocketConnection } from '@/lib/notification-api';
import { toast } from 'sonner';

export default function NotificationDebugger() {
    const [testResults, setTestResults] = useState<{
        apiGateway?: { success: boolean; message: string };
        websocket?: { success: boolean; message: string };
    }>({});

    const {
        isConnected,
        connectionStatus,
        notifications,
        unreadCount,
        fetchNotifications,
        refreshNotifications,
        handleMarkAsRead,
        handleMarkAllAsRead,
        debouncedMarkAllAsRead,
        forceRefresh,
    } = useNotificationBell();

    const testAPIGateway = async () => {
        try {
            const result = await testAPIGatewayConnection();
            setTestResults(prev => ({ ...prev, apiGateway: result }));
        } catch (error) {
            setTestResults(prev => ({
                ...prev, apiGateway: { success: false, message: `Error: ${error}` }
            }));
        }
    };

    const testWebSocket = async () => {
        try {
            const result = await testWebSocketConnection('test-user-123');
            setTestResults(prev => ({ ...prev, websocket: result }));
        } catch (error) {
            setTestResults(prev => ({
                ...prev, websocket: { success: false, message: `Error: ${error}` }
            }));
        }
    };

    const sendTestNotification = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: 'test-user-123',
                    type: 'SYSTEM',
                    category: 'TEST',
                    title: '🧪 Test Notification',
                    message: 'This is a test notification sent at ' + new Date().toLocaleTimeString(),
                    priority: 'MEDIUM'
                })
            });

            if (response.ok) {
                //console.log(('✅ Test notification sent successfully');
                alert('Test notification sent! Check if it appears in real-time.');
            } else {
                console.error('❌ Failed to send test notification');
                alert('Failed to send test notification');
            }
        } catch (error) {
            console.error('Error sending test notification:', error);
            alert('Error sending test notification');
        }
    };

    const testToastDirectly = () => {
        //console.log(('🧪 Testing toast directly...');
        toast(
            <div className="flex items-start space-x-3">
                <span className="text-lg">🧪</span>
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900">
                        Direct Toast Test
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                        This toast was triggered directly at {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </div>,
            // {
            //     duration: 5000,
            //     action: {
            //         label: 'OK',
            //         onClick: () => //console.log(('Toast action clicked'),
            //     },
            //     dismissible: true,
            // }
        );
        //console.log(('✅ Direct toast test completed');
    };

    const testNotificationCounts = () => {
        //console.log(('🧪 Testing notification count display...');

        // Simulate different notification counts to test the "9+" to dot transition
        const testCounts = [5, 12, 25, 3, 15];
        let currentIndex = 0;

        const simulateCount = () => {
            if (currentIndex < testCounts.length) {
                const count = testCounts[currentIndex];
                //console.log((`🧪 Simulating notification count: ${count}`);

                // This would need to be integrated with the actual notification state
                // For now, just log the expected behavior
                if (count > 9) {
                    //console.log((`🧪 Should show "9+" for ${count} notifications, then change to dot after 1 second`);
                } else {
                    //console.log((`🧪 Should show "${count}" for ${count} notifications`);
                }

                currentIndex++;
                setTimeout(simulateCount, 2000); // Test next count after 2 seconds
            }
        };

        simulateCount();
    };

    return (
        <div className="p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">🔧 Notification System Debugger</h3>

            {/* Connection Status */}
            <div className="mb-4">
                <h4 className="font-medium mb-2">Connection Status</h4>
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm">WebSocket:</span>
                        <span className={`px-2 py-1 rounded text-xs ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm">Status:</span>
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                            {connectionStatus}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm">Notifications:</span>
                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                            {notifications.length} total, {unreadCount} unread
                        </span>
                    </div>
                </div>
            </div>

            {/* Test Buttons */}
            <div className="mb-4">
                <h4 className="font-medium mb-2">Connection Tests</h4>
                <div className="space-y-2">
                    <button
                        onClick={testAPIGateway}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                        Test API Gateway
                    </button>
                    <button
                        onClick={testWebSocket}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 ml-2"
                    >
                        Test WebSocket
                    </button>
                    <button
                        onClick={sendTestNotification}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 ml-2"
                    >
                        Send Test Notification
                    </button>
                    <button
                        onClick={testToastDirectly}
                        className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 ml-2"
                    >
                        Test Toast Directly
                    </button>
                    <button
                        onClick={testNotificationCounts}
                        className="px-3 py-1 bg-pink-500 text-white rounded text-sm hover:bg-pink-600 ml-2"
                    >
                        Test Count Display
                    </button>
                </div>
            </div>

            {/* Manual Controls */}
            <div className="mb-4">
                <h4 className="font-medium mb-2">Manual Controls</h4>
                <div className="space-y-2">
                    <button
                        onClick={() => fetchNotifications(1, 20)}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                        Fetch Notifications
                    </button>
                    <button
                        onClick={refreshNotifications}
                        className="px-3 py-1 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600 ml-2"
                    >
                        Refresh Counts
                    </button>
                    <button
                        onClick={debouncedMarkAllAsRead}
                        className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 ml-2"
                    >
                        Mark All As Read (debounced)
                    </button>
                    <button
                        onClick={forceRefresh}
                        className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-800 ml-2"
                    >
                        Force Refresh
                    </button>
                </div>
            </div>

            {/* Current Configuration */}
            <div>
                <h4 className="font-medium mb-2">Current Configuration</h4>
                <div className="text-xs space-y-1">
                    <div>API Base URL: {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}</div>
                    <div>WebSocket URL: ws://localhost:3000/api/notifications/ws</div>
                    <div>Environment: {process.env.NODE_ENV}</div>
                </div>
            </div>
        </div>
    );
} 