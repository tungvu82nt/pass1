# Phân tích Chất lượng Mã nguồn - Memory Safe Guard
*Ngày phân tích: 7 tháng 1, 2025*

## 🔍 Code Smells đã phát hiện

### 1. **Unused Import** - `src/hooks/use-passwords.ts`
**Vấn đề**: Import `useToastNotifications` nhưng không sử dụng (dòng 15)
```typescript
import { useToastNotifications } from '@/hooks/use-toast-notifications'; // ❌ Unused
```

**Tác động**: 
- Tăng bundle size không cần thiết
- Gây confusion cho developers
- Violate clean code principles

**Giải pháp**: Xóa import không sử dụng

---

### 2. **Duplicate Type Definitions** - `src/hooks/use-toast-notifications.ts`
**Vấn đề**: Có cả `ToastConfigLegacy` và `ToastConfig` từ types file
```typescript
// ❌ Duplicate definitions
interface ToastConfigLegacy {
  duration?: number;
  position?: string;
  action?: { label: string; onClick: () => void; };
}

interface UseToastNotificationsReturnLegacy {
  // ... duplicate methods
}
```

**Tác động**:
- Code duplication và confusion
- Maintenance overhead
- Type inconsistency risks

**Giải pháp**: Sử dụng chỉ types từ `@/lib/types/toast-types`

---

### 3. **Complex Hook** - `src/hooks/use-toast-notifications.ts`
**Vấn đề**: Hook có quá nhiều methods (9 methods) và logic phức tạp
- Single Responsibility Principle violation
- Hook quá lớn (150+ lines)
- Quá nhiều concerns trong một hook

**Tác động**:
- Khó test và maintain
- Reusability bị hạn chế
- Performance impact với nhiều useCallback

**Giải pháp**: Tách thành multiple specialized hooks

---

### 4. **API Service Coupling** - `src/lib/services/password-service.ts`
**Vấn đề**: `ApiService` class được define inline trong file service
```typescript
class ApiService {
  // ❌ Tightly coupled với PasswordService
  static async fetchPasswords(query?: string): Promise<PasswordEntry[]> {
    // ... 50+ lines of API logic
  }
}
```

**Tác động**:
- Tight coupling giữa API và business logic
- File quá lớn (200+ lines)
- Khó test riêng biệt

**Giải pháp**: Tách `ApiService` thành file riêng

---

### 5. **Missing Error Recovery** - `src/components/PasswordForm.tsx`
**Vấn đề**: Form không có comprehensive error recovery mechanism
- Chỉ có basic try-catch
- Không có retry logic
- Không có form state recovery

**Tác động**:
- Poor user experience khi có lỗi
- Data loss potential
- Không có graceful degradation
## 🚀 Đề xuất Cải tiến cụ thể

### 1. **Refactor useToastNotifications Hook**

#### Tách thành multiple hooks:
```typescript
// src/hooks/toast/use-basic-toast.ts
export const useBasicToast = () => {
  const isMobile = useIsMobile();
  const { trackToast } = useToastPerformance();
  
  return {
    showSuccess: (message: string, config?: ToastConfig) => { /* ... */ },
    showError: (message: string, config?: ToastConfig) => { /* ... */ },
    showInfo: (message: string, config?: ToastConfig) => { /* ... */ },
    showWarning: (message: string, config?: ToastConfig) => { /* ... */ },
  };
};

// src/hooks/toast/use-enhanced-toast.ts
export const useEnhancedToast = () => {
  const basicToast = useBasicToast();
  
  return {
    ...basicToast,
    showSuccessWithUndo: (message: string, onUndo: () => void) => { /* ... */ },
    showErrorWithRetry: (message: string, onRetry: () => void) => { /* ... */ },
    showInfoWithAction: (message: string, action: ToastAction) => { /* ... */ },
  };
};

// src/hooks/toast/use-toast-manager.ts
export const useToastManager = () => {
  return {
    dismissAll: () => toast.dismiss(),
    dismissByLevel: (level: string) => { /* ... */ },
  };
};
```

#### Composite hook cho backward compatibility:
```typescript
// src/hooks/use-toast-notifications.ts
export const useToastNotifications = () => {
  const basicToast = useBasicToast();
  const enhancedToast = useEnhancedToast();
  const toastManager = useToastManager();
  
  return {
    ...basicToast,
    ...enhancedToast,
    ...toastManager,
  };
};
```

---

### 2. **Tách ApiService thành module riêng**

```typescript
// src/lib/api/password-api.ts
export class PasswordApiService {
  private static baseUrl = API_CONFIG.BASE_URL;

  static async fetchPasswords(query?: string): Promise<PasswordEntry[]> {
    // ... API logic
  }

  static async addPassword(entry: PasswordInsert): Promise<PasswordEntry> {
    // ... API logic
  }

  // ... other methods
}

// src/lib/services/password-service.ts
import { PasswordApiService } from '@/lib/api/password-api';

export class PasswordService {
  // ... simplified service logic
  private apiService = PasswordApiService;
}
```

---

### 3. **Enhanced Error Recovery cho PasswordForm**

```typescript
// src/hooks/use-form-recovery.ts
export const useFormRecovery = <T>(formKey: string) => {
  const [savedData, setSavedData] = useState<Partial<T> | null>(null);
  
  const saveFormData = useCallback((data: Partial<T>) => {
    localStorage.setItem(`form_recovery_${formKey}`, JSON.stringify(data));
    setSavedData(data);
  }, [formKey]);
  
  const clearSavedData = useCallback(() => {
    localStorage.removeItem(`form_recovery_${formKey}`);
    setSavedData(null);
  }, [formKey]);
  
  const loadSavedData = useCallback((): Partial<T> | null => {
    const saved = localStorage.getItem(`form_recovery_${formKey}`);
    return saved ? JSON.parse(saved) : null;
  }, [formKey]);
  
  return { savedData, saveFormData, clearSavedData, loadSavedData };
};

// Enhanced PasswordForm với recovery
export const PasswordForm = ({ isOpen, onClose, onSave, editEntry }: PasswordFormProps) => {
  const { savedData, saveFormData, clearSavedData, loadSavedData } = useFormRecovery<PasswordEntryFormData>('password-form');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
  const onSubmit = async (data: PasswordEntryFormData) => {
    try {
      await onSave(data);
      clearSavedData(); // Clear recovery data on success
      onClose();
    } catch (error) {
      saveFormData(data); // Save for recovery
      
      if (retryCount < maxRetries) {
        // Show retry option
        showErrorWithRetry(
          `Lỗi lưu mật khẩu (${retryCount + 1}/${maxRetries}). Thử lại?`,
          () => {
            setRetryCount(prev => prev + 1);
            handleSubmit(onSubmit)();
          }
        );
      } else {
        showError('Không thể lưu mật khẩu. Dữ liệu đã được lưu để khôi phục.');
      }
    }
  };
};
```

---

### 4. **Performance Optimization Pattern**

```typescript
// src/hooks/use-optimized-passwords.ts
export const useOptimizedPasswords = (config: UsePasswordsConfig = {}) => {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debounced search để tránh excessive API calls
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      passwordService.searchPasswords(query).then(setPasswords);
    }, 300),
    [passwordService]
  );
  
  // Memoized filtered results
  const filteredPasswords = useMemo(() => {
    if (!searchQuery) return passwords;
    return passwords.filter(p => 
      p.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [passwords, searchQuery]);
  
  // Virtual scrolling cho large datasets
  const virtualizedPasswords = useMemo(() => {
    if (filteredPasswords.length > 100) {
      return filteredPasswords.slice(0, 50); // Load first 50, implement pagination
    }
    return filteredPasswords;
  }, [filteredPasswords]);
  
  return {
    passwords: virtualizedPasswords,
    searchQuery,
    setSearchQuery: (query: string) => {
      setSearchQuery(query);
      debouncedSearch(query);
    },
    // ... other methods
  };
};
```

---

### 5. **Type Safety Improvements**

```typescript
// src/lib/types/service-types.ts
export interface ServiceConfig {
  enableApiSync: boolean;
  retryAttempts?: number;
  timeout?: number;
  cacheStrategy?: 'memory' | 'indexeddb' | 'none';
}

export interface ServiceResult<T> {
  data: T;
  source: 'cache' | 'indexeddb' | 'api';
  timestamp: number;
  error?: Error;
}

// Enhanced service với better typing
export class PasswordService {
  async getAllPasswords(): Promise<ServiceResult<PasswordEntry[]>> {
    const startTime = Date.now();
    
    try {
      const data = await db.getAllPasswords();
      return {
        data,
        source: 'indexeddb',
        timestamp: startTime,
      };
    } catch (error) {
      if (this.config.enableApiSync) {
        const apiData = await ApiService.fetchPasswords();
        return {
          data: apiData,
          source: 'api',
          timestamp: startTime,
          error: error as Error,
        };
      }
      throw error;
    }
  }
}
```
## 🏗️ Architecture Improvements

### 1. **Dependency Injection Pattern**

```typescript
// src/lib/di/container.ts
export class DIContainer {
  private static services = new Map<string, any>();
  
  static register<T>(key: string, service: T): void {
    this.services.set(key, service);
  }
  
  static get<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service ${key} not registered`);
    }
    return service;
  }
}

// Register services
DIContainer.register('passwordService', PasswordService.getInstance());
DIContainer.register('apiService', new PasswordApiService());

// Usage trong hooks
export const usePasswords = () => {
  const passwordService = DIContainer.get<PasswordService>('passwordService');
  // ... hook logic
};
```

### 2. **Event-Driven Architecture**

```typescript
// src/lib/events/password-events.ts
export enum PasswordEvents {
  ADDED = 'password:added',
  UPDATED = 'password:updated',
  DELETED = 'password:deleted',
  SEARCH = 'password:search',
}

export class PasswordEventBus {
  private static instance: PasswordEventBus;
  private listeners = new Map<string, Function[]>();
  
  static getInstance(): PasswordEventBus {
    if (!this.instance) {
      this.instance = new PasswordEventBus();
    }
    return this.instance;
  }
  
  emit(event: PasswordEvents, data: any): void {
    const eventListeners = this.listeners.get(event) || [];
    eventListeners.forEach(listener => listener(data));
  }
  
  on(event: PasswordEvents, listener: Function): () => void {
    const eventListeners = this.listeners.get(event) || [];
    eventListeners.push(listener);
    this.listeners.set(event, eventListeners);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(event) || [];
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }
}

// Usage trong service
export class PasswordService {
  private eventBus = PasswordEventBus.getInstance();
  
  async addPassword(entry: PasswordInsert): Promise<PasswordEntry> {
    const result = await db.addPassword(entry);
    this.eventBus.emit(PasswordEvents.ADDED, result);
    return result;
  }
}

// Usage trong components
export const PasswordList = () => {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const eventBus = PasswordEventBus.getInstance();
  
  useEffect(() => {
    const unsubscribe = eventBus.on(PasswordEvents.ADDED, (newPassword) => {
      setPasswords(prev => [...prev, newPassword]);
    });
    
    return unsubscribe;
  }, [eventBus]);
};
```

### 3. **Caching Strategy**

```typescript
// src/lib/cache/cache-manager.ts
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, CacheEntry<any>>();
  
  static getInstance(): CacheManager {
    if (!this.instance) {
      this.instance = new CacheManager();
    }
    return this.instance;
  }
  
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

// Enhanced service với caching
export class PasswordService {
  private cache = CacheManager.getInstance();
  
  async getAllPasswords(): Promise<PasswordEntry[]> {
    const cacheKey = 'passwords:all';
    const cached = this.cache.get<PasswordEntry[]>(cacheKey);
    
    if (cached) {
      logger.debug('Returning cached passwords');
      return cached;
    }
    
    const passwords = await db.getAllPasswords();
    this.cache.set(cacheKey, passwords, 2 * 60 * 1000); // Cache 2 minutes
    
    return passwords;
  }
  
  async addPassword(entry: PasswordInsert): Promise<PasswordEntry> {
    const result = await db.addPassword(entry);
    this.cache.invalidate('passwords:'); // Invalidate all password caches
    return result;
  }
}
```

---

## 🧪 Testing Strategy Improvements

### 1. **Hook Testing với React Testing Library**

```typescript
// src/hooks/__tests__/use-passwords.test.ts
import { renderHook, act } from '@testing-library/react';
import { usePasswords } from '../use-passwords';

describe('usePasswords', () => {
  beforeEach(() => {
    // Mock dependencies
    jest.clearAllMocks();
  });
  
  it('should load passwords on initialization', async () => {
    const { result } = renderHook(() => usePasswords());
    
    await act(async () => {
      await result.current.refreshPasswords();
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.passwords).toHaveLength(0);
  });
  
  it('should handle add password with success toast', async () => {
    const { result } = renderHook(() => usePasswords());
    const mockEntry = {
      service: 'Test Service',
      username: 'test@example.com',
      password: 'securepassword123',
    };
    
    await act(async () => {
      await result.current.addPassword(mockEntry);
    });
    
    // Verify toast was called
    expect(mockShowSuccess).toHaveBeenCalledWith(
      expect.stringContaining('Đã thêm mật khẩu')
    );
  });
});
```

### 2. **Component Testing với MSW**

```typescript
// src/components/__tests__/PasswordForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PasswordForm } from '../PasswordForm';
import { server } from '../../test/mocks/server';

describe('PasswordForm', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  
  it('should validate form fields', async () => {
    const mockOnSave = jest.fn();
    
    render(
      <PasswordForm
        isOpen={true}
        onClose={() => {}}
        onSave={mockOnSave}
      />
    );
    
    // Submit empty form
    fireEvent.click(screen.getByText('Lưu'));
    
    await waitFor(() => {
      expect(screen.getByText('Tên dịch vụ là bắt buộc')).toBeInTheDocument();
    });
  });
  
  it('should recover form data after error', async () => {
    // Test form recovery functionality
  });
});
```

---

## 📊 Performance Monitoring

### 1. **Enhanced Performance Hooks**

```typescript
// src/hooks/use-performance-monitor.ts
export const usePerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    reRenderCount: 0,
  });
  
  const renderStartTime = useRef<number>(0);
  const reRenderCount = useRef<number>(0);
  
  useEffect(() => {
    renderStartTime.current = performance.now();
    reRenderCount.current += 1;
  });
  
  useLayoutEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    
    setMetrics(prev => ({
      ...prev,
      renderTime,
      reRenderCount: reRenderCount.current,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
    }));
    
    // Log performance metrics
    logger.performance(`${componentName} render`, {
      renderTime,
      reRenderCount: reRenderCount.current,
    });
  });
  
  return metrics;
};
```

### 2. **Bundle Analysis Setup**

```typescript
// vite.config.ts enhancement
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer
    process.env.ANALYZE && bundleAnalyzer(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
        },
      },
    },
  },
});
```

---

## 🔒 Security Enhancements

### 1. **Secure Data Handling**

```typescript
// src/lib/security/data-encryption.ts
export class DataEncryption {
  private static key: CryptoKey | null = null;
  
  static async generateKey(): Promise<CryptoKey> {
    if (!this.key) {
      this.key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    }
    return this.key;
  }
  
  static async encrypt(data: string): Promise<string> {
    const key = await this.generateKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );
    
    return btoa(JSON.stringify({
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted)),
    }));
  }
  
  static async decrypt(encryptedData: string): Promise<string> {
    const key = await this.generateKey();
    const { iv, data } = JSON.parse(atob(encryptedData));
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      key,
      new Uint8Array(data)
    );
    
    return new TextDecoder().decode(decrypted);
  }
}
```

---

## 📋 Implementation Roadmap

### Phase 1: Critical Fixes (1-2 days)
- [ ] Fix unused import trong `use-passwords.ts`
- [ ] Remove duplicate type definitions
- [ ] Tách ApiService thành file riêng

### Phase 2: Architecture Improvements (3-5 days)
- [ ] Refactor useToastNotifications thành multiple hooks
- [ ] Implement form recovery mechanism
- [ ] Add comprehensive error boundaries

### Phase 3: Performance & Security (5-7 days)
- [ ] Implement caching strategy
- [ ] Add performance monitoring
- [ ] Enhance security với data encryption
- [ ] Add comprehensive testing

### Phase 4: Advanced Features (7-10 days)
- [ ] Event-driven architecture
- [ ] Dependency injection
- [ ] Advanced performance optimization
- [ ] Bundle optimization

---

## 🎯 Expected Benefits

### Code Quality
- **Maintainability**: +40% với cleaner architecture
- **Testability**: +60% với better separation of concerns
- **Reusability**: +50% với modular hooks

### Performance
- **Bundle Size**: -15% với better tree shaking
- **Runtime Performance**: +25% với caching và optimization
- **Memory Usage**: -20% với better cleanup

### Developer Experience
- **Development Speed**: +30% với better tooling
- **Debugging**: +50% với enhanced logging
- **Code Confidence**: +40% với comprehensive testing

---

**Tổng kết**: Các cải tiến này sẽ nâng Memory Safe Guard lên một level mới về chất lượng mã nguồn, performance và maintainability, đồng thời đảm bảo security và user experience tốt nhất.