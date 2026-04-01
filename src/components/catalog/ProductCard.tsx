'use client';

import CallbackForm from '@/components/forms/CallbackForm';
import { Badge, Button, Card } from '@/components/ui';
import Modal from '@/components/ui/Modal';
import { PLACEHOLDER_PRODUCT_IMAGE } from '@/lib/constants';
import type { IProduct } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type ProductCardProduct = Pick<
  IProduct,
  | 'id'
  | 'title'
  | 'slug'
  | 'price'
  | 'priceOld'
  | 'shortDescription'
  | 'images'
  | 'powerKw'
  | 'fuelType'
  | 'hasAvr'
  | 'inStock'
>;

interface ProductCardProps {
  product: ProductCardProduct;
  href: string;
  /** First screen: eager + high fetch priority so LCP isn’t blocked by lazy images. */
  imagePriority?: boolean;
}

function fuelLabel(fuel: string | null | undefined): string {
  switch (fuel) {
    case 'PETROL':
      return 'бензиновый';
    case 'DIESEL':
      return 'дизельный';
    case 'GAS':
      return 'газовый';
    case 'HYBRID':
      return 'гибрид';
    case 'OTHER':
      return 'прочее';
    default:
      return '';
  }
}

/** Grid: max-w-7xl, 1 / 2 / 3 / 4 columns — width hint for responsive srcset. */
const CARD_IMAGE_SIZES =
  '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw';

function isPriceOnRequest(price: number): boolean {
  return price === 0;
}

export default function ProductCard({ product, href, imagePriority = false }: ProductCardProps) {
  const primaryUrl = product.images?.[0] ?? PLACEHOLDER_PRODUCT_IMAGE;
  const [imageSrc, setImageSrc] = useState(primaryUrl);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const fuel = fuelLabel(product.fuelType);
  const onRequest = isPriceOnRequest(product.price);

  useEffect(() => {
    setImageSrc(product.images?.[0] ?? PLACEHOLDER_PRODUCT_IMAGE);
  }, [product.id, product.images?.[0]]);

  const unoptimized =
    imageSrc.endsWith('.svg') || imageSrc.startsWith('data:');

  return (
    <Card padding="none" hover>
      <div className="relative">
        <div className="relative aspect-square w-full overflow-hidden rounded-t-lg bg-surface-light">
          <Image
            src={imageSrc}
            alt={`${product.title} — изображение`}
            fill
            className="object-cover"
            sizes={CARD_IMAGE_SIZES}
            priority={imagePriority}
            quality={75}
            unoptimized={unoptimized}
            referrerPolicy="no-referrer"
            onError={() => setImageSrc(PLACEHOLDER_PRODUCT_IMAGE)}
          />
        </div>
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {!product.inStock ? (
            <Badge variant="error">Нет в наличии</Badge>
          ) : null}
          {product.hasAvr === true ? <Badge variant="success">АВР</Badge> : null}
          {product.priceOld != null && !onRequest ? <Badge variant="warning">Скидка</Badge> : null}
        </div>
      </div>

      <div className="p-4">
        <Link href={href}>
          <h3 className="line-clamp-2 min-h-[48px] text-base font-medium text-text-primary">
            {product.title}
          </h3>
        </Link>
        {product.shortDescription ? (
          <p className="mt-2 line-clamp-2 text-xs text-text-secondary">{product.shortDescription}</p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
          {product.powerKw != null ? <span>{product.powerKw} кВт</span> : null}
          {product.powerKw != null && fuel ? <span>·</span> : null}
          {fuel ? <span>{fuel}</span> : null}
        </div>

        {onRequest ? (
          <div className="mt-4">
            <Button
              type="button"
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => setPriceModalOpen(true)}
            >
              Цена по запросу
            </Button>
          </div>
        ) : (
          <div className="mt-4 flex items-baseline gap-2">
            {product.priceOld != null ? (
              <>
                <span className="text-sm text-text-secondary line-through">
                  {formatPrice(product.priceOld)}
                </span>
                <span className="text-xl font-bold text-accent">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-xl font-bold text-accent">{formatPrice(product.price)}</span>
            )}
          </div>
        )}

        <div className="mt-4">
          <Button as="a" href={href} variant={onRequest ? 'outline' : 'primary'} size="sm" fullWidth leftIcon={<Eye className="h-4 w-4" />}>
            Подробнее
          </Button>
        </div>
      </div>

      <Modal
        isOpen={priceModalOpen}
        onClose={() => setPriceModalOpen(false)}
        title="Цена по запросу"
        size="sm"
      >
        <p className="mb-4 text-sm text-text-secondary">
          Оставьте имя и телефон — менеджер свяжется и сообщит стоимость по товару «{product.title}».
        </p>
        <CallbackForm
          productId={product.id}
          onSuccess={() => setPriceModalOpen(false)}
        />
      </Modal>
    </Card>
  );
}
