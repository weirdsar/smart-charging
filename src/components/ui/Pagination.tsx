'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export function generatePaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | 'ellipsis')[] {
  if (totalPages <= 0) return [];
  if (totalPages === 1) return [1];

  const totalBlocks = siblingCount * 2 + 5;
  if (totalPages <= totalBlocks) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const left = Math.max(2, currentPage - siblingCount);
  const right = Math.min(totalPages - 1, currentPage + siblingCount);

  const items: (number | 'ellipsis')[] = [1];

  if (left > 2) {
    items.push('ellipsis');
  }

  for (let i = left; i <= right; i += 1) {
    items.push(i);
  }

  if (right < totalPages - 1) {
    items.push('ellipsis');
  }

  items.push(totalPages);

  return items;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  const [isMd, setIsMd] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsMd(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (totalPages < 1) return null;

  const range = generatePaginationRange(currentPage, totalPages, siblingCount);

  const goPrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const goNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Пагинация">
      <button
        type="button"
        onClick={goPrev}
        disabled={prevDisabled}
        className={cn(
          'flex h-10 min-w-[40px] items-center justify-center rounded-md px-2 text-sm transition-colors',
          'bg-surface text-text-secondary hover:bg-surface-light hover:text-text-primary',
          prevDisabled && 'cursor-not-allowed opacity-50'
        )}
        aria-label="Предыдущая страница"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Назад</span>
      </button>

      {isMd ? (
        <div className="flex flex-wrap items-center gap-1">
          {range.map((item, index) =>
            item === 'ellipsis' ? (
              <span
                key={`e-${index}`}
                className="flex h-10 min-w-[40px] items-center justify-center text-sm text-text-secondary"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={cn(
                  'flex h-10 min-w-[40px] items-center justify-center rounded-md text-sm transition-colors',
                  item === currentPage
                    ? 'bg-accent text-white'
                    : 'bg-surface text-text-secondary hover:bg-surface-light hover:text-text-primary'
                )}
                aria-current={item === currentPage ? 'page' : undefined}
              >
                {item}
              </button>
            )
          )}
        </div>
      ) : (
        <span className="flex h-10 min-w-[40px] items-center justify-center rounded-md bg-accent px-3 text-sm text-white">
          {currentPage}
        </span>
      )}

      <button
        type="button"
        onClick={goNext}
        disabled={nextDisabled}
        className={cn(
          'flex h-10 min-w-[40px] items-center justify-center rounded-md px-2 text-sm transition-colors',
          'bg-surface text-text-secondary hover:bg-surface-light hover:text-text-primary',
          nextDisabled && 'cursor-not-allowed opacity-50'
        )}
        aria-label="Следующая страница"
      >
        <span className="hidden sm:inline">Вперёд</span>
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </nav>
  );
}
