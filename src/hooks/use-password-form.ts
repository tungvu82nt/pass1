/**
 * usePasswordForm Hook
 * Tách logic form ra khỏi component để dễ test và maintain
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PasswordEntry, PasswordInsert } from '@/lib/types/models';
import { 
  passwordEntrySchema, 
  PasswordEntryFormData, 
  generateSecurePassword, 
  validatePasswordStrength 
} from '@/lib/validation/password-validation';
import { logger } from '@/lib/utils/logger';

interface UsePasswordFormProps {
  editEntry?: PasswordEntry;
  onSave: (entry: PasswordInsert) => Promise<void>;
  onClose: () => void;
}

/**
 * Custom hook cho password form logic
 * Separation of concerns - tách UI khỏi business logic
 */
export const usePasswordForm = ({ editEntry, onSave, onClose }: UsePasswordFormProps) => {
  const form = useForm<PasswordEntryFormData>({
    resolver: zodResolver(passwordEntrySchema),
    defaultValues: {
      service: "",
      username: "",
      password: "",
    }
  });

  const { reset, setValue, watch, handleSubmit } = form;
  const watchedPassword = watch("password");

  // Password strength calculation
  const passwordStrength = watchedPassword ? validatePasswordStrength(watchedPassword) : null;

  // Reset form when editEntry changes
  useEffect(() => {
    if (editEntry) {
      reset({
        service: editEntry.service,
        username: editEntry.username,
        password: editEntry.password,
      });
      logger.debug("Form reset with edit data", { entryId: editEntry.id });
    } else {
      reset({
        service: "",
        username: "",
        password: "",
      });
      logger.debug("Form reset for new entry");
    }
  }, [editEntry, reset]);

  // Form submission handler
  const onSubmit = handleSubmit(async (data: PasswordEntryFormData) => {
    try {
      logger.info("Submitting password form", { 
        service: data.service, 
        isEdit: !!editEntry 
      });
      
      await onSave(data);
      onClose();
      
      logger.info("Password form submitted successfully");
    } catch (error) {
      logger.error("Failed to submit password form", error as Error);
      throw error; // Re-throw để component có thể handle
    }
  });

  // Generate secure password
  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(16);
    setValue("password", newPassword);
    logger.debug("Generated new secure password");
  };

  return {
    form,
    passwordStrength,
    watchedPassword,
    onSubmit,
    handleGeneratePassword,
    isEdit: !!editEntry,
  };
};