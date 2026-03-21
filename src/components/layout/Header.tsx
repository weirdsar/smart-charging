'use client';

import CallbackForm from '@/components/forms/CallbackForm';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import MobileMenu from '@/components/layout/MobileMenu';
import TopBar from '@/components/layout/TopBar';
import {
  COMPANY_PHONE,
  COMPANY_PHONE_DISPLAY,
  NAV_ITEMS,
} from '@/lib/constants';
import type { NavItem } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ChevronDown, Menu, Phone } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DesktopDropdown({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  if (!item.children?.length) return null;

  return (
    <div className="absolute left-0 top-full z-50 pt-2 opacity-0 invisible transition-all duration-200 group-hover:visible group-hover:opacity-100">
      <div className="min-w-[220px] rounded-b-lg border border-surface-light bg-surface py-2 shadow-xl">
        {item.children.map((child) => {
          if (child.children?.length) {
            return (
              <div
                key={child.href}
                className="border-b border-surface-light pb-2 last:mb-0 last:border-b-0 last:pb-0"
              >
                <Link
                  href={child.href}
                  className="block px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-text-secondary/60 transition-colors hover:text-accent"
                >
                  {child.label}
                </Link>
                {child.children.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className={cn(
                      'block px-4 py-2.5 pl-6 text-sm text-text-secondary transition-colors hover:bg-surface-light hover:text-text-primary',
                      isNavActive(pathname, sub.href) && 'text-accent'
                    )}
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            );
          }
          return (
            <Link
              key={child.href}
              href={child.href}
              className={cn(
                'block px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-light hover:text-text-primary',
                child.href === '/catalog/charging-stations' &&
                  'border-t border-surface-light pt-3',
                isNavActive(pathname, child.href) && 'text-accent'
              )}
            >
              {child.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const telHref = `tel:${COMPANY_PHONE.replace(/\s/g, '')}`;

  return (
    <header>
      <TopBar />
      <div
        className={cn(
          'sticky top-0 z-50 border-b border-surface-light transition-shadow duration-200',
          scrolled
            ? 'bg-primary shadow-lg'
            : 'bg-primary/95 backdrop-blur-md'
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex flex-col">
            <span className="font-heading text-xl font-bold text-text-primary">
              Умная<span className="text-accent">Зарядка</span>
            </span>
            <span className="text-[10px] leading-none text-text-secondary">
              Официальный дилер TSS и Pandora
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Основное меню">
            {NAV_ITEMS.map((item) => {
              const active = isNavActive(pathname, item.href);
              if (!item.children?.length) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-3 py-2 text-sm transition-colors',
                      active ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1 px-3 py-2 text-sm transition-colors',
                      active ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
                    )}
                  >
                    {item.label}
                    <ChevronDown
                      className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:rotate-180"
                      aria-hidden
                    />
                  </Link>
                  <DesktopDropdown item={item} pathname={pathname} />
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              as="a"
              href={telHref}
              variant="ghost"
              size="sm"
              className="hidden gap-2 px-2 md:inline-flex"
              aria-label={`Позвонить: ${COMPANY_PHONE_DISPLAY}`}
            >
              <Phone className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden xl:inline">{COMPANY_PHONE_DISPLAY}</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="hidden lg:inline-flex"
              onClick={() => setCallbackOpen(true)}
            >
              Заказать звонок
            </Button>
            <button
              type="button"
              className="rounded-md p-2 text-text-primary transition-colors hover:bg-surface-light lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Открыть меню"
            >
              <Menu className="h-6 w-6" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Modal
        isOpen={callbackOpen}
        onClose={() => setCallbackOpen(false)}
        title="Заказать звонок"
        size="sm"
      >
        <CallbackForm onSuccess={() => setCallbackOpen(false)} />
      </Modal>
    </header>
  );
}
