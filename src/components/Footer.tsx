/**
 * Footer Component
 * Hiển thị thông tin copyright và domain
 */

import { DOMAIN_CONFIG } from "@/lib/config/app-config";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-6 px-4 border-t border-border/40">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>© {currentYear}</span>
            <a 
              href={DOMAIN_CONFIG.PRODUCTION_URL}
              className="font-medium text-foreground hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {DOMAIN_CONFIG.PRODUCTION_DOMAIN}
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs">
              {DOMAIN_CONFIG.APP_NAME} - {DOMAIN_CONFIG.APP_DESCRIPTION}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};