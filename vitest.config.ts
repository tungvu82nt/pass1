/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Bật globals để sử dụng describe, it, expect mà không cần import
    globals: true,
    
    // Môi trường DOM cho React testing
    environment: 'jsdom',
    
    // File setup cho mỗi test
    setupFiles: ['./src/test/setup.ts'],
    
    // Cấu hình coverage reporting
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/main.tsx', // Entry point không cần test
        'src/vite-env.d.ts',
      ],
      // Ngưỡng coverage tối thiểu
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    
    // Timeout cho tests
    testTimeout: 10000,
    
    // Pattern để tìm test files
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    
    // Loại trừ các file không cần test
    exclude: [
      'node_modules',
      'dist',
      '.git',
      '.cache',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});