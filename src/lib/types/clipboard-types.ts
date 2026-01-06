/**
 * Clipboard Types - Enhanced với Error Handling
 * Centralized type definitions cho clipboard operations
 */

import { AppError, ErrorType } from '@/lib/utils/error-patterns';

/**
 * Clipboard operation result với enhanced error info
 */
export interface ClipboardResult {
  success: boolean;
  error?: AppError;
  metadata?: {
    method: 'modern' | 'fallback';
    textLength: number;
    timestamp: number;
  };
}

/**
 * Clipboard security policies
 */
export interface ClipboardSecurityPolicy {
  autoCleanup: boolean;
  cleanupDelay: number;
  maxTextLength: number;
  allowedDomains?: string[];
}

/**
 * Enhanced clipboard configuration với validation
 */
export interface ClipboardConfig {
  showToast?: boolean;
  toastDuration?: number;
  securityPolicy?: Partial<ClipboardSecurityPolicy>;
  retryConfig?: {
    maxRetries: number;
    retryDelay: number;
  };
}

/**
 * Clipboard operation context
 */
export interface ClipboardContext {
  label: string;
  source: string;
  sensitive: boolean;
  timestamp: number;
}

/**
 * Clipboard hook return type với enhanced methods
 */
export interface UseClipboardReturn {
  // State
  copied: boolean;
  isSupported: boolean;
  
  // Operations
  copyToClipboard: (text: string, context?: Partial<ClipboardContext>) => Promise<ClipboardResult>;
  clearClipboard: () => Promise<ClipboardResult>;
  
  // Utilities
  cleanup: () => void;
}

/**
 * Clipboard error factory
 */
export class ClipboardError extends AppError {
  constructor(
    message: string,
    public readonly operation: 'copy' | 'clear' | 'permission',
    public readonly context?: ClipboardContext
  ) {
    super(message, ErrorType.CLIPBOARD, `Lỗi clipboard: ${message}`);
  }
}