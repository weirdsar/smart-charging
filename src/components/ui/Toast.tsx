'use client';

import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import type { ToastRecord } from './ToastProvider';

export interface ToastProps {
  toast: ToastRecord;
  onClose: () => void;
}

const borderByType: Record<ToastRecord['type'], string> = {
  success: 'border-l-success',
  error: 'border-l-error',
  warning: 'border-l-warning',
  info: 'border-l-accent',
};

export default function Toast({ toast, onClose }: ToastProps) {
  const Icon =
    toast.type === 'success'
      ? CheckCircle
      : toast.type === 'error'
        ? XCircle
        : toast.type === 'warning'
          ? AlertTriangle
          : Info;

  const iconClass =
    toast.type === 'success'
      ? 'text-success'
      : toast.type === 'error'
        ? 'text-error'
        : toast.type === 'warning'
          ? 'text-warning'
          : 'text-accent';

  return (
    <div
      className={cn(
        'relative rounded-lg border border-surface-light bg-surface p-4 pl-3 shadow-lg',
        'border-l-4',
        borderByType[toast.type]
      )}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-2 top-2 rounded p-1 text-text-secondary transition-colors hover:text-text-primary"
        aria-label="Закрыть уведомление"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
      <div className="flex gap-3 pr-6">
        <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconClass)} aria-hidden />
        <div className="min-w-0">
          <p className="font-medium text-text-primary">{toast.title}</p>
          {toast.message ? (
            <p className="mt-1 text-sm text-text-secondary">{toast.message}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
