/**
 * useToastNotifications Hook - Improved Hybrid Approach
 * Kết hợp sự đơn giản với tính năng advanced và backward compatibility
 * 
 * Features:
 * - Backward compatibility với existing code
 * - Simple API cho basic usage
 * - Advanced features khi cần thiết
 * - Performance optimization
 * - Mobile-responsive
 */

import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { logger } from '@/lib/utils/logger';

// Simplified config cho basic usage
export interface SimpleToastConfig {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Advanced config cho power users
export interface AdvancedToastConfig {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive';
  };
  dismissible?: boolean;
  important?: boolean;
}

// Union type cho flexibility
export type ToastConfig = SimpleToastConfig | AdvancedToastConfig;

export interface UseToastNotificationsReturn {
  // Basic API - Simple signatures cho backward compatibility
  showSuccess: (message: string, config?: ToastConfig) => void;
  showError: (message: string, config?: ToastConfig) => void;
  showInfo: (message: string, config?: ToastConfig) => void;
  showWarning: (message: string, config?: ToastConfig) => void;
  
  // Advanced API - Cho power users
  showSuccessWithUndo: (message: string, onUndo: () => void) => void;
  showErrorWithRetry: (message: string, onRetry: () => void) => void;
  
  // Utility methods
  dismissAll: () => void;
}

/**
 * Improved useToastNotifications Hook
 * Hybrid approach: Simple cho basic usage, advanced cho power users
 */
export const useToastNotifications = (): UseToastNotificationsReturn => {
  const isMobile = useIsMobile();
  
  // Default position dựa trên device
  const defaultPosition = useMemo(() => 
    isMobile ? 'bottom-center' : 'top-right',
    [isMobile]
  );

  // Helper để process config
  const processConfig = useCallback((config: ToastConfig = {}) => {
    const {
      description,
      duration = 4000,
      action,
      ...advancedConfig
    } = config;

    return {
      description,
      duration,
      action,
      position: (advancedConfig as AdvancedToastConfig).position || defaultPosition,
      ...advancedConfig
    };
  }, [defaultPosition]);

  /**
   * Show success notification
   * Supports both simple and advanced usage:
   * - showSuccess("Message") 
   * - showSuccess("Message", { description: "Details" })
   * - showSuccess("Message", { duration: 5000, position: "top-center" })
   */
  const showSuccess = useCallback((
    message: string, 
    config: ToastConfig = {}
  ) => {
    const processedConfig = processConfig(config);
    
    // Performance tracking
    const startTime = performance.now();
    
    toast.success(message, processedConfig);
    
    // Log performance
    const duration = performance.now() - startTime;
    logger.debug('Toast shown', { type: 'success', duration, message });
  }, [processConfig]);

  const showError = useCallback((
    message: string,
    config: ToastConfig = {}
  ) => {
    const processedConfig = processConfig(config);
    toast.error(message, processedConfig);
    logger.debug('Toast shown', { type: 'error', message });
  }, [processConfig]);

  const showInfo = useCallback((
    message: string,
    config: ToastConfig = {}
  ) => {
    const processedConfig = processConfig(config);
    toast.info(message, processedConfig);
    logger.debug('Toast shown', { type: 'info', message });
  }, [processConfig]);

  const showWarning = useCallback((
    message: string,
    config: ToastConfig = {}
  ) => {
    const processedConfig = processConfig(config);
    toast.warning(message, processedConfig);
    logger.debug('Toast shown', { type: 'warning', message });
  }, [processConfig]);

  // Advanced methods
  const showSuccessWithUndo = useCallback((
    message: string, 
    onUndo: () => void
  ) => {
    showSuccess(message, {
      duration: 6000, // Longer duration cho undo
      action: {
        label: 'Hoàn tác',
        onClick: onUndo
      }
    });
  }, [showSuccess]);

  const showErrorWithRetry = useCallback((
    message: string, 
    onRetry: () => void
  ) => {
    showError(message, {
      duration: 8000, // Longer duration cho retry
      action: {
        label: 'Thử lại',
        onClick: onRetry,
        variant: 'default'
      }
    });
  }, [showError]);

  const dismissAll = useCallback(() => {
    toast.dismiss();
    logger.debug('All toasts dismissed');
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