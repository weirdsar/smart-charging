'use client';

import { ADMIN_NAV_GROUPS } from '@/lib/adminNav';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface AdminSidebarUser {
  name?: string | null;
  email?: string | null;
  role: string;
}

interface AdminSidebarProps {
  user: AdminSidebarUser;
}

interface AdminNavigationProps {
  user: AdminSidebarUser;
  onNavigate?: () => void;
}

export function AdminNavigation({ user, onNavigate }: AdminNavigationProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname.startsWith(`${href}/`));

  const initial = (user.name?.trim().charAt(0) || user.email?.charAt(0) || '?').toUpperCase();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto py-4">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-5 pb-2 pt-4 text-xs font-medium uppercase tracking-wider text-text-secondary/50">
              {group.label}
            </p>
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-3 px-5 py-2.5 text-sm transition-colors',
                      active
                        ? 'border-r-2 border-accent bg-accent/5 text-accent'
                        : 'text-text-secondary hover:bg-surface-light hover:text-text-primary'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-surface-light p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">{user.name ?? '—'}</p>
            <p className="truncate text-xs text-text-secondary">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="shrink-0 rounded-md p-1.5 text-text-secondary transition-colors hover:text-error"
            aria-label="Выйти"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-surface-light bg-surface lg:flex">
      <div className="shrink-0 border-b border-surface-light p-5">
        <Link href="/admin" className="block font-heading text-lg font-bold text-text-primary">
          Умная<span className="text-accent">Зарядка</span>
        </Link>
        <p className="mt-0.5 text-xs text-text-secondary">Админ-панель</p>
      </div>
      <AdminNavigation user={user} />
    </aside>
  );
}
