'use client';

import { MAX_COMPARISON_ITEMS } from '@/lib/constants';
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'product-comparison';

export function useComparison() {
  const [ids, setIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setIds(JSON.parse(saved) as string[]);
      } catch {
        // ignore
      }
    }
    setIsLoaded(true);
  }, []);

  const saveIds = useCallback((newIds: string[]) => {
    setIds(newIds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
  }, []);

  const addProduct = useCallback(
    (id: string) => {
      if (ids.length >= MAX_COMPARISON_ITEMS || ids.includes(id)) return false;
      saveIds([...ids, id]);
      return true;
    },
    [ids, saveIds]
  );

  const removeProduct = useCallback(
    (id: string) => {
      saveIds(ids.filter((i) => i !== id));
    },
    [ids, saveIds]
  );

  const clearAll = useCallback(() => {
    saveIds([]);
  }, [saveIds]);

  const isInComparison = useCallback((id: string) => ids.includes(id), [ids]);

  return {
    ids,
    count: ids.length,
    maxItems: MAX_COMPARISON_ITEMS,
    isLoaded,
    addProduct,
    removeProduct,
    clearAll,
    isInComparison,
    isFull: ids.length >= MAX_COMPARISON_ITEMS,
  };
}
