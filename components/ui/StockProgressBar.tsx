'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StockProgressBarProps {
  current: number;
  min: number | null;
  max: number | null;
  unit?: string;
  className?: string;
}

export function StockProgressBar({
  current,
  min = 0,
  max,
  unit = 'pcs',
  className,
}: StockProgressBarProps) {
  const minVal = min || 0;
  const maxVal = max || (minVal ? minVal * 3 : 100);
  const percentage = Math.min(100, Math.max(0, Math.round((current / maxVal) * 100)));

  const isLow = minVal > 0 && current < minVal;
  const isOut = current === 0;
  const isOver = max && current > max;

  const barColor = isOut
    ? 'bg-red-500'
    : isLow
    ? 'bg-amber-500'
    : isOver
    ? 'bg-purple-500'
    : 'bg-emerald-500';

  return (
    <div className={cn('w-full space-y-1 font-mono text-xs', className)}>
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-bold text-stone-900">
          {current} <span className="font-normal text-stone-500">{unit}</span>
        </span>
        {minVal > 0 && (
          <span className="text-[10px] text-stone-500">
            Min: {minVal}
          </span>
        )}
      </div>

      <div className="h-1.5 w-full bg-stone-100 overflow-hidden rounded-xs border border-stone-200">
        <div
          style={{ width: `${Math.max(current > 0 ? 5 : 0, percentage)}%` }}
          className={cn('h-full transition-all duration-300', barColor)}
        />
      </div>
    </div>
  );
}

