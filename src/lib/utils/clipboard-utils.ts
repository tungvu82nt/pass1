/**
 * Clipboard Utilities - Tách riêng core clipboard operations
 * Clean separation of concerns
 */

import { logger } from '@/lib/utils/logger';
import { ClipboardError, ClipboardResult, ClipboardContext } from '@/lib/types/clipboard-types';
import { measureAsync } from '@/lib/utils/performance-monitor';

/**
 * Check clipboard API support
 */
export const isClipboardSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'clipboard' in navigator;
};

/**
 * Modern clipboard API copy
 */
export const modernClipboardCopy = async (text: string): Promise<void> => {
  if (!isClipboardSupported()) {
    throw new ClipboardError('Clipboard API không được hỗ trợ', 'copy');
  }
  
  await navigator.clipboard.writeText(text);
};

/**
 * Fallback copy using execCommand
 */
export const fallbackClipboardCopy = (text: string): boolean => {
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
};

/**
 * Enhanced copy operation với retry logic
 */
export const copyTextToClipboard = async (
  text: string,
  context?: Partial<ClipboardContext>
): Promise<ClipboardResult> => {
  if (!text) {
    throw new ClipboardError('Không có nội dung để sao chép', 'copy', context as ClipboardContext);
  }

  return await measureAsync(
    'clipboard.copy',
    async () => {
      const timestamp = Date.now();
      
      try {
        // Try modern API first
        if (isClipboardSupported()) {
          await modernClipboardCopy(text);
          
          logger.debug('Text copied using modern API', { 
            ...context, 
            length: text.length 
          });
          
          return {
            success: true,
            metadata: {
              method: 'modern' as const,
              textLength: text.length,
              timestamp
            }
          };
        } else {
          // Fallback to execCommand
          const success = fallbackClipboardCopy(text);
          
          if (!success) {
            throw new ClipboardError('Fallback copy method failed', 'copy', context as ClipboardContext);
          }
          
          logger.debug('Text copied using fallback', { 
            ...context, 
            length: text.length 
          });
          
          return {
            success: true,
            metadata: {
              method: 'fallback' as const,
              textLength: text.length,
              timestamp
            }
          };
        }
      } catch (error) {
        const clipboardError = error instanceof ClipboardError ? error :
          new ClipboardError(
            error instanceof Error ? error.message : 'Unknown clipboard error',
            'copy',
            context as ClipboardContext
          );
        
        logger.error('Clipboard copy failed', clipboardError, context);
        
        return {
          success: false,
          error: clipboardError
        };
      }
    },
    { operation: 'copy', textLength: text.length }
  );
};

/**
 * Clear clipboard content
 */
export const clearClipboardContent = async (): Promise<ClipboardResult> => {
  return await measureAsync(
    'clipboard.clear',
    async () => {
      try {
        if (isClipboardSupported()) {
          await navigator.clipboard.writeText('');
        } else {
          fallbackClipboardCopy('');
        }
        
        logger.debug('Clipboard cleared');
        
        return {
          success: true,
          metadata: {
            method: isClipboardSupported() ? 'modern' : 'fallback',
            textLength: 0,
            timestamp: Date.now()
          }
        };
      } catch (error) {
        const clipboardError = new ClipboardError(
          error instanceof Error ? error.message : 'Failed to clear clipboard',
          'clear'
        );
        
        logger.error('Clear clipboard failed', clipboardError);
        
        return {
          success: false,
          error: clipboardError
        };
      }
    }
  );
};