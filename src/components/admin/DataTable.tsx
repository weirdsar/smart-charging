'use client';

import Card from '@/components/ui/Card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  actions?: (item: T) => ReactNode;
  emptyMessage?: string;
}

function cellContent<T>(item: T, col: Column<T>): ReactNode {
  if (col.render) {
    return col.render(item);
  }
  const row = item as Record<string, unknown>;
  const v = row[col.key];
  if (v == null) return '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onSort,
  sortKey,
  sortDirection,
  actions,
  emptyMessage = 'Данные отсутствуют',
}: DataTableProps<T>) {
  const handleSort = (key: string) => {
    if (!onSort) return;
    const nextDir =
      sortKey === key && sortDirection === 'asc' ? ('desc' as const) : ('asc' as const);
    onSort(key, nextDir);
  };

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-light text-left text-xs uppercase tracking-wider text-text-secondary">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium">
                  {col.sortable && onSort ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1 transition-colors hover:text-text-primary"
                    >
                      {col.label}
                      {sortKey === col.key ? (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                        )
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 opacity-40" aria-hidden />
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
              {actions ? (
                <th className="px-4 py-3 font-medium text-right">Действия</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-8 text-center text-sm text-text-secondary"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className="border-b border-surface-light transition-colors last:border-0 hover:bg-surface-light/30"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-text-primary">
                      {cellContent(item, col)}
                    </td>
                  ))}
                  {actions ? (
                    <td className="px-4 py-3 text-right">{actions(item)}</td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-secondary">{emptyMessage}</p>
        ) : (
          data.map((item) => (
            <Card key={keyExtractor(item)} padding="md">
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="flex justify-between gap-3 border-b border-surface-light py-2 last:border-0"
                >
                  <span className="text-sm text-text-secondary">{col.label}</span>
                  <span className="max-w-[60%] text-right text-sm font-medium text-text-primary">
                    {cellContent(item, col)}
                  </span>
                </div>
              ))}
              {actions ? (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-surface-light pt-3">
                  {actions(item)}
                </div>
              ) : null}
            </Card>
          ))
        )}
      </div>
    </>
  );
}
