'use client';

import ImageUploader from '@/components/admin/ImageUploader';
import RichTextEditor from '@/components/admin/RichTextEditor';
import {
  Button,
  Card,
  Checkbox,
  Input,
  Select,
  Textarea,
} from '@/components/ui';
import { useToast } from '@/components/ui/ToastProvider';
import {
  adminProductFormSchema,
  type AdminProductFormValues,
} from '@/lib/validations';
import { slugify } from '@/lib/utils';
import type { Prisma } from '@prisma/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

export interface ProductFormProduct {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  price: number;
  priceOld: number | null;
  shortDescription: string | null;
  description: string;
  specs: Prisma.JsonValue;
  images: string[];
  powerKw: number | null;
  fuelType: string | null;
  hasAvr: boolean | null;
  noiseLevelDb: number | null;
  connectorType: string | null;
  purpose: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  published: boolean;
  inStock: boolean;
}

interface ProductFormProps {
  product?: ProductFormProduct;
  categories: { id: string; name: string; type: string }[];
}

function specsToJson(specs: Prisma.JsonValue): string {
  if (specs && typeof specs === 'object' && !Array.isArray(specs)) {
    return JSON.stringify(specs, null, 2);
  }
  return '{}';
}

function parseSpecsJson(s: string): Record<string, unknown> {
  const t = s.trim();
  if (!t) return {};
  const parsed: unknown = JSON.parse(t);
  if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
    return parsed as Record<string, unknown>;
  }
  return {};
}

function emptyToNull(s: string | null | undefined): string | null {
  if (s == null || s.trim() === '') return null;
  return s;
}

function getDefaults(
  categories: ProductFormProps['categories'],
  product?: ProductFormProduct
): AdminProductFormValues {
  if (!product) {
    return {
      title: '',
      slug: '',
      categoryId: categories[0]?.id ?? '',
      price: 1,
      priceOld: null,
      shortDescription: '',
      description: '',
      specsJson: '{}',
      images: [],
      powerKw: null,
      fuelType: '' as AdminProductFormValues['fuelType'],
      hasAvr: 'unset',
      noiseLevelDb: null,
      connectorType: '',
      purpose: '',
      seoTitle: '',
      seoDescription: '',
      published: false,
      inStock: true,
    };
  }

  return {
    title: product.title,
    slug: product.slug,
    categoryId: product.categoryId,
    price: product.price,
    priceOld: product.priceOld,
    shortDescription: product.shortDescription ?? '',
    description: product.description,
    specsJson: specsToJson(product.specs),
    images: product.images ?? [],
    powerKw: product.powerKw,
    fuelType: (product.fuelType ?? '') as AdminProductFormValues['fuelType'],
    hasAvr: product.hasAvr === null ? 'unset' : product.hasAvr ? 'yes' : 'no',
    noiseLevelDb: product.noiseLevelDb,
    connectorType: product.connectorType ?? '',
    purpose: product.purpose ?? '',
    seoTitle: product.seoTitle ?? '',
    seoDescription: product.seoDescription ?? '',
    published: product.published,
    inStock: product.inStock,
  };
}

export default function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const form = useForm<AdminProductFormValues>({
    resolver: zodResolver(adminProductFormSchema),
    defaultValues: getDefaults(categories, product),
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
    reset(getDefaults(categories, product));
  }, [categories, product, reset]);

  const handleTitleBlur = () => {
    const title = getValues('title');
    const currentSlug = getValues('slug');
    if (!currentSlug && title) {
      setValue('slug', slugify(title), { shouldValidate: true });
    }
  };

  const onSubmit = async (data: AdminProductFormValues) => {
    try {
      const specs = parseSpecsJson(data.specsJson);
      const payload = {
        title: data.title,
        slug: data.slug,
        categoryId: data.categoryId,
        price: data.price,
        priceOld: data.priceOld,
        shortDescription: data.shortDescription,
        description: data.description,
        specs,
        images: data.images,
        powerKw: data.powerKw,
        fuelType: data.fuelType === '' ? null : data.fuelType,
        hasAvr:
          data.hasAvr === 'unset' || data.hasAvr === undefined ? null : data.hasAvr === 'yes',
        noiseLevelDb: data.noiseLevelDb,
        connectorType: emptyToNull(data.connectorType ?? undefined),
        purpose: emptyToNull(data.purpose ?? undefined),
        seoTitle: emptyToNull(data.seoTitle ?? undefined),
        seoDescription: emptyToNull(data.seoDescription ?? undefined),
        published: data.published,
        inStock: data.inStock,
      };

      const url = product ? `/api/products/${product.id}` : '/api/products';
      const method = product ? 'PUT' : 'POST';
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
        title: product ? 'Товар обновлён' : 'Товар создан',
      });
      router.push('/admin/products');
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ошибка сохранения';
      addToast({ type: 'error', title: 'Ошибка', message });
    }
  };

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const fuelOptions = [
    { value: '', label: 'Не указано' },
    { value: 'PETROL', label: 'Бензин' },
    { value: 'DIESEL', label: 'Дизель' },
    { value: 'GAS', label: 'Газ' },
    { value: 'HYBRID', label: 'Гибрид' },
    { value: 'OTHER', label: 'Другое' },
  ];

  const hasAvrOptions = [
    { value: 'unset', label: 'Не указано' },
    { value: 'yes', label: 'Да' },
    { value: 'no', label: 'Нет' },
  ];

  const titleField = register('title');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card padding="lg">
        <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">
          Основная информация
        </h2>
        <div className="space-y-4">
          <Input
            label="Название"
            {...titleField}
            error={errors.title?.message}
            onBlur={(e) => {
              titleField.onBlur(e);
              handleTitleBlur();
            }}
          />
          <Input label="Slug" {...register('slug')} error={errors.slug?.message} />
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select
                label="Категория"
                options={categoryOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.categoryId?.message}
              />
            )}
          />
          <Textarea
            label="Краткое описание"
            rows={3}
            maxLength={200}
            {...register('shortDescription')}
            error={errors.shortDescription?.message}
          />
          <Controller
            name="published"
            control={control}
            render={({ field }) => (
              <Checkbox
                label="Опубликован"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Цены</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Цена, ₽"
            type="number"
            step="0.01"
            min={0}
            {...register('price', { valueAsNumber: true })}
            error={errors.price?.message}
          />
          <Controller
            name="priceOld"
            control={control}
            render={({ field }) => (
              <Input
                label="Старая цена, ₽"
                type="number"
                step="0.01"
                min={0}
                value={field.value ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  field.onChange(v === '' ? null : Number(v));
                }}
                onBlur={field.onBlur}
                error={errors.priceOld?.message as string | undefined}
              />
            )}
          />
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Описание</h2>
        <div>
          <span className="mb-1 block text-sm text-text-secondary">Полное описание</span>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                key={product?.id ?? 'new'}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.description ? (
            <p className="mt-1 text-xs text-error" role="alert">
              {errors.description.message}
            </p>
          ) : null}
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">
          Технические характеристики
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="powerKw"
            control={control}
            render={({ field }) => (
              <Input
                label="Мощность, кВт"
                type="number"
                step="any"
                value={field.value ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  field.onChange(v === '' ? null : Number(v));
                }}
                error={errors.powerKw?.message}
              />
            )}
          />
          <Controller
            name="fuelType"
            control={control}
            render={({ field }) => (
              <Select
                label="Тип топлива"
                options={fuelOptions}
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.fuelType?.message}
              />
            )}
          />
          <Controller
            name="hasAvr"
            control={control}
            render={({ field }) => (
              <Select
                label="AVR"
                options={hasAvrOptions}
                value={field.value ?? 'unset'}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="noiseLevelDb"
            control={control}
            render={({ field }) => (
              <Input
                label="Уровень шума, дБ"
                type="number"
                step="any"
                value={field.value ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  field.onChange(v === '' ? null : Number(v));
                }}
                error={errors.noiseLevelDb?.message}
              />
            )}
          />
          <Input
            label="Тип коннектора (зарядки)"
            {...register('connectorType')}
            error={errors.connectorType?.message as string | undefined}
          />
          <Input label="Назначение" {...register('purpose')} error={errors.purpose?.message} />
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">
          Характеристики (JSON)
        </h2>
        <Textarea
          label="Дополнительные характеристики"
          rows={8}
          className="font-mono text-sm"
          placeholder='{ "engine": "...", "fuelConsumption": "..." }'
          {...register('specsJson')}
          error={errors.specsJson?.message}
        />
      </Card>

      <Card padding="lg">
        <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Изображения</h2>
        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <ImageUploader
              images={field.value ?? []}
              onChange={field.onChange}
              folder="products"
            />
          )}
        />
      </Card>

      <Card padding="lg">
        <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">SEO</h2>
        <div className="space-y-4">
          <Input
            label="SEO Title"
            maxLength={70}
            {...register('seoTitle')}
            error={errors.seoTitle?.message as string | undefined}
          />
          <Textarea
            label="SEO Description"
            rows={3}
            maxLength={160}
            {...register('seoDescription')}
            error={errors.seoDescription?.message as string | undefined}
          />
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Склад</h2>
        <Controller
          name="inStock"
          control={control}
          render={({ field }) => (
            <Checkbox
              label="В наличии"
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
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
