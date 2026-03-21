/**
 * Downloads full-size images from enhanced TSS JSON into public/images/products/.
 * Updates JSON files with local { thumb, full } paths (both point to local file).
 * Run after: npx tsx scripts/parse-tss-products.ts
 * Run: npx tsx scripts/download-tss-images.ts
 */
import * as fs from 'fs/promises';
import * as path from 'path';

interface ProductImage {
  thumb: string;
  full: string;
}

interface ProductRow {
  slug: string;
  categoryType: string;
  images: ProductImage[];
}

const FILES: { path: string; folder: string }[] = [
  {
    path: 'scripts/tss-products-generators-portable.json',
    folder: 'generators/portable',
  },
  {
    path: 'scripts/tss-products-generators-industrial.json',
    folder: 'generators/industrial',
  },
];

function safeFilename(slug: string, index: number, ext: string): string {
  const base = slug.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 80);
  return `${base}-${index + 1}${ext}`;
}

async function downloadImage(url: string, filepath: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; SmartChargingDev/1.0) AppleWebKit/537.36',
      },
    });
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
  subFolder: string
): Promise<{ downloaded: number; skipped: number }> {
  const products = await loadJson(filePath);
  if (products.length === 0) {
    console.log(`⏭️  Skip ${filePath} (empty or missing)`);
    return { downloaded: 0, skipped: 0 };
  }

  console.log(`\n📦 ${filePath} — ${products.length} products`);

  let downloaded = 0;
  let skipped = 0;

  for (const product of products) {
    const publicDir = path.join(process.cwd(), 'public', 'images', 'products', subFolder);
    const localPaths: ProductImage[] = [];

    for (let i = 0; i < product.images.length; i++) {
      const image = product.images[i];
      const url = image.full || image.thumb;
      if (!url || url.startsWith('/images/')) {
        localPaths.push(image);
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
          localPaths.push({ thumb: webPath, full: webPath });
          skipped += 1;
          continue;
        }
      } catch {
        /* continue download */
      }

      const ok = await downloadImage(url, filepath);
      if (ok) {
        downloaded += 1;
        localPaths.push({ thumb: webPath, full: webPath });
      }
      await new Promise((r) => setTimeout(r, 300));
    }

    product.images = localPaths;
  }

  await saveJson(filePath, products);
  return { downloaded, skipped };
}

async function main(): Promise<void> {
  let totalDown = 0;
  let totalSkip = 0;

  for (const { path: filePath, folder } of FILES) {
    const r = await processFile(filePath, folder);
    totalDown += r.downloaded;
    totalSkip += r.skipped;
  }

  console.log(`\n✅ Done. Downloaded: ${totalDown}, skipped/existing: ${totalSkip}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
