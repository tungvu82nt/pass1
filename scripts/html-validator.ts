/**
 * HTML Validator - Refactored Version
 * Kiểm tra tính hợp lệ của file HTML với clean architecture
 * 
 * Features:
 * - TypeScript support
 * - Modular design
 * - Comprehensive error handling
 * - Configurable validation rules
 * - Detailed reporting
 */

import * as fs from 'fs';
import * as path from 'path';

// Types
interface ValidationRule {
  name: string;
  pattern: RegExp;
  message: string;
  severity: 'error' | 'warning';
}

interface ValidationResult {
  filePath: string;
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  lineCount: number;
}

interface ValidationError {
  line: number;
  rule: string;
  message: string;
  content: string;
}

interface ValidatorConfig {
  files: string[];
  rules: ValidationRule[];
  exitOnError: boolean;
  verbose: boolean;
}

// Constants
const DEFAULT_VALIDATION_RULES: ValidationRule[] = [
  {
    name: 'unquoted-attributes',
    pattern: /\s+\w+=[^"'\s>]+[\s>]/g,
    message: 'Unquoted attribute detected',
    severity: 'error'
  },
  {
    name: 'malformed-viewport',
    pattern: /viewport.*content=(?!["'])/,
    message: 'Malformed viewport meta tag',
    severity: 'error'
  },
  {
    name: 'missing-alt-text',
    pattern: /<img(?![^>]*alt=)/i,
    message: 'Image missing alt attribute',
    severity: 'warning'
  }
];

const DEFAULT_CONFIG: ValidatorConfig = {
  files: ['index.html', 'dist/index.html'],
  rules: DEFAULT_VALIDATION_RULES,
  exitOnError: true,
  verbose: true
};

/**
 * HTML Validator Class - Single Responsibility
 */
class HTMLValidator {
  private config: ValidatorConfig;

  constructor(config: Partial<ValidatorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Validate single HTML file
   */
  async validateFile(filePath: string): Promise<ValidationResult> {
    const result: ValidationResult = {
      filePath,
      isValid: true,
      errors: [],
      warnings: [],
      lineCount: 0
    };

    try {
      if (!this.fileExists(filePath)) {
        result.errors.push({
          line: 0,
          rule: 'file-not-found',
          message: `File not found: ${filePath}`,
          content: ''
        });
        result.isValid = false;
        return result;
      }

      const content = await this.readFile(filePath);
      const lines = content.split('\n');
      result.lineCount = lines.length;

      this.logInfo(`🔍 Validating HTML: ${filePath} (${lines.length} lines)`);

      // Apply validation rules
      lines.forEach((line, index) => {
        this.validateLine(line, index + 1, result);
      });

      result.isValid = result.errors.length === 0;
      
      if (result.isValid) {
        this.logSuccess(`✅ ${filePath} validation passed!`);
      } else {
        this.logError(`❌ ${filePath} validation failed with ${result.errors.length} errors`);
      }

      return result;
    } catch (error) {
      this.logError(`💥 Error validating ${filePath}:`, error);
      result.errors.push({
        line: 0,
        rule: 'validation-error',
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        content: ''
      });
      result.isValid = false;
      return result;
    }
  }

  /**
   * Validate line against all rules
   */
  private validateLine(line: string, lineNum: number, result: ValidationResult): void {
    this.config.rules.forEach(rule => {
      if (this.shouldApplyRule(rule, line) && rule.pattern.test(line)) {
        const error: ValidationError = {
          line: lineNum,
          rule: rule.name,
          message: rule.message,
          content: line.trim()
        };

        if (rule.severity === 'error') {
          result.errors.push(error);
          this.logError(`❌ Line ${lineNum}: ${rule.message}`);
          this.logError(`   ${line.trim()}`);
        } else {
          result.warnings.push(error);
          this.logWarning(`⚠️  Line ${lineNum}: ${rule.message}`);
          this.logWarning(`   ${line.trim()}`);
        }
      }
    });
  }

  /**
   * Check if rule should be applied to line
   */
  private shouldApplyRule(rule: ValidationRule, line: string): boolean {
    // Special logic for viewport rule
    if (rule.name === 'malformed-viewport') {
      return line.includes('viewport') && line.includes('content=');
    }
    return true;
  }

  /**
   * Validate all configured files
   */
  async validateAll(): Promise<ValidationResult[]> {
    this.logInfo('🚀 Starting HTML validation...\n');

    const results: ValidationResult[] = [];
    
    for (const filePath of this.config.files) {
      const result = await this.validateFile(filePath);
      results.push(result);
      console.log(''); // Add spacing
    }

    this.printSummary(results);
    return results;
  }

  /**
   * Print validation summary
   */
  private printSummary(results: ValidationResult[]): void {
    const totalFiles = results.length;
    const validFiles = results.filter(r => r.isValid).length;
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

    console.log('📊 Validation Summary:');
    console.log(`   Files processed: ${totalFiles}`);
    console.log(`   Valid files: ${validFiles}`);
    console.log(`   Total errors: ${totalErrors}`);
    console.log(`   Total warnings: ${totalWarnings}`);

    if (validFiles === totalFiles && totalErrors === 0) {
      this.logSuccess('🎉 All HTML files are valid!');
    } else {
      this.logError('💥 HTML validation completed with issues!');
    }
  }

  /**
   * File system utilities
   */
  private fileExists(filePath: string): boolean {
    try {
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  }

  private async readFile(filePath: string): Promise<string> {
    return fs.promises.readFile(filePath, 'utf8');
  }

  /**
   * Logging utilities
   */
  private logInfo(message: string): void {
    if (this.config.verbose) {
      console.log(message);
    }
  }

  private logSuccess(message: string): void {
    console.log(message);
  }

  private logError(message: string, error?: unknown): void {
    console.error(message);
    if (error && this.config.verbose) {
      console.error(error);
    }
  }

  private logWarning(message: string): void {
    if (this.config.verbose) {
      console.warn(message);
    }
  }
}

/**
 * CLI Runner
 */
async function main(): Promise<void> {
  try {
    const validator = new HTMLValidator();
    const results = await validator.validateAll();
    
    const hasErrors = results.some(r => !r.isValid);
    
    if (hasErrors && DEFAULT_CONFIG.exitOnError) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Export for testing
export { HTMLValidator, ValidationResult, ValidationRule, ValidatorConfig };

// Run if called directly
if (require.main === module) {
  main();
}