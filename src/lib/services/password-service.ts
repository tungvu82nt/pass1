/**
 * PasswordService - Service Layer
 * Tách biệt business logic khỏi UI components
 * 
 * Features:
 * - Centralized password operations
 * - API và IndexedDB integration
 * - Error handling
 * - Type safety
 */

import { PasswordEntry, PasswordInsert, PasswordStats } from '@/lib/types/models';
import { db } from '@/lib/db/db';
import { PasswordApiService } from '@/lib/api/password-api';
import { logger } from '@/lib/utils/logger';

/**
 * Service configuration
 */
interface ServiceConfig {
  enableApiSync: boolean;
}

/**
 * Main Password Service - Singleton Pattern
 * Đảm bảo chỉ có một instance duy nhất để tối ưu performance
 */
export class PasswordService {
  private static instance: PasswordService;
  private config: ServiceConfig;

  private constructor(config: ServiceConfig = { enableApiSync: false }) {
    this.config = config;
  }

  /**
   * Singleton pattern - lấy instance duy nhất
   */
  public static getInstance(config?: ServiceConfig): PasswordService {
    if (!PasswordService.instance) {
      PasswordService.instance = new PasswordService(config);
    }
    return PasswordService.instance;
  }

  /**
   * Cập nhật config cho instance hiện tại
   */
  public updateConfig(config: ServiceConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Lấy tất cả passwords
   */
  async getAllPasswords(): Promise<PasswordEntry[]> {
    const endTimer = logger.time('service:getAllPasswords');
    
    try {
      const passwords = await db.getAllPasswords();
      logger.debug('Passwords loaded from IndexedDB', { count: passwords.length });
      return passwords;
    } catch (error) {
      logger.warn('IndexedDB failed, trying API fallback', error as Error);
      
      // Fallback to API nếu IndexedDB fail
      if (this.config.enableApiSync) {
        return await PasswordApiService.fetchPasswords();
      }
      throw error;
    } finally {
      endTimer();
    }
  }

  /**
   * Tìm kiếm passwords
   */
  async searchPasswords(query: string): Promise<PasswordEntry[]> {
    const endTimer = logger.time('service:searchPasswords');
    
    try {
      const results = await db.searchPasswords(query);
      logger.debug('Search completed in IndexedDB', { query, resultCount: results.length });
      return results;
    } catch (error) {
      logger.warn('IndexedDB search failed, trying API fallback', error as Error);
      
      // Fallback to API search
      if (this.config.enableApiSync && query) {
        return await PasswordApiService.fetchPasswords(query);
      }
      throw error;
    } finally {
      endTimer();
    }
  }

  /**
   * Thêm password mới
   */
  async addPassword(entry: PasswordInsert): Promise<PasswordEntry> {
    const endTimer = logger.time('service:addPassword');
    
    try {
      // Primary: Thêm vào IndexedDB
      const result = await db.addPassword(entry);
      logger.info('Password added to IndexedDB', { id: result.id, service: entry.service });
      
      // Secondary: Sync với API nếu enabled
      if (this.config.enableApiSync) {
        try {
          await PasswordApiService.addPassword(entry);
          logger.debug('Password synced to API successfully');
        } catch (apiErr) {
          logger.warn('API sync failed for add operation', apiErr as Error);
          // Không throw error, vì IndexedDB đã thành công
        }
      }
      
      return result;
    } catch (error) {
      logger.error('Failed to add password', error as Error);
      throw error;
    } finally {
      endTimer();
    }
  }

  /**
   * Cập nhật password
   */
  async updatePassword(id: string, entry: Partial<PasswordInsert>): Promise<PasswordEntry> {
    const endTimer = logger.time('service:updatePassword');
    
    try {
      // Primary: Cập nhật trong IndexedDB
      const result = await db.updatePassword(id, entry);
      logger.info('Password updated in IndexedDB', { id, service: entry.service });
      
      // Secondary: Sync với API nếu enabled
      if (this.config.enableApiSync) {
        try {
          await PasswordApiService.updatePassword(id, entry);
          logger.debug('Password update synced to API successfully');
        } catch (apiErr) {
          logger.warn('API sync failed for update operation', apiErr as Error);
        }
      }
      
      return result;
    } catch (error) {
      logger.error('Failed to update password', error as Error);
      throw error;
    } finally {
      endTimer();
    }
  }

  /**
   * Xóa password
   */
  async deletePassword(id: string): Promise<void> {
    const endTimer = logger.time('service:deletePassword');
    
    try {
      // Primary: Xóa từ IndexedDB
      await db.deletePassword(id);
      logger.info('Password deleted from IndexedDB', { id });
      
      // Secondary: Sync với API nếu enabled
      if (this.config.enableApiSync) {
        try {
          await PasswordApiService.deletePassword(id);
          logger.debug('Password deletion synced to API successfully');
        } catch (apiErr) {
          logger.warn('API sync failed for delete operation', apiErr as Error);
        }
      }
    } catch (error) {
      logger.error('Failed to delete password', error as Error);
      throw error;
    } finally {
      endTimer();
    }
  }

  /**
   * Xóa toàn bộ passwords
   */
  async clearAllPasswords(): Promise<void> {
    const endTimer = logger.time('service:clearAllPasswords');
    
    try {
      await db.clearAll();
      logger.warn('All passwords cleared from IndexedDB');
    } catch (error) {
      logger.error('Failed to clear all passwords', error as Error);
      throw error;
    } finally {
      endTimer();
    }
  }

  /**
   * Lấy thống kê passwords
   */
  async getStats(): Promise<PasswordStats> {
    const endTimer = logger.time('service:getStats');
    
    try {
      const passwords = await this.getAllPasswords();
      const stats = {
        total: passwords.length,
        hasPasswords: passwords.length > 0
      };
      
      logger.debug('Password stats calculated', stats);
      return stats;
    } catch (error) {
      logger.error('Failed to get password stats', error as Error);
      throw error;
    } finally {
      endTimer();
    }
  }
}