'use client';

import { Button, Card, Input, Select, Textarea } from '@/components/ui';
import { useToast } from '@/components/ui/ToastProvider';
import {
  adminCategoryFormSchema,
  type AdminCategoryFormValues,
} from '@/lib/validations';
import { slugify } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

export interface CategoryFormCategory {
  id: string;
  name: string;
  slug: string;
  type: 'GENERATORS_PORTABLE' | 'GENERATORS_INDUSTRIAL' | 'CHARGING_STATIONS';
  parentId: string | null;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  seoContent: string | null;
}

interface CategoryFormProps {
  category?: CategoryFormCategory;
  categories: { id: string; name: string }[];
}

function emptyToNull(s: string | null | undefined): string | null {
  if (s == null || s.trim() === '') return null;
  return s;
}

function getDefaults(
  category?: CategoryFormCategory
): AdminCategoryFormValues {
  if (!category) {
    return {
      name: '',
      slug: '',
      type: 'GENERATORS_PORTABLE',
      parentId: null,
      sortOrder: 0,
      seoTitle: '',
      seoDescription: '',
      seoContent: '',
    };
  }
  return {
    name: category.name,
    slug: category.slug,
    type: category.type,
    parentId: category.parentId,
    sortOrder: category.sortOrder,
    seoTitle: category.seoTitle ?? '',
    seoDescription: category.seoDescription ?? '',
    seoContent: category.seoContent ?? '',
  };
}

export default function CategoryForm({ category, categories }: CategoryFormProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const form = useForm<AdminCategoryFormValues>({
    resolver: zodResolver(adminCategoryFormSchema),
    defaultValues: getDefaults(category),
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  useEffect(() => {
    reset(getDefaults(category));
  }, [category, reset]);

  const handleNameBlur = () => {
    const name = getValues('name');
    const currentSlug = getValues('slug');
    if (!currentSlug && name) {
      setValue('slug', slugify(name), { shouldValidate: true });
    }
  };

  const onSubmit = async (data: AdminCategoryFormValues) => {
    try {
      const payload = {
        name: data.name,
        slug: data.slug,
        type: data.type,
        parentId: data.parentId === '' || data.parentId == null ? null : data.parentId,
        sortOrder: data.sortOrder,
        seoTitle: emptyToNull(data.seoTitle ?? undefined),
        seoDescription: emptyToNull(data.seoDescription ?? undefined),
        seoContent: emptyToNull(data.seoContent ?? undefined),
      };

      const url = category ? `/api/categories/${category.id}` : '/api/categories';
      const method = category ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !result.success) {
        throw new Error(result.error ?? 'Ошибка сохранения');
      }
      addToast({
        type: 'success',
        title: category ? 'Категория обновлена' : 'Категория создана',
      });
      router.push('/admin/categories');
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ошибка сохранения';
      addToast({ type: 'error', title: 'Ошибка', message });
    }
  };

  const typeOptions = [
    { value: 'GENERATORS_PORTABLE', label: 'Портативные генераторы' },
    { value: 'GENERATORS_INDUSTRIAL', label: 'Промышленные генераторы' },
    { value: 'CHARGING_STATIONS', label: 'Зарядные станции' },
  ];

  const parentOptions = [
    { value: '', label: 'Без родителя' },
    ...categories
      .filter((c) => c.id !== category?.id)
      .map((c) => ({ value: c.id, label: c.name })),
  ];

  const nameField = register('name');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card padding="lg">
        <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">
          Основная информация
        </h2>
        <div className="space-y-4">
          <Input
            label="Название"
            {...nameField}
            error={errors.name?.message}
            onBlur={(e) => {
              nameField.onBlur(e);
              handleNameBlur();
            }}
          />
          <Input label="Slug" {...register('slug')} error={errors.slug?.message} />
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                label="Тип"
                options={typeOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.type?.message}
              />
            )}
          />
          <Controller
            name="parentId"
            control={control}
            render={({ field }) => (
              <Select
                label="Родительская категория"
                options={parentOptions}
                value={field.value ?? ''}
                onChange={(v) => field.onChange(v === '' ? null : v)}
                error={errors.parentId?.message as string | undefined}
              />
            )}
          />
          <Input
            label="Порядок сортировки"
            type="number"
            step={1}
            {...register('sortOrder', { valueAsNumber: true })}
            error={errors.sortOrder?.message}
          />
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">SEO</h2>
        <div className="space-y-4">
          <Input
            label="SEO Title"
            {...register('seoTitle')}
            error={errors.seoTitle?.message as string | undefined}
          />
          <Textarea
            label="SEO Description"
            rows={3}
            {...register('seoDescription')}
            error={errors.seoDescription?.message as string | undefined}
          />
          <Textarea
            label="SEO-текст (контент)"
            rows={6}
            {...register('seoContent')}
            error={errors.seoContent?.message as string | undefined}
          />
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary" isLoading={isSubmitting}>
          Сохранить
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
