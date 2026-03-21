'use client';

import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import FilterSidebar from './FilterSidebar';

interface CatalogFiltersColumnProps {
  showAvrFilter?: boolean;
}

export default function CatalogFiltersColumn({ showAvrFilter }: CatalogFiltersColumnProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="mb-4 flex justify-end lg:hidden">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? 'Скрыть фильтры' : 'Фильтры'}
        </Button>
      </div>
      <div className={cn(mobileOpen ? 'block' : 'hidden lg:block')}>
        <FilterSidebar showAvrFilter={showAvrFilter} />
      </div>
    </>
  );
}
