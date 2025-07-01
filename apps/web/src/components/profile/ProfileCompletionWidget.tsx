'use client';

import { useRouter } from 'next/navigation';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { useAuth } from '@/hooks/useAuth';
import {
  User,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Target,
} from 'lucide-react';

interface ProfileCompletionWidgetProps {
  className?: string;
}

export function ProfileCompletionWidget({
  className = '',
}: ProfileCompletionWidgetProps) {
  const router = useRouter();
  const { user } = useAuth();
  const {
    completionPercentage,
    missingFields,
    isLoading,
    error,
    refetchProfile,
  } = useProfileCompletion();

  // Retry function for error states
  const handleRetry = () => {
    refetchProfile();
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${className}`}
      >
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
          <div className="flex-1">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="mt-1 h-3 w-16 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}
      >
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-8 w-8 text-red-600" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Unable to load profile
            </h3>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={handleRetry}
              className="mt-1 text-sm text-red-600 underline hover:text-red-800"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (completionPercentage === 100) {
    return (
      <div
        className={`rounded-lg border border-green-200 bg-green-50 p-4 ${className}`}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800">
              Profile Complete!
            </h3>
            <p className="text-sm text-green-700">
              Your profile is 100% complete. Great job!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="relative">
              <Target className="h-8 w-8 text-blue-600" />
              {completionPercentage < 50 && (
                <AlertCircle className="absolute -right-1 -top-1 h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">
              Complete Your Profile
            </h3>
            <p
              className={`text-2xl font-bold ${getCompletionColor(completionPercentage)}`}
            >
              {completionPercentage}%
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push('/profile')}
          className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <span>Complete</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
          <span>Progress</span>
          <span>{completionPercentage}% Complete</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full transition-all duration-500 ${getProgressBarColor(completionPercentage)}`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Missing Fields */}
      {missingFields.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-gray-600">
            Missing: {missingFields.slice(0, 3).join(', ')}
            {missingFields.length > 3 && ` +${missingFields.length - 3} more`}
          </p>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-4">
        <button
          onClick={() => router.push('/profile')}
          className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          <User className="h-4 w-4" />
          <span>Update Profile</span>
        </button>
      </div>
    </div>
  );
}
