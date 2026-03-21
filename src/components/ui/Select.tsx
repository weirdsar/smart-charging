'use client';

import { cn } from '@/lib/utils';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { Fragment } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function Select({
  label,
  options,
  value,
  onChange,
  placeholder = 'Выберите значение',
  error,
  disabled = false,
  fullWidth = true,
}: SelectProps) {
  const selected = options.find((o) => o.value === value);
  const hasError = Boolean(error);

  return (
    <div className={cn('flex flex-col', fullWidth && 'w-full')}>
      {label ? (
        <span className="mb-1 text-sm text-text-secondary">{label}</span>
      ) : null}
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <ListboxButton
            className={({ open }) =>
              cn(
                'relative flex h-10 w-full cursor-pointer items-center justify-between rounded-md border bg-surface px-3 text-left text-sm text-text-primary',
                'outline-none transition focus:border-accent focus:ring-1 focus:ring-accent',
                hasError
                  ? 'border-error focus:border-error focus:ring-error'
                  : 'border-surface-light',
                disabled && 'cursor-not-allowed opacity-60',
                open && 'ring-1 ring-accent'
              )
            }
            aria-invalid={hasError}
          >
            {({ open }) => (
              <>
                <span className={cn(!selected && 'text-text-secondary/50')}>
                  {selected?.label ?? placeholder}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 text-text-secondary transition-transform duration-150',
                    open && 'rotate-180'
                  )}
                  aria-hidden
                />
              </>
            )}
          </ListboxButton>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            enter="transition ease-out duration-100"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
          >
            <ListboxOptions
              transition
              className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-surface-light bg-surface py-1 shadow-lg focus:outline-none"
            >
              {options.map((option) => (
                <ListboxOption
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={({ focus, selected: isSelected }) =>
                    cn(
                      'relative cursor-pointer select-none px-3 py-2 text-sm text-text-primary',
                      focus && 'bg-surface-light',
                      isSelected && 'bg-accent/10 text-accent'
                    )
                  }
                >
                  {({ selected: isSelected }) => (
                    <span className="flex items-center gap-2">
                      {isSelected ? (
                        <Check className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                      ) : (
                        <span className="inline-block h-4 w-4 shrink-0" aria-hidden />
                      )}
                      {option.label}
                    </span>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
      {hasError ? (
        <p className="mt-1 text-xs text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
