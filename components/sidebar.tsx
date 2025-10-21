/**
 * Modern Sidebar Navigation
 * Inspired by Linear, Notion, and Vercel dashboards
 */

'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { 
  LayoutDashboard, 
  FileText, 
  Sparkles, 
  Settings,
  TrendingUp,
  Users,
  Crown,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useSidebar } from '@/contexts/sidebar-context'

const navItems = [
  { href: '/analytics', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/forms', label: 'Forms', icon: FileText },
  { href: '/insights', label: 'AI Insights', icon: Sparkles },
  { href: '/students', label: 'Students', icon: Users },
  { href: '/revenue', label: 'Revenue', icon: TrendingUp },
]

const bottomItems = [
  { href: '/upgrade', label: 'Upgrade', icon: Crown },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isCollapsed, isMobileOpen, setIsCollapsed, setIsMobileOpen } = useSidebar()

  // Preserve companyId and experienceId in navigation
  const companyId = searchParams.get('companyId') || searchParams.get('company_id')
  const experienceId = searchParams.get('experienceId') || searchParams.get('experience_id')
  
  // Build query string to preserve in navigation
  const queryParams = new URLSearchParams()
  if (companyId) queryParams.set('companyId', companyId)
  if (experienceId) queryParams.set('experienceId', experienceId)
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileOpen && window.innerWidth < 768) {
        const sidebar = document.getElementById('mobile-sidebar')
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setIsMobileOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileOpen, setIsMobileOpen])

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-[#12151A] border border-[#2A2F36] rounded-lg p-2 text-[#E5E7EB] hover:bg-[#1E2228] transition-colors"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        id="mobile-sidebar"
        className={cn(
          "fixed left-0 top-0 h-screen border-r border-[#2A2F36] bg-[#12151A] flex flex-col z-50 transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[#2A2F36]">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h1 className="text-xl font-bold">
                <span className="text-white">Creator</span>
                <span className="text-[#10B981]">IQ</span>
              </h1>
            )}
            {isCollapsed && (
              <div className="w-8 h-8 bg-[#10B981] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
            )}
            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#1E2228] transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-[#9AA4B2]" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-[#9AA4B2]" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={`${item.href}${queryString}`}
                onClick={() => {
                  // Close mobile sidebar when navigating
                  if (window.innerWidth < 768) {
                    setIsMobileOpen(false)
                  }
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 group relative",
                  isActive
                    ? "bg-[#1E2228] text-[#E5E7EB]"
                    : "text-zinc-300 hover:bg-[#0F1319] hover:text-[#E5E7EB]"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-[#1E2228] text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Items */}
        <div className="p-4 border-t border-[#2A2F36] space-y-1">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={`${item.href}${queryString}`}
                onClick={() => {
                  // Close mobile sidebar when navigating
                  if (window.innerWidth < 768) {
                    setIsMobileOpen(false)
                  }
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 group relative",
                  isActive
                    ? "bg-[#1E2228] text-[#E5E7EB]"
                    : "text-zinc-300 hover:bg-[#0F1319] hover:text-[#E5E7EB]"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-[#1E2228] text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </aside>
    </>
  )
}

