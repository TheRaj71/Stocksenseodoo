'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  Search, 
  AlertTriangle, 
  User as UserIcon, 
  LogOut, 
  Layers,
  Menu,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { UserButton, useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface TopBarProps {
  onOpenSearch?: () => void;
  onToggleSidebar?: () => void;
  lowStockCount?: number;
  activeWarehouse?: string;
  onWarehouseChange?: (whId: string) => void;
}

export function TopBar({
  onOpenSearch,
  onToggleSidebar,
  lowStockCount = 0,
  activeWarehouse = 'all',
  onWarehouseChange,
}: TopBarProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();

  return (
    <header className="h-12 bg-stone-900 text-stone-200 border-b border-stone-800 flex items-center justify-between px-3 sm:px-4 select-none sticky top-0 z-30 shrink-0">
      {/* Left side: Hamburger & Warehouse Node */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-none cursor-pointer"
          aria-label="Toggle navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2 font-mono font-bold text-sm tracking-wider text-white">
          <span className="w-2.5 h-2.5 bg-amber-500 inline-block" />
          <span>STOCKSENSE</span>
          <span className="hidden sm:inline-block text-[10px] text-stone-400 font-normal px-1.5 py-0.2 bg-stone-800 border border-stone-700">
            OPS CONSOLE
          </span>
        </Link>

        {/* Multi-Warehouse Context Switcher */}
        <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-stone-800 text-xs font-mono">
          <Building2 className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-stone-400">NODE:</span>
          <select
            value={activeWarehouse}
            onChange={(e) => onWarehouseChange && onWarehouseChange(e.target.value)}
            className="bg-stone-800 border border-stone-700 text-stone-200 text-xs px-2 py-0.5 rounded-none font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">ALL WAREHOUSES [GLOBAL]</option>
            <option value="WH">MAIN WAREHOUSE (WH-01)</option>
            <option value="WH-SEC">SECONDARY WAREHOUSE (WH-02)</option>
          </select>
        </div>
      </div>

      {/* Center/Right: Quick Scanner search & Operations indicators */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick SKU / Barcode Scan Shortcut */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-2.5 py-1 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs font-mono text-stone-300 transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-stone-400" />
          <span className="hidden sm:inline">SCAN SKU / DOC</span>
          <kbd className="text-[10px] bg-stone-900 px-1.5 py-0.2 text-amber-400 border border-stone-700">
            / or Ctrl+K
          </kbd>
        </button>

        {/* Low Stock Alert Counter */}
        {lowStockCount > 0 ? (
          <Link
            href="/products?filter=low_stock"
            className="flex items-center gap-1.5 px-2 py-1 bg-amber-950/80 border border-amber-600/80 text-amber-400 hover:bg-amber-900 text-xs font-mono cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 animate-pulse text-amber-500" />
            <span className="font-bold">{lowStockCount}</span>
            <span className="hidden md:inline text-[11px]">LOW STOCK</span>
          </Link>
        ) : (
          <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-emerald-400 px-2 py-0.5 bg-emerald-950/40 border border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>STOCK OPTIMAL</span>
          </div>
        )}

        {/* User profile / Clerk */}
        <div className="flex items-center pl-2 border-l border-stone-800">
          <UserButton 
            appearance={{
              elements: {
                userButtonAvatarBox: 'w-6 h-6 rounded-none ring-1 ring-stone-700',
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}
