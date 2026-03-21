'use client';

import Button from '@/components/ui/Button';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'cookie-consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(STORAGE_KEY) === 'accepted') return;
    const t = window.setTimeout(() => setVisible(true), 2000);
    return () => window.clearTimeout(t);
  }, [mounted]);

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, 'accepted');
    }
    setVisible(false);
  };

  if (!mounted) return null;

  return (
    <AnimatePresence mode="wait">
      {visible ? (
        <motion.div
          key="cookie-banner"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-surface-light bg-surface p-4 shadow-lg"
          role="dialog"
          aria-label="Уведомление о cookie"
        >
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-center text-sm text-text-secondary sm:text-left">
              Мы используем файлы cookie для улучшения работы сайта.{' '}
              <Link href="/privacy" className="text-accent transition-colors hover:underline">
                Подробнее
              </Link>
            </p>
            <Button variant="primary" size="sm" onClick={handleAccept}>
              Принять
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
