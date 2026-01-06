/**
 * usePasswords Hook - Refactored với Service Layer
 * Quản lý passwords với clean architecture pattern
 * 
 * Features:
 * - Service layer separation (theo steering rules)
 * - Centralized error handling
 * - Loading states management
 * - Toast notifications
 * - Type safety
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { PasswordEntry, PasswordInsert, PasswordStats } from '@/lib/types/models';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useLoadingState } from '@/hooks/use-loading-state';
import { PasswordService } from '@/lib/services/password-service';
import { SUCCESS_MESSAGES } from '@/lib/constants/app-constants';
import { logger } from '@/lib/utils/logger';

/**
 * Hook configuration
 */
interface UsePasswordsConfig {
  enableApiSync?: boolean;
  autoInitialize?: boolean;
}

/**
 * Hook return type
 */
interface UsePasswordsReturn {
  // Data
  passwords: PasswordEntry[];
  loading: boolean;
  error: string | null;
  stats: PasswordStats;
  
  // Actions
  searchPasswords: (query?: string) => Promise<void>;
  addPassword: (entry: PasswordInsert) => Promise<void>;
  updatePassword: (id: string, entry: Partial<PasswordInsert>) => Promise<void>;
  deletePassword: (id: string) => Promise<void>;
  refreshPasswords: () => Promise<void>;
  clearAllPasswords: () => Promise<void>;
}

/**
 * Main usePasswords Hook - Refactored
 */
export const usePasswords = (config: UsePasswordsConfig = {}): UsePasswordsReturn => {
  const { enableApiSync = false, autoInitialize = true } = config;
  
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const { handleAsyncError } = useErrorHandler();
  const { loading, error, executeOperation } = useLoadingState();

  // Khởi tạo service với singleton pattern để tối ưu performance
  const passwordService = useMemo(() => {
    logger.debug('Initializing PasswordService', { enableApiSync });
    return PasswordService.getInstance({ enableApiSync });
  }, [enableApiSync]);

  // Cập nhật config khi enableApiSync thay đổi
  useEffect(() => {
    passwordService.updateConfig({ enableApiSync });
  }, [passwordService, enableApiSync]);

  /**
   * Initialize database on mount
   */
  useEffect(() => {
    if (autoInitialize) {
      logger.info('Auto-initializing passwords');
      refreshPasswords();
    }
  }, [autoInitialize]);

  /**
   * Load passwords từ service với enhanced error handling
   */
  const refreshPasswords = useCallback(async () => {
    const endTimer = logger.time('refreshPasswords');
    
    const result = await handleAsyncError(
      () => executeOperation(() => passwordService.getAllPasswords()),
      { showToast: false } // Không hiển thị toast cho refresh
    );
    
    if (result) {
      setPasswords(result);
      logger.info('Passwords refreshed successfully', { count: result.length });
    }
    
    endTimer();
  }, [passwordService, executeOperation, handleAsyncError]);

  /**
   * Tìm kiếm passwords với logging
   */
  const searchPasswords = useCallback(async (query?: string) => {
    const endTimer = logger.time('searchPasswords');
    logger.debug('Searching passwords', { query });
    
    const result = await handleAsyncError(
      () => executeOperation(() => passwordService.searchPasswords(query || '')),
      { showToast: false }
    );
    
    if (result) {
      setPasswords(result);
      logger.info('Search completed', { query, resultCount: result.length });
    }
    
    endTimer();
  }, [passwordService, executeOperation, handleAsyncError]);

  /**
   * Thêm password mới với success notification
   */
  const addPassword = useCallback(async (entry: PasswordInsert) => {
    const endTimer = logger.time('addPassword');
    logger.info('Adding new password', { service: entry.service });
    
    await executeOperation(
      () => passwordService.addPassword(entry),
      { 
        successMessage: SUCCESS_MESSAGES.PASSWORD_ADDED,
        showToast: true 
      }
    );
    
    // Refresh danh sách sau khi thêm thành công
    await refreshPasswords();
    endTimer();
  }, [passwordService, executeOperation, refreshPasswords]);

  /**
   * Cập nhật password với success notification
   */
  const updatePassword = useCallback(async (id: string, entry: Partial<PasswordInsert>) => {
    const endTimer = logger.time('updatePassword');
    logger.info('Updating password', { id, service: entry.service });
    
    await executeOperation(
      () => passwordService.updatePassword(id, entry),
      { 
        successMessage: SUCCESS_MESSAGES.PASSWORD_UPDATED,
        showToast: true 
      }
    );
    
    // Refresh danh sách sau khi cập nhật thành công
    await refreshPasswords();
    endTimer();
  }, [passwordService, executeOperation, refreshPasswords]);

  /**
   * Xóa password với success notification
   */
  const deletePassword = useCallback(async (id: string) => {
    const endTimer = logger.time('deletePassword');
    logger.info('Deleting password', { id });
    
    await executeOperation(
      () => passwordService.deletePassword(id),
      { 
        successMessage: SUCCESS_MESSAGES.PASSWORD_DELETED,
        showToast: true 
      }
    );
    
    // Refresh danh sách sau khi xóa thành công
    await refreshPasswords();
    endTimer();
  }, [passwordService, executeOperation, refreshPasswords]);

  /**
   * Xóa toàn bộ passwords (cho testing)
   */
  const clearAllPasswords = useCallback(async () => {
    const endTimer = logger.time('clearAllPasswords');
    logger.warn('Clearing all passwords');
    
    await executeOperation(
      () => passwordService.clearAllPasswords(),
      { 
        successMessage: "Đã xóa toàn bộ mật khẩu",
        showToast: true 
      }
    );
    
    // Refresh danh sách sau khi xóa thành công
    await refreshPasswords();
    endTimer();
  }, [passwordService, executeOperation, refreshPasswords]);

  /**
   * Tính toán stats từ passwords hiện tại
   */
  const stats = useMemo((): PasswordStats => ({
    total: passwords.length,
    hasPasswords: passwords.length > 0
  }), [passwords]);

  return {
    // Data
    passwords,
    loading,
    error,
    stats,
    
    // Actions
    searchPasswords,
    addPassword,
    updatePassword,
    deletePassword,
    refreshPasswords,
    clearAllPasswords,
  };
};