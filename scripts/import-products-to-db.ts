/**
 * Import products from enhanced TSS JSON (optional one-off).
 * Requires DATABASE_URL. Skips slugs that already exist.
 * Run: npx tsx scripts/import-products-to-db.ts
 */
import { Prisma, PrismaClient, CategoryType, FuelType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ProductImage {
  thumb: string;
  full: string;
}

interface ProductJSON {
  title: string;
  slug: string;
  categoryType: 'GENERATORS_PORTABLE' | 'GENERATORS_INDUSTRIAL' | 'CHARGING_STATIONS';
  price: number | null;
  priceOld: number | null;
  powerKw: number | null;
  fuelType?: 'PETROL' | 'DIESEL' | 'GAS' | 'UNKNOWN';
  hasAvr?: boolean;
  noiseLevelDb?: number | null;
  connectorType?: string | null;
  purpose?: string | null;
  shortDescription: string;
  description: string;
  specs: Record<string, string>;
  images: ProductImage[];
  inStock: boolean;
  published: boolean;
}

const FILES = [
  'scripts/tss-products-generators-portable.json',
  'scripts/tss-products-generators-industrial.json',
  'scripts/pandora-products-charging-stations.json',
];

function mapFuel(f: NonNullable<ProductJSON['fuelType']>): FuelType | null {
  if (f === 'PETROL') return FuelType.PETROL;
  if (f === 'DIESEL') return FuelType.DIESEL;
  if (f === 'GAS') return FuelType.GAS;
  return null;
}

async function importProducts(): Promise<void> {
  let imported = 0;
  let skipped = 0;

  for (const file of FILES) {
    const full = path.join(process.cwd(), file);
    if (!fs.existsSync(full)) {
      console.log(`⏭️  Skip ${file} (not found)`);
      continue;
    }

    const products = JSON.parse(fs.readFileSync(full, 'utf8')) as ProductJSON[];
    console.log(`\n📦 ${file} (${products.length} rows)`);

    for (const product of products) {
      const category = await prisma.category.findFirst({
        where: { type: product.categoryType as CategoryType },
      });

      if (!category) {
        console.error(`❌ Category ${product.categoryType} not found`);
        skipped += 1;
        continue;
      }

      const existing = await prisma.product.findUnique({
        where: { slug: product.slug },
      });

      if (existing) {
        console.log(`⏭️  ${product.slug}`);
        skipped += 1;
        continue;
      }

      const imageUrls = product.images.map((im) => im.full).filter(Boolean);
      const images =
        imageUrls.length > 0 ? imageUrls : ['/images/placeholders/product.svg'];

      const seoTitle = `${product.title} — купить в Саратове | Умная зарядка`.slice(0, 120);
      const isCharging = product.categoryType === 'CHARGING_STATIONS';
      const seoDescription = `${product.shortDescription} Официальный дилер ${isCharging ? 'Pandora' : 'TSS'}. Доставка и монтаж.`.slice(
        0,
        160
      );

      await prisma.product.create({
        data: {
          title: product.title,
          slug: product.slug,
          categoryId: category.id,
          price: new Prisma.Decimal(product.price ?? 0),
          priceOld:
            product.priceOld != null ? new Prisma.Decimal(product.priceOld) : null,
          shortDescription: product.shortDescription,
          description: product.description,
          specs: product.specs,
          images,
          powerKw: product.powerKw,
          fuelType: mapFuel(product.fuelType ?? 'UNKNOWN'),
          hasAvr: product.hasAvr ?? null,
          noiseLevelDb: product.noiseLevelDb ?? null,
          connectorType: product.connectorType ?? null,
          purpose: product.purpose ?? null,
          inStock: product.inStock,
          published: product.published,
          seoTitle,
          seoDescription,
        },
      });

      console.log(`✅ ${product.title}`);
      imported += 1;
    }
  }

  console.log(`\n✅ Import finished. Imported: ${imported}, skipped: ${skipped}`);
}

importProducts()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
