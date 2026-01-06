/**
 * Toast Types
 * Centralized type definitions cho toast system
 * 
 * Features:
 * - Type-safe toast configurations
 * - Enhanced action types
 * - Position and duration types
 */

/**
 * Toast positions - type-safe với literal types
 */
export type ToastPosition = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right';

/**
 * Toast action configuration
 */
export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
}

/**
 * Enhanced toast configuration với better typing
 */
export interface ToastConfig {
  duration?: number;
  position?: ToastPosition;
  action?: ToastAction;
  dismissible?: boolean;
  important?: boolean;
}

/**
 * Toast notification levels
 */
export type ToastLevel = 'success' | 'error' | 'info' | 'warning';

/**
 * Toast notification data structure
 */
export interface ToastNotification {
  id: string;
  level: ToastLevel;
  message: string;
  config?: ToastConfig;
  timestamp: number;
}

/**
 * Toast hook return type với enhanced methods
 */
export interface UseToastNotificationsReturn {
  // Basic methods
  showSuccess: (message: string, config?: ToastConfig) => void;
  showError: (message: string, config?: ToastConfig) => void;
  showInfo: (message: string, config?: ToastConfig) => void;
  showWarning: (message: string, config?: ToastConfig) => void;
  
  // Enhanced methods với common actions
  showSuccessWithUndo: (message: string, onUndo: () => void) => void;
  showErrorWithRetry: (message: string, onRetry: () => void) => void;
  showInfoWithAction: (message: string, action: ToastAction) => void;
  
  // Utility methods
  dismissAll: () => void;
  dismissByLevel: (level: ToastLevel) => void;
}