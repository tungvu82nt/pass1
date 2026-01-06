/**
 * useConfigurationHealth Hook
 * Monitor configuration health và provide diagnostics
 */

import { useState, useEffect, useCallback } from 'react';
import { configurationService } from '@/lib/config';
import { logger } from '@/lib/utils/logger';

interface ConfigurationHealth {
  isHealthy: boolean;
  lastCheck: Date | null;
  errors: string[];
  warnings: string[];
  url: string | null;
  domain: string | null;
  isProduction: boolean | null;
}

interface UseConfigurationHealthReturn {
  health: ConfigurationHealth;
  checkHealth: () => Promise<void>;
  isChecking: boolean;
}

/**
 * Hook để monitor configuration health
 * Cung cấp real-time diagnostics cho configuration issues
 */
export const useConfigurationHealth = (): UseConfigurationHealthReturn => {
  const [health, setHealth] = useState<ConfigurationHealth>({
    isHealthy: false,
    lastCheck: null,
    errors: [],
    warnings: [],
    url: null,
    domain: null,
    isProduction: null,
  });
  
  const [isChecking, setIsChecking] = useState(false);

  /**
   * Perform comprehensive health check
   */
  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    const startTime = performance.now();
    
    try {
      const errors: string[] = [];
      const warnings: string[] = [];
      let url: string | null = null;
      let domain: string | null = null;
      let isProduction: boolean | null = null;

      // Test configuration service methods
      try {
        url = configurationService.getCurrentUrl();
        if (!url) {
          errors.push('getCurrentUrl returned empty value');
        } else if (!url.startsWith('http')) {
          errors.push('Invalid URL format - must start with http/https');
        }
      } catch (error) {
        errors.push(`getCurrentUrl failed: ${(error as Error).message}`);
      }

      try {
        domain = configurationService.getCurrentDomain();
        if (!domain) {
          errors.push('getCurrentDomain returned empty value');
        }
      } catch (error) {
        errors.push(`getCurrentDomain failed: ${(error as Error).message}`);
      }

      try {
        isProduction = configurationService.isProduction();
      } catch (error) {
        errors.push(`isProduction failed: ${(error as Error).message}`);
      }

      // Validate configuration consistency
      if (url && domain) {
        try {
          const urlObj = new URL(url);
          if (urlObj.hostname !== domain) {
            warnings.push(`URL hostname (${urlObj.hostname}) doesn't match domain (${domain})`);
          }
        } catch (error) {
          errors.push('Invalid URL format');
        }
      }

      // Test API base URL
      try {
        const apiUrl = configurationService.getApiBaseUrl();
        if (!apiUrl.endsWith('/api')) {
          warnings.push('API base URL should end with /api');
        }
      } catch (error) {
        errors.push(`getApiBaseUrl failed: ${(error as Error).message}`);
      }

      // Run configuration validation
      try {
        const isValid = configurationService.validateConfiguration();
        if (!isValid) {
          errors.push('Configuration validation failed');
        }
      } catch (error) {
        errors.push(`Configuration validation error: ${(error as Error).message}`);
      }

      const endTime = performance.now();
      const checkDuration = endTime - startTime;

      // Performance warning
      if (checkDuration > 100) {
        warnings.push(`Configuration check took ${checkDuration.toFixed(2)}ms (slow)`);
      }

      const newHealth: ConfigurationHealth = {
        isHealthy: errors.length === 0,
        lastCheck: new Date(),
        errors,
        warnings,
        url,
        domain,
        isProduction,
      };

      setHealth(newHealth);

      // Log results
      if (errors.length > 0) {
        logger.error('Configuration health check failed', { errors, warnings });
      } else if (warnings.length > 0) {
        logger.warn('Configuration health check completed with warnings', { warnings });
      } else {
        logger.info('Configuration health check passed', { 
          url, 
          domain, 
          isProduction,
          duration: `${checkDuration.toFixed(2)}ms`
        });
      }

    } catch (error) {
      logger.error('Configuration health check crashed', error as Error);
      setHealth({
        isHealthy: false,
        lastCheck: new Date(),
        errors: [`Health check crashed: ${(error as Error).message}`],
        warnings: [],
        url: null,
        domain: null,
        isProduction: null,
      });
    } finally {
      setIsChecking(false);
    }
  }, []);

  /**
   * Auto-check on mount
   */
  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return {
    health,
    checkHealth,
    isChecking,
  };
};