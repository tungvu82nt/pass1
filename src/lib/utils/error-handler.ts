/**
 * Centralized Error Handler
 * Tập trung xử lý lỗi để tránh code duplication
 */

import { logger } from './logger';

export enum ErrorType {
  DATABASE = 'DATABASE',
  API = 'API',
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  context?: Record<string, any>;
}

/**
 * Centralized error handler class
 */
export class ErrorHandler {
  /**
   * Create standardized error
   */
  static createError(
    type: ErrorType, 
    message: string, 
    originalError?: Error,
    context?: Record<string, any>
  ): AppError {
    return {
      type,
      message,
      originalError,
      context
    };
  }

  /**
   * Handle database errors
   */
  static handleDatabaseError(error: Error, operation: string): AppError {
    logger.error(`Database operation failed: ${operation}`, error);
    
    return this.createError(
      ErrorType.DATABASE,
      `Lỗi cơ sở dữ liệu: ${operation}`,
      error,
      { operation }
    );
  }

  /**
   * Handle API errors
   */
  static handleApiError(error: Error, endpoint: string): AppError {
    logger.error(`API call failed: ${endpoint}`, error);
    
    return this.createError(
      ErrorType.API,
      `Lỗi kết nối API: ${endpoint}`,
      error,
      { endpoint }
    );
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(error: Error, field?: string): AppError {
    logger.warn(`Validation failed${field ? ` for ${field}` : ''}`, error);
    
    return this.createError(
      ErrorType.VALIDATION,
      `Dữ liệu không hợp lệ${field ? `: ${field}` : ''}`,
      error,
      { field }
    );
  }

  /**
   * Handle unknown errors
   */
  static handleUnknownError(error: Error, context?: string): AppError {
    logger.error(`Unknown error${context ? ` in ${context}` : ''}`, error);
    
    return this.createError(
      ErrorType.UNKNOWN,
      'Có lỗi không xác định xảy ra',
      error,
      { context }
    );
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(appError: AppError): string {
    switch (appError.type) {
      case ErrorType.DATABASE:
        return 'Có lỗi với cơ sở dữ liệu. Vui lòng thử lại.';
      case ErrorType.API:
        return 'Không thể kết nối với máy chủ. Kiểm tra kết nối mạng.';
      case ErrorType.VALIDATION:
        return appError.message;
      case ErrorType.NETWORK:
        return 'Lỗi kết nối mạng. Vui lòng kiểm tra internet.';
      default:
        return 'Có lỗi xảy ra. Vui lòng thử lại sau.';
    }
  }
}