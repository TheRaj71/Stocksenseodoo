'use client';

import React from 'react';
import { MapPin, Building } from 'lucide-react';

interface LocationBalance {
  name: string;
  shortCode: string;
  warehouseName: string;
  totalQuantity: number;
}

interface LocationCapacityBarsProps {
  locations: LocationBalance[];
}

export function LocationCapacityBars({ locations }: LocationCapacityBarsProps) {
  const maxQty = Math.max(1, ...locations.map((l) => l.totalQuantity));

  if (locations.length === 0) {
    return (
      <div className="p-4 text-center text-xs font-mono text-stone-400 bg-stone-50 border border-stone-200">
        No location stock balances found.
      </div>
    );
  }

  return (
    <div className="space-y-2.5 font-mono text-xs">
      {locations.map((loc) => {
        const fillPct = Math.min(100, Math.round((loc.totalQuantity / maxQty) * 100));

        return (
          <div key={loc.shortCode} className="p-2.5 bg-white border border-stone-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-stone-900 font-semibold truncate">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">{loc.name}</span>
                <span className="text-[10px] text-stone-400">[{loc.shortCode}]</span>
              </div>
              <span className="font-bold text-stone-900 text-sm">
                {loc.totalQuantity} <span className="text-[11px] font-normal text-stone-500">units</span>
              </span>
            </div>

            {/* Capacity Progress Bar */}
            <div className="h-2 w-full bg-stone-100 overflow-hidden rounded-xs">
              <div
                style={{ width: `${Math.max(3, fillPct)}%` }}
                className={`h-full transition-all duration-300 ${
                  fillPct > 80
                    ? 'bg-amber-600'
                    : fillPct > 40
                    ? 'bg-stone-800'
                    : 'bg-stone-600'
                }`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

