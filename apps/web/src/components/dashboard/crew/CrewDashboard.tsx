'use client';

import React from 'react';
import { useCrewDashboard } from '@/hooks/useDashboardData';
import { useAuth } from '@/hooks/useAuth';
import { QuickActionsGrid } from '../shared/QuickActions';
import { WorkHistorySummary } from '@/components/WorkHistorySummary';
import { WorkHistoryList } from '@/components/WorkHistoryList';
import { Portfolio } from '@/components/Portfolio';
import { Achievements } from '@/components/Achievements';

export const CrewDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data, loading, error, refresh } = useCrewDashboard();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-3 py-2 md:p-3">
        <div className="flex min-h-screen items-center justify-center">
          <div className="card-glass p-3 text-center md:p-3">
            <div className="border-brand-primary mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent md:mb-4 md:h-8 md:w-8"></div>
            <p className="text-muted text-sm md:text-base">
              Loading your crew dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-3 py-2 md:p-3">
        <div className="mx-auto max-w-7xl">
          <div className="card-glass p-3 text-center md:p-3">
            <div className="mb-2 text-3xl md:mb-4 md:text-4xl">⚠️</div>
            <h2 className="text-heading mb-1 text-lg font-semibold md:mb-2 md:text-xl">
              Dashboard Error
            </h2>
            <p className="text-muted mb-3 text-sm md:mb-6 md:text-base">
              Unable to load your dashboard data. Please try again.
            </p>
            <button
              onClick={refresh}
              className="btn-primary px-4 py-2 text-sm md:text-base"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-10 px-1 py-0 md:p-1">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-1 md:mb-1">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-heading text-xl font-bold md:text-2xl">
                Crew Dashboard
              </h1>
              <p className="text-muted text-sm md:text-base">
                Welcome back, {user?.username || user?.email || 'Crew Member'}!
                🎬
              </p>
            </div>
            <QuickActionsGrid
              actions={[
                { label: 'Browse Projects', href: '/marketplace', icon: '🎬' },
                { label: 'My Bids', href: '/my-bids', icon: '📋' },
                { label: 'Equipment', href: '/equipment', icon: '📹' },
                { label: 'Profile', href: '/profile', icon: '👤' },
              ]}
            />
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="mb-1 grid grid-cols-2 gap-1 md:mb-1 md:grid-cols-2 md:gap-1 lg:grid-cols-4">
          <div className="card-glass p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-xs md:text-sm">Active Projects</p>
                <p className="text-heading text-lg font-semibold md:text-xl">
                  {data?.projectMetrics?.activeProjects || 0}
                </p>
                <p className="text-muted text-xs">
                  {data?.projectMetrics?.pendingBids || 0} pending bids
                </p>
              </div>
              <div className="text-2xl md:text-3xl">🎬</div>
            </div>
          </div>

          <div className="card-glass p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-xs md:text-sm">Monthly Revenue</p>
                <p className="text-heading text-lg font-semibold md:text-xl">
                  $
                  {data?.businessMetrics?.monthlyRevenue?.toLocaleString() ||
                    '0'}
                </p>
                <p className="text-muted text-xs">
                  Avg: $
                  {data?.projectMetrics?.avgProjectValue?.toLocaleString() ||
                    '0'}
                </p>
              </div>
              <div className="text-2xl md:text-3xl">💰</div>
            </div>
          </div>

          <div className="card-glass p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-xs md:text-sm">Success Rate</p>
                <p className="text-heading text-lg font-semibold md:text-xl">
                  {data?.projectMetrics?.successRate || 0}%
                </p>
                <p className="text-muted text-xs">
                  {data?.projectMetrics?.onTimeDelivery || 0}% on time
                </p>
              </div>
              <div className="text-2xl md:text-3xl">🎯</div>
            </div>
          </div>

          <div className="card-glass p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-xs md:text-sm">Skills</p>
                <p className="text-heading text-lg font-semibold md:text-xl">
                  {data?.skillMetrics?.totalSkills || 0}
                </p>
                <p className="text-muted text-xs">
                  {data?.skillMetrics?.expertiseLevel || 'Beginner'}
                </p>
              </div>
              <div className="text-2xl md:text-3xl">🛠️</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-1 md:gap-1 lg:grid-cols-3">
          {/* Left Column - Projects & Performance */}
          <div className="space-y-1 md:space-y-1 lg:col-span-2">
            {/* Project Performance */}
            <div className="card-glass p-1 md:p-1">
              <div className="mb-1 flex items-center justify-between md:mb-1">
                <h3 className="text-heading text-lg font-semibold">
                  Project Performance
                </h3>
                <div className="text-xl">📊</div>
              </div>
              <div className="grid grid-cols-3 gap-2 md:grid-cols-3">
                <div className="text-center">
                  <p className="text-muted text-xs md:text-sm">Completed</p>
                  <p className="text-heading text-lg font-semibold">
                    {data?.projectMetrics?.completedProjects || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted text-xs md:text-sm">Utilization</p>
                  <p className="text-heading text-lg font-semibold">
                    {data?.businessMetrics?.utilizationRate || 0}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted text-xs md:text-sm">
                    Client Retention
                  </p>
                  <p className="text-heading text-lg font-semibold">
                    {data?.businessMetrics?.clientRetentionRate || 0}%
                  </p>
                </div>
              </div>
              <div className="mt-3 rounded-none bg-green-50 p-2 md:mt-4">
                <p className="text-xs text-green-800 md:text-sm">
                  🏆 Repeat Clients:{' '}
                  {data?.businessMetrics?.repeatClientPercentage || 0}% • Avg
                  Duration: {data?.businessMetrics?.avgProjectDuration || 0}{' '}
                  days
                </p>
              </div>
            </div>

            {/* Recent Projects */}
            {data?.recentProjects && data.recentProjects.length > 0 && (
              <div className="card-glass p-3 md:p-4">
                <div className="mb-1 flex items-center justify-between md:mb-4">
                  <h3 className="text-heading text-lg font-semibold">
                    Recent Projects
                  </h3>
                  <div className="text-xl">🎬</div>
                </div>
                <div className="space-y-2 md:space-y-3">
                  {data.recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between rounded-none bg-gray-50 p-2 md:p-3"
                    >
                      <div className="flex-1">
                        <p className="text-heading text-sm font-medium md:text-base">
                          {project.title}
                        </p>
                        <p className="text-muted text-xs">
                          {project.client} • Due:{' '}
                          {new Date(project.deadline).toLocaleDateString()}
                        </p>
                        {project.completion > 0 && (
                          <div className="mt-1">
                            <div className="h-1.5 rounded-none bg-gray-200">
                              <div
                                className="bg-brand-primary h-1.5 rounded-none transition-all duration-300"
                                style={{ width: `${project.completion}%` }}
                              ></div>
                            </div>
                            <p className="text-muted mt-1 text-xs">
                              {project.completion}% complete
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="ml-3 text-right">
                        <p className="text-heading text-sm font-medium md:text-base">
                          ${project.budget.toLocaleString()}
                        </p>
                        <span
                          className={`inline-block rounded-none px-2 py-1 text-xs ${project.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : project.status === 'ACTIVE'
                              ? 'bg-blue-100 text-blue-800'
                              : project.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {project.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Work History Section */}
            <div className="mt-0 space-y-0 md:space-y-0">
              <div className="card-glass p-1 md:p-1">
                <div className="mb-2 flex items-center justify-between md:mb-4">
                  <h3 className="text-heading text-lg font-semibold">
                    Work History & Portfolio
                  </h3>
                  <div className="text-xl">📊</div>
                </div>

                {/* Work History Summary */}
                <div className="mb-1">
                  <WorkHistorySummary userId={user?.id} />
                </div>

                {/* Recent Work and Achievements Grid */}
                <div className="grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-2">
                  <div>
                    <h4 className="text-heading mb-2 text-sm font-medium md:text-base">
                      Recent Work
                    </h4>
                    <div className="max-h-64 overflow-y-auto">
                      <WorkHistoryList userId={user?.id} showFilters={false} limit={3} />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-heading mb-1 text-sm font-medium md:text-base">
                      Recent Achievements
                    </h4>
                    <div className="max-h-64 overflow-y-auto">
                      <Achievements userId={user?.id} showVerifiedOnly={false} />
                    </div>
                  </div>
                </div>

                {/* Portfolio Preview */}
                <div className="mt-1">
                  <h4 className="text-heading mb-1 text-sm font-medium md:text-base">
                    Portfolio Highlights
                  </h4>
                  <div className="max-h-48 overflow-y-auto">
                    <Portfolio userId={user?.id} showPublicOnly={false} />
                  </div>
                </div>
              </div>
            </div>

            {/* Client History */}
            {data?.clientHistory && data.clientHistory.length > 0 && (
              <div className="card-glass p-3 md:p-4">
                <div className="mb-1 flex items-center justify-between md:mb-4">
                  <h3 className="text-heading text-lg font-semibold">
                    Top Clients
                  </h3>
                  <div className="text-xl">🤝</div>
                </div>
                <div className="space-y-2 md:space-y-3">
                  {data.clientHistory.slice(0, 5).map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between rounded-none bg-gray-50 p-2 md:p-3"
                    >
                      <div>
                        <p className="text-heading text-sm font-medium md:text-base">
                          {client.name}
                        </p>
                        <p className="text-muted text-xs">
                          {client.projectsCount} projects • Last:{' '}
                          {new Date(client.lastProject).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-heading text-sm font-medium md:text-base">
                          ${client.totalValue.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1">
                          <span className="text-xs">⭐</span>
                          <span className="text-muted text-xs">
                            {client.rating}/5
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Skills & Business */}
          <div className="space-y-1 md:space-y-1">
            {/* Skills Overview */}
            <div className="card-glass p-2 md:p-2">
              <div className="mb-1 flex items-center justify-between md:mb-1">
                <h3 className="text-heading text-lg font-semibold">Skills</h3>
                <div className="text-xl">🛠️</div>
              </div>
              <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Total Skills</span>
                  <span className="text-heading font-semibold">
                    {data?.skillMetrics?.totalSkills || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Expertise</span>
                  <span className="text-heading font-semibold">
                    {data?.skillMetrics?.expertiseLevel || 'Beginner'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Hourly Rate</span>
                  <span className="text-heading font-semibold">
                    ${data?.skillMetrics?.hourlyRate || 0}/hr
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Equipment</span>
                  <span className="text-heading font-semibold">
                    {data?.skillMetrics?.equipmentCount || 0} items
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Certifications</span>
                  <span className="text-heading font-semibold">
                    {data?.skillMetrics?.certifications || 0}
                  </span>
                </div>
              </div>
              {data?.skillMetrics?.specializations &&
                data.skillMetrics.specializations.length > 0 && (
                  <div className="mt-3 md:mt-4">
                    <h4 className="text-heading mb-2 text-sm font-medium">
                      Specializations
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {data.skillMetrics.specializations.map(
                        (spec: string, index: number) => (
                          <span
                            key={index}
                            className="bg-brand-primary/10 text-brand-primary rounded-none px-2 py-1 text-xs"
                          >
                            {spec}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Business Metrics */}
            <div className="card-glass p-2 md:p-4">
              <div className="mb-1 flex items-center justify-between md:mb-1">
                <h3 className="text-heading text-lg font-semibold">Business</h3>
                <div className="text-xl">📈</div>
              </div>
              <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Monthly Revenue</span>
                  <span className="text-heading font-semibold">
                    $
                    {data?.businessMetrics?.monthlyRevenue?.toLocaleString() ||
                      '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Profit Margin</span>
                  <span className="font-semibold text-green-600">
                    {data?.businessMetrics?.profitMargin || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Utilization</span>
                  <span className="font-semibold text-blue-600">
                    {data?.businessMetrics?.utilizationRate || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Client Retention</span>
                  <span className="font-semibold text-purple-600">
                    {data?.businessMetrics?.clientRetentionRate || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Equipment Portfolio */}
            {data?.equipmentPortfolio && data.equipmentPortfolio.length > 0 && (
              <div className="card-glass p-2 md:p-4">
                <div className="mb-1 flex items-center justify-between md:mb-1">
                  <h3 className="text-heading text-lg font-semibold">
                    Equipment
                  </h3>
                  <div className="text-xl">📹</div>
                </div>
                <div className="space-y-2 md:space-y-3">
                  {data.equipmentPortfolio.map((category, index) => (
                    <div
                      key={index}
                      className="rounded-none bg-gray-50 p-2 md:p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-heading text-sm font-medium">
                          {category.category}
                        </h4>
                        <span className="text-muted text-xs">
                          ${category.value.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {category.items
                          .slice(0, 3)
                          .map((item: string, itemIndex: number) => (
                            <span
                              key={itemIndex}
                              className="rounded-none bg-white px-2 py-1 text-xs text-gray-700"
                            >
                              {item}
                            </span>
                          ))}
                        {category.items.length > 3 && (
                          <span className="text-muted rounded-none px-2 py-1 text-xs">
                            +{category.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Opportunities */}
            {data?.opportunities && (
              <div className="card-glass p-2 md:p-4">
                <div className="mb-1 flex items-center justify-between md:mb-1">
                  <h3 className="text-heading text-lg font-semibold">
                    Opportunities
                  </h3>
                  <div className="text-xl">🎯</div>
                </div>
                {data.opportunities.matchedProjects?.length > 0 && (
                  <div className="mb-3 md:mb-4">
                    <h4 className="text-heading mb-2 text-sm font-medium">
                      Matched Projects (
                      {data.opportunities.matchedProjects.length})
                    </h4>
                    <button className="btn-primary w-full py-2 text-sm">
                      View All Matches
                    </button>
                  </div>
                )}
                {data.opportunities.skillRecommendations?.length > 0 && (
                  <div className="mb-3 md:mb-4">
                    <h4 className="text-heading mb-2 text-sm font-medium">
                      Skill Recommendations
                    </h4>
                    <div className="space-y-1">
                      {data.opportunities.skillRecommendations
                        .slice(0, 3)
                        .map((skill: string, index: number) => (
                          <p key={index} className="text-muted text-xs">
                            💡 {skill}
                          </p>
                        ))}
                    </div>
                  </div>
                )}
                {data.opportunities.marketDemand?.length > 0 && (
                  <div>
                    <h4 className="text-heading mb-2 text-sm font-medium">
                      Market Demand
                    </h4>
                    <p className="text-muted text-xs">
                      📈 High demand in your skills area
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          
        </div>
      </div>
    </div>
  );
};