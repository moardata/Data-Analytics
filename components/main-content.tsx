'use client';

import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils/cn';

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  const { isMobileOpen } = useSidebar();

  return (
    <main 
      className={cn(
        "flex-1 transition-all duration-300",
        // Always ml-16 for collapsed sidebar, ml-64 for mobile when open
        "ml-0 md:ml-16",
        // Override for mobile when sidebar is open
        isMobileOpen && "ml-64",
        className
      )}
    >
      {children}
    </main>
  );
}
