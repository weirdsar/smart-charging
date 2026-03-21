'use client';

import { cn } from '@/lib/utils';
import type { KeyboardEvent } from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export default function Card({
  children,
  className,
  padding = 'md',
  hover = false,
  onClick,
}: CardProps) {
  const base = cn(
    'rounded-lg border border-surface-light bg-surface',
    paddingClasses[padding],
    hover && 'cursor-pointer transition-colors hover:border-accent/50',
    className
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  if (onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        className={base}
        onClick={onClick}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    );
  }

  return <div className={base}>{children}</div>;
}
