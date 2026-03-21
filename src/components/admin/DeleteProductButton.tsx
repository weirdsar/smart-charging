'use client';

import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DeleteProductButtonProps {
  id: string;
}

export default function DeleteProductButton({ id }: DeleteProductButtonProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Удалить этот товар? Это действие необратимо.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const result = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !result.success) {
        addToast({
          type: 'error',
          title: 'Ошибка',
          message: result.error ?? 'Не удалось удалить товар',
        });
        return;
      }
      addToast({ type: 'success', title: 'Товар удалён' });
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
