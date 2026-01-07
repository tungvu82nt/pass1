/**
 * Configuration Service
 * Centralized configuration access với type safety
 * Thay thế global scope pollution
 */

import { getCurrentUrl, getCurrentDomain, isProductionDomain } from './domain-config';
import { logger } from '@/lib/utils/logger';

/**
 * Configuration Service Interface
 * Định nghĩa contract cho configuration access
 */
interface IConfigurationService {
  getCurrentUrl(): string;
  getCurrentDomain(): string;
  isProduction(): boolean;
  getApiBaseUrl(): string;
  validateConfiguration(): boolean;
}

/**
 * Configuration Service Implementation
 * Singleton pattern để đảm bảo consistency
 */
class ConfigurationService implements IConfigurationService {
  private static instance: ConfigurationService;
  private isInitialized = false;

  private constructor() {
    this.initialize();
  }

  /**
   * Singleton instance getter
   */
  public static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  /**
   * Initialize configuration service
   */
  private initialize(): void {
    try {
      // Validate configuration on initialization
      this.validateConfiguration();
      this.isInitialized = true;
      logger.info('ConfigurationService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize ConfigurationService', error as Error);
      throw new Error('Configuration initialization failed');
    }
  }

  /**
   * Get current URL với error handling
   */
  public getCurrentUrl(): string {
    this.ensureInitialized();
    try {
      return getCurrentUrl();
    } catch (error) {
      logger.error('Failed to get current URL', error as Error);
      // Fallback to production URL
      return 'https://harmonious-pothos-5f3f98.netlify.app';
    }
  }

  /**
   * Get current domain với error handling
   */
  public getCurrentDomain(): string {
    this.ensureInitialized();
    try {
      return getCurrentDomain();
    } catch (error) {
      logger.error('Failed to get current domain', error as Error);
      return 'harmonious-pothos-5f3f98.netlify.app';
    }
  }

  /**
   * Check if running in production
   */
  public isProduction(): boolean {
    this.ensureInitialized();
    try {
      return isProductionDomain();
    } catch (error) {
      logger.error('Failed to check production status', error as Error);
      return true; // Safe default
    }
  }

  /**
   * Get API base URL
   */
  public getApiBaseUrl(): string {
    const baseUrl = this.getCurrentUrl();
    return `${baseUrl}/api`;
  }

  /**
   * Validate configuration
   */
  public validateConfiguration(): boolean {
    try {
      const url = getCurrentUrl();
      const domain = getCurrentDomain();

      if (!url || !domain) {
        throw new Error('Invalid configuration: missing URL or domain');
      }

      // Validate URL format
      new URL(url);

      logger.debug('Configuration validation passed', { url, domain });
      return true;
    } catch (error) {
      logger.error('Configuration validation failed', error as Error);
      return false;
    }
  }

  /**
   * Ensure service is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('ConfigurationService not initialized');
    }
  }

  /**
   * Reset instance (for testing)
   */
  public static resetInstance(): void {
    ConfigurationService.instance = null as any;
  }
}

/**
 * Export singleton instance
 */
export const configurationService = ConfigurationService.getInstance();

/**
 * Convenience functions với type safety
 */
export const getConfiguredUrl = (): string => configurationService.getCurrentUrl();
export const getConfiguredDomain = (): string => configurationService.getCurrentDomain();
export const isConfiguredProduction = (): boolean => configurationService.isProduction();
export const getConfiguredApiBaseUrl = (): string => configurationService.getApiBaseUrl();

/**
 * Type definitions cho global access (nếu thực sự cần thiết)
 */
declare global {
  interface Window {
    __CONFIG_SERVICE__?: ConfigurationService;
  }
}

/**
 * Optional: Safe global access (chỉ khi thực sự cần thiết)
 * Với proper type safety và error handling
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.__CONFIG_SERVICE__ = configurationService;
  logger.debug('ConfigurationService attached to window for debugging');
}