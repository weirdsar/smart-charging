'use client';

import ComparisonModal from '@/components/comparison/ComparisonModal';
import Button from '@/components/ui/Button';
import { useComparison } from '@/hooks/useComparison';
import { normalizeProductImageList } from '@/lib/catalog';
import { PLACEHOLDER_PRODUCT_IMAGE } from '@/lib/constants';
import type { ComparisonProductRow } from '@/types/comparison';
import { BarChart3, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export default function ComparisonBar() {
  const { ids, count, isLoaded, removeProduct, clearAll } = useComparison();
  const [products, setProducts] = useState<ComparisonProductRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async (productIds: string[]) => {
    if (productIds.length === 0) {
      setProducts([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: productIds }),
      });
      const json = (await res.json()) as { success?: boolean; data?: ComparisonProductRow[] };
      if (json.success && Array.isArray(json.data)) {
        setProducts(json.data);
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    void fetchProducts(ids);
  }, [ids, isLoaded, fetchProducts]);

  useEffect(() => {
    if (count === 0) {
      setModalOpen(false);
    }
  }, [count]);

  return (
    <>
      {isLoaded && count > 0 ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="pointer-events-auto flex w-full max-w-5xl items-center gap-3 rounded-xl border border-surface-light bg-surface/95 px-4 py-3 shadow-2xl backdrop-blur-md sm:gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
              <BarChart3 className="h-5 w-5 shrink-0 text-accent" aria-hidden />
              <span className="shrink-0 text-sm font-medium text-text-primary">
                Сравнение: {count}
              </span>
              <div className="flex gap-1.5">
                {loading
                  ? ids.map((id) => (
                      <div
                        key={id}
                        className="h-10 w-10 shrink-0 animate-pulse rounded-md bg-surface-light"
                        aria-hidden
                      />
                    ))
                  : products.map((p) => {
                      const src =
                        normalizeProductImageList(p.images as unknown)[0] ?? PLACEHOLDER_PRODUCT_IMAGE;
                      return (
                        <div
                          key={p.id}
                          className="group relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-surface-light"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                          <button
                            type="button"
                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                            aria-label="Убрать из сравнения"
                            onClick={() => removeProduct(p.id)}
                          >
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      );
                    })}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button type="button" variant="primary" size="sm" onClick={() => setModalOpen(true)}>
                Сравнить
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
                Очистить
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <ComparisonModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        products={products}
        onRemove={removeProduct}
      />
    </>
  );
}
