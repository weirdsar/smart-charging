import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { PLACEHOLDER_PRODUCT_IMAGE } from '@/lib/constants';
import { normalizeProductImageList } from '@/lib/catalog';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';
import type { CategoryType, FuelType } from '@prisma/client';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CATEGORY_CARDS = [
  {
    title: 'Портативные генераторы',
    subtitle: 'до 10 кВт · бензиновые и дизельные',
    priceHint: 'от 25 000 ₽',
    href: '/catalog/generators/portable',
    categoryType: 'GENERATORS_PORTABLE' as const,
  },
  {
    title: 'Промышленные генераторы',
    subtitle: 'от 10 кВт · дизельные и газовые',
    priceHint: 'от 150 000 ₽',
    href: '/catalog/generators/industrial',
    categoryType: 'GENERATORS_INDUSTRIAL' as const,
  },
  {
    title: 'Зарядные станции',
    subtitle: 'для электромобилей · Pandora',
    priceHint: 'от 65 000 ₽',
    href: '/catalog/charging-stations',
    categoryType: 'CHARGING_STATIONS' as const,
  },
] as const;

interface SerializedFeaturedProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  priceOld: number | null;
  shortDescription: string | null;
  images: string[];
  powerKw: number | null;
  fuelType: FuelType | null;
  hasAvr: boolean | null;
  inStock: boolean;
  categoryType: CategoryType;
}

function productHref(product: Pick<SerializedFeaturedProduct, 'slug' | 'categoryType'>): string {
  if (product.categoryType === 'CHARGING_STATIONS') {
    return `/catalog/charging-stations/${product.slug}`;
  }
  if (product.categoryType === 'GENERATORS_INDUSTRIAL') {
    return `/catalog/generators/industrial/${product.slug}`;
  }
  return `/catalog/generators/portable/${product.slug}`;
}

function powerLine(product: Pick<SerializedFeaturedProduct, 'powerKw' | 'fuelType' | 'categoryType'>): string {
  const kw = product.powerKw != null ? `${product.powerKw} кВт` : '';
  if (product.categoryType === 'CHARGING_STATIONS') {
    return kw ? `${kw} · зарядная станция` : 'Зарядная станция';
  }
  const fuel =
    product.fuelType === 'PETROL'
      ? 'бензиновый'
      : product.fuelType === 'DIESEL'
        ? 'дизельный'
        : product.fuelType === 'GAS'
          ? 'газовый'
          : '';
  return fuel ? `${kw} · ${fuel}` : kw;
}

function previewImageSrc(url: string | null | undefined): string {
  return url && url.trim().length > 0 ? url.trim() : PLACEHOLDER_PRODUCT_IMAGE;
}

export default async function CatalogPreview() {
  const [featuredIdRows, categoryCoverRows] = await Promise.all([
    prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM products
      WHERE published = true AND in_stock = true
      ORDER BY (price = 0) ASC, price ASC
      LIMIT 4
    `,
    Promise.all(
      CATEGORY_CARDS.map((cat) =>
        prisma.$queryRaw<Array<{ images: unknown }>>`
          SELECT p.images FROM products p
          INNER JOIN categories c ON c.id = p.category_id
          WHERE p.published = true
            AND p.in_stock = true
            AND c.type = ${cat.categoryType}::"CategoryType"
          ORDER BY (p.price = 0) ASC, p.price ASC
          LIMIT 1
        `.then((rows) => rows[0] ?? null)
      )
    ),
  ]);

  const featuredIds = featuredIdRows.map((r) => r.id);
  const productsUnordered = await prisma.product.findMany({
    where: { id: { in: featuredIds } },
    include: { category: { select: { type: true } } },
  });
  const byId = new Map(productsUnordered.map((p) => [p.id, p]));
  const products = featuredIds.map((id) => byId.get(id)).filter((p): p is NonNullable<typeof p> => p != null);

  const categoryCoverSrc = CATEGORY_CARDS.map((_, i) => {
    const row = categoryCoverRows[i];
    const first = row ? normalizeProductImageList(row.images as unknown)[0] : undefined;
    return previewImageSrc(first);
  });

  const serializedProducts: SerializedFeaturedProduct[] = products.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price.toNumber(),
    priceOld: p.priceOld?.toNumber() ?? null,
    shortDescription: p.shortDescription,
    images: normalizeProductImageList(p.images as unknown),
    powerKw: p.powerKw,
    fuelType: p.fuelType,
    hasAvr: p.hasAvr,
    inStock: p.inStock,
    categoryType: p.category?.type ?? 'GENERATORS_PORTABLE',
  }));

  return (
    <section className="bg-primary py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">Наш каталог</h2>
            <p className="mt-2 text-text-secondary">
              Электростанции и зарядные станции с доставкой и монтажом
            </p>
          </div>
          <Button
            as="a"
            href="/catalog"
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            rightIcon={<ArrowRight className="h-4 w-4" aria-hidden />}
          >
            Все товары
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_CARDS.map((cat, index) => {
            const coverSrc = categoryCoverSrc[index];
            return (
            <Card key={cat.href} padding="none" hover className="overflow-hidden">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-surface-light">
                {/* eslint-disable-next-line @next/next/no-img-element -- CDN + local placeholders */}
                <img
                  src={coverSrc}
                  alt={`${cat.title} — пример из каталога`}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  referrerPolicy={coverSrc.startsWith('http') ? 'no-referrer' : undefined}
                />
              </div>
              <div className="p-5">
                <h3 className="font-heading text-xl font-bold text-text-primary">{cat.title}</h3>
                <p className="mt-1 text-sm text-text-secondary">{cat.subtitle}</p>
                <p className="mt-3 font-bold text-accent">{cat.priceHint}</p>
                <Link
                  href={cat.href}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
                >
                  Смотреть каталог
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </Card>
            );
          })}
        </div>

        <h3 className="mb-6 mt-16 font-heading text-xl font-bold text-text-primary">Популярные товары</h3>

        <div className="flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible">
          {serializedProducts.map((product) => {
            const src = previewImageSrc(product.images[0]);
            return (
              <Link key={product.id} href={productHref(product)} className="block h-full min-w-[260px] shrink-0 lg:min-w-0">
                <Card padding="none" hover className="h-full overflow-hidden">
                  <div className="relative aspect-square w-full overflow-hidden rounded-t-lg bg-surface-light">
                    {/* eslint-disable-next-line @next/next/no-img-element -- CDN + local placeholders */}
                    <img
                      src={src}
                      alt={product.title}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      referrerPolicy={src.startsWith('http') ? 'no-referrer' : undefined}
                    />
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-2 h-10 text-sm font-medium text-text-primary">{product.title}</p>
                    <p className="mt-1 text-xs text-text-secondary">{powerLine(product)}</p>
                    {product.hasAvr === true ? (
                      <div className="mt-2">
                        <Badge variant="success" size="sm">
                          АВР
                        </Badge>
                      </div>
                    ) : null}
                    <div className="mt-3 flex items-center gap-2">
                      {product.priceOld != null ? (
                        <>
                          <span className="text-sm text-text-secondary line-through">
                            {formatPrice(product.priceOld)}
                          </span>
                          <span className="font-bold text-accent">{formatPrice(product.price)}</span>
                        </>
                      ) : (
                        <span className="font-bold text-accent">{formatPrice(product.price)}</span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
