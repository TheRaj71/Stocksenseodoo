'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Boxes, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Sliders, 
  CornerDownLeft,
  X,
  Building,
  PackageCheck
} from 'lucide-react';
import { getProducts } from '@/app/actions/products';
import { ProductWithDetails } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      loadInitialProducts();
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const loadInitialProducts = async () => {
    setIsLoading(true);
    try {
      const res = await getProducts();
      if (res.success && res.data) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.Category?.name && p.Category.name.toLowerCase().includes(q))
    );
  }).slice(0, 8);

  const quickActions = [
    { label: 'New Incoming Receipt', href: '/receipts?action=new', icon: ArrowDownLeft },
    { label: 'New Outgoing Delivery', href: '/deliveries?action=new', icon: ArrowUpRight },
    { label: 'Transfer Stock between Bins', href: '/transfers?action=new', icon: ArrowLeftRight },
    { label: 'Perform Physical Count / Adjustment', href: '/adjustments?action=new', icon: Sliders },
  ];

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered by parent if handled
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-3 bg-stone-900/60 backdrop-blur-none">
      <div className="w-full max-w-2xl bg-white border-2 border-stone-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Search Bar Input */}
        <div className="flex items-center px-3 py-2.5 bg-stone-900 text-white border-b border-stone-800">
          <Search className="w-4 h-4 text-amber-500 mr-2 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="SCAN BARCODE, TYPE SKU OR DOCUMENT REFERENCE..."
            className="w-full bg-transparent text-xs sm:text-sm font-mono tracking-wider text-white placeholder:text-stone-500 focus:outline-none uppercase"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-stone-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="ml-2 text-[10px] font-mono px-1.5 py-0.5 bg-stone-800 border border-stone-700 text-stone-400 shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-stone-100">
          {/* Quick Action Shortcuts when query is short */}
          {!query && (
            <div className="p-2 bg-stone-50">
              <div className="px-2 py-1 text-[10px] font-mono uppercase font-bold text-stone-500">
                QUICK DISPATCH SHORTCUTS
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                {quickActions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.label}
                      onClick={() => handleSelect(act.href)}
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-mono text-left bg-white border border-stone-200 hover:border-amber-600 hover:bg-amber-50/40 text-stone-800 cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Product / SKU Matches */}
          <div className="p-2">
            <div className="px-2 py-1 text-[10px] font-mono uppercase font-bold text-stone-500">
              MATCHING SKU / PRODUCT LEDGER ({filteredProducts.length})
            </div>

            {filteredProducts.length === 0 && !isLoading && (
              <div className="px-3 py-6 text-center text-xs font-mono text-stone-500">
                NO SKU OR DOCUMENT MATCHING "{query.toUpperCase()}"
              </div>
            )}

            <div className="space-y-1 mt-1">
              {filteredProducts.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => handleSelect(`/products?sku=${p.sku}`)}
                  className="flex items-center justify-between p-2 hover:bg-amber-50/50 border border-transparent hover:border-stone-300 cursor-pointer text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-1.5 py-0.5 bg-stone-900 text-amber-400 font-bold text-[11px] border border-stone-800">
                      {p.sku}
                    </span>
                    <div className="truncate">
                      <span className="font-semibold text-stone-900">{p.name}</span>
                      {p.Category && (
                        <span className="ml-2 text-stone-500 text-[11px]">
                          [{p.Category.name}]
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-stone-600">
                      Stock:{' '}
                      <span className="font-bold text-stone-900">
                        {p.stock_quantity ?? '—'}
                      </span>{' '}
                      {p.UnitOfMeasure?.symbol || 'pcs'}
                    </span>
                    <CornerDownLeft className="w-3.5 h-3.5 text-stone-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-3 py-1.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-[11px] font-mono text-stone-500">
          <span>Tip: Scan any physical barcode directly into terminal</span>
          <span>[Enter] Select &nbsp;&nbsp; [Esc] Dismiss</span>
        </div>
      </div>
    </div>
  );
}

