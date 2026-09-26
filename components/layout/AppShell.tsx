'use client';

import React, { useState, useEffect } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { CommandPalette } from './CommandPalette';

interface AppShellProps {
  children: React.ReactNode;
  counts?: {
    pendingReceipts?: number;
    pendingDeliveries?: number;
    internalTransfers?: number;
    lowStock?: number;
  };
}

export function AppShell({ children, counts }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [warehouse, setWarehouse] = useState('all');

  // Global key listener for Ctrl+K or / to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === '/' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900 antialiased selection:bg-amber-500 selection:text-black">
      {/* Top Console Bar */}
      <TopBar
        onOpenSearch={() => setSearchOpen(true)}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        lowStockCount={counts?.lowStock || 0}
        activeWarehouse={warehouse}
        onWarehouseChange={setWarehouse}
      />

      {/* Main Workstation Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Bar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          counts={counts}
        />

        {/* Dynamic Center Workstation View */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-stone-100/90 max-w-[1600px] w-full">
          {children}
        </main>
      </div>

      {/* Global Command & Barcode Scanner Palette */}
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}

