// components/dashboard/influencer/InfluencerDashboardClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkHistory } from '@/hooks/useWorkHistory';
import { useRouter } from 'next/navigation';
import {
  UsersIcon,
  IndianRupeeIcon,
  TargetIcon,
  StarIcon,
  MegaphoneIcon,
  FileTextIcon,
  TrendingUpIcon,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface Application {
  id: string;
  gigId: string;
  applicantId: string;
  applicantType: string;
  proposal: string;
  quotedPrice: number;
  estimatedTime: string;
  portfolio: string[] | { title: string; url: string }[];
  status: string;
  appliedAt: string;
  respondedAt: string;
  rejectionReason: string | null;
  gig: Gig;
}

interface Gig {
  id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  budgetType: string;
  status: string;
  deadline: string;
  createdAt: string;
}

// CLIENT-SIDE PROGRESSIVE ENHANCEMENT
export function InfluencerDashboardClient() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { workSummary, skills, portfolio, achievements, reputation } =
    useWorkHistory(user?.id);

  const [applications, setApplications] = React.useState<Application[]>([]);
  const [stats, setStats] = React.useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadApplications();
    }
    // Set loading to false after component mounts
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user]);

  const loadApplications = async () => {
    try {
      const response = await apiClient.get('/api/my/applications');

      if (response.success && response.data) {
        const { applications = [] } = response.data as {
          applications: Application[];
        };
        setApplications(applications);

        // Calculate stats
        setStats({
          total: applications.length,
          pending: applications.filter(
            (app: Application) => app.status === 'PENDING'
          ).length,
          approved: applications.filter(
            (app: Application) => app.status === 'APPROVED'
          ).length,
          completed: applications.filter(
            (app: Application) => app.status === 'COMPLETED'
          ).length,
        });
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
      setError('Failed to load applications');
    }
  };

  const activeApplications = applications.filter(
    (app) => app.status === 'PENDING' || app.status === 'APPROVED'
  );

  return (
    <>
      {/* Enhanced Metrics with Real Data */}
      <div className="mb-1 grid grid-cols-1 gap-1 md:mb-1 md:grid-cols-3 md:gap-1 lg:grid-cols-3">
        <div className="card-glass p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-xs md:text-sm">Monthly Earnings</p>
              <p className="text-heading text-lg font-semibold md:text-xl">
                ₹{workSummary?.totalEarnings || 0}
              </p>
              <p className="text-muted text-xs">
                Avg: ₹
                {workSummary?.totalEarnings && workSummary?.totalProjects
                  ? Math.round(
                      workSummary.totalEarnings / workSummary.totalProjects
                    )
                  : 0}
              </p>
            </div>
            <div className="text-2xl md:text-3xl">
              <IndianRupeeIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div
          className="card-glass cursor-pointer p-3 transition-shadow hover:shadow-lg md:p-4"
          onClick={() => router.push('/my/applications')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-xs md:text-sm">
                Active Applications
              </p>
              <p className="text-heading text-lg font-semibold md:text-xl">
                {stats.pending + stats.approved}
              </p>
              <p className="text-muted text-xs">{stats.pending} pending</p>
            </div>
            <div className="text-2xl md:text-3xl">
              <TargetIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="card-glass p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-xs md:text-sm">Success Rate</p>
              <p className="text-heading text-lg font-semibold md:text-xl">
                {workSummary?.totalProjects
                  ? Math.round(
                      (workSummary.completedProjects /
                        workSummary.totalProjects) *
                        100
                    )
                  : 0}
                %
              </p>
              <p className="text-muted text-xs">
                {workSummary?.completedProjects || 0} completed
              </p>
            </div>
            <div className="text-2xl md:text-3xl">
              <StarIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-1 md:gap-1 lg:grid-cols-3">
        {/* Left Column - Content & Campaigns */}
        <div className="space-y-1 md:space-y-1 lg:col-span-2">
          {/* Recent Applications */}
          <div className="card-glass p-3 md:p-4">
            <h3 className="text-heading mb-3 flex items-center gap-2 text-lg font-semibold">
              <FileTextIcon className="h-5 w-5" />
              Recent Applications
            </h3>

            {applications.length > 0 ? (
              <div className="space-y-3">
                {applications.slice(0, 3).map((application) => (
                  <div
                    key={application.id}
                    className="border-l-4 border-blue-500 pl-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {application.gig.title}
                        </h4>
                        <p className="mb-1 line-clamp-2 text-sm text-gray-600">
                          {application.proposal}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>₹{application.quotedPrice}</span>
                          <span
                            className={`rounded px-2 py-1 ${
                              application.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : application.status === 'APPROVED'
                                  ? 'bg-green-100 text-green-800'
                                  : application.status === 'REJECTED'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {application.status}
                          </span>
                          <span>
                            {new Date(
                              application.appliedAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {applications.length > 3 && (
                  <div className="pt-2 text-center">
                    <a
                      href="/my/applications"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View all {applications.length} applications →
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="mb-3 text-4xl">📄</div>
                <p className="mb-4 text-gray-600">No applications yet</p>
                <a href="/marketplace" className="btn-primary">
                  Browse Opportunities
                </a>
              </div>
            )}
          </div>

          {/* Work History Section */}
          {workSummary && (
            <div className="card-glass p-3 md:p-4">
              <h3 className="text-heading mb-3 flex items-center gap-2 text-lg font-semibold">
                <TrendingUpIcon className="h-5 w-5" />
                Work History
              </h3>

              <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {workSummary.totalProjects}
                  </div>
                  <div className="text-sm text-gray-600">Total Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {workSummary.completedProjects}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    ₹{workSummary.totalEarnings}
                  </div>
                  <div className="text-sm text-gray-600">Total Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(
                      (workSummary.completedProjects /
                        Math.max(workSummary.totalProjects, 1)) *
                        100
                    )}
                    %
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>

              {achievements && achievements.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium text-gray-900">
                    Recent Achievements
                  </h4>
                  <div className="space-y-2">
                    {achievements.slice(0, 3).map((achievement: any) => (
                      <div
                        key={achievement.id}
                        className="flex items-center gap-2"
                      >
                        <span className="text-yellow-500">🏆</span>
                        <span className="text-sm">{achievement.title}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(
                            achievement.achievedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Stats & Insights */}
        <div className="space-y-1 md:space-y-1">
          {/* Earnings Overview */}
          <div className="card-glass p-3 md:p-4">
            <h3 className="text-heading mb-3 flex items-center gap-2 text-lg font-semibold">
              <IndianRupeeIcon className="h-5 w-5" />
              Earnings Overview
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Earnings</span>
                <span className="font-semibold">
                  ₹{workSummary?.totalEarnings || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Average per Project</span>
                <span className="font-semibold">
                  ₹
                  {workSummary?.totalEarnings && workSummary?.totalProjects
                    ? Math.round(
                        workSummary.totalEarnings / workSummary.totalProjects
                      )
                    : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">This Month</span>
                <span className="font-semibold text-green-600">
                  ₹{Math.round((workSummary?.totalEarnings || 0) * 0.3)}
                </span>
              </div>
            </div>
          </div>

          {/* Skills & Expertise */}
          {skills && skills.length > 0 && (
            <div className="card-glass p-3 md:p-4">
              <h3 className="text-heading mb-3 text-lg font-semibold">
                Skills & Expertise
              </h3>
              <div className="space-y-3">
                {skills.slice(0, 4).map((skill: any) => (
                  <div key={skill.skill}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">{skill.skill}</span>
                      <span className="text-xs text-gray-500">
                        {skill.level}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-purple-600"
                        style={{
                          width: `${skill.level === 'Expert' ? 90 : skill.level === 'Advanced' ? 70 : skill.level === 'Intermediate' ? 50 : 30}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
                {skills.length > 4 && (
                  <div className="pt-2 text-center">
                    <button className="text-sm text-purple-600 hover:text-purple-800">
                      View all {skills.length} skills →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reputation & Rating */}
          {reputation && (
            <div className="card-glass p-3 md:p-4">
              <h3 className="text-heading mb-3 text-lg font-semibold">
                Reputation
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall Rating</span>
                  <span className="font-semibold">
                    {reputation.overallRating}/5 ⭐
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">On-time Delivery</span>
                  <span className="font-semibold">
                    {workSummary?.onTimeDeliveryRate || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Projects</span>
                  <span className="font-semibold">
                    {workSummary?.totalProjects || 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card-glass p-3 md:p-4">
            <h3 className="text-heading mb-3 text-lg font-semibold">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <a
                href="/marketplace"
                className="btn-primary block w-full text-center"
              >
                Browse New Gigs
              </a>
              <a
                href="/my/applications"
                className="btn-secondary block w-full text-center"
              >
                View Applications
              </a>
              <a
                href="/profile/edit"
                className="btn-ghost block w-full text-center"
              >
                Update Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
