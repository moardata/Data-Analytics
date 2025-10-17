/**
 * Modern Sidebar Navigation
 * Inspired by Linear, Notion, and Vercel dashboards
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-[#2A2F36] bg-[#12151A] flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-[#2A2F36]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#10B981] flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold">
              <span className="text-white">Creator</span>
              <span className="text-[#10B981]">IQ</span>
            </h1>
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
              href={item.href}
                className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 group",
                isActive
                  ? "bg-[#1E2228] text-[#E5E7EB]"
                  : "text-zinc-300 hover:bg-[#0F1319] hover:text-[#E5E7EB]"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
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
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 group",
                isActive
                  ? "bg-[#1E2228] text-[#E5E7EB]"
                  : "text-zinc-300 hover:bg-[#0F1319] hover:text-[#E5E7EB]"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
        
      </div>
    </aside>
  )
}

