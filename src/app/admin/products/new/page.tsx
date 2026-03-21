import ProductForm from '@/components/admin/ProductForm';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Новый товар | Админ' };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true, type: true },
  });

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">Новый товар</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
