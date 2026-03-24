import { productToCatalogItem } from '@/lib/catalog';
import { prisma } from '@/lib/prisma';
import { Prisma, type CategoryType, type Product } from '@prisma/client';

export interface CatalogSearchParams {
  page?: string;
  search?: string;
  sort?: string;
  avr?: string;
}

function buildWhereSql(
  categoryId: string,
  search: string,
  avrFilter: boolean
): Prisma.Sql {
  const parts: Prisma.Sql[] = [
    Prisma.sql`category_id = ${categoryId}`,
    Prisma.sql`published = true`,
  ];
  if (search) {
    parts.push(Prisma.sql`title ILIKE ${'%' + search + '%'}`);
  }
  if (avrFilter) {
    parts.push(Prisma.sql`has_avr = true`);
  }
  return Prisma.join(parts, ' AND ');
}

function orderSql(sort: string): Prisma.Sql {
  switch (sort) {
    case 'price_desc':
      return Prisma.sql`ORDER BY (price = 0) ASC, price DESC`;
    case 'power_desc':
      return Prisma.sql`ORDER BY power_kw DESC NULLS LAST`;
    default:
      return Prisma.sql`ORDER BY (price = 0) ASC, price ASC`;
  }
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

  const whereSql = buildWhereSql(category.id, search, avrFilter);
  const order = orderSql(sort);
  const offset = (page - 1) * limit;

  const [idRows, total] = await Promise.all([
    prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM products
      WHERE ${whereSql}
      ${order}
      LIMIT ${limit} OFFSET ${offset}
    `,
    prisma.product.count({ where }),
  ]);

  const ids = idRows.map((r) => r.id);
  const rowsUnordered = await prisma.product.findMany({
    where: { id: { in: ids } },
  });
  const byId = new Map(rowsUnordered.map((p) => [p.id, p]));
  const rows: Product[] = ids.map((id) => byId.get(id)).filter((p): p is Product => p != null);

  return {
    category,
    products: rows.map(productToCatalogItem),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
