import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: ReactNode;
}

export default function StatsCard({ title, value, change, changeType = 'neutral', icon }: StatsCardProps) {
  return (
    <Card padding="lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-text-secondary">{title}</p>
          <p className="mt-2 font-heading text-2xl font-bold text-text-primary">{value}</p>
          {change ? (
            <p
              className={cn(
                'mt-1 text-xs',
                changeType === 'positive' && 'text-success',
                changeType === 'negative' && 'text-error',
                changeType === 'neutral' && 'text-text-secondary'
              )}
            >
              {changeType === 'positive' && '↑ '}
              {changeType === 'negative' && '↓ '}
              {change}
            </p>
          ) : null}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
          {icon}
        </div>
      </div>
    </Card>
  );
}
