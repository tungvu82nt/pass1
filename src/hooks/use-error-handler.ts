/**
 * useErrorHandler Hook
 * Centralized error handling với toast notifications
 * 
 * Features:
 * - Consistent error messaging
 * - Toast integration
 * - Error logging
 * - Retry logic support
 */

import { useCallback } from 'react';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { ERROR_MESSAGES } from '@/lib/constants/app-constants';
import { logger } from '@/lib/utils/logger';

/**
 * Error handler configuration
 */
interface ErrorHandlerConfig {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

/**
 * Error handler return type
 */
interface UseErrorHandlerReturn {
  handleError: (error: unknown, config?: ErrorHandlerConfig) => void;
  handleAsyncError: <T>(
    operation: () => Promise<T>,
    config?: ErrorHandlerConfig
  ) => Promise<T | null>;
}

/**
 * Custom hook để xử lý errors một cách nhất quán
 * Updated: Sử dụng useToastNotifications để giảm code duplication
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const { showError } = useToastNotifications();

  /**
   * Xử lý error với configuration options
   */
  const handleError = useCallback((
    error: unknown,
    config: ErrorHandlerConfig = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      fallbackMessage = ERROR_MESSAGES.UNKNOWN_ERROR
    } = config;

    // Log error nếu được enable
    if (logError) {
      logger.error('Error handled by useErrorHandler', error as Error);
    }

    // Hiển thị toast notification nếu được enable
    if (showToast) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : fallbackMessage;

      showError(errorMessage);
    }
  }, [showError]);

  /**
   * Wrapper cho async operations với error handling
   */
  const handleAsyncError = useCallback(async <T>(
    operation: () => Promise<T>,
    config: ErrorHandlerConfig = {}
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      handleError(error, config);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
  };
};