/**
 * App Configuration Constants
 * Tập trung các cấu hình chính của ứng dụng
 */

import { QueryClient } from "@tanstack/react-query";
import { ENV_ACCESS } from './env-utils';
import { buildApiBaseUrl } from './url-builder';

/**
 * App metadata configuration
 */
export const APP_CONFIG = {
  NAME: "Memory Safe Guard",
  DESCRIPTION: "Ứng dụng quản lý mật khẩu hiện đại và an toàn",
  VERSION: "1.0.0", // Có thể lấy từ package.json
} as const;

/**
 * Environment detection utilities
 * Centralized environment access với validation
 * 
 * Refactored: Loại bỏ deprecated API config để tránh duplication
 */
export const ENV_CONFIG = {
  // App environment
  isDevelopment: ENV_ACCESS.isDevelopment,
  isProduction: ENV_ACCESS.isProduction,
  
  // Domain configuration
  APP_DOMAIN: ENV_ACCESS.getEnvVar('VITE_APP_DOMAIN', 'yapee.online'),
  APP_URL: ENV_ACCESS.getEnvVar('VITE_APP_URL', 'https://yapee.online'),
  
  // Database URL (nếu có)
  DATABASE_URL: ENV_ACCESS.getEnvVar('DATABASE_URL', ''),
} as const;

/**
 * Theme configuration
 */
export const THEME_CONFIG = {
  DEFAULT_THEME: "dark" as const,
  STORAGE_KEY: "memory-safe-guard-theme",
} as const;

/**
 * QueryClient configuration cho password manager
 * Tối ưu cho bảo mật và performance
 */
export const QUERY_CLIENT_CONFIG = {
  defaultOptions: {
    queries: {
      // Cache data trong 5 phút cho password data
      staleTime: 5 * 60 * 1000,
      // Retry 2 lần khi có lỗi
      retry: 2,
      // Không refetch khi window focus (bảo mật)
      refetchOnWindowFocus: false,
      // Không refetch khi reconnect (tránh leak data)
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry 1 lần cho mutations
      retry: 1,
    },
  },
} as const;

/**
 * Tạo QueryClient instance với cấu hình tối ưu
 */
export const createQueryClient = () => new QueryClient(QUERY_CLIENT_CONFIG);

/**
 * Route configuration
 */
export const ROUTES = {
  HOME: "/",
  NOT_FOUND: "*",
} as const;

/**
 * API configuration cho hybrid approach
 * Refactored: Sử dụng URL Builder để tách biệt complex logic
 */
import { buildApiBaseUrl } from './url-builder';

/**
 * API Default Configuration
 * Centralized defaults để tránh magic values
 */
const API_DEFAULTS = {
  // Smart sync enabling: production default true, development false để tránh timeout
  DEFAULT_SYNC_ENABLED: ENV_ACCESS.isProduction,
  // Fallback sync disabled để tránh API timeout trong development
  FALLBACK_SYNC_ENABLED: false,
  DEFAULT_TIMEOUT: 10000, // 10s timeout cho production stability
  MIN_TIMEOUT: 3000, // Minimum timeout để tránh premature failures
} as const;

export const API_CONFIG = {
  // Clean URL construction với proper separation of concerns
  BASE_URL: buildApiBaseUrl(),
  // Smart sync configuration với proper fallback logic
  ENABLE_SYNC: ENV_ACCESS.getBooleanEnv(
    'VITE_ENABLE_API_SYNC', 
    // Sử dụng fallback disabled để tránh timeout issues trong development
    ENV_ACCESS.isDevelopment ? API_DEFAULTS.FALLBACK_SYNC_ENABLED : API_DEFAULTS.DEFAULT_SYNC_ENABLED
  ),
  TIMEOUT: Math.max(
    ENV_ACCESS.getNumberEnv('VITE_API_TIMEOUT', API_DEFAULTS.DEFAULT_TIMEOUT),
    API_DEFAULTS.MIN_TIMEOUT
  ),
} as const;

/**
 * Database configuration
 */
export const DATABASE_CONFIG = {
  NAME: "memorySafeGuardDB",
  VERSION: 1,
  STORE_NAME: "passwords",
  INDEXES: ["service", "username", "updatedAt"] as const,
} as const;

/**
 * Domain configuration
 */
export const DOMAIN_CONFIG = {
  APP_NAME: "Memory Safe Guard",
  APP_DESCRIPTION: "Quản lý mật khẩu an toàn và hiện đại",
  DOMAIN: "yapee.online",
  HOMEPAGE: "https://yapee.online",
  // Thêm properties để consistent với Footer component
  PRODUCTION_DOMAIN: "yapee.online",
  PRODUCTION_URL: "https://yapee.online",
} as const;
