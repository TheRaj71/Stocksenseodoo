import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

export type DocStepStatus = 'DRAFT' | 'WAITING' | 'READY' | 'DONE' | 'CANCELLED';

interface StatusStepperProps {
  currentStatus: DocStepStatus;
  className?: string;
  onStatusSelect?: (status: DocStepStatus) => void;
  interactive?: boolean;
}

const steps: { id: DocStepStatus; label: string; index: number }[] = [
  { id: 'DRAFT', label: '1. Draft', index: 1 },
  { id: 'WAITING', label: '2. Waiting', index: 2 },
  { id: 'READY', label: '3. Ready', index: 3 },
  { id: 'DONE', label: '4. Done', index: 4 },
];

export function StatusStepper({
  currentStatus,
  className,
  onStatusSelect,
  interactive = false,
}: StatusStepperProps) {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 font-mono text-xs font-semibold rounded-sm', className)}>
        <X className="w-3.5 h-3.5 text-red-600" />
        <span>DOCUMENT CANCELLED</span>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex((s) => s.id === currentStatus) + 1;

  return (
    <div className={cn('flex items-center gap-2 select-none overflow-x-auto py-1', className)}>
      {steps.map((step, idx) => {
        const isPassed = step.index < currentStepIndex || currentStatus === 'DONE';
        const isCurrent = step.id === currentStatus;
        const isFuture = step.index > currentStepIndex && currentStatus !== 'DONE';

        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium rounded-sm border transition-colors',
                isCurrent && 'bg-stone-900 text-white border-stone-900 font-semibold shadow-xs',
                isPassed && !isCurrent && 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
                isFuture && 'bg-white text-stone-400 border-stone-200',
                interactive && 'cursor-pointer hover:border-stone-400'
              )}
              onClick={() => interactive && onStatusSelect && onStatusSelect(step.id)}
            >
              {isPassed && !isCurrent ? (
                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
              ) : (
                <span
                  className={cn(
                    'w-2 h-2 rounded-full inline-block',
                    isCurrent && 'bg-amber-400',
                    isFuture && 'bg-stone-300'
                  )}
                />
              )}
              <span>{step.label}</span>
            </div>

            {idx < steps.length - 1 && (
              <span
                className={cn(
                  'h-0.5 w-3 sm:w-4 shrink-0 rounded-full',
                  step.index < currentStepIndex ? 'bg-emerald-500' : 'bg-stone-200'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
