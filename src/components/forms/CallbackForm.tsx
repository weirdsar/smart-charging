'use client';

import { Button, Input } from '@/components/ui';
import { useToast } from '@/components/ui/ToastProvider';
import { trackFormSubmit } from '@/lib/analytics';
import { callbackFormSchema, type CallbackFormValues } from '@/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface CallbackFormProps {
  productId?: string;
  onSuccess?: () => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Произошла ошибка';
}

export default function CallbackForm({ productId, onSuccess }: CallbackFormProps) {
  const { addToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CallbackFormValues>({
    resolver: zodResolver(callbackFormSchema),
  });

  const onSubmit = async (form: CallbackFormValues) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CALLBACK',
          name: form.name,
          phone: form.phone,
          ...(productId ? { productId } : {}),
          sourcePage: window.location.href,
        }),
      });

      const raw: unknown = await res.json();
      const parsed =
        typeof raw === 'object' && raw !== null && 'success' in raw
          ? (raw as { success?: boolean; error?: string })
          : null;

      if (!res.ok || !parsed?.success) {
        throw new Error(parsed?.error ?? 'Ошибка отправки');
      }

      addToast({
        type: 'success',
        title: 'Заявка отправлена!',
        message: 'Мы свяжемся с вами в ближайшее время',
      });

      trackFormSubmit('callback');

      reset();
      onSuccess?.();
    } catch (error: unknown) {
      addToast({
        type: 'error',
        title: 'Ошибка',
        message: getErrorMessage(error),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Ваше имя"
        placeholder="Иван Иванов"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="Телефон"
        placeholder="+7 (___) ___-__-__"
        error={errors.phone?.message}
        {...register('phone')}
      />
      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isSubmitting}
        leftIcon={<Phone className="h-[18px] w-[18px]" aria-hidden />}
      >
        Заказать звонок
      </Button>
      <p className="text-center text-xs text-text-secondary">
        Нажимая кнопку, вы соглашаетесь с{' '}
        <a href="/privacy" className="text-accent hover:underline">
          политикой конфиденциальности
        </a>
      </p>
    </form>
  );
}
