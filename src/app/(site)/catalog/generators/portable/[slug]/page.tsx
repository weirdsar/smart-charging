import ProductDetailView from '@/components/catalog/ProductDetailView';
import type { BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { productPageMetadata } from '@/lib/product-detail-meta';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return productPageMetadata(params.slug, 'GENERATORS_PORTABLE');
}

export const revalidate = 3600;
export const dynamic = 'force-dynamic';

export default async function PortableProductPage({ params }: Props) {
  const product = await prisma.product.findFirst({
    where: {
      slug: params.slug,
      published: true,
      category: { type: 'GENERATORS_PORTABLE' },
    },
    include: { category: true },
  });

  if (!product) {
    notFound();
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/catalog' },
    { label: 'Генераторы', href: '/catalog/generators' },
    { label: product.category.name, href: '/catalog/generators/portable' },
    { label: product.title },
  ];

  return <ProductDetailView product={product} breadcrumbs={breadcrumbs} />;
}
