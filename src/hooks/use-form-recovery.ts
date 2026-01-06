/**
 * useFormRecovery Hook
 * Form data recovery mechanism để prevent data loss
 * 
 * Features:
 * - Auto-save form data to localStorage
 * - Recovery after errors or crashes
 * - Configurable save intervals
 * - Type-safe data handling
 * - Cleanup on successful submission
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { logger } from '@/lib/utils/logger';

/**
 * Form recovery configuration
 */
interface FormRecoveryConfig {
  autoSaveInterval?: number; // milliseconds
  maxRetries?: number;
  enableAutoSave?: boolean;
}

/**
 * Form recovery hook return type
 */
interface UseFormRecoveryReturn<T> {
  savedData: Partial<T> | null;
  saveFormData: (data: Partial<T>) => void;
  clearSavedData: () => void;
  loadSavedData: () => Partial<T> | null;
  hasSavedData: boolean;
  autoSave: (data: Partial<T>) => void;
}

/**
 * Form recovery hook để prevent data loss
 * Automatically saves form data và provides recovery mechanism
 */
export const useFormRecovery = <T>(
  formKey: string,
  config: FormRecoveryConfig = {}
): UseFormRecoveryReturn<T> => {
  const {
    autoSaveInterval = 5000, // 5 seconds
    enableAutoSave = true
  } = config;

  const [savedData, setSavedData] = useState<Partial<T> | null>(null);
  const [hasSavedData, setHasSavedData] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const storageKey = `form_recovery_${formKey}`;

  /**
   * Load saved data from localStorage on mount
   */
  useEffect(() => {
    const loaded = loadSavedData();
    if (loaded) {
      setSavedData(loaded);
      setHasSavedData(true);
      logger.info('Form recovery data loaded', { formKey, hasData: !!loaded });
    }
  }, [formKey]);

  /**
   * Save form data to localStorage
   */
  const saveFormData = useCallback((data: Partial<T>) => {
    try {
      const dataToSave = {
        ...data,
        _timestamp: Date.now(),
        _formKey: formKey
      };
      
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      setSavedData(data);
      setHasSavedData(true);
      
      logger.debug('Form data saved for recovery', { formKey, dataKeys: Object.keys(data) });
    } catch (error) {
      logger.error('Failed to save form recovery data', error as Error);
    }
  }, [formKey, storageKey]);

  /**
   * Clear saved data from localStorage
   */
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setSavedData(null);
      setHasSavedData(false);
      
      // Clear auto-save timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      logger.debug('Form recovery data cleared', { formKey });
    } catch (error) {
      logger.error('Failed to clear form recovery data', error as Error);
    }
  }, [formKey, storageKey]);

  /**
   * Load saved data from localStorage
   */
  const loadSavedData = useCallback((): Partial<T> | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return null;

      const parsedData = JSON.parse(saved);
      
      // Validate data structure
      if (!parsedData._timestamp || !parsedData._formKey) {
        logger.warn('Invalid form recovery data structure', { formKey });
        return null;
      }

      // Check if data is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      if (Date.now() - parsedData._timestamp > maxAge) {
        logger.info('Form recovery data expired, clearing', { formKey });
        clearSavedData();
        return null;
      }

      // Remove metadata before returning
      const { _timestamp, _formKey, ...formData } = parsedData;
      return formData as Partial<T>;
    } catch (error) {
      logger.error('Failed to load form recovery data', error as Error);
      return null;
    }
  }, [formKey, storageKey, clearSavedData]);

  /**
   * Auto-save with debouncing
   */
  const autoSave = useCallback((data: Partial<T>) => {
    if (!enableAutoSave) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveFormData(data);
    }, autoSaveInterval);
  }, [enableAutoSave, autoSaveInterval, saveFormData]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    savedData,
    saveFormData,
    clearSavedData,
    loadSavedData,
    hasSavedData,
    autoSave,
  };
};