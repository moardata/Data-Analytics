'use client';

import { Bell, Users, Settings, Info } from 'lucide-react';

export function TopBar() {
  return (
    <div className="fixed top-0 right-0 left-0 z-40 bg-[#0a0a0a] border-b border-[#1a1a1a] h-16 flex items-center justify-between px-6">
      {/* Left side - CreatorIQ Logo */}
      <div className="flex items-center">
        <span className="text-white font-bold text-4xl">
          <span className="text-white">Creator</span>
          <span className="text-[#10B981]">IQ</span>
        </span>
      </div>
      
      {/* Right side - Icons */}
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors" title="Information">
          <Info className="h-4 w-4 text-[#A1A1AA]" />
        </button>
        <button className="p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors" title="Users">
          <Users className="h-4 w-4 text-[#A1A1AA]" />
        </button>
        <button className="p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors" title="Notifications">
          <Bell className="h-4 w-4 text-[#A1A1AA]" />
        </button>
        <button className="p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors" title="Settings">
          <Settings className="h-4 w-4 text-[#A1A1AA]" />
        </button>
      </div>
    </div>
  );
}
