/**
 * useRenderPerformance Hook
 * Specialized hook để track render performance
 * Tách từ use-performance.ts để giảm complexity
 * 
 * Features:
 * - Component render tracking
 * - Average render time calculation
 * - Slow render detection
 * - Performance recommendations
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import { logger } from '@/lib/utils/logger';

/**
 * Render performance metrics
 */
interface RenderMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  slowRenderCount: number;
}

/**
 * Configuration for render performance monitoring
 */
interface RenderPerformanceConfig {
  logThreshold?: number; // ms - threshold for slow render warning
  maxSamples?: number; // Maximum number of render times to keep
  enableLogging?: boolean;
}

/**
 * Hook return type
 */
interface UseRenderPerformanceReturn {
  metrics: RenderMetrics;
  recommendations: string[];
  resetMetrics: () => void;
}

/**
 * Hook để monitor render performance của component
 * Tách từ usePerformance để Single Responsibility
 */
export const useRenderPerformance = (
  componentName: string,
  config: RenderPerformanceConfig = {}
): UseRenderPerformanceReturn => {
  const {
    logThreshold = 16, // 60fps = 16ms per frame
    maxSamples = 100,
    enableLogging = true
  } = config;

  const renderStartTime = useRef<number>(0);
  const renderTimes = useRef<number[]>([]);
  const [metrics, setMetrics] = useState<RenderMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    slowRenderCount: 0,
  });

  /**
   * Start render timing - called before render
   */
  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  /**
   * Track render completion - called after render
   */
  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;

    // Update render times array
    renderTimes.current.push(renderTime);
    if (renderTimes.current.length > maxSamples) {
      renderTimes.current = renderTimes.current.slice(-maxSamples);
    }

    // Calculate metrics
    const averageRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
    const slowRenderCount = renderTimes.current.filter(time => time > logThreshold).length;

    // Update metrics state
    setMetrics(prev => ({
      renderCount: prev.renderCount + 1,
      lastRenderTime: renderTime,
      averageRenderTime,
      slowRenderCount,
    }));

    // Log slow renders
    if (renderTime > logThreshold && enableLogging) {
      logger.warn(`Slow render detected in ${componentName}`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        threshold: `${logThreshold}ms`,
        renderCount: metrics.renderCount + 1,
      });
    }

    // Log render info in debug mode
    if (enableLogging) {
      logger.debug(`Component render: ${componentName}`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        averageRenderTime: `${averageRenderTime.toFixed(2)}ms`,
        renderCount: metrics.renderCount + 1,
      });
    }
  });

  /**
   * Generate performance recommendations
   */
  const recommendations = useMemo((): string[] => {
    const recs: string[] = [];

    if (metrics.averageRenderTime > logThreshold) {
      recs.push('Consider optimizing render logic or using React.memo');
    }

    if (metrics.renderCount > 50 && metrics.averageRenderTime > logThreshold / 2) {
      recs.push('High render count with slow renders - check for unnecessary re-renders');
    }

    if (metrics.slowRenderCount > metrics.renderCount * 0.2) {
      recs.push('More than 20% of renders are slow - investigate performance bottlenecks');
    }

    if (metrics.renderCount > 100) {
      recs.push('High render count - consider memoization with useMemo/useCallback');
    }

    return recs;
  }, [metrics, logThreshold]);

  /**
   * Reset all metrics
   */
  const resetMetrics = () => {
    renderTimes.current = [];
    setMetrics({
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      slowRenderCount: 0,
    });
    
    if (enableLogging) {
      logger.info(`Render metrics reset for ${componentName}`);
    }
  };

  return {
    metrics,
    recommendations,
    resetMetrics,
  };
};