/**
 * AI ANALYTICS DASHBOARD - Expandable Insight Cards
 * Reflective metallic design with expandable insight cards and emerald accents.
 */

'use client';

import React, { useState } from "react";

export type InsightSeverity = 'info' | 'success' | 'warning' | 'critical';

export interface Insight {
  id: string;
  headline: string;
  detail: string;
  createdAt: string;
  severity?: InsightSeverity;
  tags?: string[];
  metricDeltaPct?: number;
  status?: string;
}

export function InsightsGrid({
  items,
  columns = { base: 1, md: 2, xl: 3 },
  onOpen,
  accent = '#10B981',
}: {
  items: Insight[];
  columns?: { base: 1 | 2 | 3; md?: 1 | 2 | 3; xl?: 1 | 2 | 3 };
  onOpen?: (id: string) => void;
  accent?: string;
}) {
  const clsCols = `grid grid-cols-${columns.base} ${
    columns.md ? `md:grid-cols-${columns.md}` : ''
  } ${columns.xl ? `xl:grid-cols-${columns.xl}` : ''} gap-4`;
  return (
    <div className={clsCols}>
      {items.map((i) => (
        <InsightCard key={i.id} item={i} accent={accent} onOpen={onOpen} />
      ))}
    </div>
  );
}

export function InsightCard({
  item,
  onOpen,
  accent = '#10B981',
}: {
  item: Insight;
  onOpen?: (id: string) => void;
  accent?: string;
}) {
  const [open, setOpen] = useState(false);
  const [actionTaken, setActionTaken] = useState(item.status === 'action_taken');
  const toggle = () => setOpen((v) => !v);
  const pillColor = (s?: InsightSeverity) =>
    ({
      info: '#00FFFF',
      success: '#32CD32',
      warning: '#FFD700',
      critical: '#FF0040',
    }[s || 'info']);

  const handleMarkAction = async () => {
    try {
      const response = await fetch('/api/insights/mark-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insightId: item.id })
      });

      if (response.ok) {
        setActionTaken(true);
      }
    } catch (error) {
      console.error('Error marking action:', error);
    }
  };

  return (
    <div
      role="group"
      className={`relative rounded-2xl border border-[#1a1a1a]/70 bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_2px_12px_rgba(0,0,0,0.6)] backdrop-blur-md overflow-hidden`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/4 to-transparent" />

      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          toggle();
          onOpen?.(item.id);
        }}
        className="w-full text-left p-4 focus:outline-none"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
            style={{
              background: `${pillColor(item.severity)}15`,
              color: pillColor(item.severity),
              border: `1px solid ${pillColor(item.severity)}40`,
              boxShadow: `0 0 10px ${pillColor(item.severity)}40`,
            }}
          >
            {item.severity ?? "info"}
          </span>
          <div className="flex-1">
            <div className="font-medium leading-snug text-[#F8FAFC]">
              {item.headline}
            </div>
            <div className="mt-1 text-xs text-[#A1A1AA]">
              {new Date(item.createdAt).toLocaleDateString()}
            </div>
          </div>
          {typeof item.metricDeltaPct === "number" && (
            <div
              className="ml-auto text-xs rounded-md px-2 py-1"
              style={{
                color: item.metricDeltaPct >= 0 ? "#32CD32" : "#FF0040",
                background: item.metricDeltaPct >= 0 ? "rgba(50,205,50,0.15)" : "rgba(255,0,64,0.15)",
                border: `1px solid ${item.metricDeltaPct >= 0 ? "rgba(50,205,50,0.4)" : "rgba(255,0,64,0.4)"}`,
                boxShadow: `0 0 8px ${item.metricDeltaPct >= 0 ? "rgba(50,205,50,0.3)" : "rgba(255,0,64,0.3)"}`,
              }}
            >
              {item.metricDeltaPct >= 0
                ? `↑${Math.abs(item.metricDeltaPct)}%`
                : `↓${Math.abs(item.metricDeltaPct)}%`}
            </div>
          )}
        </div>
      </button>

      <div
        className={`transition-[max-height,opacity] duration-300 ease-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="px-4 pb-4">
          <div className="text-sm text-[#A1A1AA] leading-relaxed">
            {item.detail}
          </div>
          {item.tags && item.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="text-[11px] rounded-full px-2 py-0.5 border border-[#1a1a1a] text-[#A1A1AA] bg-[#0a0a0a]"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
          
          {/* Action Button */}
          <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
            {actionTaken ? (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-[#10B981] font-medium">Action Taken ✓</span>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAction();
                }}
                className="w-full py-2 px-4 rounded-lg bg-[#10B981] hover:bg-[#0E9F71] text-white font-medium text-sm transition-all"
              >
                Mark as Actioned
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


