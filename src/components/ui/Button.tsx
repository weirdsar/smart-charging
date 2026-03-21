'use client';

import { cn } from '@/lib/utils';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'href' | 'as'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  as?: 'button' | 'a';
  href?: string;
}

function LoadingSpinner() {
  return (
    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
      <svg
        className="h-4 w-4 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 18v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4.93 4.93l2.83 2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16.24 16.24l2.83 2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export default function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  as = 'button',
  href,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const { type: buttonType = 'button', ...buttonRest } =
    rest as ButtonHTMLAttributes<HTMLButtonElement>;

  const base =
    'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary disabled:cursor-not-allowed disabled:opacity-50';

  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-accent text-white hover:bg-accent-hover',
    secondary:
      'border border-surface-light bg-surface-light text-text-primary hover:border-accent',
    outline:
      'border border-text-secondary text-text-primary hover:border-accent hover:text-accent',
    ghost: 'text-text-secondary hover:bg-surface hover:text-text-primary',
    danger: 'bg-error text-white hover:bg-red-600',
  };

  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-5 text-sm',
    lg: 'h-12 px-8 text-base',
  };

  const composed = cn(
    base,
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    isLoading && 'pointer-events-none opacity-80',
    className
  );

  const content = (
    <>
      {isLoading ? <LoadingSpinner /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </>
  );

  if (as === 'a') {
    const anchorProps = buttonRest as unknown as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a
        href={href ?? '#'}
        className={composed}
        aria-disabled={disabled}
        {...anchorProps}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={buttonType}
      className={composed}
      disabled={disabled || isLoading}
      {...buttonRest}
    >
      {content}
    </button>
  );
}
