import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  File,
  FileText,
  FolderTree,
  Inbox,
  Layout,
  Package,
  Search,
  Settings,
} from 'lucide-react';

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: 'Контент',
    items: [
      { href: '/admin/products', label: 'Товары', icon: Package },
      { href: '/admin/categories', label: 'Категории', icon: FolderTree },
      { href: '/admin/projects', label: 'Проекты', icon: Briefcase },
      { href: '/admin/blog', label: 'Блог', icon: FileText },
      { href: '/admin/documents', label: 'Документы', icon: File },
      { href: '/admin/filter-pages', label: 'SEO-страницы', icon: Search },
    ],
  },
  {
    label: 'Заявки',
    items: [{ href: '/admin/leads', label: 'Заявки', icon: Inbox }],
  },
  {
    label: 'Настройки',
    items: [
      { href: '/admin/pages', label: 'Страницы', icon: Layout },
      { href: '/admin/settings', label: 'Настройки', icon: Settings },
    ],
  },
];
