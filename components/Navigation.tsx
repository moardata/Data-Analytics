/**
 * Navigation Component
 * Main navigation bar for the Creator Analytics app
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/analytics', label: 'Analytics', icon: '📊' },
    { href: '/courses', label: 'Courses', icon: '📚' },
    { href: '/students', label: 'Students', icon: '👥' },
    { href: '/revenue', label: 'Revenue', icon: '💰' },
    { href: '/forms', label: 'Forms', icon: '📝' },
    { href: '/insights', label: 'AI Insights', icon: '🧠' },
  ];

  return (
    <nav className="bg-gradient-to-br from-[#1A1E25] via-[#20242B] to-[#1A1E25] shadow-lg border-b border-[#2E343C]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex">
            {/* Logo/Brand */}
            <div className="flex-shrink-0 flex items-center">
              <span className="text-4xl font-bold">
                <span className="text-white">Creator</span>
                <span className="text-[#10B981]">IQ</span>
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden sm:ml-10 sm:flex sm:space-x-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname?.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-5 py-2 text-lg font-bold rounded-xl transition-all ${
                      isActive
                        ? 'bg-[#10B981] text-white shadow-lg'
                        : 'text-[#E1E4EA] hover:bg-[#2A2F36]'
                    }`}
                  >
                    <span className="mr-2 text-xl">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - User menu / Actions */}
          <div className="flex items-center">
            <Link href="/upgrade">
              <button className="px-6 py-3 text-base font-bold text-white bg-gradient-to-r from-[#10B981] to-[#0E3A2F] rounded-xl hover:shadow-lg transition-all hover:scale-105">
                ⚡ Upgrade
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden border-t border-[#2E343C]/70">
        <div className="px-2 pt-2 pb-3 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 text-base font-semibold rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#10B981] text-white shadow-md'
                    : 'text-[#E1E4EA] hover:bg-[#2A2F36]'
                }`}
              >
                <span className="mr-2 text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

