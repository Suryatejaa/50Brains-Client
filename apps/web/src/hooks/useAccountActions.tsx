// hooks/useAccountActions.tsx
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface UseAccountActionsReturn {
  deactivateAccount: () => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export const useAccountActions = (): UseAccountActionsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deactivateAccount = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/api/account/deactivate');

      if (response.success) {
        // Redirect to login page or show success message
        window.location.href = '/login?message=account-deactivated';
        return true;
      } else {
        setError('Failed to deactivate account');
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Network error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.delete('/api/account');

      if (response.success) {
        // Clear local storage and redirect
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login?message=account-deleted';
        return true;
      } else {
        setError('Failed to delete account');
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Network error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deactivateAccount,
    deleteAccount,
    isLoading,
    error,
  };
};
