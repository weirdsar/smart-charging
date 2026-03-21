import ProductsListClient from './ProductsListClient';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Товары | Админ',
};

interface SearchParams {
  page?: string;
  search?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1);
  const limit = 20;
  const search = typeof searchParams.search === 'string' ? searchParams.search.trim() : '';

  const where = search
    ? { title: { contains: search, mode: 'insensitive' as const } }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { category: { select: { name: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  const serializedProducts = products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price.toNumber(),
    published: p.published,
    inStock: p.inStock,
    categoryName: p.category?.name ?? '—',
  }));

  return (
    <ProductsListClient
      products={serializedProducts}
      total={total}
      currentPage={page}
      limit={limit}
    />
  );
}
