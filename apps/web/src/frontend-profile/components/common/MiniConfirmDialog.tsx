// components/common/MiniConfirmDialog.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  FiLogOut,
  FiPause,
  FiAlertTriangle,
  FiEye,
  FiEyeOff,
  FiHelpCircle,
  FiPlay,
  FiSend,
  FiEyeOff as FiHide,
  FiX,
  FiCheck,
  FiSave,
  FiArchive,
  FiRotateCcw,
  FiShield,
  FiShieldOff,
} from 'react-icons/fi';
import './MiniConfirmDialog.css';

interface MiniConfirmDialogProps {
  isOpen: boolean;
  type:
    | 'logout'
    | 'deactivate'
    | 'delete'
    | 'pause'
    | 'resume'
    | 'publish'
    | 'unpublish'
    | 'cancel'
    | 'close'
    | 'save'
    | 'submit'
    | 'confirm'
    | 'archive'
    | 'restore'
    | 'block'
    | 'unblock';
  onConfirm: (password?: string) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

const MiniConfirmDialog: React.FC<MiniConfirmDialogProps> = ({
  isOpen,
  type,
  onConfirm,
  onCancel,
  loading = false,
  error = null,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Reset password when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setShowPassword(false);
    }
  }, [isOpen]);
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, loading, onCancel]);

  // Configuration for different action types
  const getConfig = () => {
    switch (type) {
      case 'logout':
        return {
          icon: <FiLogOut />,
          title: 'Confirm Logout',
          message:
            'Are you sure you want to logout? You will need to sign in again to access your account.',
          confirmText: 'Logout',
          confirmClass: 'btn--primary',
          iconClass: 'icon--primary',
          requiresPassword: false,
        };
      case 'deactivate':
        return {
          icon: <FiPause />,
          title: 'Deactivate Account',
          message:
            'Your profile will be hidden from other users, but you can reactivate it later by logging in. Please enter your password to confirm.',
          confirmText: 'Deactivate',
          confirmClass: 'btn--warning',
          iconClass: 'icon--warning',
          requiresPassword: true,
        };
      case 'delete':
        return {
          icon: <FiAlertTriangle />,
          title: 'Delete Item',
          message:
            'This action cannot be undone and all related data will be lost forever. Please confirm to proceed.',
          confirmText: 'Delete Forever',
          confirmClass: 'btn--danger',
          iconClass: 'icon--danger',
          requiresPassword: false,
        };
      case 'pause':
        return {
          icon: <FiPause />,
          title: 'Pause Item',
          message:
            'This will temporarily pause the item. You can resume it later.',
          confirmText: 'Pause',
          confirmClass: 'btn--warning',
          iconClass: 'icon--warning',
          requiresPassword: false,
        };
      case 'resume':
        return {
          icon: <FiPlay />,
          title: 'Resume Item',
          message: 'This will reactivate the item and make it active again.',
          confirmText: 'Resume',
          confirmClass: 'btn--primary',
          iconClass: 'icon--primary',
          requiresPassword: false,
        };
      case 'publish':
        return {
          icon: <FiSend />,
          title: 'Publish Item',
          message:
            'This will make the item visible to the public. Are you sure you want to proceed?',
          confirmText: 'Publish',
          confirmClass: 'btn--primary',
          iconClass: 'icon--primary',
          requiresPassword: false,
        };
      case 'unpublish':
        return {
          icon: <FiHide />,
          title: 'Unpublish Item',
          message:
            'This will hide the item from public view. It can be published again later.',
          confirmText: 'Unpublish',
          confirmClass: 'btn--warning',
          iconClass: 'icon--warning',
          requiresPassword: false,
        };
      case 'cancel':
        return {
          icon: <FiX />,
          title: 'Cancel Action',
          message:
            'This will cancel the current action. Any unsaved changes will be lost.',
          confirmText: 'Cancel',
          confirmClass: 'btn--danger',
          iconClass: 'icon--danger',
          requiresPassword: false,
        };
      case 'close':
        return {
          icon: <FiX />,
          title: 'Close Item',
          message:
            'This will close the item. Are you sure you want to proceed?',
          confirmText: 'Close',
          confirmClass: 'btn--warning',
          iconClass: 'icon--warning',
          requiresPassword: false,
        };
      case 'save':
        return {
          icon: <FiSave />,
          title: 'Save Changes',
          message: 'This will save all your changes. Do you want to continue?',
          confirmText: 'Save',
          confirmClass: 'btn--primary',
          iconClass: 'icon--primary',
          requiresPassword: false,
        };
      case 'submit':
        return {
          icon: <FiSend />,
          title: 'Submit Form',
          message:
            'This will submit the form. Please review your information before proceeding.',
          confirmText: 'Submit',
          confirmClass: 'btn--primary',
          iconClass: 'icon--primary',
          requiresPassword: false,
        };
      case 'confirm':
        return {
          icon: <FiCheck />,
          title: 'Confirm Action',
          message: 'Please confirm that you want to proceed with this action.',
          confirmText: 'Confirm',
          confirmClass: 'btn--primary',
          iconClass: 'icon--primary',
          requiresPassword: false,
        };
      case 'archive':
        return {
          icon: <FiArchive />,
          title: 'Archive Item',
          message:
            'This will move the item to archives. It can be restored later.',
          confirmText: 'Archive',
          confirmClass: 'btn--warning',
          iconClass: 'icon--warning',
          requiresPassword: false,
        };
      case 'restore':
        return {
          icon: <FiRotateCcw />,
          title: 'Restore Item',
          message:
            'This will restore the item from archives and make it active again.',
          confirmText: 'Restore',
          confirmClass: 'btn--primary',
          iconClass: 'icon--primary',
          requiresPassword: false,
        };
      case 'block':
        return {
          icon: <FiShield />,
          title: 'Block Item',
          message:
            'This will block the item. This action can be reversed later.',
          confirmText: 'Block',
          confirmClass: 'btn--danger',
          iconClass: 'icon--danger',
          requiresPassword: false,
        };
      case 'unblock':
        return {
          icon: <FiShieldOff />,
          title: 'Unblock Item',
          message: 'This will unblock the item and restore normal access.',
          confirmText: 'Unblock',
          confirmClass: 'btn--primary',
          iconClass: 'icon--primary',
          requiresPassword: false,
        };
      default:
        return {
          icon: <FiHelpCircle />,
          title: 'Confirm Action',
          message: 'Are you sure you want to proceed?',
          confirmText: 'Confirm',
          confirmClass: 'btn--primary',
          iconClass: 'icon--primary',
          requiresPassword: false,
        };
    }
  };

  if (!isOpen) return null;

  const config = getConfig();

  return (
    <div
      className="mini-confirm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mini-confirm-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div className="mini-confirm-dialog">
        <div className={`mini-confirm-icon`}>{config.icon}</div>

        <div className="mini-confirm-content">
          <h3 id="mini-confirm-title" className="mini-confirm-title">
            {config.title}
          </h3>
          <p className="mini-confirm-message">{config.message}</p>

          {error && (
            <div className="mini-confirm-error">
              <p className="error-message">{error}</p>
            </div>
          )}

          {config.requiresPassword && (
            <div className="mini-confirm-password">
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="password-input"
                  disabled={loading}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && password.trim() && !loading) {
                      onConfirm(password);
                    }
                  }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mini-confirm-actions">
          <button
            className="btn btn--secondary mini-confirm-btn"
            onClick={onCancel}
            disabled={loading}
            type="button"
          >
            Cancel
          </button>
          <button
            className={`btn ${config.confirmClass} mini-confirm-btn`}
            onClick={() =>
              onConfirm(config.requiresPassword ? password : undefined)
            }
            disabled={loading || (config.requiresPassword && !password.trim())}
            type="button"
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Processing...
              </>
            ) : (
              config.confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniConfirmDialog;
