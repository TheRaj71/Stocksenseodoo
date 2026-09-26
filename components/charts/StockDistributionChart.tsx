'use client';

import React from 'react';
import { calculatePercentage } from '@/lib/utils';

interface CategoryShare {
  name: string;
  count: number;
  totalQty: number;
}

interface StockDistributionChartProps {
  data: CategoryShare[];
}

const colorPalette = [
  'bg-amber-500 text-amber-900 border-amber-600',
  'bg-blue-500 text-blue-900 border-blue-600',
  'bg-emerald-500 text-emerald-900 border-emerald-600',
  'bg-purple-500 text-purple-900 border-purple-600',
  'bg-stone-500 text-stone-900 border-stone-600',
  'bg-sky-500 text-sky-900 border-sky-600',
];

export function StockDistributionChart({ data }: StockDistributionChartProps) {
  const totalItems = data.reduce((sum, d) => sum + d.totalQty, 0);

  if (data.length === 0 || totalItems === 0) {
    return (
      <div className="p-4 text-center text-xs font-mono text-stone-400 bg-stone-50 border border-stone-200">
        No stock category data available to display.
      </div>
    );
  }

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Segmented Distribution Bar */}
      <div className="h-4 w-full bg-stone-100 flex overflow-hidden rounded-xs border border-stone-300">
        {data.map((cat, idx) => {
          const pct = Math.max(2, Math.round((cat.totalQty / totalItems) * 100));
          const color = colorPalette[idx % colorPalette.length].split(' ')[0];
          return (
            <div
              key={cat.name}
              style={{ width: `${pct}%` }}
              className={`${color} h-full transition-all duration-300 relative group cursor-pointer`}
              title={`${cat.name}: ${cat.totalQty} units (${pct}%)`}
            />
          );
        })}
      </div>

      {/* Legend & Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {data.map((cat, idx) => {
          const pct = calculatePercentage(cat.totalQty, totalItems);
          const color = colorPalette[idx % colorPalette.length].split(' ')[0];

          return (
            <div
              key={cat.name}
              className="p-2 bg-stone-50 border border-stone-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-2 truncate">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
                <span className="text-[11px] text-stone-700 font-semibold truncate">
                  {cat.name}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="font-bold text-stone-900">{cat.totalQty}</span>
                <span className="text-[10px] text-stone-500 ml-1">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

