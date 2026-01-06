/**
 * Environment Utilities
 * Centralized environment detection với consistent fallbacks
 * 
 * Refactor: Tách từ app-config.ts để tái sử dụng
 */

/**
 * Safe environment access với fallbacks
 */
export const ENV_ACCESS = {
  isDevelopment: import.meta.env?.DEV ?? false,
  isProduction: import.meta.env?.PROD ?? true,
  mode: import.meta.env?.MODE ?? 'production',
  
  // Vite environment variables với fallbacks
  getEnvVar: (key: string, fallback: string = ''): string => {
    return import.meta.env?.[key] ?? fallback;
  },
  
  // Boolean environment variables
  getBooleanEnv: (key: string, fallback: boolean = false): boolean => {
    const value = import.meta.env?.[key];
    if (value === undefined) return fallback;
    return value === 'true' || value === true;
  },
  
  // Number environment variables
  getNumberEnv: (key: string, fallback: number = 0): number => {
    const value = import.meta.env?.[key];
    if (value === undefined) return fallback;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? fallback : parsed;
  },
} as const;

/**
 * Environment detection utilities
 * Deprecated: Sử dụng ENV_ACCESS thay thế
 * @deprecated Use ENV_ACCESS instead
 */
export const ENV_UTILS = ENV_ACCESS;

/**
 * Type-safe environment configuration
 */
export interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  mode: string;
}

/**
 * Get current environment configuration
 */
export const getEnvironmentConfig = (): EnvironmentConfig => ({
  isDevelopment: ENV_ACCESS.isDevelopment,
  isProduction: ENV_ACCESS.isProduction,
  mode: ENV_ACCESS.mode,
});