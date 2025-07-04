'use client';

// components/ProfileTabsClient.tsx - Client Component for tab switching
import React, { useState } from 'react';
import './ProfileTabs.css';

interface ProfileTabsClientProps {
  defaultTab: string;
  isPublicView: boolean;
}

const ProfileTabsClient: React.FC<ProfileTabsClientProps> = ({
  defaultTab,
  isPublicView,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'work-history', label: 'Work History', icon: '💼' },
    { id: 'portfolio', label: 'Portfolio', icon: '🎨' },
    ...(isPublicView
      ? []
      : [{ id: 'settings', label: 'Settings', icon: '⚙️' }]),
  ];

  return (
    <div className="profile-tabs__nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`profile-tabs__nav-item ${
            activeTab === tab.id ? 'profile-tabs__nav-item--active' : ''
          }`}
        >
          <span className="profile-tabs__nav-icon">{tab.icon}</span>
          <span className="profile-tabs__nav-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ProfileTabsClient;
