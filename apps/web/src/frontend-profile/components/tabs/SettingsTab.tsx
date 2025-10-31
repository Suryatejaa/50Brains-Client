// components/tabs/SettingsTab.tsx
'use client';

import React, { useState } from 'react';
import { UserProfileData } from '../../types/profile.types';
import EditableField from '../common/EditableField';
import MiniConfirmDialog from '../common/MiniConfirmDialog';
import { useAuth } from '@/hooks/useAuth';
import { useAccountActions } from '@/hooks/useAccountActions';
import { OtpVerificationModal } from '@/components/auth/OtpVerificationModal';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../services/apiClient';

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
  const {
    logout,
    deactivateAccount,
    deleteAccount,
    isLoading,
    changePassword,
    sendEmailVerificationOtp,
    verifyEmailOtp,
  } = useAuth();
  const { isLoading: accountActionsLoading, error: accountError } =
    useAccountActions();
  console.log('User in SettingsTab:', user);
  // Dialog state management
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'logout' | 'deactivate' | 'delete' | null;
    loading: boolean;
    error: string | null;
  }>({
    isOpen: false,
    type: null,
    loading: false,
    error: null,
  });
  const router = useRouter();
  // Password change state
  const [passwordChange, setPasswordChange] = useState({
    isOpen: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    error: '',
    success: '',
    loading: false,
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    fieldErrors: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Email verification state
  const [emailVerification, setEmailVerification] = useState({
    isOpen: false,
    loading: false,
    error: '',
  });

  // Username update state
  const [usernameUpdate, setUsernameUpdate] = useState({
    loading: false,
    error: '',
    success: '',
  });

  // Email update state
  const [emailUpdate, setEmailUpdate] = useState({
    isOpen: false,
    step: 'initiate' as 'initiate' | 'verify',
    newEmail: '',
    loading: false,
    error: '',
    success: '',
  });

  // Account section loading
  const [accountLoading, setAccountLoading] = useState(false);

  const openDialog = (type: 'logout' | 'deactivate' | 'delete') => {
    setConfirmDialog({
      isOpen: true,
      type,
      loading: false,
      error: null,
    });
  };

  const closeDialog = () => {
    if (!confirmDialog.loading) {
      setConfirmDialog({
        isOpen: false,
        type: null,
        loading: false,
        error: null,
      });
    }
  };

  const handleConfirmAction = async (password?: string) => {
    setConfirmDialog((prev) => ({ ...prev, loading: true }));

    try {
      let success = false;

      switch (confirmDialog.type) {
        case 'logout':
          await logout();
          success = true;
          router.push('/login');
          break;
        case 'deactivate':
          if (!password) {
            setConfirmDialog((prev) => ({ ...prev, loading: false }));
            return;
          }
          success = await deactivateAccount(password);
          break;
        case 'delete':
          if (!password) {
            setConfirmDialog((prev) => ({ ...prev, loading: false }));
            return;
          }
          success = await deleteAccount(password);
          break;
      }

      console.log(`result of ${confirmDialog.type}:`, success);
      if (success) {
        closeDialog();
      } else {
        setConfirmDialog((prev) => ({
          ...prev,
          loading: false,
          error: 'Operation failed. Please try again.',
        }));
      }
    } catch (error: any) {
      console.error(`Failed to ${confirmDialog.type} account:`, error);
      console.log('🔍 Error object structure:', {
        message: error?.message,
        error: error?.error,
        statusCode: error?.statusCode,
        status: error?.status,
        details: error?.details,
        fullError: error,
      });

      // Extract error message from various possible structures
      const errorMessage =
        error?.error || // API error field
        error?.message || // Standard error message
        error?.data?.message || // Nested API response
        error?.response?.data?.message || // Axios-style response
        `Failed to ${confirmDialog.type} account. Please try again.`;

      console.log('📝 Final error message to display:', errorMessage);
      setConfirmDialog((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

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

  const handleUsernameUpdate = async () => {
    const newUsername = editing.data.username;

    if (!newUsername || newUsername === user.username) {
      setUsernameUpdate({
        loading: false,
        error: 'Please enter a different username',
        success: '',
      });
      return;
    }

    if (!canChangeUsername) {
      setUsernameUpdate({
        loading: false,
        error: `Username can be changed in ${getDaysUntilUsernameChange()} more days`,
        success: '',
      });
      return;
    }

    try {
      setUsernameUpdate({ loading: true, error: '', success: '' });
      const response = await apiClient.put('/api/auth/update/username', {
        username: newUsername.trim(),
      });

      if (response.success) {
        setUsernameUpdate({
          loading: false,
          error: '',
          success: 'Username updated successfully!',
        });
        // Update the editing data to reflect the change
        editing.data.username = newUsername;
        // Refresh profile data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setUsernameUpdate({
          loading: false,
          error: response.message || 'Failed to update username',
          success: '',
        });
      }
    } catch (error: any) {
      console.error('Username update error:', error);
      const errorMessage =
        error?.message || error?.error || 'Failed to update username';
      setUsernameUpdate({
        loading: false,
        error: errorMessage,
        success: '',
      });
    }
  };

  const handleEmailUpdateInitiate = async () => {
    const newEmail = editing.data.email;

    if (!newEmail || newEmail === user.email) {
      setEmailUpdate((prev) => ({
        ...prev,
        error: 'Please enter a different email address',
      }));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailUpdate((prev) => ({
        ...prev,
        error: 'Please enter a valid email address',
      }));
      return;
    }

    try {
      setEmailUpdate((prev) => ({ ...prev, loading: true, error: '' }));
      const response = await apiClient.post('/api/auth/update/email-initiate', {
        newEmail: newEmail.trim(),
      });

      if (response.success) {
        setEmailUpdate({
          isOpen: true,
          step: 'verify',
          newEmail: newEmail.trim(),
          loading: false,
          error: '',
          success: '',
        });
      } else {
        setEmailUpdate((prev) => ({
          ...prev,
          loading: false,
          error: response.message || 'Failed to initiate email update',
        }));
      }
    } catch (error: any) {
      console.error('Email update initiate error:', error);
      const errorMessage =
        error?.message || error?.error || 'Failed to initiate email update';
      setEmailUpdate((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  const handleEmailUpdateComplete = async (otp: string) => {
    try {
      const response = await apiClient.post('/api/auth/update/email-complete', {
        newEmail: emailUpdate.newEmail,
        otp: otp,
      });

      if (response.success) {
        setEmailUpdate({
          isOpen: false,
          step: 'initiate',
          newEmail: '',
          loading: false,
          error: '',
          success: 'Email updated successfully!',
        });
        // Update the editing data to reflect the change
        editing.data.email = emailUpdate.newEmail;
        // Refresh profile data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error(response.message || 'Failed to complete email update');
      }
    } catch (error: any) {
      console.error('Email update complete error:', error);
      throw new Error(
        error?.message || error?.error || 'Failed to verify email update'
      );
    }
  };

  const handleEmailUpdateResend = async () => {
    try {
      await apiClient.post('/api/auth/update/email-initiate', {
        newEmail: emailUpdate.newEmail,
      });
    } catch (error: any) {
      throw new Error(
        error?.message || error?.error || 'Failed to resend verification code'
      );
    }
  };

  const handleEmailUpdateCancel = () => {
    setEmailUpdate({
      isOpen: false,
      step: 'initiate',
      newEmail: '',
      loading: false,
      error: '',
      success: '',
    });
  };

  const handleSave = async (section: string, data: any) => {
    // This function is now only used for non-account sections
    const result = await onUpdateSection('basicInfo', { [section]: data });
    if (!result.success) {
      console.error(`Failed to update ${section}:`, result.error);
    }
  };

  // Password validation functions
  const validatePassword = (password: string) => {
    if (password.length === 0) return '';

    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[@$!%*?&]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChars) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }

    return '';
  };

  const validateConfirmPassword = (
    newPassword: string,
    confirmPassword: string
  ) => {
    if (confirmPassword.length === 0) return '';

    if (newPassword !== confirmPassword) {
      return 'Passwords do not match';
    }

    return '';
  };

  const updatePasswordField = (field: string, value: string) => {
    setPasswordChange((prev) => {
      const updated = { ...prev, [field]: value };

      // Validate fields in real-time
      const fieldErrors = { ...prev.fieldErrors };

      if (field === 'newPassword') {
        fieldErrors.newPassword = validatePassword(value);
        // Also revalidate confirm password if it has a value
        if (updated.confirmPassword) {
          fieldErrors.confirmPassword = validateConfirmPassword(
            value,
            updated.confirmPassword
          );
        }
      } else if (field === 'confirmPassword') {
        fieldErrors.confirmPassword = validateConfirmPassword(
          updated.newPassword,
          value
        );
      }

      return { ...updated, fieldErrors };
    });
  };

  // Password Change Functions
  const handlePasswordChangeStart = () => {
    setPasswordChange({
      isOpen: true,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      error: '',
      success: '',
      loading: false,
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      fieldErrors: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
    });
  };

  const handlePasswordChangeSubmit = async () => {
    // Validate all fields and update errors
    const fieldErrors = {
      currentPassword: !passwordChange.currentPassword
        ? 'Current password is required'
        : '',
      newPassword: validatePassword(passwordChange.newPassword),
      confirmPassword: validateConfirmPassword(
        passwordChange.newPassword,
        passwordChange.confirmPassword
      ),
    };

    // Check if there are any errors
    const hasErrors = Object.values(fieldErrors).some((error) => error !== '');

    if (
      hasErrors ||
      !passwordChange.currentPassword ||
      !passwordChange.newPassword ||
      !passwordChange.confirmPassword
    ) {
      setPasswordChange((prev) => ({
        ...prev,
        fieldErrors,
        error: hasErrors
          ? 'Please fix the errors above'
          : 'Please fill in all password fields',
      }));
      return;
    }

    try {
      setPasswordChange((prev) => ({
        ...prev,
        loading: true,
        error: '',
        fieldErrors: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        },
      }));

      await changePassword({
        currentPassword: passwordChange.currentPassword,
        newPassword: passwordChange.newPassword,
      });

      // Success - show success message first, then close modal after delay
      setPasswordChange({
        isOpen: true,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        error: '',
        success: 'Password changed successfully!',
        loading: false,
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false,
        fieldErrors: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        },
      });

      // Close modal after showing success message
      setTimeout(() => {
        setPasswordChange({
          isOpen: false,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          error: '',
          success: '',
          loading: false,
          showCurrentPassword: false,
          showNewPassword: false,
          showConfirmPassword: false,
          fieldErrors: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          },
        });
      }, 2000);
    } catch (error: any) {
      setPasswordChange((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to change password',
      }));
    }
  };

  const handlePasswordChangeCancel = () => {
    setPasswordChange({
      isOpen: false,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      error: '',
      success: '',
      loading: false,
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      fieldErrors: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
    });
  };

  // Email Verification Functions
  const handleEmailVerificationStart = async () => {
    try {
      setEmailVerification({ isOpen: false, loading: true, error: '' });
      const response = await sendEmailVerificationOtp();
      console.log('Email verification OTP sent response:', response);

      // Check if the response indicates success
      if (response && (response.otpSent || response.message)) {
        setEmailVerification({ isOpen: true, loading: false, error: '' });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      setEmailVerification({
        isOpen: false,
        loading: false,
        error: error.message || 'Failed to send verification code',
      });
    }
  };

  const handleEmailVerificationComplete = async (otp: string) => {
    try {
      await verifyEmailOtp({ otp });
      setEmailVerification({ isOpen: false, loading: false, error: '' });
      // Refresh user data to show verified status
      window.location.reload(); // Simple refresh, you might want to use a more elegant state update
    } catch (error: any) {
      throw new Error(error.message || 'Failed to verify email');
    }
  };

  const handleEmailVerificationResend = async () => {
    try {
      await sendEmailVerificationOtp();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend verification code');
    }
  };

  // Calculate days until username can be changed
  const getDaysUntilUsernameChange = () => {
    if (!user.lastUsernameUpdated) return 0;

    const lastUpdate = new Date(user.lastUsernameUpdated);
    const now = new Date();
    const daysSinceUpdate = Math.floor(
      (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysRemaining = 15 - daysSinceUpdate;

    return Math.max(0, daysRemaining);
  };

  const canChangeUsername = getDaysUntilUsernameChange() === 0;

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
            {/* Email Section */}
            <div className="mb-4">
              <EditableField
                label="Email"
                value={editing.data.email}
                type="email"
                isEditing={true}
                onChange={(value) => {
                  editing.data.email = value;
                  // Clear previous messages when user types
                  setEmailUpdate((prev) => ({
                    ...prev,
                    error: '',
                    success: '',
                  }));
                }}
              />
              {emailUpdate.error && (
                <p className="mt-1 text-sm text-red-600">
                  ❌ {emailUpdate.error}
                </p>
              )}
              {emailUpdate.success && (
                <p className="mt-1 text-sm text-green-600">
                  ✅ {emailUpdate.success}
                </p>
              )}
              <div className="mt-2">
                <button
                  onClick={handleEmailUpdateInitiate}
                  disabled={
                    emailUpdate.loading ||
                    !editing.data.email ||
                    editing.data.email === user.email
                  }
                  className="btn btn--primary btn--sm"
                >
                  {emailUpdate.loading ? (
                    <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Sending OTP...
                    </div>
                  ) : (
                    'Update Email'
                  )}
                </button>
              </div>
            </div>

            {/* Username Section */}
            <div className="mb-4">
              <EditableField
                label="Username"
                value={editing.data.username}
                type="text"
                disabled={!canChangeUsername}
                isEditing={canChangeUsername}
                onChange={(value) => {
                  if (canChangeUsername) {
                    editing.data.username = value;
                    // Clear previous messages when user types
                    setUsernameUpdate({
                      loading: false,
                      error: '',
                      success: '',
                    });
                  }
                }}
              />
              {!canChangeUsername && (
                <p className="mt-1 text-sm text-amber-600">
                  ⚠️ Username can be changed in {getDaysUntilUsernameChange()}{' '}
                  more days
                </p>
              )}
              {canChangeUsername && (
                <p className="mt-1 text-sm text-gray-500">
                  💡 Username can only be changed once every 15 days
                </p>
              )}
              {usernameUpdate.error && (
                <p className="mt-1 text-sm text-red-600">
                  ❌ {usernameUpdate.error}
                </p>
              )}
              {usernameUpdate.success && (
                <p className="mt-1 text-sm text-green-600">
                  ✅ {usernameUpdate.success}
                </p>
              )}
              <div className="mt-2">
                <button
                  onClick={handleUsernameUpdate}
                  disabled={
                    usernameUpdate.loading ||
                    !canChangeUsername ||
                    !editing.data.username ||
                    editing.data.username === user.username
                  }
                  className="btn btn--primary btn--sm"
                >
                  {usernameUpdate.loading ? (
                    <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update Username'
                  )}
                </button>
              </div>
            </div>

            <div className="settings-edit__actions">
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
              {!canChangeUsername && user.lastUsernameUpdated && (
                <small className="mt-1 block text-amber-600">
                  Can be changed in {getDaysUntilUsernameChange()} days
                </small>
              )}
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
              {!user.emailVerified && (
                <button
                  onClick={handleEmailVerificationStart}
                  disabled={emailVerification.loading}
                  className="btn btn--sm btn--primary"
                  style={{ marginLeft: '12px' }}
                >
                  {emailVerification.loading ? 'Sending...' : 'Verify Email'}
                </button>
              )}
            </div>
            {emailVerification.error && (
              <div
                className="error-message"
                style={{ marginTop: '8px', color: '#dc2626' }}
              >
                {emailVerification.error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Password Change Section */}
      <div className="settings-section">
        <div className="settings-section__header">
          <h4>Security</h4>
        </div>
        <div className="settings-content">
          <div className="settings-field">
            <label>Password:</label>
            <span>••••••••</span>
            <button
              onClick={handlePasswordChangeStart}
              disabled={passwordChange.loading}
              className="btn btn--secondary"
              style={{ marginLeft: '12px' }}
            >
              Change Password
            </button>
          </div>
        </div>
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
        <div className="settings-content">
          <button
            className="btn btn--danger"
            onClick={() => openDialog('logout')}
            disabled={isLoading}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-section settings-section--danger">
        <div className="settings-content">
          <div className="danger-actions">
            <button
              className="btn btn--danger"
              onClick={() => openDialog('deactivate')}
              disabled={accountActionsLoading}
            >
              {accountActionsLoading && confirmDialog.type === 'deactivate'
                ? 'Processing...'
                : 'Deactivate Account'}
            </button>
            <button
              className="btn btn--danger"
              onClick={() => openDialog('delete')}
              disabled={accountActionsLoading}
            >
              {accountActionsLoading && confirmDialog.type === 'delete'
                ? 'Processing...'
                : 'Delete Account'}
            </button>
          </div>

          {accountError && (
            <div
              className="error-message"
              style={{
                marginTop: '12px',
                padding: '8px',
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                color: '#dc2626',
              }}
            >
              {accountError}
            </div>
          )}
        </div>
      </div>

      {/* Mini Confirm Dialog */}
      <MiniConfirmDialog
        isOpen={confirmDialog.isOpen}
        type={confirmDialog.type || 'logout'}
        onConfirm={handleConfirmAction}
        onCancel={closeDialog}
        loading={confirmDialog.loading}
        error={confirmDialog.error}
      />

      {/* Password Change Modal */}
      {passwordChange.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Change Password
            </h3>

            {passwordChange.error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">{passwordChange.error}</p>
              </div>
            )}

            {passwordChange.success && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-sm text-green-600">
                  ✅ {passwordChange.success}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={
                      passwordChange.showCurrentPassword ? 'text' : 'password'
                    }
                    value={passwordChange.currentPassword}
                    onChange={(e) =>
                      setPasswordChange((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                        fieldErrors: {
                          ...prev.fieldErrors,
                          currentPassword: '',
                        },
                      }))
                    }
                    className={`w-full rounded-md border px-3 py-2 pr-10 focus:outline-none focus:ring-2 ${
                      passwordChange.fieldErrors.currentPassword
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPasswordChange((prev) => ({
                        ...prev,
                        showCurrentPassword: !prev.showCurrentPassword,
                      }))
                    }
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {passwordChange.showCurrentPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordChange.fieldErrors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {passwordChange.fieldErrors.currentPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={passwordChange.showNewPassword ? 'text' : 'password'}
                    value={passwordChange.newPassword}
                    onChange={(e) =>
                      updatePasswordField('newPassword', e.target.value)
                    }
                    className={`w-full rounded-md border px-3 py-2 pr-10 focus:outline-none focus:ring-2 ${
                      passwordChange.fieldErrors.newPassword
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPasswordChange((prev) => ({
                        ...prev,
                        showNewPassword: !prev.showNewPassword,
                      }))
                    }
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {passwordChange.showNewPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordChange.fieldErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {passwordChange.fieldErrors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={
                      passwordChange.showConfirmPassword ? 'text' : 'password'
                    }
                    value={passwordChange.confirmPassword}
                    onChange={(e) =>
                      updatePasswordField('confirmPassword', e.target.value)
                    }
                    className={`w-full rounded-md border px-3 py-2 pr-10 focus:outline-none focus:ring-2 ${
                      passwordChange.fieldErrors.confirmPassword
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPasswordChange((prev) => ({
                        ...prev,
                        showConfirmPassword: !prev.showConfirmPassword,
                      }))
                    }
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {passwordChange.showConfirmPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordChange.fieldErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {passwordChange.fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Password must be at least 8 characters with uppercase, lowercase,
              number, and special character
            </p>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={handlePasswordChangeSubmit}
                disabled={passwordChange.loading || passwordChange.success}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {passwordChange.loading ? (
                  <div className="flex items-center justify-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Changing...
                  </div>
                ) : passwordChange.success ? (
                  'Success!'
                ) : (
                  'Change Password'
                )}
              </button>
              <button
                onClick={handlePasswordChangeCancel}
                disabled={passwordChange.loading}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {passwordChange.success ? 'Close' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Verification Modal */}
      <OtpVerificationModal
        isOpen={emailVerification.isOpen}
        onClose={() =>
          setEmailVerification((prev) => ({ ...prev, isOpen: false }))
        }
        onVerify={handleEmailVerificationComplete}
        onResend={handleEmailVerificationResend}
        email={user.email}
        title="Verify Your Email"
        description="We've sent a verification code to your email address. Enter it below to verify your email."
        error={emailVerification.error}
      />

      {/* Email Update OTP Modal */}
      <OtpVerificationModal
        isOpen={emailUpdate.isOpen}
        onClose={handleEmailUpdateCancel}
        onVerify={handleEmailUpdateComplete}
        onResend={handleEmailUpdateResend}
        email={emailUpdate.newEmail}
        title="Verify Email Update"
        description={`We've sent a verification code to ${emailUpdate.newEmail}. Enter it below to complete your email update.`}
        error={emailUpdate.error}
      />
    </div>
  );
};

export default SettingsTab;
