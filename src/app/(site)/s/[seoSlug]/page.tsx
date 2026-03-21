import { Card } from '@/components/ui';
import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: { seoSlug: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const title = decodeURIComponent(params.seoSlug).replace(/-/g, ' ');
  return {
    title: `${title} | Умная зарядка — Саратов`,
    description:
      'SEO-страница для органического поиска. ООО «Умная зарядка» — официальный дилер TSS и Pandora в Саратове.',
    alternates: {
      canonical: `/s/${params.seoSlug}`,
    },
  };
}

export default function SeoLandingPage({ params }: PageProps) {
  const label = decodeURIComponent(params.seoSlug).replace(/-/g, ' ');

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
          <Search className="h-7 w-7 text-accent" aria-hidden />
        </div>
        <h1 className="mt-6 font-heading text-3xl font-bold text-text-primary sm:text-4xl">{label}</h1>
        <p className="mt-4 text-lg text-text-secondary">
          Это заготовка SEO-лендинга под расширенные запросы. Контент и уникальные тексты будут добавлены при
          настройке поисковой оптимизации. Сейчас вы можете перейти в каталог или связаться с нами.
        </p>
      </div>

      <Card padding="lg" className="mt-10">
        <p className="text-sm text-text-secondary">
          ООО «Умная зарядка» — официальный дилер генераторов TSS и зарядных станций Pandora. Монтаж, сервис и
          гарантия на работы в Саратове и области.
        </p>
      </Card>

      <p className="mt-10 flex flex-wrap justify-center gap-4 text-sm">
        <Link href="/catalog" className="font-medium text-accent hover:text-accent-hover">
          Каталог
        </Link>
        <Link href="/contacts" className="font-medium text-accent hover:text-accent-hover">
          Контакты
        </Link>
        <Link href="/services" className="font-medium text-accent hover:text-accent-hover">
          Услуги
        </Link>
      </p>
    </div>
  );
}
