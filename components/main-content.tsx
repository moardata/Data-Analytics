'use client';

import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils/cn';

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  const { isCollapsed, isMobileOpen } = useSidebar();
  
  return (
    <main 
      className={cn(
        "flex-1 transition-all duration-300",
        // Desktop: ml-16 for collapsed sidebar, ml-64 for expanded
        // Mobile: ml-0 when sidebar closed, ml-64 when open
        "ml-0 md:ml-16",
        "pt-16",
        // Mobile: add margin when sidebar is open
        isMobileOpen && "ml-64",
        // Desktop: adjust margin based on collapsed state
        !isMobileOpen && isCollapsed && "md:ml-16",
        !isMobileOpen && !isCollapsed && "md:ml-64",
        // Ensure content doesn't overflow
        "overflow-x-hidden",
        className
      )}
    >
      <div className="w-full max-w-full px-4 md:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}
