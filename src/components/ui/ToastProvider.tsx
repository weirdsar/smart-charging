'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Toast from './Toast';

export interface ToastRecord {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface ToastContextValue {
  addToast: (toast: Omit<ToastRecord, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let idCounter = 0;

function nextId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  idCounter += 1;
  return `toast-${idCounter}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const existing = timers.current.get(id);
    if (existing) clearTimeout(existing);
    timers.current.delete(id);
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastRecord, 'id'>) => {
      const id = nextId();
      const duration = toast.duration ?? 5000;
      const entry: ToastRecord = { ...toast, id };

      setToasts((prev) => {
        const next = [...prev, entry];
        if (next.length <= 5) return next;
        const dropped = next.slice(0, next.length - 5);
        dropped.forEach((d) => {
          const t = timers.current.get(d.id);
          if (t) clearTimeout(t);
          timers.current.delete(d.id);
        });
        return next.slice(-5);
      });

      if (duration > 0) {
        const t = setTimeout(() => removeToast(id), duration);
        timers.current.set(id, t);
      }
    },
    [removeToast]
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
      map.clear();
    };
  }, []);

  const value = useMemo(
    () => ({ addToast, removeToast }),
    [addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2"
        aria-live="polite"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.2 }}
            >
              <Toast toast={t} onClose={() => removeToast(t.id)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
