/**
 * Service Factory Pattern
 * Centralized service creation và dependency injection
 * Updated: Enhanced Neon DB support với automatic detection
 */

import { PasswordService } from './password-service';
import { NeonPasswordService } from './neon-password-service';
import { IndexedDBPasswordRepository, IPasswordRepository } from '@/lib/db/password-repository';
import { API_CONFIG, ENV_CONFIG } from '@/lib/config/app-config';
import { logger } from '@/lib/utils/logger';

/**
 * Service configuration interface
 */
export interface ServiceFactoryConfig {
  enableApiSync?: boolean;
  repositoryType?: 'indexeddb' | 'neondb' | 'api' | 'hybrid';
  useNeonDB?: boolean;
  forceNeonDB?: boolean; // New: Force Neon DB usage
}

/**
 * Factory class cho service creation
 */
export class ServiceFactory {
  private static repositories = new Map<string, IPasswordRepository>();
  private static services = new Map<string, PasswordService | NeonPasswordService>();

  /**
   * Detect best service type based on environment
   * Updated: Force NeonDB only
   */
  private static detectServiceType(): 'neondb' {
    // Always return NeonDB - no more IndexedDB fallback
    const hasNeonConfig = ENV_CONFIG.DATABASE_URL && ENV_CONFIG.DATABASE_URL.length > 0;
    const forceNeonDB = ENV_CONFIG.FORCE_NEONDB;
    const disableIndexedDB = ENV_CONFIG.DISABLE_INDEXEDDB;

    if (!hasNeonConfig) {
      throw new Error('DATABASE_URL is required. NeonDB is the only supported database.');
    }

    logger.info('Using NeonDB as the only database option', { 
      hasNeonConfig, 
      forceNeonDB,
      disableIndexedDB
    });
    
    return 'neondb';
  }

  /**
   * Create password repository based on configuration
   */
  static createPasswordRepository(type: 'indexeddb' | 'neondb' | 'api' | 'hybrid' = 'indexeddb'): IPasswordRepository {
    const key = `password-repo-${type}`;
    
    if (!this.repositories.has(key)) {
      switch (type) {
        case 'indexeddb':
          this.repositories.set(key, new IndexedDBPasswordRepository());
          break;
        case 'neondb':
          // NeonDB sử dụng HTTP API, không cần repository pattern
          logger.info('NeonDB uses direct HTTP API, skipping repository creation');
          break;
        case 'api':
          // TODO: Implement API repository
          throw new Error('API repository not implemented yet');
        case 'hybrid':
          // TODO: Implement hybrid repository (NeonDB + IndexedDB fallback)
          throw new Error('Hybrid repository not implemented yet');
        default:
          throw new Error(`Unknown repository type: ${type}`);
      }
    }

    return this.repositories.get(key)!;
  }

  /**
   * Create password service with proper dependencies
   * Updated: NeonDB only - no IndexedDB fallback
   */
  static createPasswordService(config: ServiceFactoryConfig = {}): NeonPasswordService {
    const {
      enableApiSync = API_CONFIG.ENABLE_SYNC,
      forceNeonDB = true // Always force NeonDB
    } = config;

    // Always use NeonDB - no fallback
    const key = `neon-password-service-${enableApiSync}`;
    
    if (!this.services.has(key)) {
      logger.info('Creating NeonPasswordService instance (NeonDB only mode)', { 
        enableApiSync,
        apiBaseUrl: API_CONFIG.BASE_URL 
      });
      
      const service = new NeonPasswordService({
        apiBaseUrl: API_CONFIG.BASE_URL,
        timeout: API_CONFIG.TIMEOUT,
        enableEncryption: !!ENV_CONFIG.ENCRYPTION_KEY
      });
      
      this.services.set(key, service);
    }

    return this.services.get(key)! as NeonPasswordService;
  }

  /**
   * Clear all cached instances - for testing
   */
  static clearCache(): void {
    this.repositories.clear();
    this.services.clear();
    PasswordService.resetInstance();
    logger.info('ServiceFactory cache cleared');
  }

  /**
   * Get default password service - NeonDB only
   */
  static getDefaultPasswordService(): NeonPasswordService {
    logger.info('Getting default password service (NeonDB only)', { 
      apiSync: API_CONFIG.ENABLE_SYNC 
    });
    
    return this.createPasswordService({
      enableApiSync: API_CONFIG.ENABLE_SYNC,
      forceNeonDB: true
    });
  }

  /**
   * Force NeonDB service creation (same as default now)
   */
  static getNeonPasswordService(): NeonPasswordService {
    logger.info('Getting NeonPasswordService (default behavior)');
    
    return this.createPasswordService({
      forceNeonDB: true,
      enableApiSync: true
    });
  }

  /**
   * IndexedDB service is no longer available
   * @deprecated IndexedDB is disabled in NeonDB-only mode
   */
  static getIndexedDBPasswordService(): never {
    throw new Error('IndexedDB is disabled. Only NeonDB is supported.');
  }

  /**
   * Get service info for debugging
   */
  static getServiceInfo(): {
    detectedType: string;
    hasNeonConfig: boolean;
    forceNeonDB: boolean;
    disableIndexedDB: boolean;
    apiBaseUrl: string;
    enableApiSync: boolean;
  } {
    return {
      detectedType: this.detectServiceType(),
      hasNeonConfig: !!(ENV_CONFIG.DATABASE_URL && ENV_CONFIG.DATABASE_URL.length > 0),
      forceNeonDB: ENV_CONFIG.FORCE_NEONDB,
      disableIndexedDB: ENV_CONFIG.DISABLE_INDEXEDDB,
      apiBaseUrl: API_CONFIG.BASE_URL,
      enableApiSync: API_CONFIG.ENABLE_SYNC
    };
  }
}