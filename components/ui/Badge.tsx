import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 
  | 'DRAFT' 
  | 'WAITING' 
  | 'READY' 
  | 'DONE' 
  | 'CANCELLED' 
  | 'LOW_STOCK' 
  | 'OUT_OF_STOCK' 
  | 'OVERSTOCK'
  | 'INTERNAL'
  | 'VENDOR'
  | 'CUSTOMER'
  | 'DEFAULT';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant | string;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

const variantStyles: Record<string, string> = {
  DRAFT: 'bg-stone-100 text-stone-700 border-stone-300',
  WAITING: 'bg-amber-50 text-amber-800 border-amber-300',
  READY: 'bg-blue-50 text-blue-800 border-blue-300',
  DONE: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  CANCELLED: 'bg-red-50 text-red-800 border-red-300',
  LOW_STOCK: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold',
  OUT_OF_STOCK: 'bg-red-100 text-red-900 border-red-300 font-semibold',
  OVERSTOCK: 'bg-purple-50 text-purple-800 border-purple-300',
  INTERNAL: 'bg-stone-100 text-stone-800 border-stone-200',
  VENDOR: 'bg-sky-50 text-sky-800 border-sky-200',
  CUSTOMER: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  DEFAULT: 'bg-stone-100 text-stone-700 border-stone-200',
};

const dotColors: Record<string, string> = {
  DONE: 'bg-emerald-500',
  WAITING: 'bg-amber-500',
  READY: 'bg-blue-500',
  CANCELLED: 'bg-red-500',
  DRAFT: 'bg-stone-400',
  LOW_STOCK: 'bg-amber-500',
  OUT_OF_STOCK: 'bg-red-500',
};

export function Badge({
  children,
  variant = 'DEFAULT',
  size = 'md',
  showDot = false,
  className,
  ...props
}: BadgeProps) {
  const normVariant = variant.toUpperCase();
  const appliedStyle = variantStyles[normVariant] || variantStyles.DEFAULT;
  const dotColor = dotColors[normVariant] || 'bg-stone-400';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono tracking-wide uppercase border rounded-xs select-none font-medium',
        size === 'sm' ? 'text-[10px] px-1.5 py-0.5 leading-none' : 'text-[11px] px-2 py-0.5 leading-tight',
        appliedStyle,
        className
      )}
      {...props}
    >
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColor)} />
      )}
      <span>{children || normVariant.replace('_', ' ')}</span>
    </span>
  );
}
