/**
 * Runtime Configuration Validator
 * Validate configurations khi ứng dụng khởi chạy
 * 
 * Features:
 * - Startup validation
 * - Environment-specific checks
 * - Configuration health monitoring
 * - Auto-correction suggestions
 */

import { logger } from '@/lib/utils/logger';
import { validateApiConfig, validateDatabaseConfig, validateDomainConfig } from './config-validator';
import { API_CONFIG, DATABASE_CONFIG, DOMAIN_CONFIG } from './app-config';

/**
 * Configuration health status
 */
export interface ConfigHealthStatus {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

/**
 * Validate API configuration at runtime
 */
export const validateRuntimeApiConfig = (): ConfigHealthStatus => {
  const status: ConfigHealthStatus = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  try {
    validateApiConfig(API_CONFIG);
    
    // Additional runtime checks
    if (API_CONFIG.ENABLE_SYNC && API_CONFIG.BASE_URL.includes('localhost')) {
      status.warnings.push('API sync enabled với localhost URL - có thể gây vấn đề trong production');
      status.suggestions.push('Cân nhắc sử dụng VITE_ENABLE_API_SYNC=false cho development');
    }
    
    if (API_CONFIG.TIMEOUT < 3000) {
      status.warnings.push('API timeout quá thấp có thể gây timeout errors');
      status.suggestions.push('Khuyến nghị timeout >= 3000ms cho production');
    }
    
    logger.info('API configuration validation passed', { config: API_CONFIG });
  } catch (error) {
    status.isValid = false;
    status.errors.push(`API config validation failed: ${(error as Error).message}`);
    logger.error('API configuration validation failed', error as Error);
  }

  return status;
};

/**
 * Validate database configuration at runtime
 */
export const validateRuntimeDatabaseConfig = (): ConfigHealthStatus => {
  const status: ConfigHealthStatus = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  try {
    validateDatabaseConfig(DATABASE_CONFIG);
    
    // Check for potential issues
    if (DATABASE_CONFIG.VERSION === 1) {
      status.suggestions.push('Cân nhắc implement database migration system cho future updates');
    }
    
    logger.info('Database configuration validation passed', { config: DATABASE_CONFIG });
  } catch (error) {
    status.isValid = false;
    status.errors.push(`Database config validation failed: ${(error as Error).message}`);
    logger.error('Database configuration validation failed', error as Error);
  }

  return status;
};

/**
 * Validate domain configuration at runtime
 */
export const validateRuntimeDomainConfig = (): ConfigHealthStatus => {
  const status: ConfigHealthStatus = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  try {
    validateDomainConfig(DOMAIN_CONFIG);
    
    // Check domain consistency
    if (!API_CONFIG.BASE_URL.includes(DOMAIN_CONFIG.DOMAIN)) {
      status.warnings.push('API BASE_URL domain không khớp với DOMAIN config');
      status.suggestions.push('Đảm bảo API và domain configs nhất quán');
    }
    
    logger.info('Domain configuration validation passed', { config: DOMAIN_CONFIG });
  } catch (error) {
    status.isValid = false;
    status.errors.push(`Domain config validation failed: ${(error as Error).message}`);
    logger.error('Domain configuration validation failed', error as Error);
  }

  return status;
};

/**
 * Comprehensive runtime configuration validation
 */
export const validateAllRuntimeConfigs = (): {
  overall: ConfigHealthStatus;
  api: ConfigHealthStatus;
  database: ConfigHealthStatus;
  domain: ConfigHealthStatus;
} => {
  const api = validateRuntimeApiConfig();
  const database = validateRuntimeDatabaseConfig();
  const domain = validateRuntimeDomainConfig();
  
  const overall: ConfigHealthStatus = {
    isValid: api.isValid && database.isValid && domain.isValid,
    errors: [...api.errors, ...database.errors, ...domain.errors],
    warnings: [...api.warnings, ...database.warnings, ...domain.warnings],
    suggestions: [...api.suggestions, ...database.suggestions, ...domain.suggestions]
  };
  
  // Log overall status
  if (overall.isValid) {
    logger.info('All runtime configurations validated successfully');
  } else {
    logger.error('Runtime configuration validation failed', { 
      errors: overall.errors,
      warnings: overall.warnings 
    });
  }
  
  // Log suggestions if any
  if (overall.suggestions.length > 0) {
    logger.info('Configuration improvement suggestions', { suggestions: overall.suggestions });
  }
  
  return { overall, api, database, domain };
};

/**
 * Initialize configuration validation on app startup
 * Call this in main.tsx hoặc App.tsx
 */
export const initializeConfigValidation = () => {
  logger.info('Initializing runtime configuration validation...');
  
  const results = validateAllRuntimeConfigs();
  
  // Show warnings in development
  if (import.meta.env?.DEV && results.overall.warnings.length > 0) {
    console.warn('⚠️ Configuration Warnings:', results.overall.warnings);
  }
  
  // Show suggestions in development
  if (import.meta.env?.DEV && results.overall.suggestions.length > 0) {
    console.info('💡 Configuration Suggestions:', results.overall.suggestions);
  }
  
  return results;
};