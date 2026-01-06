# Project Structure & Organization

## Folder Structure

```
src/
├── assets/              # Static resources (images, fonts)
│   └── password-hero.png
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── toast.tsx
│   │   └── ... (other UI primitives)
│   ├── ErrorBoundary.tsx   # Global error boundary component
│   ├── PasswordCard.tsx    # Password display component
│   ├── PasswordForm.tsx    # Add/edit password form
│   └── SearchBar.tsx       # Search functionality
├── hooks/               # Custom React hooks
│   ├── use-clipboard.ts    # Enhanced clipboard operations
│   ├── use-loading-state.ts # Reusable loading state management
│   ├── use-mobile.tsx      # Mobile detection hook
│   ├── use-passwords.ts    # Password management hook
│   ├── use-performance.ts  # Performance monitoring hook
│   └── use-toast.ts        # Toast notification hook
├── lib/                 # Utilities and libraries
│   ├── config/             # Application configuration
│   ├── constants/          # Application constants
│   ├── db/                 # Database layer
│   │   ├── database-operations.ts # Specialized database operations
│   │   └── db.ts              # IndexedDB management
│   ├── services/           # Business logic services
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   │   └── logger.ts          # Comprehensive logging system
│   ├── validation/         # Validation schemas
│   │   └── password-validation.ts # Password validation logic
│   └── utils.ts            # Common utility functions
├── pages/               # Page components
│   ├── Index.tsx           # Main application page
│   └── NotFound.tsx        # 404 error page
├── App.tsx              # Root application component
├── main.tsx             # Application entry point
├── index.css            # Global styles
└── vite-env.d.ts        # Vite type definitions
```

## Architecture Patterns

### Component Organization
- **UI Components**: Base components trong `src/components/ui/`
- **Feature Components**: Components chức năng trong `src/components/`
- **Page Components**: Components trang trong `src/pages/`

### State Management
- **Local State**: useState cho component state
- **Global State**: Custom hooks (usePasswords) cho shared state
- **Server State**: React Query cho data fetching và caching

### Data Layer
- **Database**: IndexedDB thông qua DatabaseManager singleton
- **Types**: TypeScript interfaces cho type safety
- **Hooks**: Custom hooks để abstract business logic

## Naming Conventions

### Files & Folders
- **Components**: PascalCase (PasswordCard.tsx)
- **Hooks**: camelCase với prefix "use-" (use-passwords.ts)
- **Utilities**: camelCase (utils.ts)
- **Pages**: PascalCase (Index.tsx)

### Code Style
- **Components**: Functional components với TypeScript
- **Props**: Interface definitions với Props suffix
- **Exports**: Named exports cho utilities, default export cho components
- **Imports**: Absolute imports sử dụng `@/` alias

## File Responsibilities

### Components
- **ErrorBoundary.tsx**: Global error boundary với fallback UI và error reporting
- **PasswordCard.tsx**: Hiển thị thông tin mật khẩu, secure clipboard operations, edit/delete actions
- **PasswordForm.tsx**: Form thêm/chỉnh sửa mật khẩu với validation, password strength indicator
- **SearchBar.tsx**: Tìm kiếm mật khẩu theo service/username

### Hooks
- **use-clipboard.ts**: Enhanced clipboard operations với security features
- **use-loading-state.ts**: Reusable loading state management và error handling
- **use-passwords.ts**: CRUD operations cho passwords, error handling, toast notifications
- **use-performance.ts**: Performance monitoring và metrics tracking
- **use-toast.ts**: Toast notification management
- **use-mobile.tsx**: Mobile device detection

### Database & Services
- **db.ts**: DatabaseManager singleton class, IndexedDB operations
- **database-operations.ts**: Specialized operations (search, batch operations)
- **password-service.ts**: Business logic layer cho password operations

### Validation & Utils
- **password-validation.ts**: Zod schemas, password strength validation, secure password generation
- **logger.ts**: Comprehensive logging system với multiple levels và performance tracking
- **utils.ts**: Common utility functions

### Pages
- **Index.tsx**: Main page layout, password list, search integration
- **NotFound.tsx**: 404 error handling

## Import Patterns

```typescript
// External libraries
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// Internal utilities
import { cn } from '@/lib/utils';

// Types
import { PasswordEntry } from '@/lib/db/db';

// Hooks
import { usePasswords } from '@/hooks/use-passwords';
```

## Component Structure

```typescript
// Standard component structure
interface ComponentProps {
  // Props definition
}

export const Component = ({ prop1, prop2 }: ComponentProps) => {
  // Hooks
  // State
  // Effects
  // Handlers
  
  return (
    // JSX
  );
};
```