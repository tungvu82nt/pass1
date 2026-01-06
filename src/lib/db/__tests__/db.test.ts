/**
 * DatabaseManager Tests
 * Test suite cho IndexedDB implementation với proper mocking
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseManager } from '../db';
import { PasswordInsert } from '@/lib/types/models';

// Mock IndexedDB cho testing environment
const mockIndexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
};

// Mock IDBDatabase
const mockDB = {
  transaction: vi.fn(),
  close: vi.fn(),
  objectStoreNames: {
    contains: vi.fn(),
  },
  createObjectStore: vi.fn(),
};

// Mock IDBTransaction
const mockTransaction = {
  objectStore: vi.fn(),
  oncomplete: null,
  onerror: null,
};

// Mock IDBObjectStore
const mockStore = {
  add: vi.fn(),
  put: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
  getAll: vi.fn(),
  clear: vi.fn(),
  createIndex: vi.fn(),
};

// Mock IDBRequest với proper event simulation
const createMockRequest = (result: any = null, error: any = null) => {
  const request = {
    result,
    error,
    onsuccess: null as any,
    onerror: null as any,
  };
  
  // Auto-trigger success/error sau một tick
  setTimeout(() => {
    if (error && request.onerror) {
      request.onerror();
    } else if (request.onsuccess) {
      request.onsuccess();
    }
  }, 0);
  
  return request;
};

describe('DatabaseManager', () => {
  let dbManager: DatabaseManager;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup IndexedDB mock
    global.indexedDB = mockIndexedDB as any;
    
    // Get fresh instance
    dbManager = DatabaseManager.getInstance();
    
    // Setup default transaction mocks
    mockDB.transaction.mockReturnValue(mockTransaction);
    mockTransaction.objectStore.mockReturnValue(mockStore);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = DatabaseManager.getInstance();
      const instance2 = DatabaseManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('Database Initialization', () => {
    it('should initialize database successfully', async () => {
      const mockRequest = createMockRequest(mockDB);
      mockIndexedDB.open.mockReturnValue(mockRequest);
      
      const initPromise = dbManager.initialize();
      await expect(initPromise).resolves.toBeUndefined();
      expect(mockIndexedDB.open).toHaveBeenCalledWith('memorySafeGuardDB', 1);
    });

    it('should handle database initialization error', async () => {
      const mockRequest = createMockRequest(null, new Error('DB Error'));
      mockIndexedDB.open.mockReturnValue(mockRequest);
      
      const initPromise = dbManager.initialize();
      await expect(initPromise).rejects.toThrow('Không thể kết nối đến cơ sở dữ liệu');
    });
  });

  describe('Password Operations', () => {
    const samplePassword: PasswordInsert = {
      service: 'Gmail',
      username: 'test@gmail.com',
      password: 'secure123',
    };

    beforeEach(async () => {
      // Mock successful initialization
      const mockRequest = createMockRequest(mockDB);
      mockIndexedDB.open.mockReturnValue(mockRequest);
      
      await dbManager.initialize();
    });

    describe('addPassword', () => {
      it('should add password successfully', async () => {
        const mockRequest = createMockRequest();
        mockStore.add.mockReturnValue(mockRequest);
        
        const result = await dbManager.addPassword(samplePassword);
        
        expect(result).toMatchObject({
          service: samplePassword.service,
          username: samplePassword.username,
          password: samplePassword.password,
        });
        expect(result.id).toBeDefined();
        expect(result.createdAt).toBeDefined();
        expect(result.updatedAt).toBeDefined();
      });

      it('should handle add password error', async () => {
        const mockRequest = createMockRequest(null, new Error('Add failed'));
        mockStore.add.mockReturnValue(mockRequest);
        
        await expect(dbManager.addPassword(samplePassword)).rejects.toThrow('Không thể thêm mật khẩu mới');
      });
    });

    describe('getAllPasswords', () => {
      it('should get all passwords successfully', async () => {
        const mockPasswords = [
          { id: '1', service: 'Gmail', username: 'test@gmail.com', password: 'pass1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
          { id: '2', service: 'Facebook', username: 'test@fb.com', password: 'pass2', createdAt: '2024-01-02', updatedAt: '2024-01-02' },
        ];
        
        const mockRequest = createMockRequest(mockPasswords);
        mockStore.getAll.mockReturnValue(mockRequest);
        
        const result = await dbManager.getAllPasswords();
        expect(result).toEqual(mockPasswords);
      });
    });

    describe('searchPasswords', () => {
      it('should search passwords by service', async () => {
        const mockPasswords = [
          { id: '1', service: 'Gmail', username: 'test@gmail.com', password: 'pass1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
          { id: '2', service: 'Facebook', username: 'test@fb.com', password: 'pass2', createdAt: '2024-01-02', updatedAt: '2024-01-02' },
        ];
        
        const mockRequest = createMockRequest(mockPasswords);
        mockStore.getAll.mockReturnValue(mockRequest);
        
        const result = await dbManager.searchPasswords('gmail');
        
        expect(result).toHaveLength(1);
        expect(result[0].service).toBe('Gmail');
      });

      it('should return all passwords when query is empty', async () => {
        const mockPasswords = [
          { id: '1', service: 'Gmail', username: 'test@gmail.com', password: 'pass1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        ];
        
        const mockRequest = createMockRequest(mockPasswords);
        mockStore.getAll.mockReturnValue(mockRequest);
        
        const result = await dbManager.searchPasswords('');
        expect(mockStore.getAll).toHaveBeenCalled();
        expect(result).toEqual(mockPasswords);
      });
    });

    describe('updatePassword', () => {
      it('should update password successfully', async () => {
        const existingPassword = {
          id: '1',
          service: 'Gmail',
          username: 'test@gmail.com',
          password: 'oldpass',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        };
        
        const updates = { password: 'newpass' };
        
        const mockGetRequest = createMockRequest(existingPassword);
        const mockPutRequest = createMockRequest();
        
        mockStore.get.mockReturnValue(mockGetRequest);
        mockStore.put.mockReturnValue(mockPutRequest);
        
        const result = await dbManager.updatePassword('1', updates);
        
        expect(result.password).toBe('newpass');
        expect(result.updatedAt).not.toBe(existingPassword.updatedAt);
      });

      it('should handle password not found', async () => {
        const mockGetRequest = createMockRequest(null);
        mockStore.get.mockReturnValue(mockGetRequest);
        
        await expect(dbManager.updatePassword('nonexistent', { password: 'newpass' }))
          .rejects.toThrow('Không thể cập nhật mật khẩu');
      });
    });

    describe('deletePassword', () => {
      it('should delete password successfully', async () => {
        const mockRequest = createMockRequest();
        mockStore.delete.mockReturnValue(mockRequest);
        
        await expect(dbManager.deletePassword('1')).resolves.toBeUndefined();
        expect(mockStore.delete).toHaveBeenCalledWith('1');
      });
    });

    describe('getStats', () => {
      it('should return correct stats', async () => {
        const mockPasswords = [
          { id: '1', service: 'Gmail', username: 'test@gmail.com', password: 'pass1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
          { id: '2', service: 'Facebook', username: 'test@fb.com', password: 'pass2', createdAt: '2024-01-02', updatedAt: '2024-01-02' },
        ];
        
        const mockRequest = createMockRequest(mockPasswords);
        mockStore.getAll.mockReturnValue(mockRequest);
        
        const result = await dbManager.getStats();
        
        expect(result).toEqual({
          total: 2,
          hasPasswords: true,
        });
      });
    });

    describe('clearAll', () => {
      it('should clear all passwords successfully', async () => {
        const mockRequest = createMockRequest();
        mockStore.clear.mockReturnValue(mockRequest);
        
        await expect(dbManager.clearAll()).resolves.toBeUndefined();
        expect(mockStore.clear).toHaveBeenCalled();
      });
    });
  });

  describe('Private Methods', () => {
    it('should generate unique IDs', () => {
      const id1 = (dbManager as any).generateId();
      const id2 = (dbManager as any).generateId();
      
      expect(id1).toMatch(/^pwd_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^pwd_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it('should sort passwords by date correctly', () => {
      const passwords = [
        { id: '1', service: 'A', username: 'a', password: 'a', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '2', service: 'B', username: 'b', password: 'b', createdAt: '2024-01-02', updatedAt: '2024-01-03' },
        { id: '3', service: 'C', username: 'c', password: 'c', createdAt: '2024-01-03', updatedAt: '2024-01-02' },
      ];
      
      const sorted = (dbManager as any).sortPasswordsByDate(passwords);
      
      expect(sorted[0].id).toBe('2'); // Most recent updatedAt
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1'); // Oldest updatedAt
    });

    it('should filter passwords by query correctly', () => {
      const passwords = [
        { id: '1', service: 'Gmail', username: 'test@gmail.com', password: 'pass1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '2', service: 'Facebook', username: 'user@fb.com', password: 'pass2', createdAt: '2024-01-02', updatedAt: '2024-01-02' },
        { id: '3', service: 'Twitter', username: 'test@twitter.com', password: 'pass3', createdAt: '2024-01-03', updatedAt: '2024-01-03' },
      ];
      
      const filtered = (dbManager as any).filterPasswordsByQuery(passwords, 'gmail');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].service).toBe('Gmail');
      
      const filteredByUsername = (dbManager as any).filterPasswordsByQuery(passwords, 'test');
      expect(filteredByUsername).toHaveLength(2); // Gmail and Twitter have 'test' in username
    });
  });
});