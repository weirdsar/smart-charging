'use client';

import DeleteProductButton from '@/components/admin/DeleteProductButton';
import PaginationWrapper from '@/components/admin/PaginationWrapper';
import DataTable from '@/components/admin/DataTable';
import { Badge, Button } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import { Edit, Plus } from 'lucide-react';
import { Suspense } from 'react';

interface ProductRow {
  id: string;
  title: string;
  slug: string;
  price: number;
  published: boolean;
  inStock: boolean;
  categoryName: string;
}

interface ProductsListClientProps {
  products: ProductRow[];
  total: number;
  currentPage: number;
  limit: number;
}

export default function ProductsListClient({
  products,
  total,
  currentPage,
  limit,
}: ProductsListClientProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-2xl font-bold text-text-primary">Товары</h1>
          <Badge variant="default">{total}</Badge>
        </div>
        <Button
          as="a"
          href="/admin/products/new"
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" aria-hidden />}
        >
          Добавить товар
        </Button>
      </div>

      <DataTable
        columns={[
          { key: 'title', label: 'Название' },
          { key: 'categoryName', label: 'Категория' },
          {
            key: 'price',
            label: 'Цена',
            render: (p) => formatPrice(p.price),
          },
          {
            key: 'published',
            label: 'Статус',
            render: (p) => (
              <Badge variant={p.published ? 'success' : 'default'}>
                {p.published ? 'Опубликован' : 'Черновик'}
              </Badge>
            ),
          },
          {
            key: 'inStock',
            label: 'Наличие',
            render: (p) => (
              <Badge variant={p.inStock ? 'success' : 'error'}>
                {p.inStock ? 'В наличии' : 'Нет'}
              </Badge>
            ),
          },
        ]}
        data={products}
        keyExtractor={(p) => p.id}
        actions={(p) => (
          <div className="flex flex-wrap gap-2">
            <Button
              as="a"
              href={`/admin/products/${p.id}/edit`}
              variant="ghost"
              size="sm"
              leftIcon={<Edit className="h-3.5 w-3.5" aria-hidden />}
            >
              Изменить
            </Button>
            <DeleteProductButton id={p.id} />
          </div>
        )}
      />

      <Suspense
        fallback={
          <div className="mt-6 text-center text-sm text-text-secondary">Загрузка пагинации…</div>
        }
      >
        <div className="mt-6 flex justify-center">
          <PaginationWrapper currentPage={currentPage} totalPages={totalPages} />
        </div>
      </Suspense>
    </div>
  );
}
