import { useState, useCallback } from 'react';
import { PasswordEntry } from '@/lib/types/models';

/**
 * Custom hook để quản lý state của Password Form
 * Tách biệt logic form khỏi component chính để dễ test và maintain
 */
interface UsePasswordFormReturn {
  isFormOpen: boolean;
  editEntry: PasswordEntry | undefined;
  openAddForm: () => void;
  openEditForm: (entry: PasswordEntry) => void;
  closeForm: () => void;
  resetForm: () => void;
}

export function usePasswordForm(): UsePasswordFormReturn {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<PasswordEntry | undefined>();

  const openAddForm = useCallback(() => {
    setEditEntry(undefined);
    setIsFormOpen(true);
  }, []);

  const openEditForm = useCallback((entry: PasswordEntry) => {
    setEditEntry(entry);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
  }, []);

  const resetForm = useCallback(() => {
    setEditEntry(undefined);
    setIsFormOpen(false);
  }, []);

  return {
    isFormOpen,
    editEntry,
    openAddForm,
    openEditForm,
    closeForm,
    resetForm,
  };
}