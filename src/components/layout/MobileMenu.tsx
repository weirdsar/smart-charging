'use client';

import Button from '@/components/ui/Button';
import {
  COMPANY_ADDRESS,
  COMPANY_EMAIL,
  COMPANY_PHONE,
  COMPANY_PHONE_DISPLAY,
  COMPANY_WORKTIME,
  NAV_ITEMS,
} from '@/lib/constants';
import type { NavItem } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { ChevronDown, Phone, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MotionDialogPanel = motion(DialogPanel);

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MobileNavLinks({
  items,
  onNavigate,
  pathname,
  depth = 0,
}: {
  items: NavItem[];
  onNavigate: () => void;
  pathname: string;
  depth?: number;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <ul className="list-none">
      {items.map((item) => {
        const hasChildren = Boolean(item.children?.length);
        const key = item.href;
        const active = isNavActive(pathname, item.href);

        if (!hasChildren) {
          return (
            <li key={key}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'block border-b border-surface-light px-4 py-3 text-base text-text-primary transition-colors hover:bg-surface',
                  active && 'text-accent',
                  depth > 0 && 'pl-8 text-sm text-text-secondary',
                  depth > 1 && 'pl-12'
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        }

        const expanded = openKey === key;
        return (
          <li key={key}>
            <button
              type="button"
              onClick={() => setOpenKey(expanded ? null : key)}
              className="flex w-full items-center justify-between border-b border-surface-light px-4 py-3 text-left text-base text-text-primary transition-colors hover:bg-surface"
            >
              <span className={cn(active && 'text-accent')}>{item.label}</span>
              <ChevronDown
                className={cn('h-4 w-4 shrink-0 transition-transform', expanded && 'rotate-180')}
                aria-hidden
              />
            </button>
            {expanded && item.children ? (
              <div className="border-b border-surface-light">
                <MobileNavLinks
                  items={item.children}
                  onNavigate={onNavigate}
                  pathname={pathname}
                  depth={depth + 1}
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const telHref = `tel:${COMPANY_PHONE.replace(/\s/g, '')}`;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[60]">
      <DialogBackdrop
        transition
        className="fixed inset-0 z-[60] bg-black/70 transition duration-300 ease-out data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 z-[70] flex justify-end">
        <MotionDialogPanel
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex h-full w-[85%] max-w-sm flex-col overflow-y-auto border-l border-surface-light bg-primary shadow-xl outline-none data-[closed]:translate-x-full"
          aria-label="Меню навигации"
        >
          <div className="flex items-center justify-between border-b border-surface-light p-4">
            <Link href="/" className="flex flex-col" onClick={onClose}>
              <span className="font-heading text-lg font-bold text-text-primary">
                Умная<span className="text-accent">Зарядка</span>
              </span>
              <span className="text-[10px] leading-none text-text-secondary">
                Официальный дилер TSS и Pandora
              </span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-2 text-text-secondary transition-colors hover:text-accent"
              aria-label="Закрыть меню"
            >
              <X className="h-6 w-6" aria-hidden />
            </button>
          </div>

          <div className="border-b border-surface-light p-4">
            <a
              href={telHref}
              className="flex items-center gap-2 text-lg font-bold text-accent"
              onClick={onClose}
            >
              <Phone className="h-5 w-5 shrink-0" aria-hidden />
              {COMPANY_PHONE_DISPLAY}
            </a>
            <p className="mt-2 text-xs text-text-secondary">{COMPANY_WORKTIME}</p>
          </div>

          <nav className="flex-1">
            <MobileNavLinks items={NAV_ITEMS} onNavigate={onClose} pathname={pathname} />
          </nav>

          <div className="px-4 py-4">
            <Button variant="primary" fullWidth onClick={onClose}>
              Заказать звонок
            </Button>
          </div>

          <div className="mt-auto border-t border-surface-light p-4 text-xs text-text-secondary">
            <p>{COMPANY_ADDRESS}</p>
            <a href={`mailto:${COMPANY_EMAIL}`} className="mt-1 block hover:text-accent">
              {COMPANY_EMAIL}
            </a>
          </div>
        </MotionDialogPanel>
      </div>
    </Dialog>
  );
}
