/**
 * Maps TSS catalog JSON (from scripts/parse-tss-products.ts) to Prisma product seed rows.
 * Supports legacy listing-only rows and enhanced rows (detail scrape: gallery, specs, HTML description).
 */
import { FuelType } from '@prisma/client';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export interface TssProductImage {
  thumb: string;
  full: string;
}

/** Listing-only JSON (older parser output). */
export interface TssJsonRowLegacy {
  title: string;
  model: string | null;
  article: string | null;
  price: number | null;
  priceRaw: string | null;
  powerKw: number | null;
  powerRaw: string | null;
  fuelType: 'PETROL' | 'DIESEL' | 'UNKNOWN';
  imageThumb: string | null;
  imageOriginalGuess: string | null;
  productUrl: string | null;
  specs: Record<string, string>;
}

/** Enhanced JSON: detail page scrape (gallery as { thumb, full }[], slug, descriptions). */
export interface TssJsonRowEnhanced {
  title: string;
  slug: string;
  model: string | null;
  article: string | null;
  price: number | null;
  priceRaw: string | null;
  priceOld: number | null;
  powerKw: number | null;
  powerRaw: string | null;
  fuelType: 'PETROL' | 'DIESEL' | 'UNKNOWN';
  hasAvr: boolean;
  noiseLevelDb: number | null;
  shortDescription: string;
  description: string;
  specs: Record<string, string>;
  images: TssProductImage[];
  detailUrl: string;
  productUrl: string;
}

export type TssJsonRow = TssJsonRowLegacy | TssJsonRowEnhanced;

function isEnhancedTssRow(row: TssJsonRow): row is TssJsonRowEnhanced {
  if (!('images' in row)) return false;
  const imgs = row.images;
  if (!Array.isArray(imgs) || imgs.length === 0) return false;
  const first = imgs[0];
  return (
    typeof first === 'object' &&
    first !== null &&
    'full' in first &&
    typeof (first as TssProductImage).full === 'string'
  );
}

export type SeedProductRow = {
  categoryId: string;
  title: string;
  slug: string;
  price: number;
  priceOld: number | null;
  inStock: boolean;
  description: string;
  shortDescription: string;
  specs: Record<string, string>;
  images: string[];
  hasAvr: boolean | null;
  fuelType: FuelType | null;
  powerKw: number | null;
  noiseLevelDb: number | null;
  connectorType: string | null;
  purpose: string | null;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
};

const PLACEHOLDER = '/images/placeholders/product.svg';

export function loadTssJsonList(relativePath: string): TssJsonRow[] {
  const filepath = join(process.cwd(), relativePath);
  if (!existsSync(filepath)) {
    console.warn(`⚠️  Missing ${relativePath} — run: npx tsx scripts/parse-tss-products.ts`);
    return [];
  }
  const raw = readFileSync(filepath, 'utf8');
  return JSON.parse(raw) as TssJsonRow[];
}

function slugFromRow(row: TssJsonRowLegacy): string {
  if (row.productUrl) {
    try {
      const pathname = new URL(row.productUrl).pathname.replace(/\/$/, '');
      const seg = pathname.split('/').pop();
      if (seg && /^[a-zA-Z0-9_-]+$/.test(seg)) {
        return seg;
      }
    } catch {
      /* ignore */
    }
  }
  if (row.article) {
    return `tss-article-${row.article}`;
  }
  const base = row.title
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  return base || `tss-${Date.now()}`;
}

function hasAvrFromTitle(title: string): boolean {
  return /АВР|AVR/i.test(title);
}

function fuelFromRow(row: TssJsonRowLegacy | TssJsonRowEnhanced): FuelType | null {
  if (row.fuelType === 'PETROL') return FuelType.PETROL;
  if (row.fuelType === 'DIESEL') return FuelType.DIESEL;
  return null;
}

function buildDescription(row: TssJsonRowLegacy): string {
  const link = row.productUrl
    ? `<p><a href="${row.productUrl}" target="_blank" rel="noopener noreferrer">Карточка товара на сайте производителя (tss.ru)</a></p>`
    : '';
  const art = row.article ? `<p>Артикул: ${row.article}.</p>` : '';
  const priceNote =
    row.price == null
      ? '<p>Цена по запросу — уточняйте у менеджера.</p>'
      : '<p>Цена ориентировочная по данным каталога; итоговая стоимость с монтажом — по запросу.</p>';
  return `<p>${row.title}. Официальный дилер TSS в Саратове.</p>${art}${priceNote}${link}`;
}

function mapEnhancedRowToSeedProduct(row: TssJsonRowEnhanced, categoryId: string): SeedProductRow {
  const price = row.price ?? 0;
  const powerKw = row.powerKw ?? null;
  const article = row.article ?? '';

  const specs: Record<string, string> = {};
  for (const [k, v] of Object.entries(row.specs ?? {})) {
    specs[k] = String(v);
  }
  if (row.detailUrl) specs.sourceUrl = row.detailUrl;

  const urls = row.images.map((im) => im.full).filter(Boolean);
  const images = urls.length > 0 ? urls : [PLACEHOLDER];

  const shortDescription =
    row.shortDescription ||
    [powerKw != null ? `${powerKw} кВт` : '', article ? `арт. ${article}` : '']
      .filter(Boolean)
      .join(' · ') ||
    row.title.slice(0, 120);

  const seoDescription =
    `${row.title}. ${powerKw != null ? `Мощность ${powerKw} кВт. ` : ''}` +
    `Продажа и монтаж в Саратове. Официальный дилер TSS.`.slice(0, 160);

  const seoTitle = `${row.title} | Умная зарядка — Саратов`.slice(0, 120);

  return {
    categoryId,
    title: row.title,
    slug: row.slug,
    price,
    priceOld: row.priceOld ?? null,
    inStock: true,
    description: row.description,
    shortDescription,
    specs,
    images,
    hasAvr: row.hasAvr,
    fuelType: fuelFromRow(row),
    powerKw,
    noiseLevelDb: row.noiseLevelDb,
    connectorType: null,
    purpose: row.fuelType === 'DIESEL' ? 'Промышленность, резерв, инфраструктура' : 'Дом, дача, объект',
    seoTitle,
    seoDescription,
    published: true,
  };
}

export function mapTssRowToSeedProduct(row: TssJsonRow, categoryId: string): SeedProductRow {
  if (isEnhancedTssRow(row)) {
    return mapEnhancedRowToSeedProduct(row, categoryId);
  }

  const slug = slugFromRow(row);
  const price = row.price ?? 0;
  const powerKw = row.powerKw ?? null;
  const article = row.article ?? '';

  const specs: Record<string, string> = {};
  for (const [k, v] of Object.entries(row.specs ?? {})) {
    specs[k] = String(v);
  }
  if (row.productUrl) specs.sourceUrl = row.productUrl;

  const img = row.imageOriginalGuess || row.imageThumb;
  const images = img ? [img] : [PLACEHOLDER];

  const shortParts: string[] = [];
  if (powerKw != null) shortParts.push(`${powerKw} кВт`);
  if (article) shortParts.push(`арт. ${article}`);
  const shortDescription = shortParts.join(' · ') || row.title.slice(0, 120);

  const seoDescription =
    `${row.title}. ${powerKw != null ? `Мощность ${powerKw} кВт. ` : ''}` +
    `Продажа и монтаж в Саратове. Официальный дилер TSS.`.slice(0, 160);

  const seoTitle = `${row.title} | Умная зарядка — Саратов`.slice(0, 120);

  return {
    categoryId,
    title: row.title,
    slug,
    price,
    priceOld: null,
    inStock: true,
    description: buildDescription(row),
    shortDescription,
    specs,
    images,
    hasAvr: hasAvrFromTitle(row.title),
    fuelType: fuelFromRow(row),
    powerKw,
    noiseLevelDb: null,
    connectorType: null,
    purpose: row.fuelType === 'DIESEL' ? 'Промышленность, резерв, инфраструктура' : 'Дом, дача, объект',
    seoTitle,
    seoDescription,
    published: true,
  };
}

export function mapTssListToSeedProducts(
  rows: TssJsonRow[],
  categoryId: string
): SeedProductRow[] {
  const seen = new Set<string>();
  const out: SeedProductRow[] = [];
  for (const row of rows) {
    const p = mapTssRowToSeedProduct(row, categoryId);
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
