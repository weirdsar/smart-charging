'use client';

import { Button, Checkbox, Input, Select } from '@/components/ui';
import { Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface FilterSidebarProps {
  showAvrFilter?: boolean;
}

export default function FilterSidebar({ showAvrFilter }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');

  useEffect(() => {
    setSearch(searchParams.get('search') ?? '');
  }, [searchParams]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const sortValue = searchParams.get('sort') ?? '';

  return (
    <div className="sticky top-20 h-fit space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-text-primary">Поиск</label>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateFilters('search', search.trim());
            }
          }}
          placeholder="Название модели..."
          leftIcon={<Search size={16} aria-hidden />}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-text-primary">Сортировка</label>
        <Select
          options={[
            { value: '', label: 'По умолчанию' },
            { value: 'price_asc', label: 'Цена: по возрастанию' },
            { value: 'price_desc', label: 'Цена: по убыванию' },
            { value: 'power_desc', label: 'Мощность: по убыванию' },
          ]}
          value={sortValue}
          onChange={(val) => updateFilters('sort', val)}
        />
      </div>

      {showAvrFilter ? (
        <div>
          <Checkbox
            label="Только с АВР"
            checked={searchParams.get('avr') === 'true'}
            onChange={(checked) => updateFilters('avr', checked ? 'true' : '')}
          />
        </div>
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="sm"
        fullWidth
        leftIcon={<X size={14} aria-hidden />}
        onClick={clearFilters}
      >
        Сбросить фильтры
      </Button>
    </div>
  );
}
