import CategoryForm from '@/components/admin/CategoryForm';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Новая категория | Админ' };

export default async function NewCategoryPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">Новая категория</h1>
      <CategoryForm categories={categories} />
    </div>
  );
}
