import { Toaster as Sonner, toast } from "sonner"
import { useMemo } from "react"

type ToasterProps = React.ComponentProps<typeof Sonner>

// Constants cho configuration để dễ bảo trì
const TOAST_BASE_CLASSES = "toaster group"
const DEFAULT_THEME = "dark" as const

const TOAST_CLASS_NAMES = {
  toast:
    "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
  description: "group-[.toast]:text-muted-foreground",
  actionButton:
    "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
  cancelButton:
    "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
} as const

/**
 * Safe theme detection utility
 * Fallback to default theme nếu ThemeProvider không available
 */
const getSafeTheme = (): "dark" | "light" => {
  try {
    // Kiểm tra theme từ DOM class hoặc localStorage
    const root = document.documentElement
    if (root.classList.contains('dark')) return 'dark'
    if (root.classList.contains('light')) return 'light'
    
    // Fallback: check localStorage
    const stored = localStorage.getItem('memory-safe-guard-theme')
    if (stored === 'dark' || stored === 'light') return stored
    
    // Final fallback: system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    // Safe fallback cho SSR hoặc restricted environments
    return DEFAULT_THEME
  }
}

/**
 * Toaster component với intelligent theme detection
 * 
 * Features:
 * - Safe theme detection không phụ thuộc vào ThemeProvider context
 * - Fallback chain: DOM classes → localStorage → system preference → default
 * - Memoized configuration để optimize performance
 * 
 * @param props - Sonner toaster props
 */
const Toaster = (props: ToasterProps) => {
  // Intelligent theme detection với multiple fallbacks
  const detectedTheme = getSafeTheme()
  
  // Memoize toast options để tránh unnecessary re-creation
  const toastOptions = useMemo(() => ({
    classNames: TOAST_CLASS_NAMES,
  }), [])

  return (
    <Sonner
      theme={detectedTheme}
      className={TOAST_BASE_CLASSES}
      toastOptions={toastOptions}
      {...props}
    />
  )
}

export { Toaster, toast }