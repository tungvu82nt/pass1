/**
 * Password Repository Pattern
 * Tách biệt data access logic khỏi business logic
 */

import { PasswordEntry, PasswordInsert } from '@/lib/types/models';
import { DatabaseCore } from './database-core';
import { ErrorHandler, ErrorType } from '@/lib/utils/error-handler';
import { DATABASE_CONFIG } from '@/lib/config/app-config';

/**
 * Repository interface cho password operations
 */
export interface IPasswordRepository {
  findAll(): Promise<PasswordEntry[]>;
  findById(id: string): Promise<PasswordEntry | null>;
  search(query: string): Promise<PasswordEntry[]>;
  create(entry: PasswordInsert): Promise<PasswordEntry>;
  update(id: string, updates: Partial<PasswordInsert>): Promise<PasswordEntry>;
  delete(id: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * IndexedDB implementation của Password Repository
 */
export class IndexedDBPasswordRepository implements IPasswordRepository {
  private core: DatabaseCore;

  constructor() {
    this.core = new DatabaseCore({
      name: DATABASE_CONFIG.NAME,
      version: DATABASE_CONFIG.VERSION,
      storeName: DATABASE_CONFIG.STORE_NAME,
      indexes: DATABASE_CONFIG.INDEXES
    });
  }

  async findAll(): Promise<PasswordEntry[]> {
    try {
      const passwords = await this.core.executeTransaction('readonly', store => store.getAll());
      return this.sortByDate(passwords);
    } catch (error) {
      throw ErrorHandler.handleDatabaseError(error as Error, 'findAll');
    }
  }

  async findById(id: string): Promise<PasswordEntry | null> {
    try {
      const password = await this.core.executeTransaction('readonly', store => store.get(id));
      return password || null;
    } catch (error) {
      throw ErrorHandler.handleDatabaseError(error as Error, 'findById');
    }
  }

  async search(query: string): Promise<PasswordEntry[]> {
    try {
      if (!query.trim()) return this.findAll();
      
      const allPasswords = await this.findAll();
      return this.filterByQuery(allPasswords, query);
    } catch (error) {
      throw ErrorHandler.handleDatabaseError(error as Error, 'search');
    }
  }

  async create(entry: PasswordInsert): Promise<PasswordEntry> {
    try {
      const now = new Date().toISOString();
      const newPassword: PasswordEntry = {
        id: this.generateId(),
        ...entry,
        createdAt: now,
        updatedAt: now,
      };

      await this.core.executeTransaction('readwrite', store => store.add(newPassword));
      return newPassword;
    } catch (error) {
      throw ErrorHandler.handleDatabaseError(error as Error, 'create');
    }
  }

  async update(id: string, updates: Partial<PasswordInsert>): Promise<PasswordEntry> {
    try {
      const existing = await this.findById(id);
      if (!existing) {
        throw new Error(`Password with id ${id} not found`);
      }

      const updated: PasswordEntry = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await this.core.executeTransaction('readwrite', store => store.put(updated));
      return updated;
    } catch (error) {
      throw ErrorHandler.handleDatabaseError(error as Error, 'update');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.core.executeTransaction('readwrite', store => store.delete(id));
    } catch (error) {
      throw ErrorHandler.handleDatabaseError(error as Error, 'delete');
    }
  }

  async clear(): Promise<void> {
    try {
      await this.core.executeTransaction('readwrite', store => store.clear());
    } catch (error) {
      throw ErrorHandler.handleDatabaseError(error as Error, 'clear');
    }
  }

  // Private utility methods
  private generateId(): string {
    return `pwd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sortByDate(passwords: PasswordEntry[]): PasswordEntry[] {
    return passwords.sort((a, b) => 
      new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    );
  }

  private filterByQuery(passwords: PasswordEntry[], query: string): PasswordEntry[] {
    const searchTerm = query.toLowerCase().trim();
    return passwords.filter(password => 
      password.service.toLowerCase().includes(searchTerm) ||
      password.username.toLowerCase().includes(searchTerm)
    );
  }
}