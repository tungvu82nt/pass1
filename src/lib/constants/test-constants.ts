/**
 * Constants cho Database testing
 * Tập trung tất cả test messages và data để dễ maintain
 */

// Test messages với emoji và format nhất quán
export const TEST_MESSAGES = {
  // Client setup
  URL_LOG: '🔍 URL:',
  KEY_LOG: '🔑 Key:',
  CLIENT_CREATED: '✅ Client created',
  MISSING_ENV: '❌ Missing environment variables',
  CLIENT_FAILED: '❌ Client creation failed:',

  // Health check
  HEALTH_CHECK: '🏥 Test health check...',
  HEALTH_OK: '✅ Health check OK',
  HEALTH_FAILED: '❌ Health check failed:',

  // List data
  LIST_TEST: '📋 Test list data...',
  LIST_OK: '✅ List OK:',
  LIST_FAILED: '❌ List failed:',
  SAMPLE_DATA: '📊 Sample data:',

  // Insert operations
  INSERT_TEST: '➕ Test insert...',
  INSERT_OK: '✅ Insert OK: ID',
  INSERT_FAILED: '❌ Insert failed:',

  // Cleanup và completion
  CLEANUP: '🗑️ Cleanup done',
  ALL_PASSED: '🎉 ALL TESTS PASSED!',

  // Error handling
  EXCEPTION: '💥 Exception:',
  ERROR_CODE: '❌ Error code:',
  ERROR_DETAILS: '❌ Error details:'
} as const;

// Test data cho insert operations
export const TEST_DATA = {
  LINK: 'https://test.com',
  USER: 'testuser',
  PASS: 'testpass123'
} as const;

// UI constants
export const UI_CONSTANTS = {
  PLACEHOLDER_TEXT: 'Nhấn "Run Direct Test" để bắt đầu...',
  BUTTON_LOADING: 'Testing...',
  BUTTON_IDLE: 'Run Direct Test',
  CLEAR_BUTTON: 'Clear',

  // Component descriptions
  DESCRIPTIONS: [
    '• Test này bypass tất cả abstraction layers',
    '• Tạo Database client trực tiếp từ env vars',
    '• Kiểm tra từng operation một cách chi tiết'
  ]
} as const;

// Test configuration
export const TEST_CONFIG = {
  LIST_LIMIT: 5,
  KEY_DISPLAY_LENGTH: 20,
  MAX_LOG_HEIGHT: 'max-h-80'
} as const;