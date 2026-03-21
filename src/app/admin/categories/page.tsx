import CategoriesListClient from './CategoriesListClient';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Категории | Админ' };

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      parent: { select: { name: true } },
      _count: { select: { products: true } },
    },
  });

  const serializedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    type: c.type,
    sortOrder: c.sortOrder,
    parentName: c.parent?.name ?? null,
    productCount: c._count.products,
  }));

  return <CategoriesListClient categories={serializedCategories} />;
}
