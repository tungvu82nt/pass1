/**
 * useLoadingState Hook
 * Tách riêng loading state management để tái sử dụng
 * 
 * Features:
 * - Centralized loading state
 * - Error handling
 * - Operation wrapper
 * - Toast notifications integration
 */

import { useState, useCallback } from 'react';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { logger } from '@/lib/utils/logger';

interface LoadingStateConfig {
  showToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
  logErrors?: boolean;
}

interface UseLoadingStateReturn {
  loading: boolean;
  error: string | null;
  executeOperation: <T>(
    operation: () => Promise<T>,
    config?: LoadingStateConfig
  ) => Promise<T | null>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * Custom hook để quản lý loading state và error handling
 * Refactor: Tách từ usePasswords để tái sử dụng
 * Fixed: Sử dụng config parameter để tránh unused parameter warning
 */
export const useLoadingState = (): UseLoadingStateReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToastNotifications();

  const executeOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    config: LoadingStateConfig = {}
  ): Promise<T | null> => {
    const {
      showToast = true,
      successMessage,
      errorMessage,
      logErrors = true
    } = config;

    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      
      // Show success toast if configured
      if (showToast && successMessage) {
        showSuccess(successMessage);
      }
      
      return result;
    } catch (err) {
      const finalErrorMessage = errorMessage || 
        (err instanceof Error ? err.message : 'Có lỗi xảy ra');
      
      setError(finalErrorMessage);
      
      // Log error if enabled
      if (logErrors) {
        logger.error('Operation failed in useLoadingState', err as Error);
      }
      
      // Show error toast if enabled
      if (showToast) {
        showError(finalErrorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    executeOperation,
    setError,
    clearError,
  };
};