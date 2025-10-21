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
        // Always ml-16 for collapsed sidebar (64px width)
        "ml-16",
        className
      )}
    >
      {children}
    </main>
  );
}
