/**
 * useConfigHealth Hook
 * Monitor configuration health và provide warnings/recommendations
 */

import { useState, useEffect, useCallback } from 'react';
import { configManager, type ConfigurationStatus } from '@/lib/config/config-manager';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { logger } from '@/lib/utils/logger';

/**
 * Configuration health monitoring hook
 */
export interface UseConfigHealthReturn {
  // Status
  status: ConfigurationStatus | null;
  healthScore: number;
  isHealthy: boolean;
  isProductionReady: boolean;
  
  // Actions
  checkHealth: () => void;
  refreshStatus: () => void;
  
  // Helpers
  hasWarnings: boolean;
  hasErrors: boolean;
  warningCount: number;
  errorCount: number;
}

/**
 * Hook configuration
 */
interface UseConfigHealthConfig {
  autoCheck?: boolean;
  showToastWarnings?: boolean;
  checkInterval?: number; // milliseconds
}

/**
 * useConfigHealth Hook
 * Provides real-time configuration health monitoring
 */
export const useConfigHealth = (config: UseConfigHealthConfig = {}): UseConfigHealthReturn => {
  const {
    autoCheck = true,
    showToastWarnings = false,
    checkInterval = 5 * 60 * 1000 // 5 minutes
  } = config;

  const [status, setStatus] = useState<ConfigurationStatus | null>(null);
  const [healthScore, setHealthScore] = useState<number>(0);
  const { showWarning, showError } = useToastNotifications();

  /**
   * Check configuration health
   */
  const checkHealth = useCallback(() => {
    const endTimer = logger.time('hook:configHealth');
    
    try {
      // Get current status
      const currentStatus = configManager.validateConfiguration();
      const currentScore = configManager.getHealthScore();
      
      // Update state
      setStatus(currentStatus);
      setHealthScore(currentScore);
      
      // Show toast notifications if enabled
      if (showToastWarnings) {
        // Show errors
        if (currentStatus.errors.length > 0) {
          showError(`Configuration errors detected: ${currentStatus.errors.length}`);
        }
        
        // Show warnings (only if no errors)
        else if (currentStatus.warnings.length > 0) {
          showWarning(`Configuration warnings: ${currentStatus.warnings.length}`);
        }
      }
      
      logger.debug('Configuration health checked', {
        isValid: currentStatus.isValid,
        healthScore: currentScore,
        warningCount: currentStatus.warnings.length,
        errorCount: currentStatus.errors.length
      });
      
    } catch (error) {
      logger.error('Failed to check configuration health', error as Error);
      
      // Set error state
      setStatus({
        isValid: false,
        environment: 'development',
        apiSyncEnabled: false,
        warnings: [],
        errors: ['Health check failed'],
        recommendations: []
      });
      setHealthScore(0);
      
      if (showToastWarnings) {
        showError('Configuration health check failed');
      }
    } finally {
      endTimer();
    }
  }, [showToastWarnings, showWarning, showError]);

  /**
   * Refresh status (force revalidation)
   */
  const refreshStatus = useCallback(() => {
    configManager.resetCache();
    checkHealth();
  }, [checkHealth]);

  /**
   * Auto-check on mount và interval
   */
  useEffect(() => {
    if (autoCheck) {
      // Initial check
      checkHealth();
      
      // Set up interval
      const interval = setInterval(checkHealth, checkInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoCheck, checkHealth, checkInterval]);

  /**
   * Computed values
   */
  const isHealthy = status?.isValid === true && status.errors.length === 0;
  const isProductionReady = configManager.isProductionReady();
  const hasWarnings = (status?.warnings.length || 0) > 0;
  const hasErrors = (status?.errors.length || 0) > 0;
  const warningCount = status?.warnings.length || 0;
  const errorCount = status?.errors.length || 0;

  return {
    // Status
    status,
    healthScore,
    isHealthy,
    isProductionReady,
    
    // Actions
    checkHealth,
    refreshStatus,
    
    // Helpers
    hasWarnings,
    hasErrors,
    warningCount,
    errorCount,
  };
};

/**
 * Hook để get configuration summary
 */
export const useConfigSummary = () => {
  return configManager.getConfigurationSummary();
};