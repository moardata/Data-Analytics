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
        // Mobile: no margin when sidebar is closed, full margin when open
        "ml-0 md:ml-16 lg:ml-64",
        // Override for mobile when sidebar is open
        isMobileOpen && "ml-64",
        className
      )}
    >
      {children}
    </main>
  );
}
