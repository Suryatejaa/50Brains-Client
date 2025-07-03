// components/tabs/SettingsTab.tsx
import React from 'react';
import { UserProfileData } from '../../types/profile.types';
import EditableField from '../common/EditableField';
import { useAuth } from '@/hooks/useAuth';

interface SettingsTabProps {
  user: UserProfileData;
  editing: { section: string | null; data: any };
  onStartEditing: (section: string, data: any) => void;
  onUpdateSection: (
    section: string,
    data: any
  ) => Promise<{ success: boolean; error?: string }>;
  onCancelEditing: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  user,
  editing,
  onStartEditing,
  onUpdateSection,
  onCancelEditing,
}) => {
  const isEditingPrivacy = editing.section === 'privacy';
  const isEditingNotifications = editing.section === 'notifications';
  const isEditingAccount = editing.section === 'account';
  const { logout, isLoading } = useAuth();

  const handlePrivacyEdit = () => {
    onStartEditing('privacy', {
      profileVisibility: 'public', // Would come from user settings
      showEmail: false,
      showPhone: false,
    });
  };

  const handleNotificationsEdit = () => {
    onStartEditing('notifications', {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
    });
  };

  const handleAccountEdit = () => {
    onStartEditing('account', {
      email: user.email,
      username: user.username,
    });
  };

  const handleSave = async (section: string, data: any) => {
    const result = await onUpdateSection('settings', { [section]: data });
    if (!result.success) {
      console.error(`Failed to update ${section}:`, result.error);
    }
  };

  const handleLogout = () => {
    // Implement logout functionality
    logout().catch((error) => {
      console.error('Logout failed:', error);
    });
  };    

  return (
    <div className="settings-tab">
      <h3>Account Settings</h3>

      {/* Account Information */}
      <div className="settings-section">
        <div className="settings-section__header">
          <h4>Account Information</h4>
          {!isEditingAccount && (
            <button onClick={handleAccountEdit} className="btn btn--secondary">
              Edit
            </button>
          )}
        </div>

        {isEditingAccount ? (
          <div className="settings-edit">
            <EditableField
              label="Email"
              value={editing.data.email}
              type="email"
              isEditing={true}
              onChange={(value) => {
                editing.data.email = value;
              }}
            />
            <EditableField
              label="Username"
              value={editing.data.username}
              type="text"
              isEditing={true}
              onChange={(value) => {
                editing.data.username = value;
              }}
            />
            <div className="settings-edit__actions">
              <button
                onClick={() => handleSave('account', editing.data)}
                className="btn btn--primary"
              >
                Save Changes
              </button>
              <button onClick={onCancelEditing} className="btn btn--secondary">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="settings-content">
            <div className="settings-field">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
            <div className="settings-field">
              <label>Username:</label>
              <span>{user.username}</span>
            </div>
            <div className="settings-field">
              <label>Account Status:</label>
              <span
                className={`status ${user.isActive ? 'active' : 'inactive'}`}
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="settings-field">
              <label>Email Verified:</label>
              <span
                className={`verification ${user.emailVerified ? 'verified' : 'unverified'}`}
              >
                {user.emailVerified ? '✓ Verified' : '⚠ Unverified'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Privacy Settings */}
      <div className="settings-section">
        <div className="settings-section__header">
          <h4>Privacy Settings</h4>
          {!isEditingPrivacy && (
            <button onClick={handlePrivacyEdit} className="btn btn--secondary">
              Edit
            </button>
          )}
        </div>

        {isEditingPrivacy ? (
          <div className="settings-edit">
            <div className="settings-field">
              <label>Profile Visibility:</label>
              <select
                value={editing.data.profileVisibility}
                onChange={(e) => {
                  editing.data.profileVisibility = e.target.value;
                }}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="connections">Connections Only</option>
              </select>
            </div>
            <div className="settings-field">
              <label>
                <input
                  type="checkbox"
                  checked={editing.data.showEmail}
                  onChange={(e) => {
                    editing.data.showEmail = e.target.checked;
                  }}
                />
                Show email on profile
              </label>
            </div>
            <div className="settings-field">
              <label>
                <input
                  type="checkbox"
                  checked={editing.data.showPhone}
                  onChange={(e) => {
                    editing.data.showPhone = e.target.checked;
                  }}
                />
                Show phone on profile
              </label>
            </div>
            <div className="settings-edit__actions">
              <button
                onClick={() => handleSave('privacy', editing.data)}
                className="btn btn--primary"
              >
                Save Changes
              </button>
              <button onClick={onCancelEditing} className="btn btn--secondary">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="settings-content">
            <div className="settings-field">
              <label>Profile Visibility:</label>
              <span>Public</span>
            </div>
            <div className="settings-field">
              <label>Email Display:</label>
              <span>Hidden</span>
            </div>
            <div className="settings-field">
              <label>Phone Display:</label>
              <span>Hidden</span>
            </div>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="settings-section">
        <div className="settings-section__header">
          <h4>Notification Settings</h4>
          {!isEditingNotifications && (
            <button
              onClick={handleNotificationsEdit}
              className="btn btn--secondary"
            >
              Edit
            </button>
          )}
        </div>

        {isEditingNotifications ? (
          <div className="settings-edit">
            <div className="settings-field">
              <label>
                <input
                  type="checkbox"
                  checked={editing.data.emailNotifications}
                  onChange={(e) => {
                    editing.data.emailNotifications = e.target.checked;
                  }}
                />
                Email Notifications
              </label>
            </div>
            <div className="settings-field">
              <label>
                <input
                  type="checkbox"
                  checked={editing.data.smsNotifications}
                  onChange={(e) => {
                    editing.data.smsNotifications = e.target.checked;
                  }}
                />
                SMS Notifications
              </label>
            </div>
            <div className="settings-field">
              <label>
                <input
                  type="checkbox"
                  checked={editing.data.marketingEmails}
                  onChange={(e) => {
                    editing.data.marketingEmails = e.target.checked;
                  }}
                />
                Marketing Emails
              </label>
            </div>
            <div className="settings-edit__actions">
              <button
                onClick={() => handleSave('notifications', editing.data)}
                className="btn btn--primary"
              >
                Save Changes
              </button>
              <button onClick={onCancelEditing} className="btn btn--secondary">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="settings-content">
            <div className="settings-field">
              <label>Email Notifications:</label>
              <span>Enabled</span>
            </div>
            <div className="settings-field">
              <label>SMS Notifications:</label>
              <span>Disabled</span>
            </div>
            <div className="settings-field">
              <label>Marketing Emails:</label>
              <span>Disabled</span>
            </div>
          </div>
        )}
      </div>

      {/* Logout Section */}
      <div className="settings-section">
        <h4>Logout</h4>
        <div className="settings-content">
          <button 
            className="btn btn--danger"
            onClick={handleLogout}
            disabled={isLoading}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-section settings-section--danger">
        <h4>Danger Zone</h4>
        <div className="settings-content">
          <div className="danger-actions">
            <button className="btn btn--danger">Deactivate Account</button>
            <button className="btn btn--danger">Delete Account</button>
          </div>
          <p className="danger-warning">
            These actions are irreversible. Please proceed with caution.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
