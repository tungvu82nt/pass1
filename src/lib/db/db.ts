/**
 * DatabaseManager - IndexedDB Implementation
 * Singleton class để quản lý IndexedDB operations theo steering rules
 * 
 * Features:
 * - CRUD operations cho passwords
 * - Search functionality
 * - Error handling và retry logic
 * - Type-safe với TypeScript
 */

import { PasswordEntry, PasswordInsert } from '@/lib/types/models';
import { DATABASE, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/constants/app-constants';

/**
 * Database operation result wrapper
 */
type DatabaseResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Database configuration constants
 */
const DB_CONFIG = {
  NAME: 'memorySafeGuardDB',
  VERSION: 1,
  INDEXES: {
    SERVICE: 'service',
    USERNAME: 'username', 
    UPDATED_AT: 'updatedAt'
  }
} as const;

/**
 * IndexedDB Database Manager Singleton
 * Quản lý tất cả operations với IndexedDB
 */
export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: IDBDatabase | null = null;
  private readonly dbName = DB_CONFIG.NAME;
  private readonly storeName = DATABASE.TABLE_NAME;
  private readonly version = DB_CONFIG.VERSION;

  private constructor() {}

  /**
   * Singleton pattern - chỉ có một instance duy nhất
   */
  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Wrapper cho IndexedDB operations với error handling
   */
  private executeTransaction<T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error(ERROR_MESSAGES.CONNECTION_FAILED));
        return;
      }

      const transaction = this.db.transaction([this.storeName], mode);
      const store = transaction.objectStore(this.storeName);
      const request = operation(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(request.error?.message || 'Database operation failed'));
    });
  }

  /**
   * Tạo object store với indexes
   */
  private createObjectStore(db: IDBDatabase): void {
    if (!db.objectStoreNames.contains(this.storeName)) {
      const store = db.createObjectStore(this.storeName, { 
        keyPath: 'id' 
      });
      
      // Tạo indexes để tối ưu tìm kiếm
      store.createIndex(DB_CONFIG.INDEXES.SERVICE, 'service', { unique: false });
      store.createIndex(DB_CONFIG.INDEXES.USERNAME, 'username', { unique: false });
      store.createIndex(DB_CONFIG.INDEXES.UPDATED_AT, 'updatedAt', { unique: false });
    }
  }

  /**
   * Khởi tạo database và tạo object store
   */
  public async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error(ERROR_MESSAGES.CONNECTION_FAILED));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStore(db);
      };
    });
  }

  /**
   * Đảm bảo database đã được khởi tạo
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }
  }

  /**
   * Tạo ID duy nhất cho password entry
   */
  private generateId(): string {
    return `pwd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sắp xếp passwords theo updatedAt giảm dần
   */
  private sortPasswordsByDate(passwords: PasswordEntry[]): PasswordEntry[] {
    return passwords.sort((a, b) => 
      new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    );
  }

  /**
   * Filter passwords theo search query
   */
  private filterPasswordsByQuery(passwords: PasswordEntry[], query: string): PasswordEntry[] {
    const searchTerm = query.toLowerCase().trim();
    return passwords.filter(password => 
      password.service.toLowerCase().includes(searchTerm) ||
      password.username.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Lấy tất cả passwords từ database
   */
  public async getAllPasswords(): Promise<PasswordEntry[]> {
    await this.ensureInitialized();
    
    try {
      const passwords = await this.executeTransaction('readonly', store => store.getAll());
      return this.sortPasswordsByDate(passwords);
    } catch (error) {
      throw new Error(ERROR_MESSAGES.FETCH_FAILED);
    }
  }

  /**
   * Tìm kiếm passwords theo service hoặc username
   */
  public async searchPasswords(query: string): Promise<PasswordEntry[]> {
    if (!query.trim()) {
      return this.getAllPasswords();
    }

    await this.ensureInitialized();
    
    try {
      const allPasswords = await this.executeTransaction('readonly', store => store.getAll());
      const filtered = this.filterPasswordsByQuery(allPasswords, query);
      return this.sortPasswordsByDate(filtered);
    } catch (error) {
      throw new Error(ERROR_MESSAGES.SEARCH_FAILED);
    }
  }

  /**
   * Thêm password mới
   */
  public async addPassword(passwordData: PasswordInsert): Promise<PasswordEntry> {
    await this.ensureInitialized();
    
    const now = new Date().toISOString();
    const newPassword: PasswordEntry = {
      id: this.generateId(),
      ...passwordData,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await this.executeTransaction('readwrite', store => store.add(newPassword));
      return newPassword;
    } catch (error) {
      throw new Error(ERROR_MESSAGES.ADD_FAILED);
    }
  }

  /**
   * Cập nhật password theo ID
   */
  public async updatePassword(id: string, updates: Partial<PasswordInsert>): Promise<PasswordEntry> {
    await this.ensureInitialized();
    
    try {
      // Lấy password hiện tại
      const existingPassword = await this.executeTransaction('readonly', store => store.get(id));
      
      if (!existingPassword) {
        throw new Error('Password not found');
      }

      // Tạo password đã cập nhật
      const updatedPassword: PasswordEntry = {
        ...existingPassword,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Lưu password đã cập nhật
      await this.executeTransaction('readwrite', store => store.put(updatedPassword));
      
      return updatedPassword;
    } catch (error) {
      throw new Error(ERROR_MESSAGES.UPDATE_FAILED);
    }
  }

  /**
   * Xóa password theo ID
   */
  public async deletePassword(id: string): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await this.executeTransaction('readwrite', store => store.delete(id));
    } catch (error) {
      throw new Error(ERROR_MESSAGES.DELETE_FAILED);
    }
  }

  /**
   * Lấy thống kê passwords
   */
  public async getStats(): Promise<{ total: number; hasPasswords: boolean }> {
    try {
      const passwords = await this.getAllPasswords();
      return {
        total: passwords.length,
        hasPasswords: passwords.length > 0,
      };
    } catch (error) {
      throw new Error(ERROR_MESSAGES.STATS_FAILED);
    }
  }

  /**
   * Xóa toàn bộ database (cho testing hoặc reset)
   * Note: Chỉ sử dụng cho development và testing
   */
  public async clearAll(): Promise<void> {
    await this.ensureInitialized();
    
    try {
      await this.executeTransaction('readwrite', store => store.clear());
    } catch (error) {
      throw new Error('Không thể xóa toàn bộ dữ liệu');
    }
  }

  /**
   * Kiểm tra kết nối database
   * Refactor Hint: Có thể mở rộng thêm health check cho production
   */
  public async healthCheck(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      return this.db !== null;
    } catch (error) {
      return false;
    }
  }
}
/**
 * Export singleton instance để sử dụng trong toàn bộ app
 * Note: Singleton pattern đảm bảo chỉ có một kết nối database duy nhất
 */
export const db = DatabaseManager.getInstance();