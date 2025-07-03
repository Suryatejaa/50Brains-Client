// components/ProfileTabs.tsx
import React, { useState } from 'react'
import { CompleteProfileData } from '../types/profile.types'
import OverviewTab from './tabs/OverviewTab'
import WorkHistoryTab from './tabs/WorkHistoryTab'
import PortfolioTab from './tabs/PortfolioTab'
import SettingsTab from './tabs/SettingsTab'
import './ProfileTabs.css'

interface ProfileTabsProps {
  profile: CompleteProfileData
  isOwner: boolean
  editing: { section: string | null; data: any }
  onStartEditing: (section: string, data: any) => void
  onUpdateSection: (section: string, data: any) => Promise<{ success: boolean; error?: string }>
  onCancelEditing: () => void
  onRefreshSection: (section: 'workHistory' | 'analytics' | 'reputation') => Promise<void>
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  profile,
  isOwner,
  editing,
  onStartEditing,
  onUpdateSection,
  onCancelEditing,
  onRefreshSection
}) => {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'work-history', label: 'Work History', icon: '💼' },
    { id: 'portfolio', label: 'Portfolio', icon: '🎨' },
    ...(isOwner ? [{ id: 'settings', label: 'Settings', icon: '⚙️' }] : [])
  ]

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
        )
      
      case 'work-history':
        return (
          <WorkHistoryTab
            user={profile.user}
            workHistory={profile.workHistory}
            isOwner={isOwner}
            onRefresh={() => onRefreshSection('workHistory')}
          />
        )
      
      case 'portfolio':
        return (
          <PortfolioTab
            user={profile.user}
            workHistory={profile.workHistory}
            isOwner={isOwner}
          />
        )
      
      case 'settings':
        return isOwner ? (
          <SettingsTab
            user={profile.user}
            editing={editing}
            onStartEditing={onStartEditing}
            onUpdateSection={onUpdateSection}
            onCancelEditing={onCancelEditing}
          />
        ) : null
      
      default:
        return <div>Tab not found</div>
    }
  }

  return (
    <div className="profile-tabs">
      {/* Tab Navigation */}
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

      {/* Tab Content */}
      <div className="profile-tabs__content">
        {renderTabContent()}
      </div>
    </div>
  )
}

export default ProfileTabs
