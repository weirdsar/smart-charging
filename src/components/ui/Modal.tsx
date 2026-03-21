'use client';

import { cn } from '@/lib/utils';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition duration-300 ease-out data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className={cn(
            'w-full rounded-lg border border-surface-light bg-surface p-6 shadow-xl transition duration-300 ease-out',
            'data-[closed]:scale-95 data-[closed]:opacity-0',
            sizeClasses[size]
          )}
        >
          {(title || showCloseButton) && (
            <div
              className={cn(
                'mb-4 flex items-center gap-4 border-b border-surface-light pb-4',
                title ? 'justify-between' : 'justify-end'
              )}
            >
              {title ? (
                <DialogTitle className="font-heading text-lg font-bold text-text-primary">
                  {title}
                </DialogTitle>
              ) : (
                <DialogTitle className="sr-only">Диалог</DialogTitle>
              )}
              {showCloseButton ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 rounded-md p-1 text-text-secondary transition-colors hover:text-text-primary"
                  aria-label="Закрыть"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              ) : null}
            </div>
          )}
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
