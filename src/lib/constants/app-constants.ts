/**
 * Application Constants
 * Tập trung tất cả constants để dễ bảo trì và tùy chỉnh
 */

// Timing Constants
export const TIMING = {
  SEARCH_DEBOUNCE_DELAY: 300,
  ANIMATION_STAGGER_DELAY: 100,
  MAX_ANIMATION_DELAY: 1000,
  TOAST_DURATION: 3000,
} as const;

// UI Constants
export const UI_CONFIG = {
  HERO_SECTION: {
    title: "Bảo vệ mật khẩu của bạn",
    subtitle: "Lưu trữ và quản lý tất cả mật khẩu của bạn một cách an toàn với công nghệ bảo mật hiện đại.",
    highlight: "Không bao giờ quên mật khẩu nữa!"
  },
  GRID_BREAKPOINTS: {
    mobile: 1,
    tablet: 2,
    desktop: 3
  }
} as const;

// Database Constants
export const DATABASE = {
  TABLE_NAME: 'passwords',
  MAX_RETRY_ATTEMPTS: 3,
  CONNECTION_TIMEOUT: 5000,
} as const;

// Validation Constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 1,
  MAX_PASSWORD_LENGTH: 500,
  MIN_SERVICE_LENGTH: 1,
  MAX_SERVICE_LENGTH: 100,
  MIN_USERNAME_LENGTH: 1,
  MAX_USERNAME_LENGTH: 100,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  CONNECTION_FAILED: 'Không thể kết nối đến cơ sở dữ liệu',
  FETCH_FAILED: 'Không thể lấy danh sách mật khẩu',
  SEARCH_FAILED: 'Không thể tìm kiếm mật khẩu',
  ADD_FAILED: 'Không thể thêm mật khẩu mới',
  UPDATE_FAILED: 'Không thể cập nhật mật khẩu',
  DELETE_FAILED: 'Không thể xóa mật khẩu',
  STATS_FAILED: 'Không thể lấy thống kê',
  CLEAR_ALL_FAILED: 'Không thể xóa toàn bộ dữ liệu',
  UNKNOWN_ERROR: 'Có lỗi không xác định xảy ra',
} as const;

// Success Messages với Enhanced Actions
export const SUCCESS_MESSAGES = {
  PASSWORD_ADDED: 'Mật khẩu mới đã được thêm thành công',
  PASSWORD_UPDATED: 'Mật khẩu đã được cập nhật thành công',
  PASSWORD_DELETED: 'Mật khẩu đã được xóa',
  CONNECTION_SUCCESS: 'Kết nối thành công',
  // Enhanced messages cho undo actions
  PASSWORD_DELETED_WITH_UNDO: 'Mật khẩu đã được xóa. Có thể hoàn tác trong vài giây.',
  BULK_DELETE_WITH_UNDO: 'Đã xóa {count} mật khẩu. Có thể hoàn tác trong vài giây.',
} as const;