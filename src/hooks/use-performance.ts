/**
 * usePerformance Hook
 * Monitor và track performance metrics
 * 
 * Features:
 * - Component render tracking
 * - Memory usage monitoring
 * - Performance timing
 * - FPS monitoring
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { logger } from '@/lib/utils/logger';

/**
 * Performance metrics interface
 */
interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage?: number;
  fps?: number;
}

/**
 * Performance monitoring configuration
 */
interface PerformanceConfig {
  trackRenders?: boolean;
  trackMemory?: boolean;
  trackFPS?: boolean;
  logThreshold?: number; // ms
}

/**
 * Hook để monitor performance của component
 */
export const usePerformance = (
  componentName: string,
  config: PerformanceConfig = {}
) => {
  const {
    trackRenders = true,
    trackMemory = false,
    trackFPS = false,
    logThreshold = 16 // 60fps = 16ms per frame
  } = config;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
  });

  const renderStartTime = useRef<number>(0);
  const renderTimes = useRef<number[]>([]);
  const fpsCounter = useRef<number>(0);
  const lastFPSTime = useRef<number>(0);

  /**
   * Track render performance
   */
  useEffect(() => {
    if (!trackRenders) return;

    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;

    // Update render times array
    renderTimes.current.push(renderTime);
    if (renderTimes.current.length > 100) {
      renderTimes.current = renderTimes.current.slice(-100);
    }

    // Calculate average
    const averageRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;

    // Update metrics
    setMetrics(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1,
      lastRenderTime: renderTime,
      averageRenderTime,
    }));

    // Log slow renders
    if (renderTime > logThreshold) {
      logger.warn(`Slow render detected in ${componentName}`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        threshold: `${logThreshold}ms`,
        renderCount: metrics.renderCount + 1,
      });
    }

    // Log render info in debug mode
    logger.debug(`Component render: ${componentName}`, {
      renderTime: `${renderTime.toFixed(2)}ms`,
      averageRenderTime: `${averageRenderTime.toFixed(2)}ms`,
      renderCount: metrics.renderCount + 1,
    });
  });

  /**
   * Start render timing
   */
  useEffect(() => {
    if (trackRenders) {
      renderStartTime.current = performance.now();
    }
  });

  /**
   * Track memory usage
   */
  useEffect(() => {
    if (!trackMemory || !('memory' in performance)) return;

    const updateMemoryUsage = () => {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB

      setMetrics(prev => ({
        ...prev,
        memoryUsage,
      }));

      logger.debug(`Memory usage for ${componentName}`, {
        used: `${memoryUsage.toFixed(2)}MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
      });
    };

    const interval = setInterval(updateMemoryUsage, 5000);
    return () => clearInterval(interval);
  }, [componentName, trackMemory]);

  /**
   * Track FPS
   */
  useEffect(() => {
    if (!trackFPS) return;

    let animationId: number;

    const measureFPS = () => {
      const now = performance.now();
      fpsCounter.current++;

      if (now - lastFPSTime.current >= 1000) {
        const fps = Math.round((fpsCounter.current * 1000) / (now - lastFPSTime.current));
        
        setMetrics(prev => ({
          ...prev,
          fps,
        }));

        logger.debug(`FPS for ${componentName}`, { fps });

        fpsCounter.current = 0;
        lastFPSTime.current = now;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animationId);
  }, [componentName, trackFPS]);

  /**
   * Manual performance measurement
   */
  const measureOperation = useCallback(<T>(
    operationName: string,
    operation: () => T | Promise<T>
  ): T | Promise<T> => {
    const start = performance.now();
    
    const result = operation();
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start;
        logger.debug(`Operation completed: ${operationName}`, {
          component: componentName,
          duration: `${duration.toFixed(2)}ms`,
        });
      });
    } else {
      const duration = performance.now() - start;
      logger.debug(`Operation completed: ${operationName}`, {
        component: componentName,
        duration: `${duration.toFixed(2)}ms`,
      });
      return result;
    }
  }, [componentName]);

  /**
   * Get performance report
   */
  const getPerformanceReport = useCallback(() => {
    return {
      componentName,
      metrics,
      recommendations: generateRecommendations(metrics, logThreshold),
    };
  }, [componentName, metrics, logThreshold]);

  return {
    metrics,
    measureOperation,
    getPerformanceReport,
  };
};

/**
 * Generate performance recommendations
 */
function generateRecommendations(
  metrics: PerformanceMetrics,
  threshold: number
): string[] {
  const recommendations: string[] = [];

  if (metrics.averageRenderTime > threshold) {
    recommendations.push('Consider optimizing render logic or using React.memo');
  }

  if (metrics.renderCount > 100 && metrics.averageRenderTime > threshold / 2) {
    recommendations.push('High render count with slow renders - check for unnecessary re-renders');
  }

  if (metrics.memoryUsage && metrics.memoryUsage > 50) {
    recommendations.push('High memory usage detected - check for memory leaks');
  }

  if (metrics.fps && metrics.fps < 30) {
    recommendations.push('Low FPS detected - optimize animations and heavy operations');
  }

  return recommendations;
}

/**
 * HOC để wrap components với performance monitoring
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  config?: PerformanceConfig
) {
  const WrappedComponent = (props: P) => {
    const componentName = Component.displayName || Component.name || 'Unknown';
    const { getPerformanceReport } = usePerformance(componentName, config);

    // Log performance report on unmount
    useEffect(() => {
      return () => {
        const report = getPerformanceReport();
        logger.info(`Performance report for ${componentName}`, report);
      };
    }, [getPerformanceReport, componentName]);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}