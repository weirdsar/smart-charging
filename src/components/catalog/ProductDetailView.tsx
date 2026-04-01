import CompareButton from '@/components/catalog/CompareButton';
import ProductGallery from '@/components/catalog/ProductGallery';
import ProductLeadActions from '@/components/catalog/ProductLeadActions';
import ProductSpecs from '@/components/catalog/ProductSpecs';
import Breadcrumbs, { type BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { Badge } from '@/components/ui';
import { absoluteSiteUrl } from '@/lib/absolute-url';
import { normalizeProductImageList } from '@/lib/catalog';
import { sanitizeHtml } from '@/lib/sanitize';
import { formatPrice } from '@/lib/utils';
import type { Category, Product } from '@prisma/client';

interface ProductDetailViewProps {
  product: Product & { category: Category };
  breadcrumbs: BreadcrumbItem[];
}

function toSpecsRecord(specs: Product['specs']): Record<string, unknown> | null {
  if (typeof specs === 'object' && specs !== null && !Array.isArray(specs)) {
    return specs as Record<string, unknown>;
  }
  return null;
}

export default function ProductDetailView({ product, breadcrumbs }: ProductDetailViewProps) {
  const specs = toSpecsRecord(product.specs);
  const galleryImages = normalizeProductImageList(product.images as unknown);
  const ogImage =
    galleryImages.length > 0 ? absoluteSiteUrl(galleryImages[0]) : undefined;
  const priceNum = product.price.toNumber();
  const priceOnRequest = priceNum === 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.shortDescription ?? product.title,
    image: ogImage ? [ogImage] : undefined,
    offers: {
      '@type': 'Offer',
      ...(priceOnRequest
        ? {
            description: 'Цена по запросу',
            priceCurrency: 'RUB',
          }
        : {
            price: priceNum,
            priceCurrency: 'RUB',
          }),
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs items={breadcrumbs} />

      <div className="mt-6 lg:grid lg:grid-cols-2 lg:gap-12">
        <div>
          <ProductGallery images={galleryImages} title={product.title} />
        </div>

        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {!product.inStock ? <Badge variant="error">Нет в наличии</Badge> : null}
            {product.hasAvr ? <Badge variant="success">АВР</Badge> : null}
            {product.priceOld && !priceOnRequest ? <Badge variant="warning">Скидка</Badge> : null}
          </div>

          <h1 className="mb-4 font-heading text-3xl font-bold text-text-primary">{product.title}</h1>

          {product.shortDescription ? (
            <p className="mb-6 text-text-secondary">{product.shortDescription}</p>
          ) : null}

          {priceOnRequest ? (
            <p className="mb-8 text-3xl font-bold text-accent">Цена по запросу</p>
          ) : (
            <div className="mb-8 flex flex-wrap items-baseline gap-3">
              {product.priceOld ? (
                <span className="text-xl text-text-secondary line-through">
                  {formatPrice(product.priceOld.toNumber())}
                </span>
              ) : null}
              <span className="text-3xl font-bold text-accent">{formatPrice(priceNum)}</span>
            </div>
          )}

          <ProductLeadActions productId={product.id} />

          <div className="mt-4">
            <CompareButton productId={product.id} />
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-4 font-heading text-2xl font-bold text-text-primary">Описание</h2>
        <div
          className="prose prose-invert max-w-none text-text-secondary prose-headings:font-heading prose-headings:text-text-primary"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
        />
      </div>

      {specs && Object.keys(specs).length > 0 ? (
        <div className="mt-12">
          <h2 className="mb-4 font-heading text-2xl font-bold text-text-primary">Характеристики</h2>
          <ProductSpecs specs={specs} />
        </div>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
