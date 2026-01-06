/**
 * useToastNotifications Hook - Backward Compatible
 * Đơn giản hóa nhưng vẫn hỗ trợ existing code
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import { UseToastNotificationsReturn, ToastConfig } from '@/lib/types/toast-types';
import { logger } from '@/lib/utils/logger';

/**
 * Hook đơn giản cho toast notifications với backward compatibility
 * Supports both: 
 * - showSuccess("message", { description: "details" })
 * - showSuccess("message", { duration: 5000, action: {...} })
 */
export const useToastNotifications = (): UseToastNotificationsReturn => {
  const showSuccess = useCallback((
    message: string, 
    config: ToastConfig = {}
  ) => {
    // Support both simple description và advanced config
    const toastConfig = typeof config === 'object' && 'description' in config
      ? { description: config.description }
      : config;
      
    toast.success(message, toastConfig);
    logger.debug('Success toast shown', { message });
  }, []);

  const showError = useCallback((
    message: string, 
    config: ToastConfig = {}
  ) => {
    const toastConfig = typeof config === 'object' && 'description' in config
      ? { description: config.description }
      : config;
      
    toast.error(message, toastConfig);
    logger.debug('Error toast shown', { message });
  }, []);

  const showInfo = useCallback((
    message: string, 
    config: ToastConfig = {}
  ) => {
    const toastConfig = typeof config === 'object' && 'description' in config
      ? { description: config.description }
      : config;
      
    toast.info(message, toastConfig);
    logger.debug('Info toast shown', { message });
  }, []);

  const showWarning = useCallback((
    message: string, 
    config: ToastConfig = {}
  ) => {
    const toastConfig = typeof config === 'object' && 'description' in config
      ? { description: config.description }
      : config;
      
    toast.warning(message, toastConfig);
    logger.debug('Warning toast shown', { message });
  }, []);

  // Advanced methods
  const showSuccessWithUndo = useCallback((
    message: string, 
    onUndo: () => void
  ) => {
    toast.success(message, {
      duration: 6000,
      action: {
        label: 'Hoàn tác',
        onClick: onUndo
      }
    });
  }, []);

  const showErrorWithRetry = useCallback((
    message: string, 
    onRetry: () => void
  ) => {
    toast.error(message, {
      duration: 8000,
      action: {
        label: 'Thử lại',
        onClick: onRetry
      }
    });
  }, []);

  const dismissAll = useCallback(() => {
    toast.dismiss();
  }, []);

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showSuccessWithUndo,
    showErrorWithRetry,
    dismissAll,
  };
};