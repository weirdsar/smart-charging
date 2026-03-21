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
  return productPageMetadata(params.slug, 'CHARGING_STATIONS');
}

export const revalidate = 3600;
export const dynamic = 'force-dynamic';

export default async function ChargingProductPage({ params }: Props) {
  const product = await prisma.product.findFirst({
    where: {
      slug: params.slug,
      published: true,
      category: { type: 'CHARGING_STATIONS' },
    },
    include: { category: true },
  });

  if (!product) {
    notFound();
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/catalog' },
    { label: product.category.name, href: '/catalog/charging-stations' },
    { label: product.title },
  ];

  return <ProductDetailView product={product} breadcrumbs={breadcrumbs} />;
}
