/**
 * Pandora (pandora-rs.ru) — Tilda Store JSON: product cards + gallery URLs.
 * Run: npx tsx scripts/parse-pandora-products.ts
 * Not for production or CI.
 */
import * as fs from 'fs';
import * as path from 'path';

const CATALOG_URL = 'https://pandora-rs.ru/catalog';
const TILDA_API = 'https://store.tildaapi.com/api/getproductslist/';

/** Chrome-like UA — plain curl gets 403 from Tilda. */
const FETCH_HEADERS: HeadersInit = {
  Accept: 'text/html,application/json,*/*',
  'Accept-Language': 'ru-RU,ru;q=0.9',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
};

export interface ProductImage {
  thumb: string;
  full: string;
}

export interface ParsedPandoraProduct {
  title: string;
  slug: string;
  pandoraUid: number;
  categoryType: 'CHARGING_STATIONS';
  price: number | null;
  priceOld: number | null;
  powerKw: number | null;
  connectorType: string | null;
  currentType: string | null;
  /** Human-readable use case for filters / admin */
  purpose: string;
  shortDescription: string;
  description: string;
  specs: Record<string, string>;
  images: ProductImage[];
  detailUrl: string;
  productUrl: string;
  inStock: boolean;
  published: boolean;
}

interface TildaProduct {
  uid: number;
  title: string;
  text: string;
  descr: string;
  price: string;
  priceold: string;
  gallery: string;
  url: string;
  sku?: string;
  characteristics?: { title: string; value: string }[];
  editions?: { img?: string }[];
}

interface TildaListResponse {
  products: TildaProduct[];
}

function stripTags(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePrice(text: string | null | undefined): number | null {
  if (!text) return null;
  const digits = text.replace(/[^\d.]/g, '').replace(/^\.+|\.+$/g, '');
  if (!digits) return null;
  const n = parseFloat(digits);
  return Number.isFinite(n) ? Math.round(n) : null;
}

/** Extract max numeric kW from strings like "1-11 кВт", "40 — 120 кВт", "60 кВт". */
function parsePowerKwFromBlob(blob: string): number | null {
  const normalized = blob.replace(/,/g, '.');
  const nums = normalized.match(/[\d]+(?:[.,]\d+)?/g);
  if (!nums?.length) return null;
  const values = nums.map((x) => parseFloat(x.replace(',', '.'))).filter((n) => Number.isFinite(n));
  if (values.length === 0) return null;
  return Math.max(...values);
}

function characteristicsMap(
  rows: { title: string; value: string }[] | undefined
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!rows) return out;
  for (const r of rows) {
    const k = r.title?.trim();
    const v = r.value?.trim();
    if (k && v) out[k] = v;
  }
  return out;
}

function slugFromPandoraUrl(productUrl: string): string | null {
  try {
    const u = new URL(productUrl);
    const last = u.pathname.replace(/\/$/, '').split('/').pop();
    if (!last) return null;
    const m = last.match(/^\d+-\d+-(.+)$/);
    if (m?.[1] && /^[a-zA-Z0-9_-]+$/.test(m[1])) {
      return m[1].toLowerCase();
    }
  } catch {
    /* ignore */
  }
  return null;
}

function fallbackSlug(title: string, uid: number): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72);
  return base || `pandora-${uid}`;
}

function parseGalleryJson(galleryRaw: string): ProductImage[] {
  if (!galleryRaw?.trim()) return [];
  try {
    const arr = JSON.parse(galleryRaw) as { img?: string }[];
    if (!Array.isArray(arr)) return [];
    const out: ProductImage[] = [];
    const seen = new Set<string>();
    for (const item of arr) {
      const url = item.img?.trim();
      if (!url || !/^https?:\/\//i.test(url)) continue;
      if (seen.has(url)) continue;
      seen.add(url);
      out.push({ thumb: url, full: url });
    }
    return out.slice(0, 12);
  } catch {
    return [];
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: FETCH_HEADERS });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.text();
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: FETCH_HEADERS });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json() as Promise<T>;
}

function extractProjectId(html: string): string | null {
  const m = html.match(/data-tilda-project-id="([0-9]+)"/);
  return m?.[1] ?? null;
}

function extractStorePartUids(html: string): string[] {
  const set = new Set<string>();
  const re = /storepart:'([0-9]+)'/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    set.add(m[1]);
  }
  return Array.from(set);
}

function purposeFromSignals(title: string, currentType: string | null, descriptionHtml: string): string {
  const blob = `${currentType ?? ''} ${title} ${descriptionHtml}`.toLowerCase();
  if (
    blob.includes('постоянн') ||
    /\bdc\b/.test(blob) ||
    /тока:\s*dc/i.test(descriptionHtml)
  ) {
    return 'DC, инфраструктура, трассы';
  }
  return 'AC, дом, бизнес, парковки';
}

function mapTildaProduct(p: TildaProduct): ParsedPandoraProduct {
  const charMap = characteristicsMap(p.characteristics);
  const currentType = charMap['Вид тока'] ?? null;
  const connectorType = charMap['Тип разъема'] ?? charMap['Тип разъёма'] ?? null;
  const powerBlob = [charMap['Мощность'], p.text, p.descr].filter(Boolean).join(' ');
  const powerKw = parsePowerKwFromBlob(powerBlob);

  const price = parsePrice(p.price);
  const priceOld = parsePrice(p.priceold);

  const textHtml = p.text?.trim() ? `<div class="pandora-text">${p.text}</div>` : '';
  const descrHtml = p.descr?.trim() ? `<div class="pandora-descr">${p.descr}</div>` : '';
  const detailUrl = p.url?.trim() || CATALOG_URL;
  const sourceLink = `<p><a href="${detailUrl}" target="_blank" rel="noopener noreferrer">Карточка товара на pandora-rs.ru</a></p>`;
  const description = `${textHtml}${descrHtml}${sourceLink}`;
  const purpose = purposeFromSignals(p.title, currentType, `${p.text ?? ''}${p.descr ?? ''}`);

  const plain = stripTags(`${p.descr || ''} ${p.text || ''}`);
  const shortDescription =
    plain.length > 15
      ? `${plain.slice(0, 220)}${plain.length > 220 ? '…' : ''}`
      : p.title;

  const specs: Record<string, string> = { ...charMap };
  specs.pandoraUid = String(p.uid);
  if (p.sku) specs.sku = p.sku;

  let images = parseGalleryJson(p.gallery);
  const editionImg = p.editions?.[0]?.img as string | undefined;
  if (images.length === 0 && editionImg) {
    images = [{ thumb: editionImg, full: editionImg }];
  }

  const slug = slugFromPandoraUrl(p.url) ?? fallbackSlug(p.title, p.uid);

  return {
    title: p.title.trim(),
    slug,
    pandoraUid: p.uid,
    categoryType: 'CHARGING_STATIONS',
    price,
    priceOld,
    powerKw,
    connectorType,
    currentType,
    purpose,
    shortDescription,
    description,
    specs,
    images,
    detailUrl,
    productUrl: detailUrl,
    inStock: true,
    published: true,
  };
}

async function main(): Promise<void> {
  console.log(`Fetching catalog ${CATALOG_URL}...`);
  const html = await fetchText(CATALOG_URL);
  const projectId = extractProjectId(html);
  const storeParts = extractStorePartUids(html);

  if (!projectId) {
    throw new Error('Could not find data-tilda-project-id on catalog page');
  }
  if (storeParts.length === 0) {
    throw new Error("Could not find storepart:'…' in catalog page HTML");
  }

  console.log(`Project ${projectId}, store parts: ${storeParts.join(', ')}`);

  const byUid = new Map<number, ParsedPandoraProduct>();

  for (const part of storeParts) {
    const url = `${TILDA_API}?projectid=${projectId}&storepartuid=${part}`;
    console.log(`\nGET ${url}`);
    await delay(400);
    const data = await fetchJson<TildaListResponse>(url);
    const list = data.products ?? [];
    console.log(`  → ${list.length} products`);
    for (const raw of list) {
      const mapped = mapTildaProduct(raw);
      byUid.set(mapped.pandoraUid, mapped);
    }
    await delay(400);
  }

  const products = Array.from(byUid.values());
  products.sort((a, b) => a.title.localeCompare(b.title, 'ru'));

  const outPath = path.join(process.cwd(), 'scripts', 'pandora-products-charging-stations.json');
  fs.writeFileSync(outPath, JSON.stringify(products, null, 2), 'utf8');
  console.log(`\n✅ Saved ${products.length} → ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
