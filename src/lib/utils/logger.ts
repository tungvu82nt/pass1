/**
 * Application Logger
 * Centralized logging system với different levels
 * 
 * Features:
 * - Multiple log levels
 * - Environment-based logging
 * - Error tracking
 * - Performance monitoring
 */

import { ENV_ACCESS } from '@/lib/config/env-utils';

/**
 * Log levels
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

/**
 * Log entry interface
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
}

/**
 * Application Logger Class
 */
class ApplicationLogger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: ENV_ACCESS.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN,
      enableConsole: true,
      enableStorage: ENV_ACCESS.isDevelopment,
      maxStorageEntries: 1000,
      ...config,
    };
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    if (level > this.config.level) return;

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    // Console logging
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // Storage logging
    if (this.config.enableStorage) {
      this.logToStorage(logEntry);
    }
  }

  /**
   * Log to browser console
   */
  private logToConsole(entry: LogEntry): void {
    const { level, message, context, error } = entry;
    const prefix = `[${LogLevel[level]}] ${entry.timestamp}:`;

    switch (level) {
      case LogLevel.ERROR:
        console.error(prefix, message, context, error);
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, context);
        break;
      case LogLevel.INFO:
        console.info(prefix, message, context);
        break;
      case LogLevel.DEBUG:
        console.debug(prefix, message, context);
        break;
    }
  }

  /**
   * Log to memory storage
   */
  private logToStorage(entry: LogEntry): void {
    this.logs.push(entry);

    // Maintain max entries limit
    if (this.logs.length > this.config.maxStorageEntries) {
      this.logs = this.logs.slice(-this.config.maxStorageEntries);
    }
  }

  /**
   * Get stored logs
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level <= level);
    }
    return [...this.logs];
  }

  /**
   * Clear stored logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Performance timing utility
   */
  time(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.debug(`Performance: ${label}`, { duration: `${duration.toFixed(2)}ms` });
    };
  }
}

/**
 * Global logger instance
 */
export const logger = new ApplicationLogger();

/**
 * Performance decorator for methods
 */
export function logPerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const endTimer = logger.time(`${target.constructor.name}.${propertyName}`);
    
    try {
      const result = method.apply(this, args);
      
      // Handle async methods
      if (result instanceof Promise) {
        return result.finally(() => endTimer());
      }
      
      endTimer();
      return result;
    } catch (error) {
      endTimer();
      logger.error(`Error in ${target.constructor.name}.${propertyName}`, error as Error);
      throw error;
    }
  };

  return descriptor;
}