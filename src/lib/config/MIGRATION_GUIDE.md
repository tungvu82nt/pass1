# Configuration Service Migration Guide

## Tổng quan
Hướng dẫn chuyển đổi từ global scope pollution sang ConfigurationService pattern để cải thiện chất lượng mã và type safety.

## Thay đổi chính

### ❌ Cách cũ (Deprecated)
```typescript
// Global scope pollution - KHÔNG sử dụng
if (typeof window !== 'undefined') {
  (window as any).getCurrentUrl = getCurrentUrl;
}

// Direct function calls
const url = getCurrentUrl();
```

### ✅ Cách mới (Recommended)
```typescript
// Import ConfigurationService
import { configurationService, getConfiguredUrl } from '@/lib/config';

// Sử dụng service instance
const url = configurationService.getCurrentUrl();

// Hoặc sử dụng convenience functions
const url = getConfiguredUrl();
```

## API Migration

| Cũ | Mới | Ghi chú |
|---|---|---|
| `getCurrentUrl()` | `configurationService.getCurrentUrl()` | Có error handling |
| `getCurrentDomain()` | `configurationService.getCurrentDomain()` | Có error handling |
| `isProductionDomain()` | `configurationService.isProduction()` | Tên rõ ràng hơn |
| N/A | `configurationService.getApiBaseUrl()` | Tính năng mới |
| N/A | `configurationService.validateConfiguration()` | Validation |

## Convenience Functions

```typescript
// Import convenience functions cho code ngắn gọn
import { 
  getConfiguredUrl,
  getConfiguredDomain,
  isConfiguredProduction,
  getConfiguredApiBaseUrl
} from '@/lib/config';

// Sử dụng
const url = getConfiguredUrl();
const domain = getConfiguredDomain();
const isProd = isConfiguredProduction();
const apiUrl = getConfiguredApiBaseUrl();
```

## Benefits của ConfigurationService

### 1. **Type Safety**
- Loại bỏ `any` types
- Proper TypeScript interfaces
- Compile-time error checking

### 2. **Error Handling**
- Graceful fallbacks
- Comprehensive logging
- Validation on initialization

### 3. **Testability**
- Easy mocking với interfaces
- Singleton reset cho testing
- Isolated configuration logic

### 4. **Maintainability**
- Single responsibility principle
- Clear API contract
- Centralized configuration logic

### 5. **Performance**
- Singleton pattern - single instance
- Lazy initialization
- Configuration caching

## Testing

```typescript
// Test setup
import { ConfigurationService } from '@/lib/config/configuration-service';

beforeEach(() => {
  ConfigurationService.resetInstance();
});

// Mock service
const mockConfigService = {
  getCurrentUrl: jest.fn(() => 'https://test.com'),
  getCurrentDomain: jest.fn(() => 'test.com'),
  isProduction: jest.fn(() => false),
  getApiBaseUrl: jest.fn(() => 'https://test.com/api'),
  validateConfiguration: jest.fn(() => true)
};
```

## Development Debugging

Trong development mode, ConfigurationService được attach vào window để debugging:

```typescript
// Chỉ trong development
if (process.env.NODE_ENV === 'development') {
  console.log(window.__CONFIG_SERVICE__);
}
```

## Checklist Migration

- [ ] Thay thế tất cả `getCurrentUrl()` calls
- [ ] Thay thế tất cả `getCurrentDomain()` calls  
- [ ] Thay thế tất cả `isProductionDomain()` calls
- [ ] Update imports để sử dụng ConfigurationService
- [ ] Remove global scope dependencies
- [ ] Update tests để sử dụng service mocking
- [ ] Validate configuration on app startup

## Rollback Plan

Nếu cần rollback, có thể temporary enable global fallback:

```typescript
// Emergency rollback (temporary only)
if (typeof window !== 'undefined') {
  window.getCurrentUrl = () => configurationService.getCurrentUrl();
}
```

**Lưu ý**: Rollback chỉ nên sử dụng tạm thời và cần plan để migrate lại.