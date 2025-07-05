// components/sections/SocialLinksSection.tsx
import React from 'react';
import { UserProfileData } from '../../types/profile.types';
import EditableField from '../common/EditableField';

interface SocialLinksSectionProps {
  user: UserProfileData;
  isOwner: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

const SocialLinksSection: React.FC<SocialLinksSectionProps> = ({
  user,
  isOwner,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}) => {
  const [editData, setEditData] = React.useState({
    instagramHandle: user.instagramHandle || '',
    twitterHandle: user.twitterHandle || '',
    linkedinHandle: user.linkedinHandle || '',
    youtubeHandle: user.youtubeHandle || '',
    website: user.website || '',
  });

  // Update editData when user data changes or when entering edit mode
  React.useEffect(() => {
    // Update the state whenever user data changes, regardless of edit mode
    console.log('🔄 Updating social links edit data (user data changed):', {
      instagramHandle: user.instagramHandle,
      twitterHandle: user.twitterHandle,
      linkedinHandle: user.linkedinHandle,
      youtubeHandle: user.youtubeHandle,
      website: user.website,
    });
    setEditData({
      instagramHandle: user.instagramHandle || '',
      twitterHandle: user.twitterHandle || '',
      linkedinHandle: user.linkedinHandle || '',
      youtubeHandle: user.youtubeHandle || '',
      website: user.website || '',
    });
  }, [
    user.instagramHandle,
    user.twitterHandle,
    user.linkedinHandle,
    user.youtubeHandle,
    user.website,
  ]);

  // Debug user data changes
  React.useEffect(() => {
    console.log('👤 User social data changed:', {
      instagramHandle: user.instagramHandle,
      twitterHandle: user.twitterHandle,
      linkedinHandle: user.linkedinHandle,
      youtubeHandle: user.youtubeHandle,
      website: user.website,
    });
  }, [
    user.instagramHandle,
    user.twitterHandle,
    user.linkedinHandle,
    user.youtubeHandle,
    user.website,
  ]);

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

  return (
    <div className="social-links-section">
      <div className="section-header">
        <h3>Social Links</h3>
        {isOwner && !isEditing && (
          <button onClick={onEdit} className="btn btn--secondary">
            Edit
          </button>
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
