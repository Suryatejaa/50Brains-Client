// components/tabs/OverviewTab.tsx
import React from 'react';
import {
  UserProfileData,
  AnalyticsData,
  ReputationData,
} from '../../types/profile.types';
import SocialLinksSection from '../sections/SocialLinksSection';
import StatsOverviewSection from '../sections/StatsOverviewSection';
import AboutSection from '../sections/AboutSection';
import ContactInfoSection from '../sections/ContactInfoSection';
import RoleInfoEditForm from '../forms/RoleInfoEditForm';
import './OverviewTab.css';
import '../forms/RoleInfoEditForm.css';

interface OverviewTabProps {
  user: UserProfileData;
  analytics?: AnalyticsData | null;
  reputation?: ReputationData | null;
  isOwner: boolean;
  editing: { section: string | null; data: any };
  onStartEditing: (section: string, data: any) => void;
  onUpdateSection: (
    section: string,
    data: any
  ) => Promise<{ success: boolean; error?: string }>;
  onCancelEditing: () => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  user,
  analytics,
  reputation,
  isOwner,
  editing,
  onStartEditing,
  onUpdateSection,
  onCancelEditing,
}) => {
  return (
    <div className="overview-tab">
      <div className="overview-tab__grid">
        {/* About Section */}
        <AboutSection
          user={user}
          isOwner={isOwner}
          isEditing={editing.section === 'about'}
          onEdit={() =>
            onStartEditing('about', {
              bio: user.bio,
              location: user.location,
              website: user.website,
            })
          }
          onSave={async (data) => {
            await onUpdateSection('basicInfo', data);
          }}
          onCancel={onCancelEditing}
        />

        {/* Stats Overview */}
        <StatsOverviewSection
          user={user}
          analytics={analytics}
          reputation={reputation}
        />

        {/* Social Links */}
        <SocialLinksSection
          user={user}
          isOwner={isOwner}
          isEditing={editing.section === 'social'}
          onEdit={() =>
            onStartEditing('social', {
              instagramHandle: user.instagramHandle,
              twitterHandle: user.twitterHandle,
              linkedinHandle: user.linkedinHandle,
              youtubeHandle: user.youtubeHandle,
              website: user.website,
            })
          }
          onSave={async (data) => {
            await onUpdateSection('socialMedia', data);
          }}
          onCancel={onCancelEditing}
        />

        {/* Contact Information */}
        <ContactInfoSection
          user={user}
          isOwner={isOwner}
          isEditing={editing.section === 'contact'}
          onEdit={() =>
            onStartEditing('contact', {
              email: user.email,
              phone: user.phone,
            })
          }
          onSave={async (data) => {
            await onUpdateSection('basicInfo', data);
          }}
          onCancel={onCancelEditing}
        />

        {/* Role-Specific Information */}
        {user.roles.includes('INFLUENCER') && (
          <div className="overview-tab__role-section">
            <div className="section-header">
              <h3>Influencer Information</h3>
              {isOwner && editing.section !== 'influencerRoleInfo' && (
                <button
                  onClick={() =>
                    onStartEditing('influencerRoleInfo', {
                      primaryNiche: user.primaryNiche,
                      primaryPlatform: user.primaryPlatform,
                      estimatedFollowers: user.estimatedFollowers,
                      contentCategories: user.contentCategories,
                    })
                  }
                  className="btn btn--secondary"
                >
                  Edit
                </button>
              )}
            </div>
            <div className="overview-tab__role-content">
              {editing.section === 'influencerRoleInfo' ? (
                <RoleInfoEditForm
                  role="INFLUENCER"
                  data={editing.data}
                  onSave={async (data) => {
                    await onUpdateSection('influencerRoleInfo', data);
                  }}
                  onCancel={onCancelEditing}
                />
              ) : (
                <>
                  <div className="overview-tab__field">
                    <label>Primary Niche:</label>
                    <span>{user.primaryNiche || 'Not specified'}</span>
                  </div>
                  <div className="overview-tab__field">
                    <label>Primary Platform:</label>
                    <span>{user.primaryPlatform || 'Not specified'}</span>
                  </div>
                  <div className="overview-tab__field">
                    <label>Estimated Followers:</label>
                    <span>
                      {user.estimatedFollowers?.toLocaleString() ||
                        'Not specified'}
                    </span>
                  </div>
                  <div className="overview-tab__field">
                    <label>Content Categories:</label>
                    <div className="overview-tab__tags">
                      {user.contentCategories.map((category, index) => (
                        <span key={index} className="overview-tab__tag">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {user.roles.includes('BRAND') && (
          <div className="overview-tab__role-section">
            <div className="section-header">
              <h3>Brand Information</h3>
              {isOwner && editing.section !== 'brandRoleInfo' && (
                <button
                  onClick={() =>
                    onStartEditing('brandRoleInfo', {
                      companyName: user.companyName,
                      industry: user.industry,
                      companyType: user.companyType,
                      marketingBudget: user.marketingBudget,
                      targetAudience: user.targetAudience,
                      campaignTypes: user.campaignTypes,
                    })
                  }
                  className="btn btn--secondary"
                >
                  Edit
                </button>
              )}
            </div>
            <div className="overview-tab__role-content">
              {editing.section === 'brandRoleInfo' ? (
                <RoleInfoEditForm
                  role="BRAND"
                  data={editing.data}
                  onSave={async (data) => {
                    await onUpdateSection('brandRoleInfo', data);
                  }}
                  onCancel={onCancelEditing}
                />
              ) : (
                <>
                  <div className="overview-tab__field">
                    <label>Company Name:</label>
                    <span>{user.companyName || 'Not specified'}</span>
                  </div>
                  <div className="overview-tab__field">
                    <label>Industry:</label>
                    <span>{user.industry || 'Not specified'}</span>
                  </div>
                  <div className="overview-tab__field">
                    <label>Company Type:</label>
                    <span>{user.companyType || 'Not specified'}</span>
                  </div>
                  <div className="overview-tab__field">
                    <label>Marketing Budget:</label>
                    <span>{user.marketingBudget || 'Not specified'}</span>
                  </div>
                  <div className="overview-tab__field">
                    <label>Target Audience:</label>
                    <div className="overview-tab__tags">
                      {user.targetAudience.map((audience, index) => (
                        <span key={index} className="overview-tab__tag">
                          {audience}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {user.roles.includes('CREW') && (
          <div className="overview-tab__role-section">
            <div className="section-header">
              <h3>Crew Information</h3>
              {isOwner && editing.section !== 'crewRoleInfo' && (
                <button
                  onClick={() =>
                    onStartEditing('crewRoleInfo', {
                      experienceLevel: user.experienceLevel,
                      hourlyRate: user.hourlyRate,
                      availability: user.availability,
                      workStyle: user.workStyle,
                      crewSkills: user.crewSkills,
                      equipmentOwned: user.equipmentOwned,
                      specializations: user.specializations,
                    })
                  }
                  className="btn btn--secondary"
                >
                  Edit
                </button>
              )}
            </div>
            <div className="overview-tab__role-content">
              {editing.section === 'crewRoleInfo' ? (
                <RoleInfoEditForm
                  role="CREW"
                  data={editing.data}
                  onSave={async (data) => {
                    await onUpdateSection('crewRoleInfo', data);
                  }}
                  onCancel={onCancelEditing}
                />
              ) : (
                <>
                  <div className="overview-tab__field">
                    <label>Experience Level:</label>
                    <span>{user.experienceLevel || 'Not specified'}</span>
                  </div>
                  <div className="overview-tab__field">
                    <label>Hourly Rate:</label>
                    <span>
                      {user.hourlyRate
                        ? `$${user.hourlyRate}/hr`
                        : 'Not specified'}
                    </span>
                  </div>
                  <div className="overview-tab__field">
                    <label>Availability:</label>
                    <span>{user.availability || 'Not specified'}</span>
                  </div>
                  <div className="overview-tab__field">
                    <label>Work Style:</label>
                    <span>{user.workStyle || 'Not specified'}</span>
                  </div>
                  <div className="overview-tab__field">
                    <label>Skills:</label>
                    <div className="overview-tab__tags">
                      {user.crewSkills.map((skill, index) => (
                        <span key={index} className="overview-tab__tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="overview-tab__field">
                    <label>Equipment:</label>
                    <div className="overview-tab__tags flex flex-col gap-1">
                      <span className="overview-tab__tag cursor-pointer" onClick={() => {
                        window.location.href = `/equipment`;
                      }}>
                        Manage Equipment ({user.equipmentOwned.length})
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;
