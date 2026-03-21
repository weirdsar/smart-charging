import ProductForm, { type ProductFormProduct } from '@/components/admin/ProductForm';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: { title: true },
  });
  if (!product) {
    return { title: 'Товар не найден | Админ' };
  }
  return { title: `${product.title} | Админ` };
}

export default async function EditProductPage({ params }: PageProps) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true, type: true },
  });

  const formProduct: ProductFormProduct = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    categoryId: product.categoryId,
    price: product.price.toNumber(),
    priceOld: product.priceOld?.toNumber() ?? null,
    shortDescription: product.shortDescription,
    description: product.description,
    specs: product.specs,
    images: product.images,
    powerKw: product.powerKw,
    fuelType: product.fuelType,
    hasAvr: product.hasAvr,
    noiseLevelDb: product.noiseLevelDb,
    connectorType: product.connectorType,
    purpose: product.purpose,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    published: product.published,
    inStock: product.inStock,
  };

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">
        Редактирование: {product.title}
      </h1>
      <ProductForm product={formProduct} categories={categories} />
    </div>
  );
}
