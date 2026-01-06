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
 * Enhanced hook để quản lý state của form dialog
 * Refactor: Thêm explicit form modes và consistent state management
 */
export const useFormState = (): UseFormStateReturn => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<PasswordEntry | null>(null);

  // Computed form mode dựa trên editEntry
  const formMode = useMemo((): FormMode => 
    editEntry ? FormMode.EDIT : FormMode.ADD, 
    [editEntry]
  );

  // Computed boolean helpers
  const isEditMode = useMemo(() => formMode === FormMode.EDIT, [formMode]);
  const isAddMode = useMemo(() => formMode === FormMode.ADD, [formMode]);

  /**
   * Mở form ở chế độ thêm mới
   */
  const openAddForm = useCallback(() => {
    logger.debug('Opening form in ADD mode');
    setEditEntry(null);
    setIsFormOpen(true);
  }, []);

  /**
   * Mở form ở chế độ chỉnh sửa
   */
  const openEditForm = useCallback((entry: PasswordEntry) => {
    logger.debug('Opening form in EDIT mode', { entryId: entry.id, service: entry.service });
    setEditEntry(entry);
    setIsFormOpen(true);
  }, []);

  /**
   * Đóng form và reset toàn bộ state
   */
  const closeForm = useCallback(() => {
    logger.debug('Closing form and resetting state');
    setIsFormOpen(false);
    setEditEntry(null);
  }, []);

  /**
   * Reset về chế độ ADD mà không đóng form
   * Useful cho việc "Save and Add Another"
   */
  const resetToAddMode = useCallback(() => {
    logger.debug('Resetting form to ADD mode');
    setEditEntry(null);
  }, []);

  return {
    // State
    isFormOpen,
    editEntry,
    formMode,
    isEditMode,
    isAddMode,
    
    // Actions
    openAddForm,
    openEditForm,
    closeForm,
    resetToAddMode,
  };
};