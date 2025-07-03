import React from 'react';
import {
  User,
  Briefcase,
  GraduationCap,
  Instagram,
  TrendingUp,
  Settings,
} from 'lucide-react';

interface ProfileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NAVIGATION_TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'social', label: 'Social Media', icon: Instagram },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const ProfileNavigation: React.FC<ProfileNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="sticky top-0 z-10 mt-8 border-b border-gray-200 bg-white">
      <div className="px-4 sm:px-6">
        <nav className="scrollbar-hide flex space-x-6 overflow-x-auto sm:space-x-8">
          {NAVIGATION_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-shrink-0 items-center space-x-2 border-b-2 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
