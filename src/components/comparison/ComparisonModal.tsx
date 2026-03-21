'use client';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { normalizeProductImageList } from '@/lib/catalog';
import { PLACEHOLDER_PRODUCT_IMAGE } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import type { ComparisonProductRow } from '@/types/comparison';
import Link from 'next/link';
import { X } from 'lucide-react';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ComparisonProductRow[];
  onRemove: (id: string) => void;
}

function productHref(p: ComparisonProductRow): string {
  if (p.categoryType === 'CHARGING_STATIONS') {
    return `/catalog/charging-stations/${p.slug}`;
  }
  if (p.categoryType === 'GENERATORS_INDUSTRIAL') {
    return `/catalog/generators/industrial/${p.slug}`;
  }
  return `/catalog/generators/portable/${p.slug}`;
}

function fuelLabel(fuel: string | null | undefined): string {
  switch (fuel) {
    case 'PETROL':
      return 'Бензин';
    case 'DIESEL':
      return 'Дизель';
    case 'GAS':
      return 'Газ';
    case 'HYBRID':
      return 'Гибрид';
    case 'OTHER':
      return 'Другое';
    default:
      return '—';
  }
}

function formatSpecKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim();
}

function formatSpecValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function specsToRecord(specs: unknown): Record<string, unknown> | null {
  if (typeof specs === 'object' && specs !== null && !Array.isArray(specs)) {
    return specs as Record<string, unknown>;
  }
  return null;
}

const thProduct =
  'border-b border-surface-light px-2 pb-3 align-top text-left font-medium text-text-primary';

export default function ComparisonModal({
  isOpen,
  onClose,
  products,
  onRemove,
}: ComparisonModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Сравнение товаров" size="lg">
      {products.length === 0 ? (
        <p className="text-sm text-text-secondary">Нет товаров для сравнения.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-28 min-w-[7rem] border-b border-surface-light pb-3 text-left text-xs font-normal uppercase tracking-wide text-text-secondary">
                  Параметр
                </th>
                {products.map((p) => (
                  <th key={p.id} className={thProduct}>
                    <div className="flex max-w-[200px] flex-col gap-2">
                      <div className="relative mx-auto aspect-square w-full max-w-[120px] overflow-hidden rounded-lg bg-surface-light">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            normalizeProductImageList(p.images as unknown)[0] ?? PLACEHOLDER_PRODUCT_IMAGE
                          }
                          alt={p.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex items-start justify-between gap-1">
                        <Link
                          href={productHref(p)}
                          className="line-clamp-2 text-left text-sm font-medium text-accent hover:underline"
                          onClick={onClose}
                        >
                          {p.title}
                        </Link>
                        <button
                          type="button"
                          className="shrink-0 rounded p-1 text-text-secondary hover:bg-surface-light hover:text-error"
                          aria-label="Убрать из сравнения"
                          onClick={() => onRemove(p.id)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-text-secondary">
              <tr>
                <td className="border-b border-surface-light py-3 pr-2 text-xs text-text-secondary">
                  Цена
                </td>
                {products.map((p) => (
                  <td key={`${p.id}-price`} className="border-b border-surface-light px-2 py-3 align-top">
                    <span className="font-semibold text-accent">{formatPrice(p.price)}</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-b border-surface-light py-3 pr-2 text-xs text-text-secondary">
                  Мощность
                </td>
                {products.map((p) => (
                  <td key={`${p.id}-power`} className="border-b border-surface-light px-2 py-3 align-top">
                    {p.powerKw != null ? `${p.powerKw} кВт` : '—'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-b border-surface-light py-3 pr-2 text-xs text-text-secondary">
                  Топливо
                </td>
                {products.map((p) => (
                  <td key={`${p.id}-fuel`} className="border-b border-surface-light px-2 py-3 align-top">
                    {fuelLabel(p.fuelType)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-b border-surface-light py-3 pr-2 text-xs text-text-secondary">
                  АВР
                </td>
                {products.map((p) => (
                  <td key={`${p.id}-avr`} className="border-b border-surface-light px-2 py-3 align-top">
                    {p.hasAvr === true ? 'Да' : p.hasAvr === false ? 'Нет' : '—'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-b border-surface-light py-3 pr-2 text-xs text-text-secondary">
                  Шум
                </td>
                {products.map((p) => (
                  <td key={`${p.id}-noise`} className="border-b border-surface-light px-2 py-3 align-top">
                    {p.noiseLevelDb != null ? `${p.noiseLevelDb} дБ` : '—'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-b border-surface-light py-3 pr-2 text-xs text-text-secondary">
                  Категория
                </td>
                {products.map((p) => (
                  <td key={`${p.id}-cat`} className="border-b border-surface-light px-2 py-3 align-top">
                    {p.categoryName ?? '—'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pr-2 align-top text-xs text-text-secondary">Характеристики</td>
                {products.map((p) => {
                  const rec = specsToRecord(p.specs);
                  return (
                    <td key={`${p.id}-specs`} className="px-2 py-3 align-top">
                      {rec && Object.keys(rec).length > 0 ? (
                        <ul className="space-y-1 text-xs">
                          {Object.entries(rec).map(([k, v]) => (
                            <li key={k}>
                              <span className="text-text-secondary">{formatSpecKey(k)}: </span>
                              <span className="text-text-primary">{formatSpecValue(v)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        '—'
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-6 flex justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Закрыть
        </Button>
      </div>
    </Modal>
  );
}
