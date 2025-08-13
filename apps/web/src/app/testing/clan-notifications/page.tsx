'use client';

import ClanNotificationDebugger from '@/components/debug/ClanNotificationDebugger';
import ClanNotificationCenter from '@/components/clan/ClanNotificationCenter';

export default function ClanNotificationsTestPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Clan Notifications Test Page
                    </h1>
                    <p className="text-gray-600">
                        Test and debug the real-time clan notification system
                    </p>
                </div>

                {/* Notification Center Demo */}
                <div className="mb-8 text-center">
                    <h2 className="text-xl font-semibold mb-4">Live Notification Center</h2>
                    <div className="inline-block">
                        <ClanNotificationCenter />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Click the bell to see clan notifications
                    </p>
                </div>

                {/* Debugger */}
                <ClanNotificationDebugger />
            </div>
        </div>
    );
}
