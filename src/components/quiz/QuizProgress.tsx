'use client';

import { cn } from '@/lib/utils';

export interface QuizProgressProps {
  /** 1-based index of the current step (1…totalSteps) */
  currentStep: number;
  totalSteps: number;
}

export default function QuizProgress({ currentStep, totalSteps }: QuizProgressProps) {
  return (
    <div className="flex gap-1.5 sm:gap-2" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const n = i + 1;
        const filled = n <= currentStep;
        return (
          <div
            key={n}
            className={cn('h-1.5 flex-1 rounded-full transition-colors', filled ? 'bg-accent' : 'bg-surface-light')}
          />
        );
      })}
    </div>
  );
}
