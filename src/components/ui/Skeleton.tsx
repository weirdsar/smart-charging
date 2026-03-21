import { cn } from '@/lib/utils';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

function toCssSize(value: string | number | undefined, fallback: string): string {
  if (value === undefined) return fallback;
  return typeof value === 'number' ? `${value}px` : value;
}

export default function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  if (variant === 'text') {
    const lineCount = Math.max(1, lines);
    return (
      <div className={cn('w-full space-y-2', className)} style={{ width: toCssSize(width as string | number | undefined, '100%') }}>
        {Array.from({ length: lineCount }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 animate-pulse rounded bg-surface-light',
              i === lineCount - 1 && lineCount > 1 && 'w-3/4'
            )}
            style={{
              width: i === lineCount - 1 && lineCount > 1 ? undefined : '100%',
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circular') {
    const size = toCssSize(width ?? height, '40px');
    return (
      <div
        className={cn('animate-pulse rounded-full bg-surface-light', className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn('animate-pulse rounded bg-surface-light', className)}
      style={{
        width: toCssSize(width, '100%'),
        height: toCssSize(height, '8rem'),
      }}
    />
  );
}
