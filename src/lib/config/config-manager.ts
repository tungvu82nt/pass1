/**
 * Configuration Manager
 * Centralized configuration management với validation và monitoring
 */

import { logger } from '@/lib/utils/logger';
import { validateApiConfiguration, getApiConfigRecommendations } from './api-config-validator';
import { API_CONFIG, APP_CONFIG, DATABASE_CONFIG, DOMAIN_CONFIG } from './app-config';

/**
 * Configuration status interface
 */
export interface ConfigurationStatus {
  isValid: boolean;
  environment: 'development' | 'production';
  apiSyncEnabled: boolean;
  warnings: string[];
  errors: string[];
  recommendations: string[];
}

/**
 * Configuration Manager Class
 * Singleton pattern để manage application configuration
 */
export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private status: ConfigurationStatus | null = null;
  private lastValidation: number = 0;
  private readonly VALIDATION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    logger.debug('ConfigurationManager initialized');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  /**
   * Validate all configurations
   */
  public validateConfiguration(force = false): ConfigurationStatus {
    const now = Date.now();
    
    // Return cached result if still valid
    if (!force && this.status && (now - this.lastValidation) < this.VALIDATION_CACHE_TTL) {
      return this.status;
    }

    const endTimer = logger.time('config:validation');
    
    try {
      // Validate API configuration
      const apiValidation = validateApiConfiguration();
      
      // Determine environment
      const environment = import.meta.env.PROD ? 'production' : 'development';
      
      // Compile status
      this.status = {
        isValid: apiValidation.isValid,
        environment,
        apiSyncEnabled: API_CONFIG.ENABLE_SYNC,
        warnings: [...apiValidation.warnings],
        errors: [...apiValidation.errors],
        recommendations: [
          ...apiValidation.suggestions,
          ...getApiConfigRecommendations()
        ]
      };

      // Log validation results
      if (this.status.isValid) {
        logger.info('Configuration validation passed', {
          environment: this.status.environment,
          apiSyncEnabled: this.status.apiSyncEnabled,
          warningCount: this.status.warnings.length
        });
      } else {
        logger.error('Configuration validation failed', {
          errors: this.status.errors,
          warnings: this.status.warnings
        });
      }

      // Log warnings và recommendations
      if (this.status.warnings.length > 0) {
        logger.warn('Configuration warnings detected', { warnings: this.status.warnings });
      }

      if (this.status.recommendations.length > 0) {
        logger.info('Configuration recommendations available', { 
          recommendations: this.status.recommendations 
        });
      }

      this.lastValidation = now;
      return this.status;

    } catch (error) {
      logger.error('Configuration validation process failed', error as Error);
      
      this.status = {
        isValid: false,
        environment: 'development',
        apiSyncEnabled: false,
        warnings: [],
        errors: ['Validation process failed: ' + (error as Error).message],
        recommendations: ['Kiểm tra configuration files và environment variables']
      };
      
      return this.status;
    } finally {
      endTimer();
    }
  }

  /**
   * Get current configuration summary
   */
  public getConfigurationSummary() {
    return {
      app: {
        name: APP_CONFIG.NAME,
        version: APP_CONFIG.VERSION,
        description: APP_CONFIG.DESCRIPTION
      },
      api: {
        baseUrl: API_CONFIG.BASE_URL,
        syncEnabled: API_CONFIG.ENABLE_SYNC,
        timeout: API_CONFIG.TIMEOUT
      },
      database: {
        name: DATABASE_CONFIG.NAME,
        version: DATABASE_CONFIG.VERSION,
        storeName: DATABASE_CONFIG.STORE_NAME
      },
      domain: {
        name: DOMAIN_CONFIG.APP_NAME,
        domain: DOMAIN_CONFIG.DOMAIN,
        homepage: DOMAIN_CONFIG.HOMEPAGE
      }
    };
  }

  /**
   * Check if configuration is ready for production
   */
  public isProductionReady(): boolean {
    const status = this.validateConfiguration();
    
    return status.isValid && 
           status.errors.length === 0 && 
           (status.environment === 'development' || 
            (status.environment === 'production' && 
             (!status.apiSyncEnabled || API_CONFIG.BASE_URL.startsWith('https://'))));
  }

  /**
   * Get configuration health score (0-100)
   */
  public getHealthScore(): number {
    const status = this.validateConfiguration();
    
    let score = 100;
    
    // Deduct points for errors
    score -= status.errors.length * 25;
    
    // Deduct points for warnings
    score -= status.warnings.length * 10;
    
    // Bonus points for production readiness
    if (this.isProductionReady()) {
      score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Reset validation cache - for testing
   */
  public resetCache(): void {
    this.status = null;
    this.lastValidation = 0;
  }
}

/**
 * Export singleton instance
 */
export const configManager = ConfigurationManager.getInstance();