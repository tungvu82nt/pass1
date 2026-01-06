/**
 * useFormState Hook
 * Quản lý state cho form dialog với explicit form modes
 * 
 * Features:
 * - Form mode management (ADD/EDIT)
 * - State consistency
 * - Type-safe operations
 * - Performance optimized với useCallback
 */

import { useState, useCallback, useMemo } from 'react';
import { PasswordEntry } from '@/lib/types/models';
import { logger } from '@/lib/utils/logger';

/**
 * Form operation modes
 */
export enum FormMode {
  ADD = 'ADD',
  EDIT = 'EDIT'
}

/**
 * Enhanced form state interface
 */
interface UseFormStateReturn {
  // State
  isFormOpen: boolean;
  editEntry: PasswordEntry | null;
  formMode: FormMode;
  isEditMode: boolean;
  isAddMode: boolean;
  
  // Actions
  openAddForm: () => void;
  openEditForm: (entry: PasswordEntry) => void;
  closeForm: () => void;
  resetToAddMode: () => void;
}

/**
 * Hook để quản lý state của form dialog
 */
export const useFormState = (): UseFormStateReturn => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<PasswordEntry | null>(null);

  const openAddForm = useCallback(() => {
    setEditEntry(null);
    setIsFormOpen(true);
  }, []);

  const openEditForm = useCallback((entry: PasswordEntry) => {
    setEditEntry(entry);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditEntry(null);
  }, []);

  const resetForm = useCallback(() => {
    setEditEntry(null);
  }, []);

  return {
    isFormOpen,
    editEntry,
    openAddForm,
    openEditForm,
    closeForm,
    resetForm,
  };
};