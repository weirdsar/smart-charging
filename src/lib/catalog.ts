import type { Product } from '@prisma/client';
import type { IProduct } from '@/types';

/**
 * Normalize `images` for catalog cards (string[] of URLs).
 * Handles legacy or hand-edited rows where entries are `{ thumb, full }` objects.
 */
export function normalizeProductImageList(raw: unknown): string[] {
  if (raw == null) return [];
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item === 'string') {
      const s = item.trim();
      if (s) out.push(s);
      continue;
    }
    if (item && typeof item === 'object') {
      const o = item as Record<string, unknown>;
      const full = o.full;
      const thumb = o.thumb;
      if (typeof full === 'string' && full.trim()) {
        out.push(full.trim());
      } else if (typeof thumb === 'string' && thumb.trim()) {
        out.push(thumb.trim());
      }
    }
  }
  return out;
}

/** Serialize Prisma `Product` for catalog grid / cards (plain numbers for client components). */
export function productToCatalogItem(product: Product): IProduct {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    price: product.price.toNumber(),
    priceOld: product.priceOld?.toNumber() ?? null,
    categoryId: product.categoryId,
    published: product.published,
    shortDescription: product.shortDescription ?? undefined,
    images: normalizeProductImageList(product.images as unknown),
    powerKw: product.powerKw,
    fuelType: product.fuelType,
    hasAvr: product.hasAvr,
    inStock: product.inStock,
  };
}
