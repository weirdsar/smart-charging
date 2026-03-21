'use client';

import { cn } from '@/lib/utils';
import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    id: idProp,
    label,
    error,
    hint,
    leftIcon,
    fullWidth = true,
    disabled,
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
      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
            {leftIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={id}
          disabled={disabled}
          className={cn(
            'h-10 w-full rounded-md border bg-surface px-3 text-text-primary placeholder:text-text-secondary/50',
            'outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent',
            leftIcon && 'pl-10',
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
      </div>
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

export default Input;
