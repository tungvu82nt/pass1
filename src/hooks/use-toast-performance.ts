/**
 * useToastPerformance Hook
 * Performance monitoring cho toast notifications
 * 
 * Features:
 * - Toast frequency tracking
 * - Performance metrics
 * - Memory usage monitoring
 * - User interaction analytics
 */

import { useCallback, useRef, useMemo } from 'react';
import { logger } from '@/lib/utils/logger';
import { ToastLevel } from '@/lib/types/toast-types';

/**
 * Toast performance metrics
 */
interface ToastMetrics {
  totalToasts: number;
  toastsByLevel: Record<ToastLevel, number>;
  averageDisplayTime: number;
  lastToastTime: number;
  toastFrequency: number; // toasts per minute
}

/**
 * Performance monitoring return type
 */
interface UseToastPerformanceReturn {
  metrics: ToastMetrics;
  trackToast: (level: ToastLevel, duration?: number) => void;
  resetMetrics: () => void;
  getPerformanceReport: () => string;
}

/**
 * Custom hook để monitor toast performance
 * Giúp optimize user experience và detect spam
 */
export const useToastPerformance = (): UseToastPerformanceReturn => {
  const metricsRef = useRef<ToastMetrics>({
    totalToasts: 0,
    toastsByLevel: {
      success: 0,
      error: 0,
      info: 0,
      warning: 0,
    },
    averageDisplayTime: 0,
    lastToastTime: 0,
    toastFrequency: 0,
  });

  const displayTimesRef = useRef<number[]>([]);
  const toastTimestampsRef = useRef<number[]>([]);

  /**
   * Track toast được hiển thị
   */
  const trackToast = useCallback((level: ToastLevel, duration = 3000) => {
    const now = Date.now();
    const metrics = metricsRef.current;

    // Update counters
    metrics.totalToasts++;
    metrics.toastsByLevel[level]++;
    metrics.lastToastTime = now;

    // Track display times cho average calculation
    displayTimesRef.current.push(duration);
    if (displayTimesRef.current.length > 100) {
      displayTimesRef.current.shift(); // Keep only last 100 entries
    }

    // Track timestamps cho frequency calculation
    toastTimestampsRef.current.push(now);
    if (toastTimestampsRef.current.length > 50) {
      toastTimestampsRef.current.shift(); // Keep only last 50 entries
    }

    // Calculate average display time
    const totalTime = displayTimesRef.current.reduce((sum, time) => sum + time, 0);
    metrics.averageDisplayTime = totalTime / displayTimesRef.current.length;

    // Calculate frequency (toasts per minute)
    if (toastTimestampsRef.current.length > 1) {
      const timeSpan = now - toastTimestampsRef.current[0];
      const minutes = timeSpan / (1000 * 60);
      metrics.toastFrequency = toastTimestampsRef.current.length / minutes;
    }

    // Log performance warning nếu frequency quá cao
    if (metrics.toastFrequency > 10) {
      logger.warn('High toast frequency detected', {
        frequency: metrics.toastFrequency,
        level,
        totalToasts: metrics.totalToasts,
      });
    }

    logger.debug('Toast tracked', {
      level,
      duration,
      totalToasts: metrics.totalToasts,
      frequency: metrics.toastFrequency,
    });
  }, []);

  /**
   * Reset metrics
   */
  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      totalToasts: 0,
      toastsByLevel: {
        success: 0,
        error: 0,
        info: 0,
        warning: 0,
      },
      averageDisplayTime: 0,
      lastToastTime: 0,
      toastFrequency: 0,
    };
    displayTimesRef.current = [];
    toastTimestampsRef.current = [];
    
    logger.info('Toast metrics reset');
  }, []);

  /**
   * Generate performance report
   */
  const getPerformanceReport = useCallback((): string => {
    const metrics = metricsRef.current;
    
    return `
Toast Performance Report:
- Total Toasts: ${metrics.totalToasts}
- Success: ${metrics.toastsByLevel.success}
- Errors: ${metrics.toastsByLevel.error}
- Info: ${metrics.toastsByLevel.info}
- Warnings: ${metrics.toastsByLevel.warning}
- Average Display Time: ${metrics.averageDisplayTime.toFixed(0)}ms
- Frequency: ${metrics.toastFrequency.toFixed(1)} toasts/minute
- Last Toast: ${new Date(metrics.lastToastTime).toLocaleTimeString()}
    `.trim();
  }, []);

  /**
   * Memoized metrics để tránh unnecessary re-renders
   */
  const metrics = useMemo(() => ({ ...metricsRef.current }), [
    metricsRef.current.totalToasts,
    metricsRef.current.toastFrequency,
  ]);

  return {
    metrics,
    trackToast,
    resetMetrics,
    getPerformanceReport,
  };
};