/**
 * Domain Migration Utility
 * Utility để migrate từ domain cũ sang domain mới
 * 
 * Features:
 * - Detect old domain references
 * - Provide migration helpers
 * - Validation utilities
 */

import { logger } from './logger';

/**
 * Domain migration constants
 */
export const DOMAIN_MIGRATION = {
  OLD_DOMAIN: 'silver-bublanina-ab8828.netlify.app',
  NEW_DOMAIN: 'harmonious-pothos-5f3f98.netlify.app',
  OLD_URL: 'https://silver-bublanina-ab8828.netlify.app',
  NEW_URL: 'https://harmonious-pothos-5f3f98.netlify.app',
} as const;

/**
 * Migration utilities
 */
export class DomainMigrationUtil {
  /**
   * Check if URL contains old domain
   */
  static containsOldDomain(url: string): boolean {
    return url.includes(DOMAIN_MIGRATION.OLD_DOMAIN);
  }

  /**
   * Migrate URL from old domain to new domain
   */
  static migrateUrl(url: string): string {
    if (!this.containsOldDomain(url)) {
      return url;
    }

    const migratedUrl = url.replace(
      DOMAIN_MIGRATION.OLD_DOMAIN,
      DOMAIN_MIGRATION.NEW_DOMAIN
    );

    logger.info('Domain migration performed', {
      oldUrl: url,
      newUrl: migratedUrl,
    });

    return migratedUrl;
  }

  /**
   * Validate if all URLs use new domain
   */
  static validateDomainConsistency(urls: string[]): {
    isConsistent: boolean;
    oldDomainUrls: string[];
    migratedUrls: string[];
  } {
    const oldDomainUrls: string[] = [];
    const migratedUrls: string[] = [];

    urls.forEach(url => {
      if (this.containsOldDomain(url)) {
        oldDomainUrls.push(url);
        migratedUrls.push(this.migrateUrl(url));
      }
    });

    return {
      isConsistent: oldDomainUrls.length === 0,
      oldDomainUrls,
      migratedUrls,
    };
  }

  /**
   * Get migration report for codebase
   */
  static getMigrationReport(urls: string[]): {
    totalUrls: number;
    needsMigration: number;
    migrationPercentage: number;
    recommendations: string[];
  } {
    const validation = this.validateDomainConsistency(urls);
    const totalUrls = urls.length;
    const needsMigration = validation.oldDomainUrls.length;
    const migrationPercentage = totalUrls > 0 ?
      ((totalUrls - needsMigration) / totalUrls) * 100 : 100;

    const recommendations: string[] = [];

    if (needsMigration > 0) {
      recommendations.push(
        `Update ${needsMigration} URLs to use new domain: ${DOMAIN_MIGRATION.NEW_DOMAIN}`
      );
      recommendations.push(
        'Run domain migration utility to update all references'
      );
      recommendations.push(
        'Update environment variables and configuration files'
      );
    }

    if (migrationPercentage === 100) {
      recommendations.push('✅ All URLs are using the new domain');
    }

    return {
      totalUrls,
      needsMigration,
      migrationPercentage,
      recommendations,
    };
  }
}

/**
 * Convenience functions
 */
export const migrateUrl = (url: string) => DomainMigrationUtil.migrateUrl(url);
export const validateDomainConsistency = (urls: string[]) =>
  DomainMigrationUtil.validateDomainConsistency(urls);
export const getMigrationReport = (urls: string[]) =>
  DomainMigrationUtil.getMigrationReport(urls);

/**
 * Type definitions
 */
export type DomainMigrationReport = ReturnType<typeof DomainMigrationUtil.getMigrationReport>;
export type DomainValidationResult = ReturnType<typeof DomainMigrationUtil.validateDomainConsistency>;