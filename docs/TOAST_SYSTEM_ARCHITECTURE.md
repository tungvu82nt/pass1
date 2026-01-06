# Toast System Architecture

## Tổng quan
Hệ thống toast notifications được thiết kế với architecture hiện đại, tập trung vào performance, type safety và user experience.

## 🏗️ Architecture Components

### 1. **Core Hook - useToastNotifications**
- **Location**: `src/hooks/use-toast-notifications.ts`
- **Purpose**: Centralized toast management với Sonner integration
- **Features**:
  - Type-safe notifications
  - Mobile-responsive positioning
  - Performance tracking
  - Enhanced action support

### 2. **Type Definitions - toast-types.ts**
- **Location**: `src/lib/types/toast-types.ts`
- **Purpose**: Comprehensive type safety cho toast system
- **Features**:
  - Literal types cho positions
  - Enhanced action interfaces
  - Toast configuration types

### 3. **Performance Monitoring - useToastPerformance**
- **Location**: `src/hooks/use-toast-performance.ts`
- **Purpose**: Monitor và optimize toast performance
- **Features**:
  - Frequency tracking
  - Memory usage monitoring
  - Spam detection
  - Performance reporting

### 4. **Configuration - toast-config.ts**
- **Location**: `src/lib/config/toast-config.ts`
- **Purpose**: Centralized configuration
- **Features**:
  - Duration presets
  - Position defaults
  - Action templates

## 🔧 Usage Patterns

### Basic Usage
```typescript
const { showSuccess, showError } = useToastNotifications();

// Simple notifications
showSuccess("Mật khẩu đã được lưu!");
showError("Có lỗi xảy ra khi lưu mật khẩu");
```

### Enhanced Usage với Actions
```typescript
const { showSuccessWithUndo, showErrorWithRetry } = useToastNotifications();

// With undo action
showSuccessWithUndo("Mật khẩu đã được xóa", () => {
  // Restore password logic
});

// With retry action
showErrorWithRetry("Không thể kết nối database", () => {
  // Retry connection logic
});
```

### Custom Configuration
```typescript
showSuccess("Custom toast", {
  duration: 5000,
  position: 'top-center',
  action: {
    label: 'Xem chi tiết',
    onClick: () => console.log('Action clicked')
  }
});
```

## 📊 Performance Features

### 1. **Automatic Tracking**
- Mỗi toast được track automatically
- Frequency monitoring để detect spam
- Memory usage optimization

### 2. **Performance Metrics**
```typescript
const { metrics, getPerformanceReport } = useToastPerformance();

console.log(metrics.totalToasts);
console.log(metrics.toastFrequency);
console.log(getPerformanceReport());
```

### 3. **Optimization Features**
- Memoized position calculation
- Efficient dependency arrays
- Automatic cleanup

## 🎯 Best Practices

### 1. **Message Guidelines**
- Sử dụng tiếng Việt rõ ràng
- Ngắn gọn nhưng đầy đủ thông tin
- Consistent tone và style

### 2. **Duration Guidelines**
- Success: 3 seconds (default)
- Error: 5 seconds (longer để user đọc)
- Info: 3 seconds
- Warning: 4 seconds

### 3. **Action Guidelines**
- Chỉ sử dụng actions khi thực sự cần thiết
- Label rõ ràng và actionable
- Implement proper error handling trong onClick

### 4. **Performance Guidelines**
- Tránh spam notifications
- Sử dụng debouncing cho frequent operations
- Monitor frequency với useToastPerformance

## 🔄 Migration từ shadcn/ui Toast

### Lý do Migration
1. **Better Performance**: Sonner có animations mượt mà hơn
2. **Smaller Bundle**: Ít dependencies hơn
3. **Better API**: Flexible và dễ sử dụng
4. **Modern UX**: Animations và positioning tốt hơn

### Migration Steps
1. Replace `useToast` imports với `useToastNotifications`
2. Update toast calls theo new API
3. Remove old toast components
4. Update styling nếu cần

## 🧪 Testing Strategy

### Unit Tests
- Test hook functionality
- Test performance tracking
- Test configuration handling

### Integration Tests
- Test với real components
- Test mobile responsiveness
- Test action callbacks

### Performance Tests
- Measure render performance
- Test memory usage
- Test frequency limits

## 🔮 Future Enhancements

### Planned Features
1. **Toast Queue Management**: Advanced queuing system
2. **Persistent Toasts**: Save important toasts across sessions
3. **Theme Integration**: Better theme support
4. **Accessibility**: Enhanced screen reader support
5. **Analytics**: User interaction tracking

### Potential Improvements
1. **Custom Animations**: More animation options
2. **Sound Support**: Audio notifications
3. **Rich Content**: Support cho HTML content
4. **Batch Operations**: Group related toasts

## 📝 Refactor Notes

### Code Quality Improvements
- ✅ Eliminated code duplication
- ✅ Enhanced type safety
- ✅ Performance optimization
- ✅ Better error handling
- ✅ Comprehensive documentation

### Architecture Benefits
- **Separation of Concerns**: Clear responsibility separation
- **Single Responsibility**: Each hook có specific purpose
- **DRY Principle**: No duplicate toast logic
- **Type Safety**: Comprehensive TypeScript support
- **Performance**: Optimized với monitoring

## 🎉 Kết luận

Toast system hiện tại đã được refactor thành công với:
- **Clean Architecture** với proper separation
- **Type Safety** comprehensive
- **Performance Optimization** với monitoring
- **Enhanced UX** với better animations
- **Future-Ready** với extensible design

System sẵn sàng cho production use và có thể scale theo nhu cầu tương lai.