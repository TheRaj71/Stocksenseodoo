'use client';

import React from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Sliders } from 'lucide-react';

interface OpsFlowChartProps {
  statusCounts: Record<string, Record<string, number>>;
}

export function OpsFlowChart({ statusCounts }: OpsFlowChartProps) {
  const operations = [
    {
      key: 'RECEIPT',
      label: 'Receipts (In)',
      icon: ArrowDownLeft,
      color: 'bg-blue-600',
      lightBg: 'bg-blue-50 border-blue-200 text-blue-900',
      counts: statusCounts?.RECEIPT || {},
    },
    {
      key: 'DELIVERY',
      label: 'Deliveries (Out)',
      icon: ArrowUpRight,
      color: 'bg-emerald-600',
      lightBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      counts: statusCounts?.DELIVERY || {},
    },
    {
      key: 'INTERNAL_TRANSFER',
      label: 'Transfers (Internal)',
      icon: ArrowLeftRight,
      color: 'bg-purple-600',
      lightBg: 'bg-purple-50 border-purple-200 text-purple-900',
      counts: statusCounts?.INTERNAL_TRANSFER || {},
    },
    {
      key: 'ADJUSTMENT',
      label: 'Adjustments (Counts)',
      icon: Sliders,
      color: 'bg-amber-600',
      lightBg: 'bg-amber-50 border-amber-200 text-amber-900',
      counts: statusCounts?.ADJUSTMENT || {},
    },
  ];

  // Find max total count for relative scale
  const maxCount = Math.max(
    1,
    ...operations.map((op) =>
      Object.values(op.counts).reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0)
    )
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
      {operations.map((op) => {
        const Icon = op.icon;
        const total = Object.values(op.counts).reduce(
          (a, b) => (Number(a) || 0) + (Number(b) || 0),
          0
        );
        const draftCount = op.counts.DRAFT || 0;
        const doneCount = op.counts.DONE || 0;
        const otherCount = total - draftCount - doneCount;

        const draftPct = total > 0 ? Math.round((draftCount / total) * 100) : 0;
        const donePct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

        return (
          <div key={op.key} className="p-3 bg-white border border-stone-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs">
                <Icon className="w-3.5 h-3.5 text-stone-600" />
                <span>{op.label}</span>
              </div>
              <span className="text-sm font-bold text-stone-900 font-mono">
                {total}
              </span>
            </div>

            {/* Split Progress Bar */}
            <div className="h-2 w-full bg-stone-100 flex overflow-hidden rounded-xs">
              {doneCount > 0 && (
                <div
                  style={{ width: `${donePct}%` }}
                  className="bg-emerald-500 h-full"
                  title={`Done: ${doneCount}`}
                />
              )}
              {draftCount > 0 && (
                <div
                  style={{ width: `${draftPct}%` }}
                  className="bg-amber-500 h-full"
                  title={`Draft / Pending: ${draftCount}`}
                />
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                {draftCount} Pending
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                {doneCount} Completed
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

