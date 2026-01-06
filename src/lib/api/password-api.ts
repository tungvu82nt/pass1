/**
 * PasswordApiService - API Layer
 * Tách riêng API operations khỏi business logic
 * 
 * Features:
 * - RESTful API operations
 * - Error handling
 * - Data transformation
 * - Type safety
 */

import { PasswordEntry, PasswordInsert } from '@/lib/types/models';
import { API_CONFIG } from '@/lib/config/app-config';
import { logger } from '@/lib/utils/logger';

/**
 * API Service cho external password sync
 * Refactor: Tách từ PasswordService để giảm coupling
 */
export class PasswordApiService {
  private static baseUrl = API_CONFIG.BASE_URL;

  /**
   * Fetch passwords từ API với optional search
   */
  static async fetchPasswords(query?: string): Promise<PasswordEntry[]> {
    const endTimer = logger.time('api:fetchPasswords');
    
    try {
      const url = query 
        ? `${this.baseUrl}?searchQuery=${encodeURIComponent(query)}` 
        : this.baseUrl;
      
      logger.debug('Fetching passwords from API', { url, query });
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API fetch failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform snake_case từ API sang camelCase
      const passwords = data.map((item: any) => ({
        id: item.id,
        service: item.service,
        username: item.username,
        password: item.password,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
      
      logger.info('Passwords fetched successfully from API', { count: passwords.length });
      return passwords;
    } catch (error) {
      logger.error('Failed to fetch passwords from API', error as Error);
      throw error;
    } finally {
      endTimer();
    }
  }

  /**
   * Add password via API
   */
  static async addPassword(entry: PasswordInsert): Promise<PasswordEntry> {
    const endTimer = logger.time('api:addPassword');
    
    try {
      logger.debug('Adding password via API', { service: entry.service });
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(entry),
      });
      
      if (!response.ok) {
        throw new Error(`API add failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const password = {
        id: data.id,
        service: data.service,
        username: data.username,
        password: data.password,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      logger.info('Password added successfully via API', { id: password.id });
      return password;
    } catch (error) {
      logger.error('Failed to add password via API', error as Error);
      throw error;
    } finally {
      endTimer();
    }
  }

  /**
   * Update password via API
   */
  static async updatePassword(id: string, entry: Partial<PasswordInsert>): Promise<PasswordEntry> {
    const endTimer = logger.time('api:updatePassword');
    
    try {
      logger.debug('Updating password via API', { id, service: entry.service });
      
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(entry),
      });
      
      if (!response.ok) {
        throw new Error(`API update failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const password = {
        id: data.id,
        service: data.service,
        username: data.username,
        password: data.password,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      logger.info('Password updated successfully via API', { id: password.id });
      return password;
    } catch (error) {
      logger.error('Failed to update password via API', error as Error);
      throw error;
    } finally {
      endTimer();
    }
  }

  /**
   * Delete password via API
   */
  static async deletePassword(id: string): Promise<void> {
    const endTimer = logger.time('api:deletePassword');
    
    try {
      logger.debug('Deleting password via API', { id });
      
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API delete failed: ${response.status} ${response.statusText}`);
      }
      
      logger.info('Password deleted successfully via API', { id });
    } catch (error) {
      logger.error('Failed to delete password via API', error as Error);
      throw error;
    } finally {
      endTimer();
    }
  }

  /**
   * Health check cho API service
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      return response.ok;
    } catch (error) {
      logger.warn('API health check failed', error as Error);
      return false;
    }
  }
}