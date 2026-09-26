import React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface KpiBlockProps {
  label: string;
  value: number | string;
  subtext?: string;
  variant?: 'default' | 'amber' | 'emerald' | 'blue' | 'red';
  icon?: React.ReactNode;
  href?: string;
  alert?: boolean;
}

export function KpiBlock({
  label,
  value,
  subtext,
  variant = 'default',
  icon,
  href,
  alert = false,
}: KpiBlockProps) {
  const variantStyles = {
    default: 'border-stone-200 bg-white text-stone-900 border-l-[3px] border-l-stone-400',
    amber: 'border-amber-200 bg-amber-50/40 text-amber-950 border-l-[3px] border-l-amber-600',
    emerald: 'border-emerald-200 bg-emerald-50/40 text-emerald-950 border-l-[3px] border-l-emerald-600',
    blue: 'border-blue-200 bg-blue-50/40 text-blue-950 border-l-[3px] border-l-blue-600',
    red: 'border-red-200 bg-red-50/40 text-red-950 border-l-[3px] border-l-red-600',
  }[variant];

  const content = (
    <div
      className={cn(
        'p-3.5 border transition-all select-none',
        variantStyles,
        href && 'hover:border-stone-400 hover:bg-stone-50/60 cursor-pointer',
        alert && 'ring-1 ring-amber-500/50'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-stone-600 font-semibold truncate">
          {label}
        </span>
        {icon && <span className="text-stone-500 shrink-0">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-stone-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {alert && (
          <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500 text-white uppercase">
            ACTION
          </span>
        )}
      </div>
      {subtext && (
        <div className="mt-1 text-[11px] font-mono text-stone-500 truncate">
          {subtext}
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="block no-underline">{content}</Link>;
  }

  return content;
}

