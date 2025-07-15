// components/sections/ContactInfoSection.tsx
'use client';

import React from 'react';
import { UserProfileData } from '../../types/profile.types';
import EditableField from '../common/EditableField';

interface ContactInfoSectionProps {
  user: UserProfileData;
  isOwner: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
  user,
  isOwner,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}) => {
  const [editData, setEditData] = React.useState({
    email: user.email || '',
    phone: user.phone || '',
  });

  // Update editData when user data changes or when entering edit mode
  React.useEffect(() => {
    setEditData({
      email: user.email || '',
      phone: user.phone || '',
    });
  }, [user.email, user.phone, isEditing]);

  const handleSave = async () => {
    await onSave(editData);
  };

  const handleCancel = () => {
    // Reset edit data to current user data
    setEditData({
      email: user.email || '',
      phone: user.phone || '',
    });
    onCancel();
  };

  return (
    <div className="contact-info-section">
      <div className="section-header">
        <h3>Contact Information</h3>
        {isOwner && !isEditing && (
          <button onClick={onEdit} className="btn btn--secondary">
            Edit
          </button>
        )}
      </div>

      <div className="section-content">
        <EditableField
          label="Email"
          value={isEditing ? editData.email : user.email}
          type="email"
          isEditing={isEditing}
          onChange={(value) =>
            setEditData({ ...editData, email: String(value) })
          }
          placeholder="your.email@example.com"
        />

        <EditableField
          label="Phone"
          value={isEditing ? editData.phone : user.phone}
          type="tel"
          isEditing={isEditing}
          onChange={(value) =>
            setEditData({ ...editData, phone: String(value) })
          }
          placeholder="+1 (555) 123-4567"
        />

        {isEditing && (
          <div className="section-actions">
            <button onClick={handleSave} className="btn btn--primary">
              Save
            </button>
            <button onClick={handleCancel} className="btn btn--secondary">
              Cancel
            </button>
          </div>
        )}

        {!isOwner && (
          <div className="contact-actions">
            <button className="btn btn--primary">📧 Send Message</button>
            <button className="btn btn--secondary">📞 Contact</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactInfoSection;
