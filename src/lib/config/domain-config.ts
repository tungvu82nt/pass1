/**
 * Domain-specific configuration
 * Tách riêng domain config để dễ quản lý và maintain
 */

import { ENV_ACCESS } from './env-utils';

/**
 * Domain configuration constants
 */
export const DOMAINS = {
  PRODUCTION: "silver-bublanina-ab8828.netlify.app",
  STAGING: "staging.silver-bublanina-ab8828.netlify.app", // Cho tương lai
  LOCAL: "localhost",
} as const;

/**
 * URL configuration với type safety
 */
export const URLS = {
  PRODUCTION: `https://${DOMAINS.PRODUCTION}`,
  STAGING: `https://${DOMAINS.STAGING}`,
  LOCAL: import.meta.env?.VITE_LOCAL_URL ?? "http://localhost:8081",
} as const;

/**
 * Get current domain based on environment
 */
export const getCurrentDomain = (): string => {
  if (ENV_ACCESS.isDevelopment) return DOMAINS.LOCAL;
  if (ENV_ACCESS.mode === 'staging') return DOMAINS.STAGING;
  return DOMAINS.PRODUCTION;
};

/**
 * Get current URL based on environment
 */
export const getCurrentUrl = (): string => {
  if (ENV_ACCESS.isDevelopment) return URLS.LOCAL;
  if (ENV_ACCESS.mode === 'staging') return URLS.STAGING;
  return URLS.PRODUCTION;
};

/**
 * Global fallback for getCurrentUrl to prevent runtime errors
 * This ensures the function is available in all contexts including production builds
 */
if (typeof window !== 'undefined') {
  (window as any).getCurrentUrl = getCurrentUrl;
}

/**
 * Note: Global fallback removed - use ConfigurationService instead
 * @deprecated Direct global access removed for better architecture
 * @see ConfigurationService for type-safe configuration access
 */

/**
 * Domain validation utilities
 */
export const isDomainValid = (domain: string): boolean => {
  return Object.values(DOMAINS).includes(domain as any);
};

/**
 * Check if current domain is production
 */
export const isProductionDomain = (): boolean => {
  if (typeof window === "undefined") return ENV_ACCESS.isProduction;
  return window.location.hostname === DOMAINS.PRODUCTION;
};

export type DomainType = keyof typeof DOMAINS;
export type UrlType = keyof typeof URLS;