'use client';
import { useState, useEffect } from 'react';
import { useNotificationPreferences } from '@/components/NotificationProvider';
import { toast } from 'sonner';

export default function NotificationSettingsPage() {
    const { preferences, updatePreferences, fetchPreferences } = useNotificationPreferences();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPreferences();
    }, [fetchPreferences]);

    const handlePreferenceChange = async (key: string, value: boolean) => {
        if (!preferences) return;

        setSaving(true);
        try {
            const result = await updatePreferences({ [key]: value });
            if (result.success) {
                toast.success('Preferences updated successfully');
            } else {
                toast.error('Failed to update preferences');
            }
        } catch (error) {
            toast.error('Failed to update preferences');
        } finally {
            setSaving(false);
        }
    };

    const handleCategoryChange = async (category: string, value: boolean) => {
        if (!preferences) return;

        setSaving(true);
        try {
            const result = await updatePreferences({
                categories: {
                    ...preferences.categories,
                    [category]: value
                }
            });
            if (result.success) {
                toast.success('Category preferences updated');
            } else {
                toast.error('Failed to update category preferences');
            }
        } catch (error) {
            toast.error('Failed to update category preferences');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAll = async () => {
        if (!preferences) return;

        setSaving(true);
        try {
            const result = await updatePreferences(preferences);
            if (result.success) {
                toast.success('All preferences saved successfully');
            } else {
                toast.error('Failed to save preferences');
            }
        } catch (error) {
            toast.error('Failed to save preferences');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <div className="text-gray-500">Loading preferences...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-sm">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
                        <p className="text-gray-600 mt-1">Manage how you receive notifications</p>
                    </div>

                    {preferences ? (
                        <div className="p-6">
                            {/* Notification Channels */}
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Channels</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries({
                                        email: 'Email Notifications',
                                        push: 'Push Notifications',
                                        sms: 'SMS Notifications',
                                        inApp: 'In-App Notifications'
                                    }).map(([key, label]) => (
                                        <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{label}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {key === 'email' && 'Receive notifications via email'}
                                                    {key === 'push' && 'Receive push notifications on your device'}
                                                    {key === 'sms' && 'Receive notifications via SMS'}
                                                    {key === 'inApp' && 'Show notifications within the app'}
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={preferences[key as keyof typeof preferences] as boolean}
                                                    onChange={(e) => handlePreferenceChange(key, e.target.checked)}
                                                    className="sr-only peer"
                                                    disabled={saving}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notification Categories */}
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Categories</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries({
                                        system: 'System Notifications',
                                        engagement: 'Engagement Notifications',
                                        gig: 'Gig Notifications',
                                        payment: 'Payment Notifications',
                                        clan: 'Clan Notifications',
                                        message: 'Message Notifications',
                                        review: 'Review Notifications',
                                        promotion: 'Promotion Notifications'
                                    }).map(([key, label]) => (
                                        <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div>
                                                <h3 className="font-medium text-gray-900">{label}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {key === 'system' && 'Important system updates and alerts'}
                                                    {key === 'engagement' && 'Activity and engagement notifications'}
                                                    {key === 'gig' && 'Gig-related notifications and updates'}
                                                    {key === 'payment' && 'Payment and financial notifications'}
                                                    {key === 'clan' && 'Clan activity and membership updates'}
                                                    {key === 'message' && 'New messages and communication'}
                                                    {key === 'review' && 'Review and rating notifications'}
                                                    {key === 'promotion' && 'Promotional offers and updates'}
                                                </p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={preferences.categories[key as keyof typeof preferences.categories]}
                                                    onChange={(e) => handleCategoryChange(key, e.target.checked)}
                                                    className="sr-only peer"
                                                    disabled={saving}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => {
                                            const allEnabled = {
                                                email: true,
                                                push: true,
                                                sms: true,
                                                inApp: true,
                                                categories: {
                                                    system: true,
                                                    engagement: true,
                                                    gig: true,
                                                    payment: true,
                                                    clan: true,
                                                    message: true,
                                                    review: true,
                                                    promotion: true
                                                }
                                            };
                                            updatePreferences(allEnabled);
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                        disabled={saving}
                                    >
                                        Enable All
                                    </button>
                                    <button
                                        onClick={() => {
                                            const allDisabled = {
                                                email: false,
                                                push: false,
                                                sms: false,
                                                inApp: false,
                                                categories: {
                                                    system: false,
                                                    engagement: false,
                                                    gig: false,
                                                    payment: false,
                                                    clan: false,
                                                    message: false,
                                                    review: false,
                                                    promotion: false
                                                }
                                            };
                                            updatePreferences(allDisabled);
                                        }}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                        disabled={saving}
                                    >
                                        Disable All
                                    </button>
                                    <button
                                        onClick={handleSaveAll}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save All'}
                                    </button>
                                </div>
                            </div>

                            {/* Information */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-medium text-blue-900 mb-2">About Notification Settings</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Email notifications will be sent to your registered email address</li>
                                    <li>• Push notifications require browser permission</li>
                                    <li>• SMS notifications may incur charges from your carrier</li>
                                    <li>• In-app notifications appear within the application</li>
                                    <li>• You can change these settings at any time</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 text-center">
                            <div className="text-gray-500">Failed to load notification preferences</div>
                            <button
                                onClick={fetchPreferences}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 