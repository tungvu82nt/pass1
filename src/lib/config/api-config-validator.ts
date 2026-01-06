/**
 * API Configuration Validator
 * Specialized validator cho API configuration với business rules
 */

import { logger } from '@/lib/utils/logger';
import { API_CONFIG } from './app-config';

/**
 * API Configuration validation result
 */
export interface ApiConfigValidationResult {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
  errors: string[];
}

/**
 * Validate API configuration với business logic
 */
export const validateApiConfiguration = (): ApiConfigValidationResult => {
  const result: ApiConfigValidationResult = {
    isValid: true,
    warnings: [],
    suggestions: [],
    errors: []
  };

  try {
    // 1. Validate BASE_URL format
    if (!API_CONFIG.BASE_URL) {
      result.errors.push('API BASE_URL không được để trống');
      result.isValid = false;
    } else {
      try {
        new URL(API_CONFIG.BASE_URL);
      } catch {
        result.errors.push('API BASE_URL không phải là URL hợp lệ');
        result.isValid = false;
      }
    }

    // 2. Validate HTTPS requirement khi ENABLE_SYNC = true
    if (API_CONFIG.ENABLE_SYNC && !API_CONFIG.BASE_URL.startsWith('https://')) {
      if (API_CONFIG.BASE_URL.includes('localhost')) {
        result.warnings.push('API sync enabled với localhost - chỉ phù hợp cho development');
        result.suggestions.push('Sử dụng HTTPS cho production deployment');
      } else {
        result.errors.push('API sync yêu cầu HTTPS URL cho security');
        result.isValid = false;
      }
    }

    // 3. Validate timeout values
    if (API_CONFIG.TIMEOUT < 3000) {
      result.warnings.push(`API timeout (${API_CONFIG.TIMEOUT}ms) có thể quá thấp cho production`);
      result.suggestions.push('Khuyến nghị timeout >= 3000ms để tránh premature failures');
    }

    if (API_CONFIG.TIMEOUT > 30000) {
      result.warnings.push(`API timeout (${API_CONFIG.TIMEOUT}ms) có thể quá cao, ảnh hưởng UX`);
      result.suggestions.push('Cân nhắc giảm timeout xuống <= 30000ms');
    }

    // 4. Environment-specific validations
    const isDevelopment = import.meta.env.DEV;
    const isProduction = import.meta.env.PROD;

    if (isProduction && API_CONFIG.ENABLE_SYNC && API_CONFIG.BASE_URL.includes('localhost')) {
      result.errors.push('Production build không được sử dụng localhost API URL');
      result.isValid = false;
    }

    if (isDevelopment && API_CONFIG.ENABLE_SYNC && API_CONFIG.TIMEOUT < 5000) {
      result.warnings.push('Development với API sync nên có timeout >= 5000ms để debug');
      result.suggestions.push('Tăng VITE_API_TIMEOUT trong .env.local');
    }

    // 5. Configuration consistency checks
    if (!API_CONFIG.ENABLE_SYNC && API_CONFIG.TIMEOUT > 10000) {
      result.suggestions.push('API sync disabled, có thể giảm timeout để tối ưu performance');
    }

    logger.info('API configuration validation completed', {
      isValid: result.isValid,
      warningCount: result.warnings.length,
      errorCount: result.errors.length
    });

    return result;

  } catch (error) {
    logger.error('API configuration validation failed', error as Error);
    return {
      isValid: false,
      warnings: [],
      suggestions: [],
      errors: ['Validation process failed: ' + (error as Error).message]
    };
  }
};

/**
 * Get API configuration recommendations based on environment
 */
export const getApiConfigRecommendations = (): string[] => {
  const recommendations: string[] = [];
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  if (isDevelopment) {
    recommendations.push('Development: Cân nhắc tắt API sync (VITE_ENABLE_API_SYNC=false) để tránh timeout');
    recommendations.push('Development: Sử dụng timeout >= 5000ms cho debugging');
    recommendations.push('Development: Kiểm tra API server availability trước khi enable sync');
  }

  if (isProduction) {
    recommendations.push('Production: Đảm bảo API URL sử dụng HTTPS');
    recommendations.push('Production: Timeout nên trong khoảng 5000-15000ms');
    recommendations.push('Production: Enable API sync chỉ khi API server stable');
  }

  if (!API_CONFIG.ENABLE_SYNC) {
    recommendations.push('API sync disabled: Ứng dụng chạy offline-first mode');
    recommendations.push('Offline mode: Dữ liệu chỉ lưu trong IndexedDB local');
  }

  return recommendations;
};