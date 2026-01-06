/**
 * useToastManager Hook
 * Toast management utilities
 * 
 * Features:
 * - Dismiss all toasts
 * - Dismiss by level (future enhancement)
 * - Toast queue management
 * - Cleanup utilities
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';

/**
 * Toast management hook
 * Refactor: Tách management functionality từ useToastNotifications
 */
export const useToastManager = () => {
  /**
   * Dismiss all active toasts
   */
  const dismissAll = useCallback(() => {
    toast.dismiss();
    logger.debug('All toasts dismissed');
  }, []);

  /**
   * Dismiss toasts by level
   * Note: Sonner doesn't have built-in level filtering
   * This is a placeholder for future enhancement
   */
  const dismissByLevel = useCallback((level: string) => {
    // TODO: Implement level-based dismissal when Sonner supports it
    logger.warn(`dismissByLevel(${level}) not implemented yet - dismissing all toasts`);
    toast.dismiss();
  }, []);

  /**
   * Get active toast count
   * Note: This would require Sonner API enhancement
   */
  const getActiveToastCount = useCallback((): number => {
    // TODO: Implement when Sonner provides API
    logger.debug('getActiveToastCount not implemented - returning 0');
    return 0;
  }, []);

  /**
   * Clear toast queue
   */
  const clearQueue = useCallback(() => {
    // Sonner handles queue automatically, but we can dismiss all
    toast.dismiss();
    logger.debug('Toast queue cleared');
  }, []);

  return {
    dismissAll,
    dismissByLevel,
    getActiveToastCount,
    clearQueue,
  };
};