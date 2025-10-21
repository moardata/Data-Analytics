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
  Crown
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

  // Preserve companyId and experienceId in navigation
  const companyId = searchParams.get('companyId') || searchParams.get('company_id')
  const experienceId = searchParams.get('experienceId') || searchParams.get('experience_id')
  
  // Build query string to preserve in navigation
  const queryParams = new URLSearchParams()
  if (companyId) queryParams.set('companyId', companyId)
  if (experienceId) queryParams.set('experienceId', experienceId)
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''

  return (
    <aside 
      className="fixed left-0 top-0 h-screen w-16 border-r border-[#2A2F36] bg-[#12151A] flex flex-col z-50"
    >
        {/* Logo - Always collapsed */}
        <div className="p-6 border-b border-[#2A2F36]">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-[#10B981] rounded-lg flex items-center justify-center group cursor-pointer" title="CreatorIQ">
              <span className="text-white font-bold text-sm">C</span>
            </div>
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
                className={cn(
                  "flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 group relative",
                  isActive
                    ? "bg-[#1E2228] text-[#E5E7EB]"
                    : "text-zinc-300 hover:bg-[#0F1319] hover:text-[#E5E7EB]"
                )}
                title={item.label}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {/* Tooltip for collapsed state */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-[#1E2228] text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
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
                className={cn(
                  "flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 group relative",
                  isActive
                    ? "bg-[#1E2228] text-[#E5E7EB]"
                    : "text-zinc-300 hover:bg-[#0F1319] hover:text-[#E5E7EB]"
                )}
                title={item.label}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {/* Tooltip for collapsed state */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-[#1E2228] text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              </Link>
            )
          })}
        </div>
    </aside>
  )
}

