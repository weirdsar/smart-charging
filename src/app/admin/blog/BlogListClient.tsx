'use client';

import DeleteBlogPostButton from '@/components/admin/DeleteBlogPostButton';
import PaginationWrapper from '@/components/admin/PaginationWrapper';
import DataTable from '@/components/admin/DataTable';
import { Badge, Button } from '@/components/ui';
import { Edit, Plus } from 'lucide-react';
import { Suspense } from 'react';

interface BlogRow {
  id: string;
  title: string;
  slug: string;
  published: boolean;
}

interface BlogListClientProps {
  posts: BlogRow[];
  total: number;
  currentPage: number;
  limit: number;
}

export default function BlogListClient({ posts, total, currentPage, limit }: BlogListClientProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-2xl font-bold text-text-primary">Блог</h1>
          <Badge variant="default">{total}</Badge>
        </div>
        <Button
          as="a"
          href="/admin/blog/new"
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" aria-hidden />}
        >
          Новая статья
        </Button>
      </div>

      <DataTable
        columns={[
          { key: 'title', label: 'Заголовок' },
          { key: 'slug', label: 'Slug' },
          {
            key: 'published',
            label: 'Статус',
            render: (p) => (
              <Badge variant={p.published ? 'success' : 'default'}>
                {p.published ? 'Опубликована' : 'Черновик'}
              </Badge>
            ),
          },
        ]}
        data={posts}
        keyExtractor={(p) => p.id}
        actions={(p) => (
          <div className="flex flex-wrap gap-2">
            <Button
              as="a"
              href={`/admin/blog/${p.id}/edit`}
              variant="ghost"
              size="sm"
              leftIcon={<Edit className="h-3.5 w-3.5" aria-hidden />}
            >
              Изменить
            </Button>
            <DeleteBlogPostButton id={p.id} />
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
