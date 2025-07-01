'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@50brains/shared-types';
import { useAPI } from './api-provider';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const api = useAPI();

  const login = async (email: string, password: string) => {
    try {
      // With cookie-based auth, login will automatically set the cookie
      const result = await api.auth.login({ email, password });

      // Get user data after successful login
      const currentUser = await api.auth.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Backend will clear the auth cookie
      await api.auth.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
    }
  };

  const register = async (userData: any) => {
    try {
      await api.auth.register(userData);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    // With cookie-based auth, try to get current user to check if authenticated
    api.auth
      .getCurrentUser()
      .then(setUser)
      .catch(() => {
        // Not authenticated or session expired
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [api]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
