'use client';

import { PLACEHOLDER_PRODUCT_IMAGE } from '@/lib/constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const displayImages = useMemo(
    () => (images.length === 0 ? [PLACEHOLDER_PRODUCT_IMAGE] : images),
    [images]
  );

  const next = () => setActiveIndex((i) => (i + 1) % displayImages.length);
  const prev = () => setActiveIndex((i) => (i - 1 + displayImages.length) % displayImages.length);

  return (
    <div>
      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-lg bg-surface-light">
        {/* eslint-disable-next-line @next/next/no-img-element -- external product URLs */}
        <img
          src={displayImages[activeIndex]}
          alt={`${title} — фото ${activeIndex + 1}`}
          className="absolute inset-0 h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
        {displayImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
              aria-label="Предыдущее фото"
            >
              <ChevronLeft size={20} aria-hidden />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
              aria-label="Следующее фото"
            >
              <ChevronRight size={20} aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      {displayImages.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {displayImages.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === activeIndex ? 'border-accent' : 'border-surface-light hover:border-accent/50'
              }`}
              aria-label={`Миниатюра ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
