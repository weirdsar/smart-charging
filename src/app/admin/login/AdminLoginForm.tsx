'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function AdminLoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginValues) => {
    setFormError(null);
    try {
      const result = await signIn('credentials', {
        email: data.email.trim(),
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        setFormError('Неверный email или пароль');
        return;
      }
      if (result?.ok) {
        router.push('/admin');
        router.refresh();
        return;
      }
      setFormError('Неверный email или пароль');
    } catch {
      setFormError('Ошибка сети. Попробуйте снова.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <Card padding="lg" className="w-full max-w-sm">
        <div className="text-center">
          <Link href="/" className="inline-block font-heading text-xl font-bold text-text-primary">
            Умная<span className="text-accent">Зарядка</span>
          </Link>
          <p className="mt-1 text-sm text-text-secondary">Панель управления</p>
        </div>

        <div className="my-6 border-t border-surface-light" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Пароль"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
            Войти
          </Button>
          {formError ? <p className="mt-3 text-center text-sm text-error">{formError}</p> : null}
        </form>
      </Card>
    </div>
  );
}
