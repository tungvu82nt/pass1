/**
 * URL Builder Utility
 * Centralized URL construction với environment-aware logic
 * 
 * Features:
 * - Environment-specific URL building
 * - Validation và error handling
 * - Caching cho performance
 * - Type safety
 */

import { ENV_ACCESS } from './env-utils';
import { logger } from '@/lib/utils/logger';

/**
 * Deployment constants - Centralized hardcoded values
 */
export const DEPLOYMENT_CONSTANTS = {
  // Netlify deployment URLs
  NETLIFY_FALLBACK_URL: 'https://harmonious-pothos-5f3f98.netlify.app',
  NETLIFY_FUNCTIONS_PATH: '/.netlify/functions/api',

  // Development URLs
  DEV_API_PATH: '/api',

  // Default production domain
  DEFAULT_PRODUCTION_URL: 'https://harmonious-pothos-5f3f98.netlify.app',
} as const;

/**
 * URL validation utilities
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Cached URL values để tránh recomputation
 */
let cachedApiBaseUrl: string | null = null;
let cachedAppUrl: string | null = null;

/**
 * API URL Builder Class
 * Sử dụng Builder pattern để construct URLs
 */
export class ApiUrlBuilder {
  /**
   * Build API base URL với environment-aware logic
   */
  static buildApiBaseUrl(): string {
    // Return cached value nếu có
    if (cachedApiBaseUrl) {
      return cachedApiBaseUrl;
    }

    const endTimer = logger.time('buildApiBaseUrl');

    try {
      // Kiểm tra explicit env var trước
      const explicitApiUrl = ENV_ACCESS.getEnvVar('VITE_API_BASE_URL');
      if (explicitApiUrl) {
        if (isValidUrl(explicitApiUrl)) {
          cachedApiBaseUrl = explicitApiUrl;
          logger.debug('Using explicit API URL from env', { url: explicitApiUrl });
          return explicitApiUrl;
        } else {
          logger.warn('Invalid API URL in env var, falling back', { url: explicitApiUrl });
        }
      }

      // Environment-specific logic
      if (ENV_ACCESS.isProduction) {
        // Production: Sử dụng production API URL hoặc fallback to IndexedDB
        const productionApiUrl = ENV_ACCESS.getEnvVar('VITE_PRODUCTION_API_BASE_URL');
        if (productionApiUrl && isValidUrl(productionApiUrl)) {
          cachedApiBaseUrl = productionApiUrl;
          logger.info('Using production API URL', { url: productionApiUrl });
        } else {
          // Fallback: Disable API sync cho production nếu không có backend
          logger.warn('No production API URL configured, will use IndexedDB only');
          cachedApiBaseUrl = ''; // Empty string để trigger IndexedDB fallback
        }
      } else {
        // Development: localhost API
        cachedApiBaseUrl = 'http://localhost:3001/api';
      }

      logger.info('API Base URL built', {
        url: cachedApiBaseUrl,
        environment: ENV_ACCESS.isProduction ? 'production' : 'development'
      });

      return cachedApiBaseUrl;
    } finally {
      endTimer();
    }
  }

  /**
   * Build production API URL với fallback logic
   */
  private static buildProductionApiUrl(): string {
    const appUrl = this.getAppUrl();
    const apiPath = DEPLOYMENT_CONSTANTS.NETLIFY_FUNCTIONS_PATH;

    return `${appUrl}${apiPath}`;
  }

  /**
   * Get app URL với validation và fallback
   */
  private static getAppUrl(): string {
    if (cachedAppUrl) {
      return cachedAppUrl;
    }

    // Sử dụng fallback URL trực tiếp
    const fallbackUrl = DEPLOYMENT_CONSTANTS.NETLIFY_FALLBACK_URL;
    logger.info('Using Netlify fallback URL', {
      fallback: fallbackUrl
    });

    cachedAppUrl = fallbackUrl;
    return fallbackUrl;
  }

  /**
   * Reset cache - useful cho testing
   */
  static resetCache(): void {
    cachedApiBaseUrl = null;
    cachedAppUrl = null;
    logger.debug('URL cache reset');
  }

  /**
   * Validate current configuration
   */
  static validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const apiUrl = this.buildApiBaseUrl();
      if (!isValidUrl(apiUrl)) {
        errors.push(`Invalid API URL: ${apiUrl}`);
      }
    } catch (error) {
      errors.push(`Failed to build API URL: ${error}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Build API base URL based on environment
 * Updated: NeonDB only mode với Netlify Functions
 */
export function buildApiBaseUrl(): string {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  // Always use Netlify Functions for consistency
  const netlifyFunctionsUrl = 'https://harmonious-pothos-5f3f98.netlify.app/.netlify/functions';

  logger.info('Using Netlify Functions API (NeonDB only mode)', {
    url: netlifyFunctionsUrl,
    environment: isProduction ? 'production' : 'development'
  });

  return netlifyFunctionsUrl;
}

/**
 * Type definitions
 */
export type UrlValidationResult = {
  isValid: boolean;
  errors: string[];
};