# Tech Stack & Build System

## Core Technologies

- **React 18.3.1**: Frontend framework với hooks và functional components
- **TypeScript 5.5.3**: Static typing cho JavaScript
- **Vite 5.4.1**: Build tool và dev server hiện đại
- **Tailwind CSS 3.4.11**: Utility-first CSS framework
- **shadcn/ui**: Component library dựa trên Radix UI

## Key Libraries

### UI & Styling
- **@radix-ui/***: Headless UI components (accordion, dialog, dropdown, etc.)
- **lucide-react**: Icon library
- **tailwindcss-animate**: Animation utilities
- **class-variance-authority**: Component variant management
- **clsx + tailwind-merge**: Conditional className utilities

### State Management & Data
- **@tanstack/react-query**: Server state management và caching
- **react-hook-form**: Form handling với validation
- **@hookform/resolvers + zod**: Form validation schema
- **better-sqlite3**: SQLite database (cho IndexedDB wrapper)

### Routing & Navigation
- **react-router-dom**: Client-side routing
- **BrowserRouter**: Hash-free routing

### Utilities
- **date-fns**: Date manipulation và formatting
- **sonner**: Toast notifications
- **cmdk**: Command palette component

## Build Commands

```bash
# Development
npm run dev          # Khởi chạy dev server tại localhost:8080

# Production
npm run build        # Build cho production
npm run build:dev    # Build cho development mode
npm run preview      # Preview production build

# Code Quality
npm run lint         # Chạy ESLint để kiểm tra code
```

## Development Configuration

### Vite Config
- **Port**: 8080 (default)
- **Host**: "::" (bind to all interfaces)
- **Plugins**: React SWC, Lovable Tagger (dev only)
- **Path Alias**: `@/` → `./src/`

### TypeScript Config
- **Strict Mode**: Một số tùy chọn được tắt để linh hoạt hơn
  - `noImplicitAny: false`
  - `strictNullChecks: false`
  - `noUnusedParameters: false`
- **Path Mapping**: `@/*` → `./src/*`
- **Target**: Modern ES modules

### ESLint Config
- **Parser**: TypeScript ESLint
- **Plugins**: React hooks, React refresh
- **Rules**: Standard React/TypeScript rules

## Database
- **IndexedDB**: Browser-native database
- **Database Name**: `memorySafeGuardDB`
- **Object Store**: `passwords`
- **Indexes**: service, username, updatedAt