/**
 * Configuration Factory
 * Factory pattern để tạo configurations dựa trên environment
 * 
 * Features:
 * - Environment-aware configuration creation
 * - Configuration composition
 * - Runtime configuration switching
 * - Configuration caching
 */

import { ENV_ACCESS } from './env-utils';
import { logger } from '@/lib/utils/logger';

/**
 * Configuration profiles
 */
export type ConfigProfile = 'development' | 'production' | 'testing';

/**
 * API Configuration interface
 */
export interface ApiConfiguration {
  baseUrl: string;
  enableSync: boolean;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

/**
 * Database Configuration interface
 */
export interface DatabaseConfiguration {
  name: string;
  version: number;
  storeName: string;
  indexes: readonly string[];
  enableBackup: boolean;
  maxEntries: number;
}

/**
 * Application Configuration interface
 */
export interface ApplicationConfiguration {
  name: string;
  version: string;
  description: string;
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Complete configuration interface
 */
export interface CompleteConfiguration {
  profile: ConfigProfile;
  api: ApiConfiguration;
  database: DatabaseConfiguration;
  application: ApplicationConfiguration;
}

/**
 * Configuration Factory Class
 */
export class ConfigurationFactory {
  private static cache = new Map<ConfigProfile, CompleteConfiguration>();

  /**
   * Create API configuration for specific profile
   */
  private static createApiConfig(profile: ConfigProfile): ApiConfiguration {
    const baseConfigs = {
      development: {
        baseUrl: 'http://localhost:3001/api/passwords',
        enableSync: false,
        timeout: 10000,
        retryAttempts: 1,
        retryDelay: 1000,
      },
      production: {
        baseUrl: 'https://harmonious-pothos-5f3f98.netlify.app/.netlify/functions/api',
        enableSync: true,
        timeout: 5000,
        retryAttempts: 3,
        retryDelay: 2000,
      },
      testing: {
        baseUrl: 'http://localhost:3001/api/passwords',
        enableSync: false,
        timeout: 3000,
        retryAttempts: 0,
        retryDelay: 0,
      },
    };

    const config = baseConfigs[profile];

    // Override với environment variables nếu có
    return {
      baseUrl: ENV_ACCESS.getEnvVar('VITE_API_BASE_URL', config.baseUrl),
      enableSync: ENV_ACCESS.getBooleanEnv('VITE_ENABLE_API_SYNC', config.enableSync),
      timeout: ENV_ACCESS.getNumberEnv('VITE_API_TIMEOUT', config.timeout),
      retryAttempts: ENV_ACCESS.getNumberEnv('VITE_API_RETRY_ATTEMPTS', config.retryAttempts),
      retryDelay: ENV_ACCESS.getNumberEnv('VITE_API_RETRY_DELAY', config.retryDelay),
    };
  }

  /**
   * Create database configuration for specific profile
   */
  private static createDatabaseConfig(profile: ConfigProfile): DatabaseConfiguration {
    const baseConfigs = {
      development: {
        name: 'memorySafeGuardDB_dev',
        version: 1,
        storeName: 'passwords',
        indexes: ['service', 'username', 'updatedAt'] as const,
        enableBackup: true,
        maxEntries: 1000,
      },
      production: {
        name: 'memorySafeGuardDB',
        version: 1,
        storeName: 'passwords',
        indexes: ['service', 'username', 'updatedAt'] as const,
        enableBackup: true,
        maxEntries: 10000,
      },
      testing: {
        name: 'memorySafeGuardDB_test',
        version: 1,
        storeName: 'passwords',
        indexes: ['service', 'username', 'updatedAt'] as const,
        enableBackup: false,
        maxEntries: 100,
      },
    };

    return baseConfigs[profile];
  }

  /**
   * Create application configuration for specific profile
   */
  private static createApplicationConfig(profile: ConfigProfile): ApplicationConfiguration {
    const baseConfigs = {
      development: {
        name: 'Memory Safe Guard (Dev)',
        version: '1.0.0-dev',
        description: 'Ứng dụng quản lý mật khẩu - Development',
        enableAnalytics: false,
        enableErrorReporting: false,
        logLevel: 'debug' as const,
      },
      production: {
        name: 'Memory Safe Guard',
        version: '1.0.0',
        description: 'Ứng dụng quản lý mật khẩu hiện đại và an toàn',
        enableAnalytics: true,
        enableErrorReporting: true,
        logLevel: 'info' as const,
      },
      testing: {
        name: 'Memory Safe Guard (Test)',
        version: '1.0.0-test',
        description: 'Ứng dụng quản lý mật khẩu - Testing',
        enableAnalytics: false,
        enableErrorReporting: false,
        logLevel: 'warn' as const,
      },
    };

    return baseConfigs[profile];
  }

  /**
   * Create complete configuration for specific profile
   */
  public static createConfiguration(profile: ConfigProfile): CompleteConfiguration {
    // Check cache first
    if (this.cache.has(profile)) {
      logger.debug('Using cached configuration', { profile });
      return this.cache.get(profile)!;
    }

    logger.info('Creating new configuration', { profile });

    const config: CompleteConfiguration = {
      profile,
      api: this.createApiConfig(profile),
      database: this.createDatabaseConfig(profile),
      application: this.createApplicationConfig(profile),
    };

    // Cache configuration
    this.cache.set(profile, config);

    logger.debug('Configuration created and cached', { profile, config });
    return config;
  }

  /**
   * Get current configuration based on environment
   */
  public static getCurrentConfiguration(): CompleteConfiguration {
    let profile: ConfigProfile;

    if (ENV_ACCESS.isDevelopment) {
      profile = 'development';
    } else if (ENV_ACCESS.getEnvVar('NODE_ENV') === 'test') {
      profile = 'testing';
    } else {
      profile = 'production';
    }

    return this.createConfiguration(profile);
  }

  /**
   * Clear configuration cache
   */
  public static clearCache(): void {
    this.cache.clear();
    logger.info('Configuration cache cleared');
  }

  /**
   * Get available profiles
   */
  public static getAvailableProfiles(): ConfigProfile[] {
    return ['development', 'production', 'testing'];
  }

  /**
   * Validate configuration
   */
  public static validateConfiguration(config: CompleteConfiguration): boolean {
    try {
      // Basic validation
      if (!config.api.baseUrl || !config.database.name || !config.application.name) {
        return false;
      }

      // URL validation
      new URL(config.api.baseUrl);

      // Timeout validation
      if (config.api.timeout < 1000 || config.api.timeout > 30000) {
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Configuration validation failed', error as Error);
      return false;
    }
  }
}

/**
 * Convenience function để get current config
 */
export const getCurrentConfig = () => ConfigurationFactory.getCurrentConfiguration();

/**
 * Convenience function để get specific profile config
 */
export const getConfigForProfile = (profile: ConfigProfile) =>
  ConfigurationFactory.createConfiguration(profile);