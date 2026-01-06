/**
 * useBasicToast Hook
 * Core toast functionality với performance optimization
 * 
 * Features:
 * - Basic toast methods (success, error, info, warning)
 * - Mobile-responsive positioning
 * - Performance tracking
 * - Memoized callbacks
 */

import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { TOAST_CONFIG } from '@/lib/config/toast-config';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToastPerformance } from '@/hooks/use-toast-performance';
import { ToastConfig } from '@/lib/types/toast-types';

/**
 * Basic toast hook với core functionality
 * Refactor: Tách từ useToastNotifications để giảm complexity
 */
export const useBasicToast = () => {
  const isMobile = useIsMobile();
  const { trackToast } = useToastPerformance();
  
  // Memoize default position để tránh re-calculation
  const defaultPosition = useMemo(() => 
    isMobile ? TOAST_CONFIG.POSITIONS.MOBILE : TOAST_CONFIG.POSITIONS.DEFAULT,
    [isMobile]
  );

  /**
   * Show success notification
   */
  const showSuccess = useCallback((
    message: string, 
    config: ToastConfig = {}
  ) => {
    const { 
      duration = TOAST_CONFIG.DURATIONS.SUCCESS, 
      position = defaultPosition,
      action 
    } = config;
    
    // Track performance
    trackToast('success', duration);
    
    toast.success(message, {
      duration,
      position,
      action,
    });
  }, [defaultPosition, trackToast]);
  
  /**
   * Show error notification
   */
  const showError = useCallback((
    message: string,
    config: ToastConfig = {}
  ) => {
    const { 
      duration = TOAST_CONFIG.DURATIONS.ERROR, 
      position = defaultPosition,
      action 
    } = config;
    
    // Track performance
    trackToast('error', duration);
    
    toast.error(message, {
      duration,
      position,
      action,
    });
  }, [defaultPosition, trackToast]);
  
  /**
   * Show info notification
   */
  const showInfo = useCallback((
    message: string,
    config: ToastConfig = {}
  ) => {
    const { 
      duration = TOAST_CONFIG.DURATIONS.INFO, 
      position = defaultPosition,
      action 
    } = config;
    
    // Track performance
    trackToast('info', duration);
    
    toast.info(message, {
      duration,
      position,
      action,
    });
  }, [defaultPosition, trackToast]);
  
  /**
   * Show warning notification
   */
  const showWarning = useCallback((
    message: string,
    config: ToastConfig = {}
  ) => {
    const { 
      duration = TOAST_CONFIG.DURATIONS.WARNING, 
      position = defaultPosition,
      action 
    } = config;
    
    // Track performance
    trackToast('warning', duration);
    
    toast.warning(message, {
      duration,
      position,
      action,
    });
  }, [defaultPosition, trackToast]);

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};