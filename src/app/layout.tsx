import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AnalyticsScripts from '@/components/analytics/AnalyticsScripts';
import AuthProvider from '@/components/providers/AuthProvider';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { SITE_URL } from '@/lib/constants';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/icon-192.png', sizes: '180x180', type: 'image/png' }],
  },
  title: 'Умная зарядка — Саратов',
  description:
    'Официальный дилер TSS и Pandora. Монтаж «под ключ» с гарантией 5 лет. Генераторы и зарядные станции в Саратове.',
  openGraph: {
    title: 'Умная зарядка — Саратов',
    description: 'Официальный дилер TSS и Pandora.',
    locale: 'ru_RU',
    url: 'https://tts64.ru',
    siteName: 'Умная зарядка',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Умная зарядка — Саратов',
    description: 'Официальный дилер TSS и Pandora.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} font-body`}>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
