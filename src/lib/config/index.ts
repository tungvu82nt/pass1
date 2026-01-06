/**
 * Configuration Index
 * Central export cho tất cả configurations
 * 
 * Refactor: Tạo single source of truth cho configs
 */

// Environment utilities
export { ENV_ACCESS, ENV_UTILS, getEnvironmentConfig } from './env-utils';

// Core configurations
export { 
  APP_CONFIG, 
  THEME_CONFIG, 
  QUERY_CLIENT_CONFIG, 
  createQueryClient, 
  ROUTES,
  API_CONFIG,
  DATABASE_CONFIG,
  DOMAIN_CONFIG
} from './app-config';

// Domain-specific configurations
export { 
  DOMAINS, 
  URLS, 
  getCurrentDomain, 
  getCurrentUrl, 
  isDomainValid, 
  isProductionDomain 
} from './domain-config';

// Environment configuration
export { config as environmentConfig } from './environment';

// URL Builder utilities
export { 
  ApiUrlBuilder, 
  buildApiBaseUrl, 
  validateUrlConfiguration, 
  DEPLOYMENT_CONSTANTS 
} from './url-builder';
export type { UrlValidationResult } from './url-builder';

// Configuration validation
export { 
  validateAppConfig, 
  validateApiConfig, 
  validateDatabaseConfig, 
  validateDomainConfig, 
  validateAllConfigs 
} from './config-validator';

// Runtime validation
export {
  validateRuntimeApiConfig,
  validateRuntimeDatabaseConfig,
  validateRuntimeDomainConfig,
  validateAllRuntimeConfigs,
  initializeConfigValidation
} from './runtime-validator';
export type { ConfigHealthStatus } from './runtime-validator';

// Toast configuration
export { TOAST_CONFIG } from './toast-config';

// Configuration factory
export {
  ConfigurationFactory,
  getCurrentConfig,
  getConfigForProfile
} from './config-factory';
export type {
  ConfigProfile,
  ApiConfiguration,
  DatabaseConfiguration,
  ApplicationConfiguration,
  CompleteConfiguration
} from './config-factory';

// Type exports
export type { DomainType, UrlType } from './domain-config';
export type { Config } from './environment';
export type { EnvironmentConfig } from './env-utils';

/**
 * Convenience exports cho backward compatibility
 */
export const getBaseUrl = getCurrentUrl;
export const isProduction = isProductionDomain;

/**
 * Validated configuration object
 * Tất cả configs đã được validate
 */
import { APP_CONFIG, API_CONFIG, DATABASE_CONFIG, DOMAIN_CONFIG } from './app-config';
import { validateAllConfigs } from './config-validator';

export const VALIDATED_CONFIG = validateAllConfigs({
  app: APP_CONFIG,
  api: API_CONFIG,
  database: DATABASE_CONFIG,
  domain: DOMAIN_CONFIG,
});