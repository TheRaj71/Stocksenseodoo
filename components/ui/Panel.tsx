import React from 'react';
import { cn } from '@/lib/utils';

interface PanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  statusBorder?: 'DRAFT' | 'WAITING' | 'READY' | 'DONE' | 'CANCELLED' | 'ALERT' | null;
  density?: 'compact' | 'comfortable' | 'none';
}

export function Panel({
  title,
  subtitle,
  action,
  statusBorder,
  density = 'compact',
  children,
  className,
  ...props
}: PanelProps) {
  const statusBorderClasses = {
    DRAFT: 'border-l-4 border-l-stone-400',
    WAITING: 'border-l-4 border-l-amber-500',
    READY: 'border-l-4 border-l-blue-600',
    DONE: 'border-l-4 border-l-emerald-600',
    CANCELLED: 'border-l-4 border-l-red-600',
    ALERT: 'border-l-4 border-l-amber-600',
  };

  const paddingClasses = {
    compact: 'p-3',
    comfortable: 'p-4 sm:p-5',
    none: 'p-0',
  }[density];

  return (
    <div
      className={cn(
        'bg-white border border-stone-200 rounded-xs shadow-none',
        statusBorder && statusBorderClasses[statusBorder],
        className
      )}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-3 py-2.5 bg-stone-50/80 border-b border-stone-200">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700 font-mono">
                {title}
              </h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="text-[11px] text-stone-500 font-mono mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={paddingClasses}>{children}</div>
    </div>
  );
}
