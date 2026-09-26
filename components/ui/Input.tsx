import React from 'react';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isMonospace?: boolean;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      isMonospace = false,
      leftIcon,
      rightElement,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[11px] font-mono uppercase tracking-wider text-stone-600 font-semibold mb-1 select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-2.5 flex items-center pointer-events-none text-stone-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full h-8 px-2.5 py-1 text-xs bg-white text-stone-900',
              'border border-stone-300 rounded-none',
              'placeholder:text-stone-400',
              'focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900',
              'disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed',
              isMonospace && 'font-mono tracking-tight',
              leftIcon && 'pl-8',
              rightElement && 'pr-8',
              error && 'border-red-500 focus:border-red-600 focus:ring-red-600',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-2 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-[11px] font-mono text-red-600 font-medium">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-[11px] font-mono text-stone-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

