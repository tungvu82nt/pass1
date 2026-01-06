/**
 * Security Audit Logger
 * Theo dõi các hoạt động bảo mật quan trọng
 */

import { logger } from '@/lib/utils/logger';

export enum SecurityEvent {
  PASSWORD_CREATED = 'PASSWORD_CREATED',
  PASSWORD_VIEWED = 'PASSWORD_VIEWED',
  PASSWORD_COPIED = 'PASSWORD_COPIED',
  PASSWORD_UPDATED = 'PASSWORD_UPDATED',
  PASSWORD_DELETED = 'PASSWORD_DELETED',
  BULK_DELETE = 'BULK_DELETE',
  SEARCH_PERFORMED = 'SEARCH_PERFORMED',
  EXPORT_ATTEMPTED = 'EXPORT_ATTEMPTED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY'
}

interface AuditEntry {
  event: SecurityEvent;
  timestamp: string;
  details?: Record<string, any>;
  userAgent?: string;
  sessionId?: string;
}

/**
 * Security audit logging system
 */
export class AuditLogger {
  private static readonly STORAGE_KEY = 'security-audit-log';
  private static readonly MAX_ENTRIES = 1000;

  /**
   * Log security event
   */
  static logSecurityEvent(
    event: SecurityEvent, 
    details?: Record<string, any>
  ): void {
    const auditEntry: AuditEntry = {
      event,
      timestamp: new Date().toISOString(),
      details: this.sanitizeDetails(details),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId()
    };

    try {
      this.saveAuditEntry(auditEntry);
      logger.info(`Security event logged: ${event}`, auditEntry);
    } catch (error) {
      logger.error('Failed to log security event', error as Error);
    }
  }

  /**
   * Get audit trail (for security review)
   */
  static getAuditTrail(limit = 100): AuditEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const entries: AuditEntry[] = JSON.parse(stored);
      return entries.slice(-limit);
    } catch (error) {
      logger.error('Failed to retrieve audit trail', error as Error);
      return [];
    }
  }

  /**
   * Clear old audit entries (privacy compliance)
   */
  static cleanupOldEntries(daysToKeep = 30): void {
    try {
      const entries = this.getAuditTrail(this.MAX_ENTRIES);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const filteredEntries = entries.filter(entry => 
        new Date(entry.timestamp) > cutoffDate
      );

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredEntries));
      logger.info(`Cleaned up audit log, kept ${filteredEntries.length} entries`);
    } catch (error) {
      logger.error('Failed to cleanup audit entries', error as Error);
    }
  }

  private static saveAuditEntry(entry: AuditEntry): void {
    const entries = this.getAuditTrail(this.MAX_ENTRIES - 1);
    entries.push(entry);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
  }

  private static sanitizeDetails(details?: Record<string, any>): Record<string, any> | undefined {
    if (!details) return undefined;

    // Remove sensitive information from audit logs
    const sanitized = { ...details };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    
    return sanitized;
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('audit-session-id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('audit-session-id', sessionId);
    }
    return sessionId;
  }
}