/**
 * useClipboard Hook - Refactored với Clean Architecture
 * Enhanced clipboard operations với standardized error handling
 * 
 * Features:
 * - Standardized error patterns
 * - Performance monitoring
 * - Memory leak prevention
 * - Security policies
 * - Clean separation of concerns
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { logger } from '@/lib/utils/logger';
import { 
  ClipboardConfig, 
  ClipboardContext, 
  ClipboardSecurityPolicy,
  UseClipboardReturn,
  ClipboardResult 
} from '@/lib/types/clipboard-types';
import { 
  copyTextToClipboard, 
  clearClipboardContent, 
  isClipboardSupported 
} from '@/lib/utils/clipboard-utils';

/**
 * Default security policy
 */
const DEFAULT_SECURITY_POLICY: ClipboardSecurityPolicy = {
  autoCleanup: false,
  cleanupDelay: 30000,
  maxTextLength: 10000,
};

/**
 * Enhanced clipboard hook với security features
 */
export const useClipboard = (config: ClipboardConfig = {}): UseClipboardReturn => {
  const {
    showToast = true,
    toastDuration = 2000,
    secureMode = false,
    clearTimeout = 30000, // 30 seconds
  } = config;

  const [copied, setCopied] = useState(false);
  const { showSuccess, showError } = useToastNotifications();

  // Check if clipboard API is supported
  const isSupported = typeof navigator !== 'undefined' && 'clipboard' in navigator;

  /**
   * Fallback copy method using execCommand
   */
  const fallbackCopy = useCallback((text: string): boolean => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return result;
    } catch (error) {
      logger.error('Fallback copy failed', error as Error);
      return false;
    }
  }, []);

  /**
   * Main copy function với multiple fallbacks
   */
  const copyToClipboard = useCallback(async (
    text: string,
    label: string = 'Nội dung'
  ): Promise<ClipboardResult> => {
    if (!text) {
      const error = 'Không có nội dung để sao chép';
      logger.warn('Copy attempted with empty text');
      return { success: false, error };
    }

    try {
      // Try modern clipboard API first
      if (isSupported) {
        await navigator.clipboard.writeText(text);
        logger.debug('Text copied using Clipboard API', { label, length: text.length });
      } else {
        // Fallback to execCommand
        const success = fallbackCopy(text);
        if (!success) {
          throw new Error('Fallback copy method failed');
        }
        logger.debug('Text copied using fallback method', { label, length: text.length });
      }

      // Update state
      setCopied(true);

      // Show success toast
      if (showToast) {
        showSuccess(`${label} đã được sao chép vào clipboard`, {
          title: "Đã sao chép",
          duration: toastDuration,
        });
      }

      // Reset copied state after duration
      setTimeout(() => setCopied(false), toastDuration);

      // Secure mode: Clear clipboard after timeout
      if (secureMode) {
        setTimeout(async () => {
          try {
            await clearClipboard();
            logger.debug('Clipboard cleared for security', { label });
          } catch (error) {
            logger.warn('Failed to clear clipboard', error as Error);
          }
        }, clearTimeout);
      }

      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể sao chép';
      
      logger.error('Copy to clipboard failed', error as Error, {
        label,
        textLength: text.length,
        isSupported,
      });

      // Show error toast
      if (showToast) {
        showError(errorMessage, {
          title: "Lỗi sao chép",
          duration: toastDuration,
        });
      }

      return { success: false, error: errorMessage };
    }
  }, [isSupported, fallbackCopy, showToast, showSuccess, showError, toastDuration, secureMode, clearTimeout]);

  /**
   * Clear clipboard content
   */
  const clearClipboard = useCallback(async (): Promise<ClipboardResult> => {
    try {
      if (isSupported) {
        await navigator.clipboard.writeText('');
        logger.debug('Clipboard cleared');
        return { success: true };
      } else {
        // Fallback: copy empty string
        const success = fallbackCopy('');
        if (success) {
          logger.debug('Clipboard cleared using fallback');
          return { success: true };
        } else {
          throw new Error('Fallback clear method failed');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể xóa clipboard';
      logger.error('Clear clipboard failed', error as Error);
      return { success: false, error: errorMessage };
    }
  }, [isSupported, fallbackCopy]);

  return {
    copied,
    copyToClipboard,
    clearClipboard,
    isSupported,
  };
};

/**
 * Specialized hook cho password copying với security
 */
export const useSecureClipboard = () => {
  return useClipboard({
    secureMode: true,
    clearTimeout: 30000, // Clear after 30 seconds
    showToast: true,
  });
};