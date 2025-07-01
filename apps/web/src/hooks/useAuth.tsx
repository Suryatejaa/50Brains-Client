'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, type APIResponse } from '@/lib/api-client';

// Types based on complete API documentation
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  username?: string;
  displayName?: string;
  bio?: string;
  phone?: string;
  location?: string;
  currentRole?: string;
  skills?: string[];
  education?: string[];
  experience?: string[];
  profilePicture?: string;
  role: string; // Updated to match API response
  roles?: UserRole[]; // Keep for backward compatibility
  status:
    | 'PENDING_VERIFICATION'
    | 'ACTIVE'
    | 'INACTIVE'
    | 'SUSPENDED'
    | 'BANNED';
  isEmailVerified: boolean;
  isProfileVerified?: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

type UserRole =
  | 'USER'
  | 'INFLUENCER'
  | 'BRAND'
  | 'CREW'
  | 'MODERATOR'
  | 'ADMIN'
  | 'SUPER_ADMIN';

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  roles?: UserRole[]; // Optional for registration
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  password: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// API Response Types matching backend patterns
interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  message?: string;
}

interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface ForgotPasswordResponse {
  email: string;
  expiresIn: number;
}

interface ResetPasswordResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

// Context interface with additional methods
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (
    userData: RegisterRequest
  ) => Promise<{ user: User; message: string }>;
  logout: () => Promise<void>;
  forgotPassword: (
    data: ForgotPasswordRequest
  ) => Promise<{ message: string; email: string; expiresIn: number }>;
  resetPassword: (
    data: ResetPasswordRequest
  ) => Promise<{ message: string; user: User }>;
  changePassword: (data: ChangePasswordRequest) => Promise<{ message: string }>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
  verifyEmail: (token: string) => Promise<{ message: string }>;
  resendVerification: () => Promise<{
    message: string;
    email: string;
    expiresIn: number;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const clearError = () => {
    setError(null);
  };

  const checkAuthStatus = async () => {
    try {
      setError(null);

      // Don't check auth status on public routes
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const publicRoutes = [
          '/login',
          '/register',
          '/forgot-password',
          '/',
          '/terms',
          '/privacy',
        ];
        const isPublicRoute = publicRoutes.some(
          (route) => currentPath === route || currentPath.startsWith(route)
        );

        if (isPublicRoute) {
          console.log('Skipping auth check for public route:', currentPath);
          setIsLoading(false);
          return;
        }
      }

      if (!apiClient.isAuthenticated()) {
        setIsLoading(false);
        return;
      }

      const response = await apiClient.get<{ user: User }>('/api/auth/me');

      if (response.success) {
        setUser(response.data.user);
      } else {
        // Token is invalid, clear tokens
        apiClient.clearAuthTokens();
        setUser(null);
        // Don't set error on auth check failure
      }
    } catch (error: any) {
      console.error('Auth check failed:', error);
      apiClient.clearAuthTokens();
      setUser(null);
      // Don't set error on initial check to avoid showing error on first load
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setError(null);

      const response = await apiClient.post<{ user: User; message?: string }>(
        '/api/auth/login',
        credentials
      );

      if (response.success) {
        // For cookie-based auth, we don't need to store tokens
        // The server will set auth cookies automatically
        setUser(response.data.user);
        return;
      } else {
        // Handle specific login errors based on API documentation
        const errorMessage =
          response.message || 'Login failed. Please try again.';

        // Map specific error messages to user-friendly messages
        switch (errorMessage) {
          case 'Invalid credentials':
            throw new Error('Email or password is incorrect.');
          case 'Account suspended':
            throw new Error(
              'Your account has been suspended. Contact support.'
            );
          case 'Account locked':
            const lockMessage = response.details?.remainingTime
              ? `Account locked for ${Math.ceil(response.details.remainingTime / 60)} minutes.`
              : 'Account is temporarily locked due to too many failed attempts.';
            throw new Error(lockMessage);
          case 'Validation failed':
            throw new Error('Please check your email and password format.');
          default:
            throw new Error(errorMessage);
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.message ||
        'Unable to sign in. Please check your connection and try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setError(null);

      const response = await apiClient.post<{ user: User; message?: string }>(
        '/api/auth/register',
        userData
      );

      if (response.success) {
        // For cookie-based auth, auto-login after successful registration
        // The server will set auth cookies automatically
        setUser(response.data.user);

        return {
          user: response.data.user,
          message: 'User registered successfully. Please verify your email.',
        };
      } else {
        // Handle specific registration errors
        const errorMessage =
          response.message || 'Registration failed. Please try again.';

        switch (errorMessage) {
          case 'Email already registered':
            throw new Error(
              'An account with this email already exists. Please sign in instead.'
            );
          case 'Validation failed':
            // Handle validation details if available
            if (response.details) {
              const validationErrors = Object.values(response.details).join(
                ', '
              );
              throw new Error(`Please check your input: ${validationErrors}`);
            }
            throw new Error('Please check your input and try again.');
          default:
            throw new Error(errorMessage);
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const forgotPassword = async (data: ForgotPasswordRequest) => {
    try {
      setError(null);

      const response = await apiClient.post<ForgotPasswordResponse>(
        '/api/auth/forgot-password',
        data
      );

      if (response.success) {
        return {
          message: 'Password reset email sent successfully',
          email: response.data.email,
          expiresIn: response.data.expiresIn,
        };
      } else {
        const errorMessage =
          response.message || 'Failed to send reset email. Please try again.';

        switch (errorMessage) {
          case 'User not found':
            throw new Error('No account found with this email address.');
          case 'Rate limit exceeded':
            throw new Error(
              'Too many password reset requests. Please try again later.'
            );
          default:
            throw new Error(errorMessage);
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.message || 'Failed to send reset email. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resetPassword = async (data: ResetPasswordRequest) => {
    try {
      setError(null);

      const response = await apiClient.post<ResetPasswordResponse>(
        '/api/auth/reset-password',
        data
      );

      if (response.success) {
        // Auto-login after successful password reset
        if (response.data.accessToken && response.data.refreshToken) {
          apiClient.setAuthTokens(
            response.data.accessToken,
            response.data.refreshToken
          );
          setUser(response.data.user);
        }

        return {
          message: 'Password reset successfully',
          user: response.data.user,
        };
      } else {
        const errorMessage =
          response.message || 'Failed to reset password. Please try again.';

        switch (errorMessage) {
          case 'Invalid reset token':
            throw new Error(
              'Reset link is invalid or has expired. Please request a new one.'
            );
          case 'Token expired':
            throw new Error(
              'Reset link has expired. Please request a new one.'
            );
          case 'Validation failed':
            if (response.details?.password) {
              throw new Error(response.details.password);
            }
            throw new Error('Password does not meet security requirements.');
          default:
            throw new Error(errorMessage);
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      setError(null);

      // For cookie-based auth, tell server to clear auth cookies
      await apiClient.post('/api/auth/logout').catch(() => {
        // Ignore logout errors - user is logging out anyway
      });
    } finally {
      // Always clear local state
      apiClient.clearAuthTokens();
      setUser(null);
      router.push('/');
    }
  };

  const refreshToken = async () => {
    try {
      setError(null);

      // For cookie-based auth, refresh is handled automatically by the server
      // We just need to make a request to check if our session is still valid
      const response = await apiClient.get<{ user: User }>('/api/auth/me');

      if (response.success) {
        // Update user data if session is still valid
        setUser(response.data.user);
        return;
      } else {
        throw new Error('Session expired');
      }
    } catch (error) {
      // Session expired or refresh failed, logout user
      console.error('Session refresh failed:', error);
      apiClient.clearAuthTokens();
      setUser(null);
      setError('Session expired. Please sign in again.');
      throw error;
    }
  };

  const changePassword = async (data: ChangePasswordRequest) => {
    try {
      setError(null);

      const response = await apiClient.post<{ message: string }>(
        '/api/auth/change-password',
        data
      );

      if (response.success) {
        return {
          message: response.data.message || 'Password changed successfully',
        };
      } else {
        const errorMessage =
          response.message || 'Failed to change password. Please try again.';

        switch (errorMessage) {
          case 'Invalid current password':
            throw new Error('The current password you entered is incorrect.');
          case 'Validation failed':
            if (response.details?.password) {
              throw new Error(response.details.password);
            }
            throw new Error('Password does not meet security requirements.');
          default:
            throw new Error(errorMessage);
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.message || 'Failed to change password. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      setError(null);

      const response = await apiClient.post<{ user: User }>(
        '/api/auth/verify-email',
        { token }
      );

      if (response.success) {
        // Update user data after email verification
        setUser(response.data.user);
        return { message: 'Email verified successfully' };
      } else {
        const errorMessage =
          response.message || 'Failed to verify email. Please try again.';

        switch (errorMessage) {
          case 'Invalid verification token':
            throw new Error('Email verification token is invalid or expired.');
          default:
            throw new Error(errorMessage);
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.message || 'Failed to verify email. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resendVerification = async () => {
    try {
      setError(null);

      const response = await apiClient.post<{
        email: string;
        expiresIn: number;
      }>('/api/auth/resend-verification');

      if (response.success) {
        return {
          message: 'Verification email sent successfully',
          email: response.data.email,
          expiresIn: response.data.expiresIn,
        };
      } else {
        const errorMessage =
          response.message ||
          'Failed to send verification email. Please try again.';

        switch (errorMessage) {
          case 'Email already verified':
            throw new Error('This email address is already verified.');
          case 'Rate limit exceeded':
            throw new Error(
              'Too many verification emails sent. Please wait before requesting another.'
            );
          default:
            throw new Error(errorMessage);
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.message || 'Failed to send verification email. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    refreshToken,
    clearError,
    checkAuthStatus,
    verifyEmail,
    resendVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
