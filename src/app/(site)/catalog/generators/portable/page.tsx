import CatalogFiltersColumn from '@/components/catalog/CatalogFiltersColumn';
import ProductGrid from '@/components/catalog/ProductGrid';
import PaginationWrapper from '@/components/admin/PaginationWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getCategoryListing } from '@/app/(site)/catalog/_lib/catalog-listing';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Портативные генераторы до 10 кВт — купить в Саратове | Умная зарядка',
  description:
    'Портативные бензиновые и дизельные генераторы до 10 кВт с доставкой и монтажом в Саратове. Официальный дилер TSS.',
  alternates: {
    canonical: '/catalog/generators/portable',
  },
};

export const revalidate = 3600;
export const dynamic = 'force-dynamic';

interface SearchParams {
  page?: string;
  search?: string;
  sort?: string;
  avr?: string;
}

export default async function PortableGeneratorsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const data = await getCategoryListing('GENERATORS_PORTABLE', searchParams);

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <p className="text-text-secondary">Категория не найдена</p>
      </div>
    );
  }

  const { products, total, page, totalPages } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Каталог', href: '/catalog' },
          { label: 'Генераторы', href: '/catalog/generators' },
          { label: 'Портативные' },
        ]}
      />

      <div className="mb-8 mt-6">
        <h1 className="mb-3 font-heading text-3xl font-bold text-text-primary">
          Портативные генераторы
        </h1>
        <p className="text-text-secondary">
          Бензиновые и дизельные генераторы мощностью до 10 кВт для дома, дачи, стройки
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
        <aside className="mb-6 lg:mb-0">
          <Suspense
            fallback={
              <div className="text-sm text-text-secondary">Загрузка фильтров…</div>
            }
          >
            <CatalogFiltersColumn showAvrFilter />
          </Suspense>
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-text-secondary">Найдено товаров: {total}</p>
          </div>

          <ProductGrid products={products} categoryPath="generators/portable" />

          {totalPages > 1 ? (
            <Suspense fallback={null}>
              <div className="mt-8 flex justify-center">
                <PaginationWrapper currentPage={page} totalPages={totalPages} />
              </div>
            </Suspense>
          ) : null}
        </div>
      </div>
    </div>
  );
}
