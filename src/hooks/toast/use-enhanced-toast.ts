/**
 * useEnhancedToast Hook
 * Advanced toast functionality với action support
 * 
 * Features:
 * - Success với undo action
 * - Error với retry action
 * - Info với custom action
 * - Extended durations cho user actions
 */

import { useCallback } from 'react';
import { useBasicToast } from './use-basic-toast';
import { TOAST_CONFIG, TOAST_ACTIONS } from '@/lib/config/toast-config';
import { ToastAction } from '@/lib/types/toast-types';

/**
 * Enhanced toast hook với action support
 * Refactor: Tách advanced functionality từ useToastNotifications
 */
export const useEnhancedToast = () => {
  const basicToast = useBasicToast();

  /**
   * Success toast với undo action
   */
  const showSuccessWithUndo = useCallback((
    message: string,
    onUndo: () => void
  ) => {
    basicToast.showSuccess(message, {
      action: TOAST_ACTIONS.UNDO(onUndo),
      duration: TOAST_CONFIG.DURATIONS.SUCCESS + 2000, // Longer duration for undo
    });
  }, [basicToast]);

  /**
   * Error toast với retry action
   */
  const showErrorWithRetry = useCallback((
    message: string,
    onRetry: () => void
  ) => {
    basicToast.showError(message, {
      action: TOAST_ACTIONS.RETRY(onRetry),
    });
  }, [basicToast]);
  
  /**
   * Info toast với custom action
   */
  const showInfoWithAction = useCallback((
    message: string,
    action: ToastAction
  ) => {
    basicToast.showInfo(message, {
      action,
      duration: TOAST_CONFIG.DURATIONS.INFO + 1000, // Longer duration cho user action
    });
  }, [basicToast]);

  return {
    ...basicToast,
    showSuccessWithUndo,
    showErrorWithRetry,
    showInfoWithAction,
  };
};