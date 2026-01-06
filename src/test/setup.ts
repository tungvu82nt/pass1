/**
 * Test setup configuration
 * Cấu hình global cho tất cả test files
 */

import '@testing-library/jest-dom';

// Mock environment variables cho testing
Object.defineProperty(import.meta, 'env', {
  value: {
    DEV: true,
    PROD: false,
    VITE_ENABLE_SAMPLE_DATA: 'true',
    VITE_LOG_LEVEL: 'error', // Tắt logs trong tests
  },
  writable: true,
});

// Mock console methods để tránh noise trong tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock IndexedDB cho testing
const mockIDBRequest = {
  result: null,
  error: null,
  onsuccess: null,
  onerror: null,
  readyState: 'done',
};

const mockIDBDatabase = {
  createObjectStore: vi.fn(),
  transaction: vi.fn(() => ({
    objectStore: vi.fn(() => ({
      add: vi.fn(() => mockIDBRequest),
      get: vi.fn(() => mockIDBRequest),
      getAll: vi.fn(() => mockIDBRequest),
      put: vi.fn(() => mockIDBRequest),
      delete: vi.fn(() => mockIDBRequest),
      createIndex: vi.fn(),
    })),
    oncomplete: null,
    onerror: null,
  })),
  close: vi.fn(),
};

global.indexedDB = {
  open: vi.fn(() => ({
    ...mockIDBRequest,
    result: mockIDBDatabase,
    onupgradeneeded: null,
  })),
  deleteDatabase: vi.fn(() => mockIDBRequest),
} as any;

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
    readText: vi.fn(() => Promise.resolve('')),
  },
});