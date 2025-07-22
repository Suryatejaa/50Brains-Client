'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
    gigAlerts: boolean;
    applicationUpdates: boolean;
  };
  privacy: {
    profileVisibility: 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY';
    showEmail: boolean;
    showPhone: boolean;
    showLocation: boolean;
    allowDirectMessages: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    currency: string;
    autoAcceptConnections: boolean;
  };
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  activeSessions: number;
}

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
      gigAlerts: true,
      applicationUpdates: true,
    },
    privacy: {
      profileVisibility: 'PUBLIC',
      showEmail: false,
      showPhone: false,
      showLocation: true,
      allowDirectMessages: true,
    },
    preferences: {
      language: 'en',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      autoAcceptConnections: false,
    },
  });
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    lastPasswordChange: '',
    activeSessions: 1,
  });
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'privacy' | 'security' | 'account'>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load settings
  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
    }
  }, [isAuthenticated]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const [settingsResponse, securityResponse] = await Promise.all([
        apiClient.get('/api/user/settings'),
        apiClient.get('/api/user/security'),
      ]);
      
      if (settingsResponse.success && settingsResponse.data) {
        setSettings({ ...settings, ...settingsResponse.data });
      }
      
      if (securityResponse.success && securityResponse.data) {
        setSecurity({ ...security, ...securityResponse.data });
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await apiClient.put('/api/user/settings', settings);
      
      if (response.success) {
        setSuccess('Settings saved successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to save settings');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const enableTwoFactor = async () => {
    try {
      const response = await apiClient.post('/api/user/security/2fa/enable');
      if (response.success) {
        setSecurity(prev => ({ ...prev, twoFactorEnabled: true }));
        setSuccess('Two-factor authentication enabled');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to enable 2FA');
    }
  };

  const changePassword = () => {
    router.push('/settings/change-password' as any);
  };

  const deactivateAccount = async () => {
    if (!confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await apiClient.post('/api/user/deactivate');
      if (response.success) {
        await logout();
        router.push('/');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to deactivate account');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <div className="border-brand-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'security', label: 'Security', icon: '🛡️' },
    { id: 'account', label: 'Account', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container min-h-screen pt-16">
        <div className="content-container py-8">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-heading mb-2 text-3xl font-bold">
                Settings
              </h1>
              <p className="text-muted">
                Manage your account preferences and security settings
              </p>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="mb-6 rounded-none border border-green-200 bg-green-50 p-4">
                <p className="text-green-600">✅ {success}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-none border border-red-200 bg-red-50 p-4">
                <p className="text-red-600">❌ {error}</p>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar */}
              <div className="lg:w-1/4">
                <div className="card-glass p-4">
                  <nav className="space-y-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-none text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-brand-primary text-white'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Content */}
              <div className="lg:w-3/4">
                <div className="card-glass p-3">
                  {/* General Settings */}
                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">General Preferences</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Language
                          </label>
                          <select
                            value={settings.preferences.language}
                            onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                            className="input w-full"
                          >
                            <option value="en">English</option>
                            <option value="hi">हिंदी</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Timezone
                          </label>
                          <select
                            value={settings.preferences.timezone}
                            onChange={(e) => handleSettingChange('preferences', 'timezone', e.target.value)}
                            className="input w-full"
                          >
                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                            <option value="America/New_York">America/New_York (EST)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                            <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Currency
                          </label>
                          <select
                            value={settings.preferences.currency}
                            onChange={(e) => handleSettingChange('preferences', 'currency', e.target.value)}
                            className="input w-full"
                          >
                            <option value="INR">INR (₹)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={settings.preferences.autoAcceptConnections}
                            onChange={(e) => handleSettingChange('preferences', 'autoAcceptConnections', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">Auto-accept connection requests</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Notification Settings */}
                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
                      
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-3">Delivery Methods</h3>
                          <div className="space-y-3">
                            {Object.entries({
                              email: 'Email notifications',
                              push: 'Push notifications',
                              sms: 'SMS notifications',
                            }).map(([key, label]) => (
                              <label key={key} className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={settings.notifications[key as keyof typeof settings.notifications] as boolean}
                                  onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                                  className="rounded"
                                />
                                <span className="text-sm text-gray-700">{label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-3">Content Types</h3>
                          <div className="space-y-3">
                            {Object.entries({
                              gigAlerts: 'New gig opportunities',
                              applicationUpdates: 'Application status updates',
                              marketing: 'Marketing and promotional emails',
                            }).map(([key, label]) => (
                              <label key={key} className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={settings.notifications[key as keyof typeof settings.notifications] as boolean}
                                  onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                                  className="rounded"
                                />
                                <span className="text-sm text-gray-700">{label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Privacy Settings */}
                  {activeTab === 'privacy' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">Privacy Settings</h2>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Profile Visibility
                        </label>
                        <select
                          value={settings.privacy.profileVisibility}
                          onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                          className="input w-full max-w-md"
                        >
                          <option value="PUBLIC">Public - Anyone can view</option>
                          <option value="CONNECTIONS_ONLY">Connections only</option>
                          <option value="PRIVATE">Private - Only me</option>
                        </select>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Show on Profile</h3>
                        <div className="space-y-3">
                          {Object.entries({
                            showEmail: 'Email address',
                            showPhone: 'Phone number',
                            showLocation: 'Location',
                          }).map(([key, label]) => (
                            <label key={key} className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={settings.privacy[key as keyof typeof settings.privacy] as boolean}
                                onChange={(e) => handleSettingChange('privacy', key, e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm text-gray-700">{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={settings.privacy.allowDirectMessages}
                            onChange={(e) => handleSettingChange('privacy', 'allowDirectMessages', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">Allow direct messages from anyone</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Security Settings */}
                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                      
                      <div className="bg-gray-50 p-4 rounded-none">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-600">
                              {security.twoFactorEnabled ? 'Enabled' : 'Add an extra layer of security to your account'}
                            </p>
                          </div>
                          <button
                            onClick={enableTwoFactor}
                            disabled={security.twoFactorEnabled}
                            className={`px-4 py-2 rounded-none text-sm font-medium ${
                              security.twoFactorEnabled
                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {security.twoFactorEnabled ? 'Enabled' : 'Enable 2FA'}
                          </button>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-none">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">Password</h3>
                            <p className="text-sm text-gray-600">
                              Last changed: {security.lastPasswordChange || 'Never'}
                            </p>
                          </div>
                          <button
                            onClick={changePassword}
                            className="btn-ghost-sm"
                          >
                            Change Password
                          </button>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-none">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">Active Sessions</h3>
                            <p className="text-sm text-gray-600">
                              You have {security.activeSessions} active session(s)
                            </p>
                          </div>
                          <button className="btn-ghost-sm">
                            Manage Sessions
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Account Settings */}
                  {activeTab === 'account' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">Account Management</h2>
                      
                      <div className="bg-gray-50 p-4 rounded-none">
                        <h3 className="font-medium text-gray-900 mb-2">Account Information</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p><strong>Email:</strong> {user?.email}</p>
                          <p><strong>Roles:</strong> {user?.roles?.join(', ')}</p>
                          <p><strong>Member since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-none">
                        <h3 className="font-medium text-yellow-900 mb-2">Danger Zone</h3>
                        <p className="text-sm text-yellow-700 mb-4">
                          These actions cannot be undone. Please proceed with caution.
                        </p>
                        
                        <div className="space-y-3">
                          <button
                            onClick={deactivateAccount}
                            className="btn-ghost text-red-600 hover:bg-red-50"
                          >
                            Deactivate Account
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  {activeTab !== 'security' && activeTab !== 'account' && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="btn-primary"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
