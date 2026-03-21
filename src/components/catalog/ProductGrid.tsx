'use client';

import ProductCard from '@/components/catalog/ProductCard';
import type { IProduct } from '@/types';

interface ProductGridProps {
  products: IProduct[];
  categoryPath: string;
}

export default function ProductGrid({ products, categoryPath }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-text-secondary">Товары не найдены</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          href={`/catalog/${categoryPath}/${product.slug}`}
        />
      ))}
    </div>
  );
}
