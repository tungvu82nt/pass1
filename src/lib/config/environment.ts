/**
 * Environment configuration management
 * Centralized config từ environment variables
 */

import { z } from 'zod';
import { ENV_ACCESS } from './env-utils';

/**
 * Schema validation cho environment variables
 */
const envSchema = z.object({
  VITE_ENABLE_SAMPLE_DATA: z.string().optional().default('false'),
  VITE_SAMPLE_PASSWORDS: z.string().optional(),
  VITE_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional().default('error'),
});

/**
 * Parse và validate environment variables
 */
const parseEnv = () => {
  try {
    return envSchema.parse(import.meta.env);
  } catch (error) {
    console.error('Environment validation failed:', error);
    throw new Error('Invalid environment configuration');
  }
};

const env = parseEnv();

interface SimplePassword {
  service: string;
  username: string;
  password: string;
}

/**
 * Parse sample passwords từ JSON string
 */
const parseSamplePasswords = (): SimplePassword[] => {
  if (!env.VITE_SAMPLE_PASSWORDS) {
    // Default sample data nếu không có trong env
    return [
      {
        service: 'Gmail',
        username: 'user@gmail.com',
        password: 'sample_password_123'
      },
      {
        service: 'Facebook',
        username: 'user@facebook.com',
        password: 'fb_password_456'
      },
      {
        service: 'GitHub',
        username: 'developer',
        password: 'github_token_789'
      }
    ];
  }

  try {
    const parsed = JSON.parse(env.VITE_SAMPLE_PASSWORDS);
    if (!Array.isArray(parsed)) {
      throw new Error('Sample passwords must be an array');
    }
    return parsed;
  } catch (error) {
    console.warn('Failed to parse sample passwords from env, using defaults:', error);
    return parseSamplePasswords(); // Recursive call với empty env
  }
};

/**
 * Exported configuration object
 */
export const config = {
  // Database configuration removed

  development: {
    enableSampleData: env.VITE_ENABLE_SAMPLE_DATA === 'true',
    samplePasswords: parseSamplePasswords(),
  },

  logging: {
    level: env.VITE_LOG_LEVEL,
  },

  // Runtime environment checks
  isDevelopment: ENV_ACCESS.isDevelopment,
  isProduction: ENV_ACCESS.isProduction,
} as const;

/**
 * Type-safe config access
 */
export type Config = typeof config;