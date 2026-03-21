import { Card } from '@/components/ui';
import { prisma } from '@/lib/prisma';
import type { CategoryType } from '@prisma/client';
import type { Metadata } from 'next';
import { ArrowRight, Factory, Plug, Zap } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Каталог генераторов и зарядных станций | Умная зарядка — Саратов',
  description:
    'Полный каталог портативных и промышленных генераторов TSS, зарядных станций Pandora. Официальный дилер в Саратове.',
  alternates: {
    canonical: '/catalog',
  },
};

/** ISR interval (used when not forcing dynamic). Dynamic avoids build-time DB requirement. */
export const revalidate = 3600;
export const dynamic = 'force-dynamic';

const categoryIcons: Record<CategoryType, typeof Zap> = {
  GENERATORS_PORTABLE: Zap,
  GENERATORS_INDUSTRIAL: Factory,
  CHARGING_STATIONS: Plug,
};

export default async function CatalogPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="mb-3 font-heading text-3xl font-bold text-text-primary sm:text-4xl">
        Каталог оборудования
      </h1>
      <p className="mb-12 max-w-3xl text-lg text-text-secondary">
        Генераторы TSS и зарядные станции Pandora с монтажом «под ключ» в Саратове и области
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const Icon = categoryIcons[cat.type] ?? Zap;
          const href =
            cat.type === 'CHARGING_STATIONS'
              ? '/catalog/charging-stations'
              : `/catalog/generators/${cat.slug}`;

          const count = cat._count.products;
          const countLabel =
            count === 1 ? '1 товар' : count >= 2 && count <= 4 ? `${count} товара` : `${count} товаров`;

          return (
            <Card key={cat.id} padding="none" hover>
              <Link href={href} className="block p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Icon className="h-6 w-6 text-accent" aria-hidden />
                </div>
                <h2 className="mb-2 font-heading text-xl font-bold text-text-primary">{cat.name}</h2>
                <p className="mb-4 text-sm text-text-secondary">{countLabel}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover">
                  Смотреть каталог <ArrowRight size={14} aria-hidden />
                </span>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
