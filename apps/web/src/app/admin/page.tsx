'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';

export default function AdminSystemPage() {
  const [health, setHealth] = useState<any>(null);
  const [cronStatus, setCronStatus] = useState<any>(null);
  const [dbStats, setDbStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      const [healthRes, cronRes, dbRes, logsRes] = await Promise.all([
        apiClient.get<any>('/api/gig-admin/system/health'),
        apiClient.get<any>('/api/gig-admin/cron/status'),
        apiClient.get<any>('/api/gig-admin/system/database/stats'),
        apiClient.get<any>('/api/gig-admin/system/logs?limit=50'),
      ]);

      if (healthRes.success) setHealth(healthRes.data);
      if (cronRes.success) setCronStatus(cronRes.data);
      if (dbRes.success) setDbStats(dbRes.data);
      if (logsRes.success) setLogs((logsRes.data as any)?.logs || []);
    } catch (error) {
      console.error('Failed to load system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async (cacheType: string) => {
    if (!confirm(`Clear ${cacheType} cache?`)) return;

    try {
      await apiClient.post('/api/gig-admin/system/cache/clear', {
        cacheType,
      });
      alert('Cache cleared successfully');
      loadSystemData();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('Failed to clear cache');
    }
  };

  const handleTriggerCron = async (jobType: string) => {
    if (!confirm(`Trigger ${jobType} job manually?`)) return;

    try {
      let endpoint = '';
      switch (jobType) {
        case 'payouts':
          endpoint = '/api/gig-admin/cron/trigger-payouts';
          break;
        case 'reminders':
          endpoint = '/api/gig-admin/cron/trigger-submission-reminders';
          break;
        case 'auto-approvals':
          endpoint = '/api/gig-admin/cron/trigger-auto-approvals';
          break;
      }

      await apiClient.post(endpoint);
      alert('Cron job triggered successfully');
      loadSystemData();
    } catch (error) {
      console.error('Failed to trigger cron job:', error);
      alert('Failed to trigger cron job');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'healthy':
      case 'connected':
        return 'text-green-600';
      case 'degraded':
      case 'warning':
        return 'text-yellow-600';
      case 'offline':
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-heading mb-6 text-2xl font-bold">
          System Management
        </h1>

        {/* System Health */}
        <div className="card-glass mb-6 p-4">
          <h2 className="text-heading mb-4 text-xl font-semibold">
            System Health
          </h2>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-none border border-gray-200 p-4">
                <div className="text-muted mb-2 text-sm">Overall Status</div>
                <div
                  className={`text-xl font-bold ${getStatusColor(health?.status)}`}
                >
                  {health?.status?.toUpperCase() || 'UNKNOWN'}
                </div>
              </div>
              <div className="rounded-none border border-gray-200 p-4">
                <div className="text-muted mb-2 text-sm">Database</div>
                <div
                  className={`text-xl font-bold ${getStatusColor(health?.database)}`}
                >
                  {health?.database?.toUpperCase() || 'UNKNOWN'}
                </div>
              </div>
              <div className="rounded-none border border-gray-200 p-4">
                <div className="text-muted mb-2 text-sm">Uptime</div>
                <div className="text-heading text-xl font-bold">
                  {health?.uptime || 0}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cron Jobs */}
        <div className="card-glass mb-6 p-4">
          <h2 className="text-heading mb-4 text-xl font-semibold">
            Cron Jobs Management
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-none border border-gray-200 p-4">
              <div>
                <h3 className="text-body mb-1 font-medium">Daily Payouts</h3>
                <p className="text-muted text-sm">
                  Process daily payouts for approved submissions
                </p>
                <p className="text-muted text-xs">
                  Status:{' '}
                  {cronStatus?.jobs?.dailyPayouts?.enabled
                    ? 'Enabled'
                    : 'Disabled'}
                </p>
              </div>
              <button
                onClick={() => handleTriggerCron('payouts')}
                className="btn-primary px-4 py-2 text-sm"
              >
                Trigger Now
              </button>
            </div>

            <div className="flex items-center justify-between rounded-none border border-gray-200 p-4">
              <div>
                <h3 className="text-body mb-1 font-medium">
                  Submission Reminders
                </h3>
                <p className="text-muted text-sm">
                  Send reminders for pending submissions
                </p>
                <p className="text-muted text-xs">
                  Status:{' '}
                  {cronStatus?.jobs?.submissionReminders?.enabled
                    ? 'Enabled'
                    : 'Disabled'}
                </p>
              </div>
              <button
                onClick={() => handleTriggerCron('reminders')}
                className="btn-primary px-4 py-2 text-sm"
              >
                Trigger Now
              </button>
            </div>

            <div className="flex items-center justify-between rounded-none border border-gray-200 p-4">
              <div>
                <h3 className="text-body mb-1 font-medium">Auto Approvals</h3>
                <p className="text-muted text-sm">
                  Auto-approve overdue submissions
                </p>
                <p className="text-muted text-xs">
                  Status:{' '}
                  {cronStatus?.jobs?.autoApprovals?.enabled
                    ? 'Enabled'
                    : 'Disabled'}
                </p>
              </div>
              <button
                onClick={() => handleTriggerCron('auto-approvals')}
                className="btn-primary px-4 py-2 text-sm"
              >
                Trigger Now
              </button>
            </div>
          </div>
        </div>

        {/* Database Stats */}
        <div className="card-glass mb-6 p-4">
          <h2 className="text-heading mb-4 text-xl font-semibold">
            Database Statistics
          </h2>
          {dbStats && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-muted mb-1 text-sm">Total Records</div>
                <div className="text-heading text-xl font-bold">
                  {dbStats.totalRecords || 0}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted mb-1 text-sm">Collections</div>
                <div className="text-heading text-xl font-bold">
                  {dbStats.collections || 0}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted mb-1 text-sm">Database Size</div>
                <div className="text-heading text-xl font-bold">
                  {dbStats.size || 'N/A'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted mb-1 text-sm">Indexes</div>
                <div className="text-heading text-xl font-bold">
                  {dbStats.indexes || 0}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cache Management */}
        <div className="card-glass mb-6 p-4">
          <h2 className="text-heading mb-4 text-xl font-semibold">
            Cache Management
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => handleClearCache('all')}
              className="btn-secondary"
            >
              Clear All Cache
            </button>
            <button
              onClick={() => handleClearCache('gigs')}
              className="btn-secondary"
            >
              Clear Gigs Cache
            </button>
            <button
              onClick={() => handleClearCache('users')}
              className="btn-secondary"
            >
              Clear Users Cache
            </button>
            <button
              onClick={() => handleClearCache('analytics')}
              className="btn-secondary"
            >
              Clear Analytics Cache
            </button>
          </div>
        </div>

        {/* System Logs */}
        <div className="card-glass p-4">
          <h2 className="text-heading mb-4 text-xl font-semibold">
            Recent System Logs ({logs.length})
          </h2>
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-muted text-center">No logs available</div>
            ) : (
              logs.map((log: any, index: number) => (
                <div
                  key={index}
                  className="rounded-none border-l-4 border-gray-300 bg-gray-50 p-3 text-sm"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className={`font-medium ${
                        log.level === 'error'
                          ? 'text-red-600'
                          : log.level === 'warn'
                            ? 'text-yellow-600'
                            : 'text-gray-600'
                      }`}
                    >
                      {log.level?.toUpperCase()}
                    </span>
                    <span className="text-muted text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-body">{log.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
