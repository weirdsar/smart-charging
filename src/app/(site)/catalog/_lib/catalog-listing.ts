import { productToCatalogItem } from '@/lib/catalog';
import { prisma } from '@/lib/prisma';
import type { CategoryType, Prisma } from '@prisma/client';

export interface CatalogSearchParams {
  page?: string;
  search?: string;
  sort?: string;
  avr?: string;
}

export async function getCategoryListing(
  categoryType: CategoryType,
  searchParams: CatalogSearchParams
) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1);
  const limit = 12;
  const search = searchParams.search?.trim() ?? '';
  const sort = searchParams.sort ?? '';
  const avrFilter = searchParams.avr === 'true';

  const category = await prisma.category.findFirst({
    where: { type: categoryType },
  });

  if (!category) {
    return null;
  }

  const where: Prisma.ProductWhereInput = {
    categoryId: category.id,
    published: true,
    ...(search ? { title: { contains: search, mode: 'insensitive' as const } } : {}),
    ...(avrFilter ? { hasAvr: true } : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput = (() => {
    switch (sort) {
      case 'price_asc':
        return { price: 'asc' };
      case 'price_desc':
        return { price: 'desc' };
      case 'power_desc':
        return { powerKw: 'desc' };
      default:
        return { createdAt: 'desc' };
    }
  })();

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    category,
    products: rows.map(productToCatalogItem),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
