import React from 'react';
import {
  TrendingUp,
  Eye,
  Users,
  Target,
  Star,
  DollarSign,
  Zap,
  Heart,
  Clock,
} from 'lucide-react';
import { ProfileAnalyticsProps } from '../types';

export const ProfileAnalytics: React.FC<ProfileAnalyticsProps> = ({
  analytics,
}) => {
  if (!analytics) {
    return (
      <div className="rounded-xl border bg-white p-3 shadow-sm">
        <h3 className="mb-4 font-semibold">Performance Analytics</h3>
        <p className="text-muted-foreground">Analytics data not available</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm">
      <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
        <TrendingUp className="mr-2 h-5 w-5 text-purple-500" />
        Performance Analytics
        <span className="ml-auto rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </span>
      </h3>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* First row - Core metrics */}
        <div className="rounded-none bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Profile Views</p>
              <div className="text-2xl font-bold text-blue-700">
                {analytics.profileViews || 0}
              </div>
            </div>
            <Eye className="h-8 w-8 text-blue-500" />
          </div>
          <p className="mt-2 text-xs text-blue-600">
            +{analytics.monthlyGrowth || 0}% this month
          </p>
        </div>

        <div className="rounded-none bg-green-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Connections</p>
              <div className="text-2xl font-bold text-green-700">
                {analytics.totalConnections || 0}
              </div>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
          <p className="mt-2 text-xs text-green-600">
            {analytics.responseRate || 0}% response rate
          </p>
        </div>

        <div className="rounded-none bg-purple-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">
                Applications
              </p>
              <div className="text-2xl font-bold text-purple-700">
                {analytics.gigApplications || 0}
              </div>
            </div>
            <Target className="h-8 w-8 text-purple-500" />
          </div>
          <p className="mt-2 text-xs text-purple-600">
            {analytics.gigWinRate || 0}% win rate
          </p>
        </div>

        <div className="rounded-none bg-yellow-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Rating</p>
              <div className="text-2xl font-bold text-yellow-700">
                {analytics.averageRating?.toFixed(1) || '0.0'}
              </div>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="mt-2 text-xs text-yellow-600">
            {analytics.reviewCount || 0} reviews
          </p>
        </div>

        {/* Second row - Advanced metrics */}
        <div className="rounded-none bg-indigo-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">Earnings</p>
              <div className="text-2xl font-bold text-indigo-700">
                ${(analytics.totalEarnings || 0).toLocaleString()}
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-indigo-500" />
          </div>
          <p className="mt-2 text-xs text-indigo-600">
            Avg: ${(analytics.averageProjectValue || 0).toLocaleString()}
          </p>
        </div>

        <div className="rounded-none bg-teal-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-teal-600">Active Gigs</p>
              <div className="text-2xl font-bold text-teal-700">
                {analytics.activeGigs || 0}
              </div>
            </div>
            <Zap className="h-8 w-8 text-teal-500" />
          </div>
          <p className="mt-2 text-xs text-teal-600">
            {analytics.completedGigs || 0} completed
          </p>
        </div>

        <div className="rounded-none bg-pink-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-pink-600">Retention</p>
              <div className="text-2xl font-bold text-pink-700">
                {analytics.clientRetentionRate || 0}%
              </div>
            </div>
            <Heart className="h-8 w-8 text-pink-500" />
          </div>
          <p className="mt-2 text-xs text-pink-600">
            {analytics.repeatClients || 0} repeat clients
          </p>
        </div>

        <div className="rounded-none bg-orange-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">
                Response Time
              </p>
              <div className="text-2xl font-bold text-orange-700">
                {analytics.avgResponseTime || 0}h
              </div>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
          <p className="mt-2 text-xs text-orange-600">Average response time</p>
        </div>
      </div>
    </div>
  );
};
