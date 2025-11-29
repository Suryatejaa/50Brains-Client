'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';

export default function AdminAnalyticsPage() {
  const [platformStats, setPlatformStats] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [statsRes, perfRes, trendsRes] = await Promise.all([
        apiClient.get<any>(
          `/api/gig-admin/analytics/platform-stats?period=${period}`
        ),
        apiClient.get<any>(
          `/api/gig-admin/analytics/performance?period=${period}`
        ),
        apiClient.get<any>('/api/gig-admin/analytics/trends'),
      ]);

      if (statsRes.success) setPlatformStats(statsRes.data);
      if (perfRes.success) setPerformance(perfRes.data);
      if (trendsRes.success) setTrends(trendsRes.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    const reportType = prompt(
      'Enter report type (gigs, users, financial, platform):'
    );
    if (!reportType) return;

    try {
      const response = await apiClient.post<any>(
        '/api/gig-admin/reports/generate',
        {
          reportType,
          parameters: { period },
          format: 'PDF',
        }
      );

      if (response.success) {
        alert(
          `Report generated successfully. Report ID: ${(response.data as any)?.reportId}`
        );
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-heading text-2xl font-bold">
            Platform Analytics
          </h1>
          <div className="flex gap-4">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="input-field"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button onClick={handleGenerateReport} className="btn-primary">
              Generate Report
            </button>
          </div>
        </div>

        {/* Platform Statistics */}
        <div className="card-glass mb-6 p-4">
          <h2 className="text-heading mb-4 text-xl font-semibold">
            Platform Statistics
          </h2>
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-muted mb-1 text-sm">Total Gigs</div>
                <div className="text-heading text-2xl font-bold">
                  {platformStats?.totalGigs || 0}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted mb-1 text-sm">Active Users</div>
                <div className="text-heading text-2xl font-bold">
                  {platformStats?.activeUsers || 0}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted mb-1 text-sm">
                  Total Applications
                </div>
                <div className="text-heading text-2xl font-bold">
                  {platformStats?.totalApplications || 0}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted mb-1 text-sm">Conversion Rate</div>
                <div className="text-heading text-2xl font-bold">
                  {platformStats?.conversionRate || 0}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="card-glass p-4">
            <h2 className="text-heading mb-4 text-xl font-semibold">
              Performance Metrics
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-body">Average Response Time</span>
                <span className="text-heading font-semibold">
                  {performance?.avgResponseTime || 0}ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body">Success Rate</span>
                <span className="text-heading font-semibold">
                  {performance?.successRate || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body">User Satisfaction</span>
                <span className="text-heading font-semibold">
                  {performance?.userSatisfaction || 0}/5
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body">Platform Uptime</span>
                <span className="text-heading font-semibold">
                  {performance?.uptime || 99.9}%
                </span>
              </div>
            </div>
          </div>

          <div className="card-glass p-4">
            <h2 className="text-heading mb-4 text-xl font-semibold">
              Trending Categories
            </h2>
            <div className="space-y-3">
              {trends?.topCategories?.map((category: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-none border border-gray-200 p-3"
                >
                  <span className="text-body">{category.name}</span>
                  <div className="text-right">
                    <div className="text-heading font-semibold">
                      {category.count}
                    </div>
                    <div className="text-muted text-xs">
                      {category.growth > 0 ? '↑' : '↓'}{' '}
                      {Math.abs(category.growth)}%
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-muted text-center">
                  No trend data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Behavior */}
        <div className="card-glass p-4">
          <h2 className="text-heading mb-4 text-xl font-semibold">
            User Behavior Insights
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-none border border-gray-200 p-4">
              <div className="text-muted mb-2 text-sm">
                Avg. Session Duration
              </div>
              <div className="text-heading text-xl font-bold">
                {trends?.avgSessionDuration || '0m'}
              </div>
            </div>
            <div className="rounded-none border border-gray-200 p-4">
              <div className="text-muted mb-2 text-sm">Bounce Rate</div>
              <div className="text-heading text-xl font-bold">
                {trends?.bounceRate || 0}%
              </div>
            </div>
            <div className="rounded-none border border-gray-200 p-4">
              <div className="text-muted mb-2 text-sm">Return User Rate</div>
              <div className="text-heading text-xl font-bold">
                {trends?.returnUserRate || 0}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
