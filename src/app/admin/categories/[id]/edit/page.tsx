import CategoryForm, { type CategoryFormCategory } from '@/components/admin/CategoryForm';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { id: params.id },
    select: { name: true },
  });
  if (!category) {
    return { title: 'Категория не найдена | Админ' };
  }
  return { title: `${category.name} | Админ` };
}

export default async function EditCategoryPage({ params }: PageProps) {
  const [category, categories] = await Promise.all([
    prisma.category.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  if (!category) {
    notFound();
  }

  const formCategory: CategoryFormCategory = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    type: category.type,
    parentId: category.parentId,
    sortOrder: category.sortOrder,
    seoTitle: category.seoTitle,
    seoDescription: category.seoDescription,
    seoContent: category.seoContent,
  };

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">
        Редактирование: {category.name}
      </h1>
      <CategoryForm category={formCategory} categories={categories} />
    </div>
  );
}
