// components/ProfileTabs.tsx
import React, { useState } from 'react';
import { CompleteProfileData } from '../types/profile.types';
import OverviewTab from './tabs/OverviewTab';
import WorkHistoryTab from './tabs/WorkHistoryTab';
import PortfolioTab from './tabs/PortfolioTab';
import SettingsTab from './tabs/SettingsTab';
// Removed CSS import to fix Vercel build

interface ProfileTabsProps {
  profile: CompleteProfileData;
  isOwner: boolean;
  editing: { section: string | null; data: any };
  onStartEditing: (section: string, data: any) => void;
  onUpdateSection: (
    section: string,
    data: any
  ) => Promise<{ success: boolean; error?: string }>;
  onCancelEditing: () => void;
  onRefreshSection: (
    section: 'workHistory' | 'analytics' | 'reputation'
  ) => Promise<void>;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  profile,
  isOwner,
  editing,
  onStartEditing,
  onUpdateSection,
  onCancelEditing,
  onRefreshSection,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    // { id: 'work-history', label: 'Work History', icon: '💼' },
    // { id: 'portfolio', label: 'Portfolio', icon: '🎨' },
    ...(isOwner ? [{ id: 'settings', label: 'Settings', icon: '⚙️' }] : []),
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            user={profile.user}
            analytics={profile.analytics}
            reputation={profile.reputation}
            isOwner={isOwner}
            editing={editing}
            onStartEditing={onStartEditing}
            onUpdateSection={onUpdateSection}
            onCancelEditing={onCancelEditing}
          />
        );

      // case 'work-history':
      //   return (
      //     <WorkHistoryTab
      //       user={profile.user}
      //       workHistory={profile.workHistory}
      //       isOwner={isOwner}
      //       onRefresh={() => onRefreshSection('workHistory')}
      //     />
      //   )

      // case 'portfolio':
      //   return (
      //     <PortfolioTab
      //       user={profile.user}
      //       workHistory={profile.workHistory}
      //       isOwner={isOwner}
      //     />
      //   )

      case 'settings':
        return isOwner ? (
          <SettingsTab
            user={profile.user}
            editing={editing}
            onStartEditing={onStartEditing}
            onUpdateSection={onUpdateSection}
            onCancelEditing={onCancelEditing}
          />
        ) : null;

      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 border-none bg-transparent px-4 py-3 text-sm font-medium uppercase tracking-wide transition-all duration-200 ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 bg-white font-semibold text-blue-600'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-96 bg-white p-6">{renderTabContent()}</div>
    </div>
  );
};

export default ProfileTabs;
