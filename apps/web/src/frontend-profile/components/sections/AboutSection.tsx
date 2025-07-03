// components/sections/AboutSection.tsx
import React from 'react';
import { UserProfileData } from '../../types/profile.types';
import EditableField from '../common/EditableField';

interface AboutSectionProps {
  user: UserProfileData;
  isOwner: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

const AboutSection: React.FC<AboutSectionProps> = ({
  user,
  isOwner,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}) => {
  const [editData, setEditData] = React.useState({
    bio: user.bio || '',
    location: user.location || '',
    website: user.website || '',
  });

  const handleSave = async () => {
    await onSave(editData);
  };

  return (
    <div className="about-section">
      <div className="section-header">
        <h3>About</h3>
        {isOwner && !isEditing && (
          <button onClick={onEdit} className="btn btn--secondary">
            Edit
          </button>
        )}
      </div>

      <div className="section-content">
        <EditableField
          label="Bio"
          value={isEditing ? editData.bio : user.bio}
          type="textarea"
          isEditing={isEditing}
          onChange={(value) => setEditData({ ...editData, bio: String(value) })}
          placeholder="Tell us about yourself..."
          rows={4}
        />

        <EditableField
          label="Location"
          value={isEditing ? editData.location : user.location}
          type="text"
          isEditing={isEditing}
          onChange={(value) =>
            setEditData({ ...editData, location: String(value) })
          }
          placeholder="Your location"
        />

        <EditableField
          label="Website"
          value={isEditing ? editData.website : user.website}
          type="url"
          isEditing={isEditing}
          onChange={(value) =>
            setEditData({ ...editData, website: String(value) })
          }
          placeholder="Your website URL"
        />

        {isEditing && (
          <div className="section-actions">
            <button onClick={handleSave} className="btn btn--primary">
              Save
            </button>
            <button onClick={onCancel} className="btn btn--secondary">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutSection;
