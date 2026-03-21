/**
 * Generates SVG placeholder images for products, projects, and blog covers.
 * Run from repo root: pnpm exec tsx scripts/generate-placeholder.ts
 */
import * as fs from 'fs';
import * as path from 'path';

const root = path.join(process.cwd(), 'public', 'images', 'placeholders');

const svgs: Record<string, string> = {
  'product.svg': `<svg width="600" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="600" fill="#111111"/>
  <rect x="40" y="40" width="520" height="520" rx="12" fill="#1a1a1a" stroke="#333" stroke-width="2"/>
  <text x="300" y="290" text-anchor="middle" fill="#666666" font-size="22" font-family="system-ui,sans-serif">Фото товара</text>
  <text x="300" y="330" text-anchor="middle" fill="#FF6B00" font-size="14" font-family="system-ui,sans-serif">TSS / Pandora</text>
</svg>`,
  'project.svg': `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#111111"/>
  <text x="600" y="320" text-anchor="middle" fill="#666666" font-size="28" font-family="system-ui,sans-serif">Фото проекта</text>
</svg>`,
  'blog.svg': `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#111111"/>
  <text x="600" y="320" text-anchor="middle" fill="#666666" font-size="28" font-family="system-ui,sans-serif">Обложка статьи</text>
</svg>`,
};

function main(): void {
  fs.mkdirSync(root, { recursive: true });
  for (const [name, svg] of Object.entries(svgs)) {
    const filepath = path.join(root, name);
    fs.writeFileSync(filepath, svg.trim(), 'utf8');
    console.log(`✅ Wrote ${path.relative(process.cwd(), filepath)}`);
  }
}

main();
