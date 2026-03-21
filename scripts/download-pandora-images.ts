/**
 * Downloads images from pandora-products JSON into public/images/products/charging-stations/.
 * Run after: npx tsx scripts/parse-pandora-products.ts
 * Run: npx tsx scripts/download-pandora-images.ts
 *
 * By default does NOT rewrite JSON paths — `public/images/products/*` is gitignored, so
 * committed JSON must keep https://static.tildacdn.com/... URLs for seed/catalog to work
 * after clone. To rewrite JSON to local `/images/...` paths (optional dev): --rewrite-json
 */
import * as fs from 'fs/promises';
import * as path from 'path';

interface ProductImage {
  thumb: string;
  full: string;
}

interface ProductRow {
  slug: string;
  images: ProductImage[];
}

const FILE = 'scripts/pandora-products-charging-stations.json';
const SUBFOLDER = 'charging-stations';

const FETCH_HEADERS: HeadersInit = {
  Accept: 'image/*,*/*',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
};

function safeFilename(slug: string, index: number, ext: string): string {
  const base = slug.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80);
  return `${base}-${index + 1}${ext}`;
}

async function downloadImage(url: string, filepath: string): Promise<boolean> {
  try {
    const response = await fetch(url, { headers: FETCH_HEADERS });
    if (!response.ok) {
      console.error(`  ❌ HTTP ${response.status} ${url}`);
      return false;
    }
    const buf = Buffer.from(await response.arrayBuffer());
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, buf);
    console.log(`  ✅ ${path.basename(filepath)}`);
    return true;
  } catch (e) {
    console.error(`  ❌ ${url}`, e);
    return false;
  }
}

async function loadJson(filePath: string): Promise<ProductRow[]> {
  const full = path.join(process.cwd(), filePath);
  try {
    const raw = await fs.readFile(full, 'utf8');
    return JSON.parse(raw) as ProductRow[];
  } catch {
    return [];
  }
}

async function saveJson(filePath: string, data: ProductRow[]): Promise<void> {
  const full = path.join(process.cwd(), filePath);
  await fs.writeFile(full, JSON.stringify(data, null, 2), 'utf8');
}

async function processFile(
  filePath: string,
  subFolder: string,
  rewriteJson: boolean
): Promise<{ downloaded: number; skipped: number }> {
  const products = await loadJson(filePath);
  if (products.length === 0) {
    console.log(`⏭️  Skip ${filePath} (empty or missing)`);
    return { downloaded: 0, skipped: 0 };
  }

  console.log(`\n📦 ${filePath} — ${products.length} products`);
  if (!rewriteJson) {
    console.log('   (CDN URLs kept in JSON — use --rewrite-json to replace with local paths)');
  }

  let downloaded = 0;
  let skipped = 0;

  for (const product of products) {
    const publicDir = path.join(process.cwd(), 'public', 'images', 'products', subFolder);
    const localPaths: ProductImage[] = [];

    for (let i = 0; i < product.images.length; i++) {
      const image = product.images[i];
      const url = image.full || image.thumb;
      if (!url || url.startsWith('/images/')) {
        if (rewriteJson) {
          localPaths.push(image);
        }
        if (url?.startsWith('/images/')) skipped += 1;
        continue;
      }

      let ext = '.jpg';
      try {
        const p = new URL(url).pathname;
        const e = path.extname(p);
        if (e && e.length <= 5) ext = e;
      } catch {
        /* keep .jpg */
      }

      const filename = safeFilename(product.slug, i, ext);
      const filepath = path.join(publicDir, filename);
      const webPath = `/images/products/${subFolder}/${filename}`;

      try {
        const exists = await fs
          .access(filepath)
          .then(() => true)
          .catch(() => false);
        if (exists) {
          console.log(`  ⏭️  ${filename} (exists)`);
          if (rewriteJson) {
            localPaths.push({ thumb: webPath, full: webPath });
          }
          skipped += 1;
          continue;
        }
      } catch {
        /* continue download */
      }

      const ok = await downloadImage(url, filepath);
      if (ok) {
        downloaded += 1;
        if (rewriteJson) {
          localPaths.push({ thumb: webPath, full: webPath });
        }
      }
      await new Promise((r) => setTimeout(r, 300));
    }

    if (rewriteJson) {
      product.images = localPaths;
    }
  }

  if (rewriteJson) {
    await saveJson(filePath, products);
  }

  return { downloaded, skipped };
}

async function main(): Promise<void> {
  const rewriteJson =
    process.argv.includes('--rewrite-json') || process.env.PANDORA_IMAGES_REWRITE_JSON === '1';
  const r = await processFile(FILE, SUBFOLDER, rewriteJson);
  console.log(`\n✅ Done. Downloaded: ${r.downloaded}, skipped/existing: ${r.skipped}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
