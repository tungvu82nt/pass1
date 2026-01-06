/**
 * DatabaseCore - Core IndexedDB Operations
 * Tách riêng core database operations từ DatabaseManager
 */

import { ERROR_MESSAGES } from '@/lib/constants/app-constants';

export interface DatabaseConfig {
  name: string;
  version: number;
  storeName: string;
  indexes: readonly string[];
}

/**
 * Core database operations - Single Responsibility
 */
export class DatabaseCore {
  private db: IDBDatabase | null = null;
  
  constructor(private config: DatabaseConfig) {}

  /**
   * Initialize database connection
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.name, this.config.version);

      request.onerror = () => reject(new Error(ERROR_MESSAGES.CONNECTION_FAILED));
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
   * Execute transaction with proper error handling
   */
  async executeTransaction<T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], mode);
      const store = transaction.objectStore(this.config.storeName);
      const request = operation(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(request.error?.message || 'Database operation failed'));
    });
  }

  private createObjectStore(db: IDBDatabase): void {
    if (!db.objectStoreNames.contains(this.config.storeName)) {
      const store = db.createObjectStore(this.config.storeName, { keyPath: 'id' });
      
      // Create indexes
      this.config.indexes.forEach(index => {
        store.createIndex(index, index, { unique: false });
      });
    }
  }

  /**
   * Health check for database connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.db) await this.initialize();
      return this.db !== null;
    } catch {
      return false;
    }
  }
}