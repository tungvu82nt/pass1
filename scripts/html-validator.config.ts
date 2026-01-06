/**
 * HTML Validator Configuration
 * Cấu hình validation rules và settings
 */

import { ValidatorConfig, ValidationRule } from './html-validator';

// Extended validation rules
export const COMPREHENSIVE_RULES: ValidationRule[] = [
  // Accessibility Rules
  {
    name: 'missing-alt-text',
    pattern: /<img(?![^>]*alt=)/i,
    message: 'Image missing alt attribute for accessibility',
    severity: 'error'
  },
  {
    name: 'missing-lang-attribute',
    pattern: /<html(?![^>]*lang=)/i,
    message: 'HTML element missing lang attribute',
    severity: 'warning'
  },

  // SEO Rules
  {
    name: 'missing-title',
    pattern: /^(?!.*<title>)/i,
    message: 'Page missing title tag',
    severity: 'error'
  },
  {
    name: 'missing-meta-description',
    pattern: /^(?!.*<meta[^>]*name=["']description["'])/i,
    message: 'Page missing meta description',
    severity: 'warning'
  },

  // HTML Structure Rules
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
    name: 'unclosed-tags',
    pattern: /<(div|p|span|h[1-6])(?![^>]*\/>)(?![^>]*<\/\1>)/i,
    message: 'Potentially unclosed HTML tag',
    severity: 'warning'
  },

  // Performance Rules
  {
    name: 'inline-styles',
    pattern: /style\s*=\s*["'][^"']*["']/i,
    message: 'Inline styles detected - consider using CSS classes',
    severity: 'warning'
  },
  {
    name: 'missing-charset',
    pattern: /^(?!.*<meta[^>]*charset=)/i,
    message: 'Missing charset meta tag',
    severity: 'warning'
  }
];

// Configuration presets
export const CONFIGS = {
  // Basic validation - chỉ check lỗi cơ bản
  basic: {
    files: ['index.html'],
    rules: [
      COMPREHENSIVE_RULES.find(r => r.name === 'unquoted-attributes')!,
      COMPREHENSIVE_RULES.find(r => r.name === 'malformed-viewport')!
    ],
    exitOnError: true,
    verbose: false
  } as ValidatorConfig,

  // Production validation - check toàn diện
  production: {
    files: ['index.html', 'dist/index.html'],
    rules: COMPREHENSIVE_RULES,
    exitOnError: true,
    verbose: true
  } as ValidatorConfig,

  // Development validation - warnings only
  development: {
    files: ['index.html'],
    rules: COMPREHENSIVE_RULES.map(rule => ({ ...rule, severity: 'warning' as const })),
    exitOnError: false,
    verbose: true
  } as ValidatorConfig,

  // Accessibility focused
  accessibility: {
    files: ['index.html', 'dist/index.html'],
    rules: COMPREHENSIVE_RULES.filter(rule => 
      ['missing-alt-text', 'missing-lang-attribute'].includes(rule.name)
    ),
    exitOnError: false,
    verbose: true
  } as ValidatorConfig
};

// Export default config
export const DEFAULT_CONFIG = CONFIGS.production;