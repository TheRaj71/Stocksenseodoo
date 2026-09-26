'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Sliders,
  History,
  Building,
  User,
  LogOut,
  X,
  ScanLine,
} from 'lucide-react';
import { useClerk } from '@clerk/nextjs';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  counts?: {
    pendingReceipts?: number;
    pendingDeliveries?: number;
    internalTransfers?: number;
    lowStock?: number;
  };
}

export function Sidebar({ isOpen, onClose, counts }: SidebarProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();

  const navGroups = [
    {
      label: 'MAIN',
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          name: 'Products & Stock',
          href: '/products',
          icon: Boxes,
          badge: counts?.lowStock && counts.lowStock > 0 ? `${counts.lowStock} Low` : undefined,
          badgeVariant: 'amber',
        },
      ],
    },
    {
      label: 'OPERATIONS',
      items: [
        {
          name: 'Receipts (In)',
          href: '/receipts',
          icon: ArrowDownLeft,
          badge: counts?.pendingReceipts ? `${counts.pendingReceipts}` : undefined,
          badgeVariant: 'blue',
        },
        {
          name: 'Deliveries (Out)',
          href: '/deliveries',
          icon: ArrowUpRight,
          badge: counts?.pendingDeliveries ? `${counts.pendingDeliveries}` : undefined,
          badgeVariant: 'emerald',
        },
        {
          name: 'Internal Transfers',
          href: '/transfers',
          icon: ArrowLeftRight,
          badge: counts?.internalTransfers ? `${counts.internalTransfers}` : undefined,
          badgeVariant: 'stone',
        },
        {
          name: 'Stock Adjustments',
          href: '/adjustments',
          icon: Sliders,
        },
      ],
    },
    {
      label: 'AUDIT & MASTER',
      items: [
        {
          name: 'Move History / Ledger',
          href: '/ledger',
          icon: History,
        },
        {
          name: 'Warehouses & Locations',
          href: '/settings',
          icon: Building,
        },
      ],
    },
    {
      label: 'USER CONSOLE',
      items: [
        {
          name: 'My Profile',
          href: '/profile',
          icon: User,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/60 z-40 lg:hidden backdrop-blur-none"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed lg:sticky top-12 left-0 z-40 h-[calc(100vh-3rem)] w-60 bg-stone-900 text-stone-300 border-r border-stone-800 flex flex-col justify-between select-none transition-transform duration-150 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-4">
          <div className="flex items-center justify-between px-2 pb-1 lg:hidden border-b border-stone-800">
            <span className="text-[11px] font-mono font-bold text-amber-500 uppercase">
              NAVIGATION
            </span>
            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {navGroups.map((group) => (
            <div key={group.label} className="space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-500">
                {group.label}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center justify-between px-2.5 py-1.5 text-xs font-mono transition-colors group',
                      isActive
                        ? 'bg-amber-500 text-stone-950 font-bold border-l-2 border-l-stone-950'
                        : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={cn(
                          'w-3.5 h-3.5 shrink-0',
                          isActive
                            ? 'text-stone-950'
                            : 'text-stone-400 group-hover:text-amber-400'
                        )}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          'text-[10px] font-mono px-1.5 py-0.2 leading-none shrink-0',
                          isActive
                            ? 'bg-stone-950 text-amber-400 font-bold'
                            : item.badgeVariant === 'amber'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : item.badgeVariant === 'blue'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : item.badgeVariant === 'emerald'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-stone-800 text-stone-400 border border-stone-700'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Station Status */}
        <div className="p-3 border-t border-stone-800 bg-stone-950/60 font-mono text-[11px] space-y-1">
          <div className="flex items-center justify-between text-stone-400">
            <span>TERMINAL:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ONLINE / RLS
            </span>
          </div>
          <button
            onClick={() => signOut({ redirectUrl: '/sign-in' })}
            className="w-full mt-2 flex items-center justify-center gap-1.5 py-1 bg-stone-800 hover:bg-red-950/80 hover:text-red-400 border border-stone-700 hover:border-red-800 text-stone-400 text-xs transition-colors cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>LOGOUT SESSION</span>
          </button>
        </div>
      </aside>
    </>
  );
}

