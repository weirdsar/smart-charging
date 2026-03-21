/**
 * One-off: listing + product detail pages — full image gallery, specs, description.
 * Run: npx tsx scripts/parse-tss-products.ts
 * Not for production or CI.
 */
import * as fs from 'fs';
import * as path from 'path';

const BASE = 'https://www.tss.ru';

const LISTINGS = {
  portable: `${BASE}/catalog/elektrostantsii/benzinovye_elektrostantsii/benzogeneratory/`,
  industrial: `${BASE}/catalog/elektrostantsii/dizelnye_elektrostantsii/tss_premium/`,
} as const;

export interface ProductImage {
  thumb: string;
  full: string;
}

export interface EnhancedParsedProduct {
  title: string;
  model: string | null;
  slug: string;
  categoryType: 'GENERATORS_PORTABLE' | 'GENERATORS_INDUSTRIAL';
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
  images: ProductImage[];
  detailUrl: string;
  productUrl: string;
  inStock: boolean;
  published: boolean;
}

const MARKER = '<div class="ajax_block_product new-grid"';

function extractBlocks(html: string): string[] {
  const parts = html.split(MARKER);
  const blocks: string[] = [];
  for (let i = 1; i < parts.length; i++) {
    const rest = parts[i];
    const next = rest.indexOf(MARKER, 1);
    const body = next === -1 ? rest : rest.slice(0, next);
    blocks.push(MARKER + body);
  }
  return blocks;
}

function absUrl(href: string): string {
  if (href.startsWith('http')) return href;
  return `${BASE}${href.startsWith('/') ? '' : '/'}${href}`;
}

function guessOriginalFromResize(src: string): string {
  const m = src.match(
    /\/upload\/resize_cache\/iblock\/([a-f0-9]+)\/[0-9_]+\/([^/]+\.(?:jpg|jpeg|png|webp))/i
  );
  if (m) {
    return `${BASE}/upload/iblock/${m[1]}/${m[2]}`;
  }
  if (src.startsWith('/upload/')) {
    return `${BASE}${src}`;
  }
  return absUrl(src);
}

function slugFromProductUrl(productUrl: string): string {
  try {
    const pathname = new URL(productUrl).pathname.replace(/\/$/, '');
    const seg = pathname.split('/').pop();
    if (seg && /^[a-zA-Z0-9_-]+$/.test(seg)) {
      return seg;
    }
  } catch {
    /* ignore */
  }
  return `tss-${Date.now()}`;
}

function parsePrice(text: string | null): number | null {
  if (!text) return null;
  const digits = text.replace(/[^\d]/g, '');
  if (!digits) return null;
  return parseInt(digits, 10);
}

function parsePowerKw(powerRaw: string | null): number | null {
  if (!powerRaw) return null;
  const normalized = powerRaw.replace(/\s/g, '').replace(',', '.');
  const m = normalized.match(/^([\d.]+)/);
  if (!m) return null;
  return parseFloat(m[1]);
}

function detectModel(title: string): string | null {
  const m = title.replace(/\s+/g, ' ').trim().match(/\b(TSS|ТСС|АД)[\s\-A-ZА-ЯЁ0-9]+/i);
  return m ? m[0].replace(/\s+/g, ' ').trim() : null;
}

interface ListingCard {
  title: string;
  productUrl: string;
  price: number | null;
  priceRaw: string | null;
  article: string | null;
  powerKw: number | null;
  powerRaw: string | null;
  imageThumb: string | null;
  listingSpecs: Record<string, string>;
}

function parseListingCard(html: string): ListingCard | null {
  const titleMatch = html.match(/<span class="grid-name">([^<]+)<\/span>/);
  const title = titleMatch?.[1]?.trim() ?? '';
  if (!title) return null;

  const imgMatch = html.match(/<img[^>]+class="[^"]*replace-2x[^"]*"[^>]+src="([^"]+)"/i);
  const imageThumb = imgMatch?.[1] ?? null;

  const linkMatch = html.match(/<a class="product_img_link"[^>]+href="([^"]+)"/i);
  if (!linkMatch?.[1]) return null;
  const productUrl = absUrl(linkMatch[1]);

  const priceMatch = html.match(/<span class="price product-price">\s*([^<]+)<\/span>/i);
  const priceRaw = priceMatch?.[1]?.trim() ?? null;
  const price = parsePrice(priceRaw);

  const articleMatch = html.match(/Артикул:\s*<b>([^<]+)<\/b>/i);
  const article = articleMatch?.[1]?.trim() ?? null;

  const powerMatch = html.match(/Основная мощность:\s*<b>([^<]+)<\/b>/i);
  const powerRaw = powerMatch?.[1]?.trim() ?? null;
  const powerKw = parsePowerKw(powerRaw);

  const listingSpecs: Record<string, string> = {};
  if (article) listingSpecs.article = article;
  if (powerRaw) listingSpecs.power = powerRaw;
  const voltMatch = html.match(/Напряжение[^:]*:\s*<b>([^<]+)<\/b>/i);
  if (voltMatch?.[1]) listingSpecs.voltage = voltMatch[1].trim();

  return {
    title,
    productUrl,
    price,
    priceRaw,
    article,
    powerKw,
    powerRaw,
    imageThumb: imageThumb ? absUrl(imageThumb) : null,
    listingSpecs,
  };
}

/** Collect gallery / iblock image URLs from product detail HTML. */
function extractImagesFromDetailHtml(html: string): ProductImage[] {
  const out: ProductImage[] = [];
  const seenFull = new Set<string>();

  const pushPair = (thumbSrc: string, fullSrc: string) => {
    const full = fullSrc.trim();
    if (!/\.(jpe?g|png|webp)$/i.test(full)) return;
    if (seenFull.has(full)) return;
    seenFull.add(full);
    const thumb = thumbSrc.trim();
    out.push({ thumb: thumb || full, full });
  };

  // Links to full-size files (gallery / fancybox)
  const hrefRe = /href="([^"]*\/upload\/[^"]*\.(?:jpe?g|png|webp))"/gi;
  let m: RegExpExecArray | null;
  while ((m = hrefRe.exec(html)) !== null) {
    const raw = m[1].replace(/&amp;/g, '&');
    const abs = raw.startsWith('http') ? raw : absUrl(raw);
    const full = abs.includes('resize_cache') ? guessOriginalFromResize(abs) : abs;
    pushPair(abs, full);
  }

  // img src iblock
  const srcRe = /src="([^"]*\/upload\/[^"]*\.(?:jpe?g|png|webp))"/gi;
  while ((m = srcRe.exec(html)) !== null) {
    const raw = m[1].replace(/&amp;/g, '&');
    const abs = raw.startsWith('http') ? raw : absUrl(raw);
    const full = guessOriginalFromResize(abs);
    pushPair(abs, full);
  }

  // data-src / data-big
  const dataRe = /(?:data-src|data-big|data-image)="([^"]*\/upload\/[^"]*\.(?:jpe?g|png|webp))"/gi;
  while ((m = dataRe.exec(html)) !== null) {
    const raw = m[1].replace(/&amp;/g, '&');
    const abs = raw.startsWith('http') ? raw : absUrl(raw);
    const full = guessOriginalFromResize(abs);
    pushPair(abs, full);
  }

  return out.slice(0, 12);
}

function stripTags(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractDescriptionHtml(html: string): string {
  const patterns = [
    /<div[^>]*class="[^"]*detail_text[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*class="[^"]*product-detail[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<div[^>]*itemprop="description"[^>]*>([\s\S]*?)<\/div>/i,
  ];
  for (const re of patterns) {
    const match = html.match(re);
    if (match?.[1] && stripTags(match[1]).length > 20) {
      return match[1].trim();
    }
  }
  return '';
}

function extractSpecsFromDetailHtml(html: string): Record<string, string> {
  const specs: Record<string, string> = {};
  const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
  if (!tableMatch) return specs;

  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let row: RegExpExecArray | null;
  while ((row = rowRe.exec(tableMatch[1])) !== null) {
    const cells = row[1].match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);
    if (!cells || cells.length < 2) continue;
    const key = stripTags(cells[0]);
    const value = stripTags(cells[1]);
    if (key && value && key.length < 120) {
      specs[key] = value;
    }
  }
  return specs;
}

function extractNoiseDb(specs: Record<string, string>, title: string): number | null {
  const blob = `${title} ${Object.values(specs).join(' ')}`;
  const noise = Object.entries(specs).find(
    ([k]) =>
      k.toLowerCase().includes('шум') ||
      k.toLowerCase().includes('звук') ||
      k.toLowerCase().includes('noise')
  );
  const fromSpec = noise?.[1]?.match(/(\d+)\s*дБ/i);
  if (fromSpec) return parseInt(fromSpec[1], 10);
  const fromTitle = blob.match(/(\d+)\s*дБ/i);
  if (fromTitle) return parseInt(fromTitle[1], 10);
  return null;
}

async function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; SmartChargingDev/1.0; +https://tts64.ru) AppleWebKit/537.36',
      Accept: 'text/html,application/xhtml+xml',
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.text();
}

interface PowerFilter {
  maxPowerKw?: number;
  minPowerKw?: number;
}

async function parseTssCategory(
  listingUrl: string,
  categoryType: 'GENERATORS_PORTABLE' | 'GENERATORS_INDUSTRIAL',
  fuelType: 'PETROL' | 'DIESEL' | 'UNKNOWN',
  powerFilter: PowerFilter
): Promise<EnhancedParsedProduct[]> {
  console.log(`\nFetching listing ${listingUrl}...`);
  const listHtml = await fetchHtml(listingUrl);
  const blocks = extractBlocks(listHtml);
  const products: EnhancedParsedProduct[] = [];
  let idx = 0;

  for (const block of blocks) {
    const card = parseListingCard(block);
    if (!card) continue;

    if (
      powerFilter.maxPowerKw != null &&
      card.powerKw != null &&
      card.powerKw > powerFilter.maxPowerKw
    ) {
      continue;
    }
    if (
      powerFilter.minPowerKw != null &&
      card.powerKw != null &&
      card.powerKw <= powerFilter.minPowerKw
    ) {
      continue;
    }

    idx += 1;
    const slug = slugFromProductUrl(card.productUrl);
    console.log(`  [${idx}] ${card.title}`);

    let images: ProductImage[] = [];
    let detailSpecs: Record<string, string> = {};
    let descriptionHtml = '';

    try {
      await delay(500);
      const detailHtml = await fetchHtml(card.productUrl);
      images = extractImagesFromDetailHtml(detailHtml);
      detailSpecs = extractSpecsFromDetailHtml(detailHtml);
      descriptionHtml = extractDescriptionHtml(detailHtml);
    } catch (e) {
      console.warn(`    ⚠️  Detail fetch failed:`, e);
    }

    if (images.length === 0 && card.imageThumb) {
      const full = guessOriginalFromResize(
        card.imageThumb.replace(/^https:\/\/www\.tss\.ru/, '') || card.imageThumb
      );
      images = [{ thumb: card.imageThumb, full }];
    }

    const specs: Record<string, string> = { ...card.listingSpecs, ...detailSpecs };

    const hasAvr =
      /АВР|AVR|автозапуск/i.test(card.title) ||
      Object.values(specs).some((v) => /АВР|AVR/i.test(v));

    const noiseLevelDb = extractNoiseDb(specs, card.title);

    const description =
      descriptionHtml ||
      `<p>${card.title}. Официальный дилер TSS в Саратове.</p><p>Артикул: ${card.article ?? '—'}.</p>`;

    const plain = stripTags(descriptionHtml || card.title);
    const shortDescription =
      plain.length > 10
        ? `${plain.slice(0, 220)}${plain.length > 220 ? '…' : ''}`
        : `${card.title}. ${card.powerKw != null ? `${card.powerKw} кВт` : ''}`.trim();

    products.push({
      title: card.title,
      model: detectModel(card.title),
      slug,
      categoryType,
      article: card.article,
      price: card.price,
      priceRaw: card.priceRaw,
      priceOld: null,
      powerKw: card.powerKw,
      powerRaw: card.powerRaw,
      fuelType,
      hasAvr,
      noiseLevelDb,
      shortDescription,
      description,
      specs,
      images,
      detailUrl: card.productUrl,
      productUrl: card.productUrl,
      inStock: true,
      published: true,
    });
  }

  return products;
}

async function main(): Promise<void> {
  const outDir = path.join(process.cwd(), 'scripts');

  const portable = await parseTssCategory(
    LISTINGS.portable,
    'GENERATORS_PORTABLE',
    'PETROL',
    { maxPowerKw: 10 }
  );
  fs.writeFileSync(
    path.join(outDir, 'tss-products-generators-portable.json'),
    JSON.stringify(portable, null, 2),
    'utf8'
  );
  console.log(`\n✅ Saved ${portable.length} → scripts/tss-products-generators-portable.json`);

  const industrial = await parseTssCategory(
    LISTINGS.industrial,
    'GENERATORS_INDUSTRIAL',
    'DIESEL',
    { minPowerKw: 10 }
  );
  fs.writeFileSync(
    path.join(outDir, 'tss-products-generators-industrial.json'),
    JSON.stringify(industrial, null, 2),
    'utf8'
  );
  console.log(`✅ Saved ${industrial.length} → scripts/tss-products-generators-industrial.json`);

  // Legacy filenames (same content shape for older tooling)
  fs.writeFileSync(
    path.join(outDir, 'tss-products-portable.json'),
    JSON.stringify(portable, null, 2),
    'utf8'
  );
  fs.writeFileSync(
    path.join(outDir, 'tss-products-industrial.json'),
    JSON.stringify(industrial, null, 2),
    'utf8'
  );
  console.log(`   (also wrote tss-products-portable.json / tss-products-industrial.json)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
