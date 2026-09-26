import React from 'react';
import { cn } from '@/lib/utils';

export function Table({ className, children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto border border-stone-200 bg-white">
      <table className={cn('w-full text-left border-collapse font-sans text-xs', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        'bg-stone-100/80 text-stone-700 font-mono text-[11px] uppercase tracking-wider border-b border-stone-200 select-none sticky top-0 z-10',
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn('divide-y divide-stone-200 bg-white', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({
  className,
  children,
  isInteractive = true,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & { isInteractive?: boolean }) {
  return (
    <tr
      className={cn(
        'transition-colors',
        isInteractive && 'hover:bg-amber-50/30 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className, children, align = 'left', ...props }: React.ThHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'center' | 'right' }) {
  return (
    <th
      className={cn(
        'px-3 py-2 font-semibold',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        align === 'left' && 'text-left',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({
  className,
  children,
  align = 'left',
  isMonospace = false,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & { align?: 'left' | 'center' | 'right'; isMonospace?: boolean }) {
  return (
    <td
      className={cn(
        'px-3 py-2 text-stone-800 align-middle',
        isMonospace && 'font-mono tracking-tight tabular-nums',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        align === 'left' && 'text-left',
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

export function TableEmptyState({ message = 'No ledger records found', colSpan = 5 }: { message?: string; colSpan?: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-8 text-center text-stone-500 font-mono text-xs">
        <div className="flex flex-col items-center justify-center gap-1">
          <span className="font-semibold text-stone-600">[ NO DATA IN VIEW ]</span>
          <span>{message}</span>
        </div>
      </td>
    </tr>
  );
}

