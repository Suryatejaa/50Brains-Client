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
} from 'react-icons/fi';
import './MiniConfirmDialog.css';

interface MiniConfirmDialogProps {
  isOpen: boolean;
  type: 'logout' | 'deactivate' | 'delete';
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
          title: 'Delete Account',
          message:
            'This action cannot be undone and all your data will be lost forever. Please enter your password to confirm.',
          confirmText: 'Delete Forever',
          confirmClass: 'btn--danger',
          iconClass: 'icon--danger',
          requiresPassword: true,
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
