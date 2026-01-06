# Password Management Hooks Architecture

## Tổng quan

Hệ thống hooks được thiết kế theo các design patterns để đảm bảo tính mở rộng, bảo trì và tái sử dụng.

## Architecture Patterns

### 1. Strategy Pattern
- **Base Hook**: `usePasswordsBase` - Abstract implementation
- **Adapters**: `IndexedDBManagerAdapter`, `SupabaseManagerAdapter`
- **Concrete Hooks**: `usePasswordsIndexedDB`, `usePasswords`

### 2. Decorator Pattern
- **Enhanced Hook**: `usePasswordsEnhanced` - Thêm debounced search
- **Debounced Search**: `useDebouncedSearch` - Utility hook

## File Structure

```
src/hooks/
├── use-passwords-base.ts          # Base hook với Strategy Pattern
├── use-passwords-indexeddb.ts     # IndexedDB implementation
├── use-passwords.ts               # Supabase implementation
├── use-passwords-enhanced.ts      # Enhanced với debounced search
└── use-debounced-search.ts        # Utility hook cho debouncing
```

## Usage Examples

### Basic Usage (IndexedDB)
```typescript
import { usePasswordsIndexedDB } from '@/hooks/use-passwords-indexeddb';

function PasswordManager() {
  const { passwords, loading, addPassword, searchPasswords } = usePasswordsIndexedDB();
  
  // Use the hook...
}
```

### Enhanced Usage (với Debounced Search)
```typescript
import { usePasswordsEnhanced } from '@/hooks/use-passwords-enhanced';

function PasswordManager() {
  const { passwords, loading, isSearching, searchPasswords } = usePasswordsEnhanced();
  
  // searchPasswords sẽ tự động debounce
  const handleSearch = (query: string) => {
    searchPasswords(query);
  };
}
```

### Custom Database Implementation
```typescript
import { usePasswordsBase, DatabaseManager } from '@/hooks/use-passwords-base';

class CustomDatabaseManager implements DatabaseManager {
  // Implement interface methods...
}

function useCustomPasswords() {
  const dbManager = useMemo(() => new CustomDatabaseManager(), []);
  return usePasswordsBase(dbManager);
}
```

## Benefits

1. **DRY Principle**: Loại bỏ code duplication
2. **Strategy Pattern**: Dễ dàng thay đổi database backend
3. **Decorator Pattern**: Thêm tính năng mà không modify existing code
4. **Performance**: Debounced search, optimized re-renders
5. **Type Safety**: Full TypeScript support
6. **Maintainability**: Clear separation of concerns

## Migration Guide

### Từ `usePasswords` sang `usePasswordsEnhanced`
```typescript
// Before
import { usePasswords } from '@/hooks/use-passwords';

// After
import { usePasswordsEnhanced } from '@/hooks/use-passwords-enhanced';

// API tương thích 100%, chỉ cần thay đổi import
```

## Performance Optimizations

1. **useMemo**: Database adapters được cache
2. **useCallback**: Functions được memoized
3. **Debouncing**: Search operations được debounce
4. **Optimistic Updates**: UI updates ngay lập tức
5. **Error Boundaries**: Proper error handling

## Future Enhancements

1. **Caching Layer**: Thêm React Query integration
2. **Offline Support**: Service Worker integration
3. **Batch Operations**: Multiple operations trong một transaction
4. **Real-time Sync**: WebSocket support cho multi-device sync