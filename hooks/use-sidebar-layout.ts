'use client';

import { useSidebar } from '@/contexts/sidebar-context';

export function useSidebarLayout() {
  const { isCollapsed, isMobileOpen } = useSidebar();

  // Calculate the main content margin based on sidebar state
  const getMainContentMargin = () => {
    if (typeof window === 'undefined') return 'ml-0';
    
    // Mobile: no margin when sidebar is closed, full margin when open
    if (window.innerWidth < 768) {
      return isMobileOpen ? 'ml-64' : 'ml-0';
    }
    
    // Desktop: margin based on collapsed state
    return isCollapsed ? 'ml-16' : 'ml-64';
  };

  return {
    isCollapsed,
    isMobileOpen,
    mainContentMargin: getMainContentMargin()
  };
}
