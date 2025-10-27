/**
 * Tooltip Component
 * Simple tooltip for displaying helpful information
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [show, setShow] = React.useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {show && (
        <div
          className={cn(
            "absolute z-50 px-3 py-2 text-sm text-white bg-[#1a1a1a] border border-[#2A2F36] rounded-lg shadow-lg",
            "bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs",
            "animate-in fade-in-0 zoom-in-95",
            className
          )}
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#1a1a1a]" />
        </div>
      )}
    </div>
  );
}

