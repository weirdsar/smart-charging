'use client';

import { cn } from '@/lib/utils';
import { useId } from 'react';

export interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  id?: string;
}

export default function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  error,
  id: idProp,
}: CheckboxProps) {
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-2">
        <div className="relative mt-0.5 h-5 w-5 shrink-0">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
            className={cn(
              'h-5 w-5 cursor-pointer appearance-none rounded border-2 bg-surface transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary',
              checked ? 'border-accent bg-accent' : 'border-surface-light',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
          />
          {checked ? (
            <svg
              className="pointer-events-none absolute left-0.5 top-0.5 h-3.5 w-3.5 text-white"
              aria-hidden
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </div>
        <label
          htmlFor={id}
          className={cn(
            'cursor-pointer select-none text-sm text-text-primary',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          {label}
        </label>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-xs text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
