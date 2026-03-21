'use client';

import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DeleteCategoryButtonProps {
  id: string;
  productCount: number;
}

export default function DeleteCategoryButton({ id, productCount }: DeleteCategoryButtonProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (productCount > 0) {
      addToast({
        type: 'error',
        title: 'Невозможно удалить',
        message: `В категории ${productCount} товар(ов). Сначала перенесите или удалите товары.`,
      });
      return;
    }
    if (!confirm('Удалить эту категорию? Это действие необратимо.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const result = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !result.success) {
        addToast({
          type: 'error',
          title: 'Ошибка',
          message: result.error ?? 'Не удалось удалить категорию',
        });
        return;
      }
      addToast({ type: 'success', title: 'Категория удалена' });
      router.refresh();
    } catch {
      addToast({ type: 'error', title: 'Ошибка сети' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      isLoading={loading}
      leftIcon={<Trash2 className="h-3.5 w-3.5" aria-hidden />}
      onClick={handleDelete}
    >
      Удалить
    </Button>
  );
}
