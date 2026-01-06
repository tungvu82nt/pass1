/**
 * ConfigurationService Unit Tests
 * Đảm bảo service hoạt động đúng và có error handling tốt
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { configurationService } from '../configuration-service';

// Mock dependencies
jest.mock('../domain-config', () => ({
  getCurrentUrl: jest.fn(),
  getCurrentDomain: jest.fn(),
  isProductionDomain: jest.fn(),
}));

jest.mock('@/lib/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { getCurrentUrl, getCurrentDomain, isProductionDomain } from '../domain-config';

const mockGetCurrentUrl = getCurrentUrl as jest.MockedFunction<typeof getCurrentUrl>;
const mockGetCurrentDomain = getCurrentDomain as jest.MockedFunction<typeof getCurrentDomain>;
const mockIsProductionDomain = isProductionDomain as jest.MockedFunction<typeof isProductionDomain>;

describe('ConfigurationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockGetCurrentUrl.mockReturnValue('https://silver-bublanina-ab8828.netlify.app');
    mockGetCurrentDomain.mockReturnValue('silver-bublanina-ab8828.netlify.app');
    mockIsProductionDomain.mockReturnValue(true);
  });

  describe('getCurrentUrl', () => {
    it('should return current URL successfully', () => {
      const result = configurationService.getCurrentUrl();
      expect(result).toBe('https://silver-bublanina-ab8828.netlify.app');
      expect(mockGetCurrentUrl).toHaveBeenCalled();
    });

    it('should handle errors and return fallback URL', () => {
      mockGetCurrentUrl.mockImplementation(() => {
        throw new Error('URL error');
      });

      const result = configurationService.getCurrentUrl();
      expect(result).toBe('https://silver-bublanina-ab8828.netlify.app'); // Fallback
    });
  });

  describe('getCurrentDomain', () => {
    it('should return current domain successfully', () => {
      const result = configurationService.getCurrentDomain();
      expect(result).toBe('silver-bublanina-ab8828.netlify.app');
      expect(mockGetCurrentDomain).toHaveBeenCalled();
    });

    it('should handle errors and return fallback domain', () => {
      mockGetCurrentDomain.mockImplementation(() => {
        throw new Error('Domain error');
      });

      const result = configurationService.getCurrentDomain();
      expect(result).toBe('silver-bublanina-ab8828.netlify.app'); // Fallback
    });
  });

  describe('isProduction', () => {
    it('should return production status', () => {
      const result = configurationService.isProduction();
      expect(result).toBe(true);
      expect(mockIsProductionDomain).toHaveBeenCalled();
    });

    it('should handle errors and return safe default', () => {
      mockIsProductionDomain.mockImplementation(() => {
        throw new Error('Production check error');
      });

      const result = configurationService.isProduction();
      expect(result).toBe(true); // Safe default
    });
  });

  describe('getApiBaseUrl', () => {
    it('should return API base URL', () => {
      const result = configurationService.getApiBaseUrl();
      expect(result).toBe('https://silver-bublanina-ab8828.netlify.app/api');
    });

    it('should handle URL errors in API base URL', () => {
      mockGetCurrentUrl.mockImplementation(() => {
        throw new Error('URL error');
      });

      const result = configurationService.getApiBaseUrl();
      expect(result).toBe('https://silver-bublanina-ab8828.netlify.app/api'); // Fallback
    });
  });

  describe('validateConfiguration', () => {
    it('should validate configuration successfully', () => {
      const result = configurationService.validateConfiguration();
      expect(result).toBe(true);
    });

    it('should fail validation with invalid URL', () => {
      mockGetCurrentUrl.mockReturnValue('invalid-url');
      
      const result = configurationService.validateConfiguration();
      expect(result).toBe(false);
    });

    it('should fail validation with empty values', () => {
      mockGetCurrentUrl.mockReturnValue('');
      mockGetCurrentDomain.mockReturnValue('');
      
      const result = configurationService.validateConfiguration();
      expect(result).toBe(false);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = configurationService;
      const instance2 = configurationService;
      
      expect(instance1).toBe(instance2);
    });
  });
});

/**
 * Integration Tests cho convenience functions
 */
describe('Convenience Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUrl.mockReturnValue('https://silver-bublanina-ab8828.netlify.app');
    mockGetCurrentDomain.mockReturnValue('silver-bublanina-ab8828.netlify.app');
    mockIsProductionDomain.mockReturnValue(true);
  });

  it('should export convenience functions', async () => {
    const {
      getConfiguredUrl,
      getConfiguredDomain,
      isConfiguredProduction,
      getConfiguredApiBaseUrl
    } = await import('../configuration-service');

    expect(getConfiguredUrl()).toBe('https://silver-bublanina-ab8828.netlify.app');
    expect(getConfiguredDomain()).toBe('silver-bublanina-ab8828.netlify.app');
    expect(isConfiguredProduction()).toBe(true);
    expect(getConfiguredApiBaseUrl()).toBe('https://silver-bublanina-ab8828.netlify.app/api');
  });
});