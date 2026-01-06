import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme-context";
import { createQueryClient, THEME_CONFIG, ROUTES } from "@/lib/config/app-config";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { logger } from "@/lib/utils/logger";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

/**
 * QueryClient instance với cấu hình tối ưu cho password manager
 */
const queryClient = createQueryClient();

/**
 * Root App Component
 * 
 * Cấu hình các providers chính cho ứng dụng:
 * - ErrorBoundary: Global error handling
 * - QueryClientProvider: Quản lý server state và caching
 * - ThemeProvider: Quản lý theme (dark/light/system)
 * - TooltipProvider: Cung cấp tooltip context
 * - BrowserRouter: Routing cho SPA
 * 
 * Provider hierarchy được sắp xếp theo thứ tự dependency:
 * ErrorBoundary -> QueryClient -> Theme -> Tooltip -> Router
 */
const App = () => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      logger.error('Global error caught by App ErrorBoundary', error, {
        componentStack: errorInfo.componentStack,
      });
    }}
  >
    <QueryClientProvider client={queryClient}>
      <ThemeProvider 
        defaultTheme={THEME_CONFIG.DEFAULT_THEME} 
        storageKey={THEME_CONFIG.STORAGE_KEY}
      >
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path={ROUTES.HOME} element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
