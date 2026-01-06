/**
 * Service Factory Pattern
 * Centralized service creation và dependency injection
 */

import { PasswordService } from './password-service';
import { IndexedDBPasswordRepository, IPasswordRepository } from '@/lib/db/password-repository';
import { API_CONFIG } from '@/lib/config/app-config';

/**
 * Service configuration interface
 */
export interface ServiceFactoryConfig {
  enableApiSync?: boolean;
  repositoryType?: 'indexeddb' | 'api' | 'hybrid';
}

/**
 * Factory class cho service creation
 */
export class ServiceFactory {
  private static repositories = new Map<string, IPasswordRepository>();
  private static services = new Map<string, PasswordService>();

  /**
   * Create password repository based on configuration
   */
  static createPasswordRepository(type: 'indexeddb' | 'api' | 'hybrid' = 'indexeddb'): IPasswordRepository {
    const key = `password-repo-${type}`;
    
    if (!this.repositories.has(key)) {
      switch (type) {
        case 'indexeddb':
          this.repositories.set(key, new IndexedDBPasswordRepository());
          break;
        case 'api':
          // TODO: Implement API repository
          throw new Error('API repository not implemented yet');
        case 'hybrid':
          // TODO: Implement hybrid repository
          throw new Error('Hybrid repository not implemented yet');
        default:
          throw new Error(`Unknown repository type: ${type}`);
      }
    }

    return this.repositories.get(key)!;
  }

  /**
   * Create password service with proper dependencies
   * Refactored: Sử dụng API_CONFIG thay vì ENV_CONFIG để consistent
   */
  static createPasswordService(config: ServiceFactoryConfig = {}): PasswordService {
    const {
      enableApiSync = API_CONFIG.ENABLE_SYNC, // Sử dụng centralized API config
      repositoryType = 'indexeddb'
    } = config;

    const key = `password-service-${repositoryType}-${enableApiSync}`;
    
    if (!this.services.has(key)) {
      // Create repository
      const repository = this.createPasswordRepository(repositoryType);
      
      // Create service with dependency injection
      const service = PasswordService.getInstance({ enableApiSync });
      
      this.services.set(key, service);
    }

    return this.services.get(key)!;
  }

  /**
   * Clear all cached instances - for testing
   */
  static clearCache(): void {
    this.repositories.clear();
    this.services.clear();
    PasswordService.resetInstance();
  }

  /**
   * Get default password service
   * Refactored: Sử dụng API_CONFIG để consistent configuration
   */
  static getDefaultPasswordService(): PasswordService {
    return this.createPasswordService({
      enableApiSync: API_CONFIG.ENABLE_SYNC, // Centralized config source
      repositoryType: 'indexeddb'
    });
  }
}