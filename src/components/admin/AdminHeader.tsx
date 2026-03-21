'use client';

import { AdminNavigation, type AdminSidebarUser } from '@/components/admin/AdminSidebar';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { Bell, ExternalLink, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface AdminHeaderProps {
  user: AdminSidebarUser;
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-surface-light bg-surface px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-md p-2 text-text-primary transition-colors hover:bg-surface-light lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Открыть меню"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="font-heading text-lg font-bold text-text-primary">Панель управления</h1>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-light hover:text-text-primary sm:inline-flex"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            Сайт
          </a>
          <div className="relative">
            <Bell className="h-5 w-5 text-text-secondary" aria-hidden />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-accent" aria-hidden />
          </div>
          <span className="hidden text-sm text-text-secondary md:block">{user.name ?? user.email}</span>
        </div>
      </header>

      <Dialog open={mobileOpen} onClose={setMobileOpen} className="relative z-50 lg:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 z-50 bg-black/60 transition duration-200 data-[closed]:opacity-0"
        />
        <div className="fixed inset-0 z-50 flex justify-start">
          <DialogPanel
            transition
            className="flex h-full max-h-screen w-64 max-w-[85vw] flex-col border-r border-surface-light bg-surface shadow-xl transition duration-200 data-[closed]:-translate-x-full"
          >
            <div className="flex items-center justify-between border-b border-surface-light p-4">
              <Link
                href="/admin"
                className="font-heading text-lg font-bold text-text-primary"
                onClick={() => setMobileOpen(false)}
              >
                Умная<span className="text-accent">Зарядка</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-2 text-text-secondary hover:text-text-primary"
                aria-label="Закрыть меню"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              <AdminNavigation user={user} onNavigate={() => setMobileOpen(false)} />
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
