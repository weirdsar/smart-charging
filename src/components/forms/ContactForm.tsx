'use client';

import { Button, Input, Textarea } from '@/components/ui';
import { useToast } from '@/components/ui/ToastProvider';
import { trackFormSubmit } from '@/lib/analytics';
import { contactFormSchema, type ContactFormValues } from '@/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface ContactFormProps {
  onSuccess?: () => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Произошла ошибка';
}

export default function ContactForm({ onSuccess }: ContactFormProps) {
  const { addToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (form: ContactFormValues) => {
    try {
      const email =
        form.email && typeof form.email === 'string' && form.email.trim().length > 0
          ? form.email.trim()
          : undefined;

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CONTACT',
          name: form.name,
          phone: form.phone,
          email: email ?? '',
          message: form.message?.trim() || undefined,
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
        title: 'Сообщение отправлено!',
        message: 'Мы ответим вам в ближайшее время',
      });

      trackFormSubmit('contact');

      reset();
      onSuccess?.();
    } catch (error: unknown) {
      addToast({ type: 'error', title: 'Ошибка', message: getErrorMessage(error) });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Ваше имя" error={errors.name?.message} {...register('name')} />
      <Input label="Телефон" error={errors.phone?.message} {...register('phone')} />
      <Input
        label="Email (необязательно)"
        type="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Textarea
        label="Сообщение (необязательно)"
        rows={4}
        error={errors.message?.message}
        {...register('message')}
      />
      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isSubmitting}
        leftIcon={<Send className="h-[18px] w-[18px]" aria-hidden />}
      >
        Отправить
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
