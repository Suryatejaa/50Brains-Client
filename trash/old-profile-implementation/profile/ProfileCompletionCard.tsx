// components/profile/ProfileCompletionCard.tsx
'use client';

import React from 'react';
import { CheckCircle, Circle, ArrowRight, Star } from 'lucide-react';

interface ProfileCompletionCardProps {
  completion: {
    completionPercentage: number;
    completedSections: string[];
    missingSections: string[];
    nextStep: string;
    isProfileComplete: boolean;
  };
  sections: Array<{
    id: string;
    title: string;
    description: string;
    required: boolean;
    completed: boolean;
    weight: number;
  }>;
  onSectionClick: (sectionId: string) => void;
}

export const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({
  completion,
  sections,
  onSectionClick
}) => {
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressMessage = (percentage: number) => {
    if (percentage >= 80) return 'Great! Your profile is almost complete';
    if (percentage >= 50) return 'Good progress! Keep going';
    return 'Let\'s complete your profile to unlock all features';
  };

  return (
    <div className="card-glass p-3 border-l-4 border-[#6BC5F2]">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Profile Completion
          </h3>
          <p className="text-gray-600 mb-4">
            {getProgressMessage(completion.completionPercentage)}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-[#6BC5F2] mb-1">
            {completion.completionPercentage}%
          </div>
          {completion.isProfileComplete && (
            <div className="flex items-center gap-1 text-green-600">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">Complete</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(completion.completionPercentage)}`}
            style={{ width: `${completion.completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Section Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {sections.filter(section => section.required).map((section) => (
          <div 
            key={section.id}
            onClick={() => onSectionClick(section.id)}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              {section.completed ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <div className="font-medium text-gray-900">{section.title}</div>
                <div className="text-sm text-gray-600">{section.description}</div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </div>
        ))}
      </div>

      {/* Next Step CTA */}
      {!completion.isProfileComplete && completion.nextStep !== 'complete' && (
        <div className="bg-gradient-to-r from-[#6BC5F2] to-[#9F7AEA] p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold mb-1">Next Step</div>
              <div className="text-sm opacity-90">
                Complete {sections.find(s => s.id === completion.nextStep)?.title}
              </div>
            </div>
            <button
              onClick={() => onSectionClick(completion.nextStep)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Completion Benefits */}
      {completion.completionPercentage < 80 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Complete your profile to unlock:</strong>
            <ul className="mt-2 space-y-1 text-blue-700">
              <li>• Better visibility in search results</li>
              <li>• Access to premium gigs</li>
              <li>• Higher trust score</li>
              <li>• Personalized recommendations</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};