/**
 * URL Builder Tests
 * Comprehensive testing cho URL construction logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiUrlBuilder, DEPLOYMENT_CONSTANTS } from '../url-builder';
import { ENV_ACCESS } from '../env-utils';

// Mock ENV_ACCESS
vi.mock('../env-utils', () => ({
  ENV_ACCESS: {
    isProduction: false,
    isDevelopment: true,
    getEnvVar: vi.fn(),
  }
}));

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    time: vi.fn(() => vi.fn()),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
}));

describe('ApiUrlBuilder', () => {
  beforeEach(() => {
    // Reset cache và mocks trước mỗi test
    ApiUrlBuilder.resetCache();
    vi.clearAllMocks();
  });

  describe('buildApiBaseUrl', () => {
    it('should return explicit env var when provided and valid', () => {
      const mockUrl = 'https://custom-api.example.com/api';
      vi.mocked(ENV_ACCESS.getEnvVar).mockReturnValue(mockUrl);

      const result = ApiUrlBuilder.buildApiBaseUrl();

      expect(result).toBe(mockUrl);
      expect(ENV_ACCESS.getEnvVar).toHaveBeenCalledWith('VITE_API_BASE_URL');
    });

    it('should return dev path for development environment', () => {
      vi.mocked(ENV_ACCESS.getEnvVar).mockReturnValue(''); // No explicit URL
      vi.mocked(ENV_ACCESS).isProduction = false;

      const result = ApiUrlBuilder.buildApiBaseUrl();

      expect(result).toBe(DEPLOYMENT_CONSTANTS.DEV_API_PATH);
    });

    it('should build production URL correctly', () => {
      const mockAppUrl = 'https://yapee.online';
      vi.mocked(ENV_ACCESS.getEnvVar)
        .mockReturnValueOnce('') // No explicit API URL
        .mockReturnValueOnce(mockAppUrl); // App URL
      vi.mocked(ENV_ACCESS).isProduction = true;

      const result = ApiUrlBuilder.buildApiBaseUrl();

      const expectedUrl = `${mockAppUrl}${DEPLOYMENT_CONSTANTS.NETLIFY_FUNCTIONS_PATH}`;
      expect(result).toBe(expectedUrl);
    });

    it('should use fallback URL when app URL is missing', () => {
      vi.mocked(ENV_ACCESS.getEnvVar).mockReturnValue(''); // No URLs provided
      vi.mocked(ENV_ACCESS).isProduction = true;

      const result = ApiUrlBuilder.buildApiBaseUrl();

      const expectedUrl = `${DEPLOYMENT_CONSTANTS.NETLIFY_FALLBACK_URL}${DEPLOYMENT_CONSTANTS.NETLIFY_FUNCTIONS_PATH}`;
      expect(result).toBe(expectedUrl);
    });

    it('should cache results for performance', () => {
      const mockUrl = 'https://cached.example.com/api';
      vi.mocked(ENV_ACCESS.getEnvVar).mockReturnValue(mockUrl);

      // First call
      const result1 = ApiUrlBuilder.buildApiBaseUrl();
      // Second call
      const result2 = ApiUrlBuilder.buildApiBaseUrl();

      expect(result1).toBe(result2);
      expect(ENV_ACCESS.getEnvVar).toHaveBeenCalledTimes(1); // Only called once due to caching
    });

    it('should handle invalid URLs gracefully', () => {
      const invalidUrl = 'not-a-valid-url';
      vi.mocked(ENV_ACCESS.getEnvVar)
        .mockReturnValueOnce(invalidUrl) // Invalid explicit URL
        .mockReturnValueOnce(''); // No app URL
      vi.mocked(ENV_ACCESS).isProduction = true;

      const result = ApiUrlBuilder.buildApiBaseUrl();

      // Should fallback to Netlify URL
      const expectedUrl = `${DEPLOYMENT_CONSTANTS.NETLIFY_FALLBACK_URL}${DEPLOYMENT_CONSTANTS.NETLIFY_FUNCTIONS_PATH}`;
      expect(result).toBe(expectedUrl);
    });
  });

  describe('validateConfiguration', () => {
    it('should return valid for correct configuration', () => {
      const mockUrl = 'https://valid.example.com/api';
      vi.mocked(ENV_ACCESS.getEnvVar).mockReturnValue(mockUrl);

      const result = ApiUrlBuilder.validateConfiguration();

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid configuration', () => {
      // Mock để return invalid URL
      vi.mocked(ENV_ACCESS.getEnvVar).mockReturnValue('invalid-url');

      const result = ApiUrlBuilder.validateConfiguration();

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('resetCache', () => {
    it('should clear cached values', () => {
      const mockUrl = 'https://cached.example.com/api';
      vi.mocked(ENV_ACCESS.getEnvVar).mockReturnValue(mockUrl);

      // Build URL to cache it
      ApiUrlBuilder.buildApiBaseUrl();
      
      // Reset cache
      ApiUrlBuilder.resetCache();
      
      // Build again - should call getEnvVar again
      ApiUrlBuilder.buildApiBaseUrl();

      expect(ENV_ACCESS.getEnvVar).toHaveBeenCalledTimes(2);
    });
  });
});

describe('DEPLOYMENT_CONSTANTS', () => {
  it('should have all required constants', () => {
    expect(DEPLOYMENT_CONSTANTS.NETLIFY_FALLBACK_URL).toBeDefined();
    expect(DEPLOYMENT_CONSTANTS.NETLIFY_FUNCTIONS_PATH).toBeDefined();
    expect(DEPLOYMENT_CONSTANTS.DEV_API_PATH).toBeDefined();
    expect(DEPLOYMENT_CONSTANTS.DEFAULT_PRODUCTION_URL).toBeDefined();
  });

  it('should have valid URL formats', () => {
    expect(() => new URL(DEPLOYMENT_CONSTANTS.NETLIFY_FALLBACK_URL)).not.toThrow();
    expect(() => new URL(DEPLOYMENT_CONSTANTS.DEFAULT_PRODUCTION_URL)).not.toThrow();
  });
});