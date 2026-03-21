import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Страница не найдена',
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 text-center">
      <h1 className="font-heading text-2xl text-text-primary">Страница не найдена</h1>
      <p className="mt-4 text-text-secondary">Запрашиваемая страница отсутствует.</p>
      <Link href="/" className="mt-6 inline-block text-accent hover:text-accent-hover">
        На главную
      </Link>
    </div>
  );
}
