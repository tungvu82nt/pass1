/**
 * useToastNotifications Hook - Refactored
 * Composite hook combining all toast functionality
 * 
 * Features:
 * - Backward compatibility với existing code
 * - Modular architecture với specialized hooks
 * - Better performance với focused responsibilities
 * - Easier testing và maintenance
 * 
 * Refactor: Tách thành multiple specialized hooks:
 * - useBasicToast: Core toast functionality
 * - useEnhancedToast: Advanced features với actions
 * - useToastManager: Management utilities
 */

import { useBasicToast } from './toast/use-basic-toast';
import { useEnhancedToast } from './toast/use-enhanced-toast';
import { useToastManager } from './toast/use-toast-manager';
import { UseToastNotificationsReturn } from '@/lib/types/toast-types';

/**
 * Composite toast notifications hook
 * Provides backward compatibility while using modular architecture
 */
export const useToastNotifications = (): UseToastNotificationsReturn => {
  const basicToast = useBasicToast();
  const enhancedToast = useEnhancedToast();
  const toastManager = useToastManager();
  
  return {
    // Basic toast methods
    ...basicToast,
    
    // Enhanced methods với actions
    showSuccessWithUndo: enhancedToast.showSuccessWithUndo,
    showErrorWithRetry: enhancedToast.showErrorWithRetry,
    showInfoWithAction: enhancedToast.showInfoWithAction,
    
    // Management utilities
    ...toastManager,
  };
};