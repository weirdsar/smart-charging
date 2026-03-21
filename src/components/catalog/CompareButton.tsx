'use client';

import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';
import { useComparison } from '@/hooks/useComparison';
import { BarChart3 } from 'lucide-react';

interface CompareButtonProps {
  productId: string;
}

export default function CompareButton({ productId }: CompareButtonProps) {
  const { addProduct, removeProduct, isInComparison, isFull, isLoaded } = useComparison();
  const { addToast } = useToast();

  const inList = isInComparison(productId);

  const handleClick = () => {
    if (!isLoaded) return;
    if (inList) {
      removeProduct(productId);
      addToast({ type: 'info', title: 'Убрано из сравнения' });
      return;
    }
    const ok = addProduct(productId);
    if (!ok) {
      if (isFull && !inList) {
        addToast({
          type: 'warning',
          title: 'Сравнение заполнено',
          message: 'Можно добавить не более 4 товаров. Уберите один из списка.',
        });
      }
      return;
    }
    addToast({ type: 'success', title: 'Добавлено к сравнению' });
  };

  if (!isLoaded) {
    return (
      <Button type="button" variant="ghost" size="sm" disabled leftIcon={<BarChart3 className="h-4 w-4" />}>
        Сравнение…
      </Button>
    );
  }

  if (isFull && !inList) {
    return (
      <Button type="button" variant="ghost" size="sm" disabled leftIcon={<BarChart3 className="h-4 w-4" />}>
        Сравнение заполнено
      </Button>
    );
  }

  if (inList) {
    return (
      <Button
        type="button"
        variant="secondary"
        size="sm"
        leftIcon={<BarChart3 className="h-4 w-4" />}
        onClick={handleClick}
      >
        В сравнении ✓
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      leftIcon={<BarChart3 className="h-4 w-4" />}
      onClick={handleClick}
    >
      Добавить к сравнению
    </Button>
  );
}
