'use client';

import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils/cn';

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  return (
    <main 
      className={cn(
        "flex-1 transition-all duration-300",
        // ml-16 for sidebar, pt-16 for top bar
        "ml-16 pt-16",
        className
      )}
    >
      {children}
    </main>
  );
}
