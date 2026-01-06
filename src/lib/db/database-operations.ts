/**
 * Database Operations
 * Tách riêng các operations phức tạp từ DatabaseManager
 * 
 * Features:
 * - Specialized operations
 * - Search optimization
 * - Batch operations
 */

import { PasswordEntry, PasswordInsert } from '@/lib/types/models';

/**
 * Search operations cho passwords
 */
export class PasswordSearchOperations {
  /**
   * Advanced search với multiple criteria
   */
  static searchByMultipleCriteria(
    passwords: PasswordEntry[],
    criteria: {
      query?: string;
      dateRange?: { from: Date; to: Date };
      services?: string[];
    }
  ): PasswordEntry[] {
    let filtered = [...passwords];

    // Text search
    if (criteria.query) {
      const searchTerm = criteria.query.toLowerCase().trim();
      filtered = filtered.filter(password => 
        password.service.toLowerCase().includes(searchTerm) ||
        password.username.toLowerCase().includes(searchTerm)
      );
    }

    // Date range filter
    if (criteria.dateRange) {
      filtered = filtered.filter(password => {
        const updatedAt = new Date(password.updatedAt);
        return updatedAt >= criteria.dateRange!.from && 
               updatedAt <= criteria.dateRange!.to;
      });
    }

    // Service filter
    if (criteria.services && criteria.services.length > 0) {
      filtered = filtered.filter(password => 
        criteria.services!.includes(password.service)
      );
    }

    return filtered;
  }

  /**
   * Fuzzy search implementation
   */
  static fuzzySearch(passwords: PasswordEntry[], query: string): PasswordEntry[] {
    if (!query.trim()) return passwords;

    const searchTerm = query.toLowerCase();
    
    return passwords
      .map(password => ({
        password,
        score: this.calculateFuzzyScore(password, searchTerm)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.password);
  }

  /**
   * Calculate fuzzy search score
   */
  private static calculateFuzzyScore(password: PasswordEntry, searchTerm: string): number {
    let score = 0;
    const service = password.service.toLowerCase();
    const username = password.username.toLowerCase();

    // Exact match gets highest score
    if (service === searchTerm || username === searchTerm) {
      score += 100;
    }

    // Starts with match
    if (service.startsWith(searchTerm) || username.startsWith(searchTerm)) {
      score += 50;
    }

    // Contains match
    if (service.includes(searchTerm) || username.includes(searchTerm)) {
      score += 25;
    }

    // Character similarity (simple implementation)
    score += this.getCharacterSimilarity(service, searchTerm) * 10;
    score += this.getCharacterSimilarity(username, searchTerm) * 10;

    return score;
  }

  /**
   * Simple character similarity calculation
   */
  private static getCharacterSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate edit distance (Levenshtein distance)
   */
  private static getEditDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }
}

/**
 * Batch operations cho performance optimization
 */
export class PasswordBatchOperations {
  /**
   * Batch insert passwords
   */
  static async batchInsert(
    passwords: PasswordInsert[],
    executeTransaction: <T>(
      mode: IDBTransactionMode,
      operation: (store: IDBObjectStore) => IDBRequest<T>
    ) => Promise<T>
  ): Promise<PasswordEntry[]> {
    const now = new Date().toISOString();
    const newPasswords: PasswordEntry[] = passwords.map((password, index) => ({
      id: `pwd_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
      ...password,
      createdAt: now,
      updatedAt: now,
    }));

    // Batch insert using transaction
    await executeTransaction('readwrite', (store) => {
      newPasswords.forEach(password => {
        store.add(password);
      });
      return store.transaction;
    });

    return newPasswords;
  }

  /**
   * Batch update passwords
   */
  static async batchUpdate(
    updates: Array<{ id: string; data: Partial<PasswordInsert> }>,
    executeTransaction: <T>(
      mode: IDBTransactionMode,
      operation: (store: IDBObjectStore) => IDBRequest<T>
    ) => Promise<T>
  ): Promise<void> {
    const now = new Date().toISOString();

    await executeTransaction('readwrite', (store) => {
      updates.forEach(({ id, data }) => {
        const getRequest = store.get(id);
        getRequest.onsuccess = () => {
          const existingPassword = getRequest.result;
          if (existingPassword) {
            const updatedPassword = {
              ...existingPassword,
              ...data,
              updatedAt: now,
            };
            store.put(updatedPassword);
          }
        };
      });
      return store.transaction;
    });
  }
}