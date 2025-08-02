// components/sections/SocialLinksSection.tsx
'use client';

import React from 'react';
import { UserProfileData } from '../../types/profile.types';
import EditableField from '../common/EditableField';
import { apiClient } from '@/lib/api-client';

interface SocialLinksSectionProps {
  user: UserProfileData;
  isOwner: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  onUserUpdate?: (updatedUser: Partial<UserProfileData>) => void;
}

const SocialLinksSection: React.FC<SocialLinksSectionProps> = ({
  user,
  isOwner,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onUserUpdate,
}) => {
  const [editData, setEditData] = React.useState({
    instagramHandle: user.instagramHandle || '',
    twitterHandle: user.twitterHandle || '',
    linkedinHandle: user.linkedinHandle || '',
    youtubeHandle: user.youtubeHandle || '',
    website: user.website || '',
  });

  const [showContact, setShowContact] = React.useState(user.showContact ?? true);
  const [togglingContact, setTogglingContact] = React.useState(false);

  // Update editData when user data changes or when entering edit mode
  React.useEffect(() => {
    // Update the state whenever user data changes, regardless of edit mode
    console.log('🔄 Updating social links edit data (user data changed):', {
      instagramHandle: user.instagramHandle,
      twitterHandle: user.twitterHandle,
      linkedinHandle: user.linkedinHandle,
      youtubeHandle: user.youtubeHandle,
      website: user.website,
      showContact: user.showContact,
    });
    setEditData({
      instagramHandle: user.instagramHandle || '',
      twitterHandle: user.twitterHandle || '',
      linkedinHandle: user.linkedinHandle || '',
      youtubeHandle: user.youtubeHandle || '',
      website: user.website || '',
    });
    setShowContact(user.showContact ?? true);
  }, [
    user.instagramHandle,
    user.twitterHandle,
    user.linkedinHandle,
    user.youtubeHandle,
    user.website,
    user.showContact,
  ]);

  // Debug user data changes
  React.useEffect(() => {
    console.log('👤 User social data changed:', {
      instagramHandle: user.instagramHandle,
      twitterHandle: user.twitterHandle,
      linkedinHandle: user.linkedinHandle,
      youtubeHandle: user.youtubeHandle,
      website: user.website,
      showContact: user.showContact,
    });
  }, [
    user.instagramHandle,
    user.twitterHandle,
    user.linkedinHandle,
    user.youtubeHandle,
    user.website,
    user.showContact,
  ]);

  // Debug toggle state
  React.useEffect(() => {
    console.log('🎨 Toggle state changed - showContact:', showContact, 'translate-x-5:', showContact ? 'translate-x-5' : 'translate-x-0');
  }, [showContact]);

  const handleToggleContact = async () => {
    if (!isOwner) return;

    console.log('🔄 Toggling contact privacy from:', showContact, 'to:', !showContact);
    console.log('🎯 Current showContact value:', showContact);

    // Optimistically update the UI immediately
    const newShowContact = !showContact;
    setShowContact(newShowContact);

    console.log('✅ Updated showContact to:', newShowContact);

    try {
      setTogglingContact(true);
      const response = await apiClient.patch('/api/user/toggle-contact');

      console.log('📡 API Response:', response);

      if (response.success) {
        const responseData = response.data as { showContact: boolean };
        console.log('✅ Contact visibility toggled to:', responseData.showContact);

        // Update local state with server response
        setShowContact(responseData.showContact);

        // Notify parent component about the user update
        if (onUserUpdate) {
          onUserUpdate({ showContact: responseData.showContact });
        }
      } else {
        console.error('❌ Failed to toggle contact visibility:', response);
        // Revert the visual state if API failed
        setShowContact(user.showContact ?? true);
      }
    } catch (error) {
      console.error('❌ Error toggling contact visibility:', error);
      // Revert the visual state if API failed
      setShowContact(user.showContact ?? true);
    } finally {
      setTogglingContact(false);
    }
  };

  const handleSave = async () => {
    console.log('💾 Saving social links data:', editData);
    try {
      await onSave(editData);
      console.log('✅ Social links saved successfully');
    } catch (error) {
      console.error('❌ Failed to save social links:', error);
    }
  };

  const handleCancel = () => {
    // Reset edit data to current user data
    setEditData({
      instagramHandle: user.instagramHandle || '',
      twitterHandle: user.twitterHandle || '',
      linkedinHandle: user.linkedinHandle || '',
      youtubeHandle: user.youtubeHandle || '',
      website: user.website || '',
    });
    onCancel();
  };

  const hasAnySocialLinks =
    user.instagramHandle ||
    user.twitterHandle ||
    user.linkedinHandle ||
    user.youtubeHandle ||
    user.website;

  // Don't show anything if contact is disabled and user is not the owner
  if (!showContact && !isOwner) {
    return null;
  }

  return (
    <div className="social-links-section">
      <div className="section-header">
        <h3>Social Links</h3>
        {isOwner && (
          <div className="flex items-center space-x-2">
            {/* Contact Privacy Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600">Contact Privacy: {showContact ? 'Public' : 'Private'}</span>
              <button
                onClick={handleToggleContact}
                disabled={togglingContact}
                className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${showContact ? 'bg-green-500' : 'bg-gray-300'
                  } ${togglingContact ? 'opacity-50' : ''}`}
              >
                <span
                  className={`absolute h-4 w-4 transform rounded-full bg-white transition-all duration-200 ease-in-out ${showContact ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  style={{
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                    left: showContact ? '20px' : '2px',
                  }}
                />
              </button>
            </div>

            {!isEditing && (
              <button onClick={onEdit} className="btn btn--secondary">
                Edit
              </button>
            )}
          </div>
        )}
      </div>

      <div className="section-content">
        {isEditing ? (
          <>
            <EditableField
              label="Instagram"
              value={editData.instagramHandle}
              type="text"
              isEditing={true}
              onChange={(value) =>
                setEditData({ ...editData, instagramHandle: String(value) })
              }
              placeholder="@username"
            />

            <EditableField
              label="Twitter"
              value={editData.twitterHandle}
              type="text"
              isEditing={true}
              onChange={(value) =>
                setEditData({ ...editData, twitterHandle: String(value) })
              }
              placeholder="@username"
            />

            <EditableField
              label="LinkedIn"
              value={editData.linkedinHandle}
              type="text"
              isEditing={true}
              onChange={(value) =>
                setEditData({ ...editData, linkedinHandle: String(value) })
              }
              placeholder="username"
            />

            <EditableField
              label="YouTube"
              value={editData.youtubeHandle}
              type="text"
              isEditing={true}
              onChange={(value) =>
                setEditData({ ...editData, youtubeHandle: String(value) })
              }
              placeholder="@channel"
            />

            <EditableField
              label="Website"
              value={editData.website}
              type="url"
              isEditing={true}
              onChange={(value) =>
                setEditData({ ...editData, website: String(value) })
              }
              placeholder="https://example.com"
            />

            <div className="section-actions">
              <button onClick={handleSave} className="btn btn--primary">
                Save
              </button>
              <button onClick={handleCancel} className="btn btn--secondary">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            {hasAnySocialLinks ? (
              <div className="social-links">
                {user.instagramHandle && (
                  <a
                    href={`https://instagram.com/${user.instagramHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    📸 Instagram
                  </a>
                )}
                {user.twitterHandle && (
                  <a
                    href={`https://twitter.com/${user.twitterHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    🐦 Twitter
                  </a>
                )}
                {user.linkedinHandle && (
                  <a
                    href={`https://linkedin.com/in/${user.linkedinHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    💼 LinkedIn
                  </a>
                )}
                {user.youtubeHandle && (
                  <a
                    href={`https://youtube.com/${user.youtubeHandle[0] !== '@' ? '@' : ''}${user.youtubeHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    📺 YouTube
                  </a>
                )}
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    🌐 Website
                  </a>
                )}
              </div>
            ) : (
              <p className="no-social-links">No social links added</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SocialLinksSection;
