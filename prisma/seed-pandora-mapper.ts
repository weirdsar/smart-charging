/**
 * Maps Pandora Tilda JSON (from scripts/parse-pandora-products.ts) to Prisma seed rows.
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { SeedProductRow } from './seed-tss-mapper';

export interface PandoraJsonRow {
  title: string;
  slug: string;
  pandoraUid: number;
  categoryType: 'CHARGING_STATIONS';
  price: number | null;
  priceOld: number | null;
  powerKw: number | null;
  connectorType: string | null;
  currentType: string | null;
  purpose: string;
  shortDescription: string;
  description: string;
  specs: Record<string, string>;
  images: { thumb: string; full: string }[];
  detailUrl: string;
  productUrl: string;
  inStock: boolean;
  published: boolean;
}

const PLACEHOLDER = '/images/placeholders/product.svg';

export function loadPandoraJsonList(relativePath: string): PandoraJsonRow[] {
  const filepath = join(process.cwd(), relativePath);
  if (!existsSync(filepath)) {
    console.warn(`⚠️  Missing ${relativePath} — run: npx tsx scripts/parse-pandora-products.ts`);
    return [];
  }
  const raw = readFileSync(filepath, 'utf8');
  return JSON.parse(raw) as PandoraJsonRow[];
}

export function mapPandoraRowToSeedProduct(row: PandoraJsonRow, categoryId: string): SeedProductRow {
  const price = row.price ?? 0;
  const urls = row.images.map((im) => im.full).filter(Boolean);
  const images = urls.length > 0 ? urls : [PLACEHOLDER];

  const seoDescription =
    `${row.shortDescription} Официальный дилер Pandora. Доставка и монтаж.`.slice(0, 160);
  const seoTitle = `${row.title} — купить в Саратове | Умная зарядка`.slice(0, 120);

  return {
    categoryId,
    title: row.title,
    slug: row.slug,
    price,
    priceOld: row.priceOld ?? null,
    inStock: row.inStock,
    description: row.description,
    shortDescription: row.shortDescription,
    specs: row.specs,
    images,
    hasAvr: null,
    fuelType: null,
    powerKw: row.powerKw,
    noiseLevelDb: null,
    connectorType: row.connectorType,
    purpose: row.purpose,
    seoTitle,
    seoDescription,
    published: row.published,
  };
}

export function mapPandoraListToSeedProducts(
  rows: PandoraJsonRow[],
  categoryId: string
): SeedProductRow[] {
  const seen = new Set<string>();
  const out: SeedProductRow[] = [];
  for (const row of rows) {
    const p = mapPandoraRowToSeedProduct(row, categoryId);
    let slug = p.slug;
    let n = 0;
    while (seen.has(slug)) {
      n += 1;
      slug = `${p.slug}-${n}`;
    }
    seen.add(slug);
    out.push({ ...p, slug });
  }
  return out;
}
