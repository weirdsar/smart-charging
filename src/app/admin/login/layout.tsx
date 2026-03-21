import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Вход | Панель управления',
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
