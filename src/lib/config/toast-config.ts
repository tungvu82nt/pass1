/**
 * Toast Configuration
 * Centralized configuration cho toast notifications
 * 
 * Features:
 * - Consistent durations
 * - Theme-aware styling
 * - Accessibility settings
 */

export const TOAST_CONFIG = {
  /**
   * Default durations cho các loại toast
   */
  DURATIONS: {
    SUCCESS: 3000,
    ERROR: 5000,
    INFO: 3000,
    WARNING: 4000,
  },

  /**
   * Default positions
   */
  POSITIONS: {
    DEFAULT: 'bottom-right' as const,
    MOBILE: 'bottom-center' as const,
  },

  /**
   * Toast limits
   */
  LIMITS: {
    MAX_TOASTS: 3, // Maximum số toast hiển thị cùng lúc
    STACK_OFFSET: 10, // Offset giữa các toast
  },

  /**
   * Accessibility settings
   */
  A11Y: {
    ANNOUNCE_SUCCESS: true,
    ANNOUNCE_ERRORS: true,
    KEYBOARD_NAVIGATION: true,
  },
} as const;

/**
 * Toast action presets cho common use cases
 */
export const TOAST_ACTIONS = {
  /**
   * Retry action cho failed operations
   */
  RETRY: (onRetry: () => void) => ({
    label: 'Thử lại',
    onClick: onRetry,
  }),

  /**
   * Undo action cho reversible operations
   */
  UNDO: (onUndo: () => void) => ({
    label: 'Hoàn tác',
    onClick: onUndo,
  }),

  /**
   * View details action
   */
  VIEW_DETAILS: (onView: () => void) => ({
    label: 'Xem chi tiết',
    onClick: onView,
  }),
} as const;