import { absoluteSiteUrl } from '@/lib/absolute-url';
import { prisma } from '@/lib/prisma';
import { generateCanonical } from '@/lib/seo';
import type { CategoryType } from '@prisma/client';
import type { Metadata } from 'next';

function catalogSegmentForCategory(type: CategoryType): string {
  if (type === 'GENERATORS_PORTABLE') return 'generators/portable';
  if (type === 'GENERATORS_INDUSTRIAL') return 'generators/industrial';
  return 'charging-stations';
}

export async function productPageMetadata(
  slug: string,
  categoryType: CategoryType
): Promise<Metadata> {
  const product = await prisma.product.findFirst({
    where: { slug, published: true, category: { type: categoryType } },
    include: { category: true },
  });

  if (!product) {
    return { title: 'Товар не найден | Умная зарядка — Саратов' };
  }

  const title =
    product.seoTitle ?? `${product.title} — купить в Саратове | Умная зарядка`;
  const description =
    product.seoDescription ?? product.shortDescription ?? product.title;
  const ogImage = product.images[0] ? absoluteSiteUrl(product.images[0]) : undefined;
  const canonicalPath = `/catalog/${catalogSegmentForCategory(product.category.type)}/${product.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: product.title,
      description: product.shortDescription ?? product.title,
      url: generateCanonical(canonicalPath),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}
