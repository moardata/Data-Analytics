'use client';

import { Bell, Users, Settings, Info } from 'lucide-react';

export function TopBar() {
  return (
    <div className="fixed top-0 right-0 left-16 z-40 bg-[#12151A] border-b border-[#2A2F36] h-16 flex items-center justify-between px-6">
      {/* Left side - empty for now */}
      <div></div>
      
      {/* Right side - CreatorIQ logo and icons */}
      <div className="flex items-center gap-4">
        {/* CreatorIQ Logo */}
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-lg">
            <span className="text-white">Creator</span>
            <span className="text-[#10B981]">IQ</span>
          </span>
        </div>
        
        {/* Icons */}
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-[#1E2228] transition-colors" title="Information">
            <Info className="h-4 w-4 text-[#9AA4B2]" />
          </button>
          <button className="p-2 rounded-lg hover:bg-[#1E2228] transition-colors" title="Users">
            <Users className="h-4 w-4 text-[#9AA4B2]" />
          </button>
          <button className="p-2 rounded-lg hover:bg-[#1E2228] transition-colors" title="Notifications">
            <Bell className="h-4 w-4 text-[#9AA4B2]" />
          </button>
          <button className="p-2 rounded-lg hover:bg-[#1E2228] transition-colors" title="Settings">
            <Settings className="h-4 w-4 text-[#9AA4B2]" />
          </button>
        </div>
      </div>
    </div>
  );
}
