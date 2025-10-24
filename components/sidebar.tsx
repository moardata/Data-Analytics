/**
 * Fixed Sidebar Navigation with Brain Icon
 * Ensures brain icon is properly rendered for AI Insights
 */

'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { 
  LayoutDashboard, 
  FileText, 
  Settings,
  Users,
  Zap,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useSidebar } from '@/contexts/sidebar-context'

const navItems = [
  { href: '/analytics', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/forms', label: 'Forms', icon: FileText },
  { href: '/insights', label: 'AI Insights', icon: Sparkles },
  { href: '/students', label: 'Students', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const bottomItems = [
  { href: '/upgrade', label: 'Upgrade', icon: Zap },
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
      className="fixed left-0 top-16 h-screen w-16 border-r border-[#1a1a1a] bg-[#0a0a0a] flex flex-col z-50"
    >

        {/* Navigation Items */}
        <nav className="flex-1 pt-2 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={`${item.href}${queryString}`}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-colors duration-150 group relative mx-auto",
                  isActive
                    ? "bg-[#1a1a1a] text-[#F8FAFC]"
                    : "text-[#A1A1AA] hover:bg-[#0f0f0f] hover:text-[#F8FAFC]"
                )}
                title={item.label}
              >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                {/* Tooltip for collapsed state */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-[#0f0f0f] text-[#F8FAFC] text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Items */}
        <div className="pb-4 px-4 border-t border-[#1a1a1a] space-y-2">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={`${item.href}${queryString}`}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-colors duration-150 group relative mx-auto",
                  isActive
                    ? "bg-[#1a1a1a] text-[#F8FAFC]"
                    : "text-[#A1A1AA] hover:bg-[#0f0f0f] hover:text-[#F8FAFC]"
                )}
                title={item.label}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {/* Tooltip for collapsed state */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-[#0f0f0f] text-[#F8FAFC] text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              </Link>
            )
          })}
        </div>
      </aside>
  )
}
