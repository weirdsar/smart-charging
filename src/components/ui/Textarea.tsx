'use client';

import { cn } from '@/lib/utils';
import { forwardRef, useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    className,
    id: idProp,
    label,
    error,
    hint,
    fullWidth = true,
    disabled,
    rows = 4,
    ...props
  },
  ref
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const hasError = Boolean(error);

  return (
    <div className={cn('flex flex-col', fullWidth && 'w-full')}>
      {label ? (
        <label htmlFor={id} className="mb-1 text-sm text-text-secondary">
          {label}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        disabled={disabled}
        className={cn(
          'min-h-[2.5rem] w-full resize-y rounded-md border bg-surface px-3 py-2 text-text-primary placeholder:text-text-secondary/50',
          'outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent',
          hasError
            ? 'border-error focus:border-error focus:ring-error'
            : 'border-surface-light',
          disabled && 'cursor-not-allowed opacity-60',
          className
        )}
        aria-invalid={hasError}
        aria-describedby={
          hasError ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        {...props}
      />
      {hasError ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-text-secondary">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Textarea;
