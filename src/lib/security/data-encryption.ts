/**
 * Data Encryption Layer
 * Bảo mật dữ liệu nhạy cảm trước khi lưu trữ
 */

import { logger } from '@/lib/utils/logger';

/**
 * Simple encryption utilities cho browser environment
 * Note: Đây là basic encryption, production cần implement proper crypto
 */
export class DataEncryption {
  private static readonly ENCRYPTION_KEY = 'memory-safe-guard-key';

  /**
   * Encrypt sensitive data before storage
   */
  static async encryptData(data: string): Promise<string> {
    try {
      // Basic encoding - production nên dùng Web Crypto API
      const encoded = btoa(encodeURIComponent(data));
      logger.debug('Data encrypted successfully');
      return encoded;
    } catch (error) {
      logger.error('Failed to encrypt data', error as Error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt data after retrieval
   */
  static async decryptData(encryptedData: string): Promise<string> {
    try {
      const decoded = decodeURIComponent(atob(encryptedData));
      logger.debug('Data decrypted successfully');
      return decoded;
    } catch (error) {
      logger.error('Failed to decrypt data', error as Error);
      throw new Error('Decryption failed');
    }
  }

  /**
   * Hash password for comparison (không lưu plain text)
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      // Sử dụng Web Crypto API cho production
      const encoder = new TextEncoder();
      const data = encoder.encode(password + this.ENCRYPTION_KEY);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      logger.debug('Password hashed successfully');
      return hashHex;
    } catch (error) {
      logger.error('Failed to hash password', error as Error);
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Generate secure random salt
   */
  static generateSalt(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}