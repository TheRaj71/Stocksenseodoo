import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = 'outline',
      size = 'md',
      isLoading = false,
      disabled,
      icon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      xs: 'h-6 px-2 text-[11px] gap-1 font-mono',
      sm: 'h-7 px-2.5 text-xs gap-1.5 font-medium',
      md: 'h-8 px-3 text-xs gap-2 font-medium',
      lg: 'h-9 px-4 text-sm gap-2 font-semibold',
    }[size];

    const variantClasses = {
      primary:
        'bg-amber-600 text-white border border-amber-700 hover:bg-amber-700 active:bg-amber-800 shadow-xs focus-visible:ring-2 focus-visible:ring-amber-500 font-semibold',
      secondary:
        'bg-stone-900 text-stone-100 border border-stone-950 hover:bg-stone-800 active:bg-black shadow-xs focus-visible:ring-2 focus-visible:ring-stone-400 font-semibold',
      outline:
        'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50 hover:text-stone-900 hover:border-stone-400 active:bg-stone-100 shadow-xs focus-visible:ring-2 focus-visible:ring-stone-400',
      danger:
        'bg-red-600 text-white border border-red-700 hover:bg-red-700 active:bg-red-800 shadow-xs focus-visible:ring-2 focus-visible:ring-red-500 font-semibold',
      success:
        'bg-emerald-600 text-white border border-emerald-700 hover:bg-emerald-700 active:bg-emerald-800 shadow-xs focus-visible:ring-2 focus-visible:ring-emerald-500 font-semibold',
      ghost:
        'bg-transparent text-stone-600 hover:bg-stone-100 hover:text-stone-900 active:bg-stone-200 border border-transparent',
    }[variant];

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center select-none cursor-pointer',
          'transition-all duration-100 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
          'rounded-sm tracking-tight',
          sizeClasses,
          variantClasses,
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          icon && <span className="inline-flex shrink-0">{icon}</span>
        )}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
