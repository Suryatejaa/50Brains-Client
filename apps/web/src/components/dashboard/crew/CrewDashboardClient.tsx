// components/dashboard/crew/CrewDashboardClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkHistory } from '@/hooks/useWorkHistory';
import { useRouter } from 'next/navigation';
import {
  VideoIcon,
  IndianRupeeIcon,
  TargetIcon,
  WrenchIcon,
  FileTextIcon,
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
export function CrewDashboardClient() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { workSummary, skills, reputation } = useWorkHistory(user?.id);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [applications, setApplications] = React.useState<Application[]>([]);
  const [stats, setStats] = React.useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
  });
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadApplications();
    }
  }, [isAuthenticated, user]);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const activeApplications = applications.filter(
    (app) => app.status === 'PENDING' || app.status === 'APPROVED'
  );

  // Set loading to false after component mounts
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Enhanced Metrics with Real Data */}
      <div className="mb-1 grid grid-cols-1 gap-1 md:mb-1 md:grid-cols-3 md:gap-1 lg:grid-cols-3">
        <div
          className="card-glass cursor-pointer p-3 transition-shadow hover:shadow-lg md:p-4"
          onClick={() => router.push('/my-bids')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-xs md:text-sm">Active Projects</p>
              <p className="text-heading text-lg font-semibold md:text-xl">
                {stats.approved || 0}
              </p>
              <p className="text-muted text-xs">{stats.pending} pending bids</p>
            </div>
            <div className="text-2xl md:text-3xl">
              <VideoIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="card-glass p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-xs md:text-sm">Monthly Revenue</p>
              <p className="text-heading text-lg font-semibold md:text-xl">
                ₹{workSummary?.totalEarnings || 0}
              </p>
              <p className="text-muted text-xs">
                Avg: ₹
                {workSummary?.totalEarnings
                  ? Math.round(
                      workSummary.totalEarnings /
                        Math.max(workSummary.totalProjects, 1)
                    )
                  : 0}
              </p>
            </div>
            <div className="text-2xl md:text-3xl">
              <IndianRupeeIcon className="h-6 w-6" />
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
                {workSummary?.onTimeDeliveryRate || 0}% on time
              </p>
            </div>
            <div className="text-2xl md:text-3xl">
              <TargetIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-1 md:gap-1 lg:grid-cols-3">
        {/* Left Column - Projects & Performance */}
        <div className="space-y-1 md:space-y-1 lg:col-span-2">
          {/* Recent Projects */}
          {false ? (
            <div className="card-glass p-3 md:p-4">
              <h3 className="text-heading mb-3 flex items-center gap-2 text-lg font-semibold">
                <VideoIcon className="h-5 w-5" />
                Recent Projects
              </h3>
              <div className="space-y-3">
                {/* Placeholder for recent projects */}
                <div className="border-l-4 border-blue-500 pl-3">
                  <h4 className="font-medium text-gray-900">
                    Loading projects...
                  </h4>
                  <p className="mb-1 text-sm text-gray-600">
                    Please wait while we fetch your recent projects.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Work History Section */}
          {workSummary && (
            <div className="card-glass p-3 md:p-4">
              <h3 className="text-heading mb-3 flex items-center gap-2 text-lg font-semibold">
                <FileTextIcon className="h-5 w-5" />
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

              {skills && skills.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium text-gray-900">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.slice(0, 5).map((skill: any) => (
                      <span
                        key={skill.skill}
                        className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800"
                      >
                        {skill.skill} ({skill.level})
                      </span>
                    ))}
                    {skills.length > 5 && (
                      <span className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-600">
                        +{skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Skills & Business */}
        <div className="space-y-1 md:space-y-1">
          {/* Skills Overview */}
          <div className="card-glass p-3 md:p-4">
            <h3 className="text-heading mb-3 flex items-center gap-2 text-lg font-semibold">
              <WrenchIcon className="h-5 w-5" />
              Skills Overview
            </h3>

            {skills && skills.length > 0 ? (
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
                        className="h-2 rounded-full bg-blue-600"
                        style={{
                          width: `${skill.level === 'Expert' ? 90 : skill.level === 'Advanced' ? 70 : skill.level === 'Intermediate' ? 50 : 30}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
                {skills.length > 4 && (
                  <div className="pt-2 text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      View all {skills.length} skills →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center">
                <div className="mb-2 text-3xl">🔧</div>
                <p className="mb-3 text-gray-600">No skills listed yet</p>
                <a href="/profile/edit" className="btn-secondary">
                  Add Skills
                </a>
              </div>
            )}
          </div>

          {/* Performance Overview */}
          {reputation && (
            <div className="card-glass p-3 md:p-4">
              <h3 className="text-heading mb-3 text-lg font-semibold">
                Performance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Overall Rating</span>
                  <span className="font-semibold">
                    {reputation.overallRating}/5 ⭐
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Projects</span>
                  <span className="font-semibold">
                    {workSummary?.totalProjects || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Completed</span>
                  <span className="font-semibold">
                    {workSummary?.completedProjects || 0}
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
                Browse New Projects
              </a>
              <a
                href="/my/applications"
                className="btn-secondary block w-full text-center"
              >
                View Applications
              </a>
              <a
                href="/profile"
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
