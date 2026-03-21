'use client';

import DeleteCategoryButton from '@/components/admin/DeleteCategoryButton';
import DataTable from '@/components/admin/DataTable';
import { Badge, Button } from '@/components/ui';
import { Plus } from 'lucide-react';

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  type: string;
  sortOrder: number;
  parentName: string | null;
  productCount: number;
}

interface CategoriesListClientProps {
  categories: CategoryRow[];
}

const typeLabels: Record<string, string> = {
  GENERATORS_PORTABLE: 'Портативные генераторы',
  GENERATORS_INDUSTRIAL: 'Промышленные генераторы',
  CHARGING_STATIONS: 'Зарядные станции',
};

export default function CategoriesListClient({ categories }: CategoriesListClientProps) {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Категории</h1>
        <Button
          as="a"
          href="/admin/categories/new"
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" aria-hidden />}
        >
          Добавить категорию
        </Button>
      </div>

      <DataTable
        columns={[
          { key: 'name', label: 'Название' },
          {
            key: 'type',
            label: 'Тип',
            render: (c) => (
              <Badge size="sm" variant="accent">
                {typeLabels[c.type] ?? c.type}
              </Badge>
            ),
          },
          {
            key: 'parentName',
            label: 'Родитель',
            render: (c) => c.parentName ?? '—',
          },
          {
            key: 'productCount',
            label: 'Товаров',
          },
          { key: 'sortOrder', label: 'Порядок' },
        ]}
        data={categories}
        keyExtractor={(c) => c.id}
        actions={(c) => (
          <div className="flex flex-wrap gap-2">
            <Button as="a" href={`/admin/categories/${c.id}/edit`} variant="ghost" size="sm">
              Изменить
            </Button>
            <DeleteCategoryButton id={c.id} productCount={c.productCount} />
          </div>
        )}
      />
    </div>
  );
}
