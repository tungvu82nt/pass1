/**
 * Test Constants
 * Centralized constants cho testing để tránh hardcoded values
 * 
 * Features:
 * - Consistent test data
 * - Easy maintenance
 * - Type safety
 */

/**
 * Test URLs và Domains
 */
export const TEST_CONSTANTS = {
  // Production URLs
  PRODUCTION_DOMAIN: 'harmonious-pothos-5f3f98.netlify.app',
  PRODUCTION_URL: 'https://harmonious-pothos-5f3f98.netlify.app',
  PRODUCTION_API_URL: 'https://harmonious-pothos-5f3f98.netlify.app/.netlify/functions/api',

  // Development URLs
  DEV_DOMAIN: 'localhost',
  DEV_URL: 'http://localhost:8080',
  DEV_API_URL: '/api',

  // Test URLs
  CUSTOM_API_URL: 'https://custom-api.example.com/api',
  INVALID_URL: 'not-a-valid-url',

  // Mock data
  MOCK_PASSWORD_ENTRY: {
    id: 'test-id-123',
    service: 'Test Service',
    username: 'testuser',
    password: 'testpass123',
    notes: 'Test notes',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },

  // API responses
  MOCK_API_RESPONSES: {
    SUCCESS: { success: true, data: [] },
    ERROR: { success: false, error: 'Test error' },
  },
} as const;

/**
 * Test utilities
 */
export const TEST_UTILS = {
  /**
   * Tạo mock URL với domain
   */
  createMockUrl: (domain: string, path = '') => `https://${domain}${path}`,

  /**
   * Tạo mock API URL
   */
  createMockApiUrl: (domain: string) => `https://${domain}/.netlify/functions/api`,

  /**
   * Validate URL format
   */
  isValidTestUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
} as const;

/**
 * Environment-specific test constants
 */
export const ENV_TEST_CONSTANTS = {
  PRODUCTION: {
    domain: TEST_CONSTANTS.PRODUCTION_DOMAIN,
    url: TEST_CONSTANTS.PRODUCTION_URL,
    apiUrl: TEST_CONSTANTS.PRODUCTION_API_URL,
  },
  DEVELOPMENT: {
    domain: TEST_CONSTANTS.DEV_DOMAIN,
    url: TEST_CONSTANTS.DEV_URL,
    apiUrl: TEST_CONSTANTS.DEV_API_URL,
  },
} as const;

/**
 * Type definitions
 */
export type TestEnvironment = keyof typeof ENV_TEST_CONSTANTS;
export type TestConstants = typeof TEST_CONSTANTS;