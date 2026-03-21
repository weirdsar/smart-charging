'use client';

import { Button, Card, Input } from '@/components/ui';
import { useToast } from '@/components/ui/ToastProvider';
import { documentFormSchema, type DocumentFormValues } from '@/lib/validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useState } from 'react';
import { useForm } from 'react-hook-form';

export interface DocumentFormDoc {
  id: string;
  title: string;
  fileUrl: string;
  docType: 'CERTIFICATE' | 'PERMIT' | 'GRATITUDE' | 'OTHER';
  sortOrder: number;
}

interface DocumentFormProps {
  document?: DocumentFormDoc;
}

const DOC_TYPE_OPTIONS = [
  { value: 'CERTIFICATE', label: 'Сертификат' },
  { value: 'PERMIT', label: 'Разрешение' },
  { value: 'GRATITUDE', label: 'Благодарность' },
  { value: 'OTHER', label: 'Другое' },
];

function getDefaults(doc?: DocumentFormDoc): DocumentFormValues {
  if (!doc) {
    return {
      title: '',
      fileUrl: '',
      docType: 'OTHER',
      sortOrder: 0,
    };
  }
  return {
    title: doc.title,
    fileUrl: doc.fileUrl,
    docType: doc.docType,
    sortOrder: doc.sortOrder,
  };
}

export default function DocumentForm({ document: doc }: DocumentFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputId = useId();

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: getDefaults(doc),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  const fileUrl = watch('fileUrl');

  useEffect(() => {
    reset(getDefaults(doc));
  }, [doc, reset]);

  const uploadPdf = useCallback(
    async (file: File) => {
      if (file.type !== 'application/pdf') {
        addToast({ type: 'error', title: 'Ошибка', message: 'Нужен файл PDF' });
        return;
      }
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'documents');
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const result = (await res.json()) as { success: boolean; data?: { url: string }; error?: string };
        if (!result.success || !result.data?.url) {
          throw new Error(result.error ?? 'Ошибка загрузки');
        }
        setValue('fileUrl', result.data.url, { shouldValidate: true });
        addToast({ type: 'success', title: 'Файл загружен' });
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Ошибка загрузки';
        addToast({ type: 'error', title: 'Ошибка', message });
      } finally {
        setUploading(false);
      }
    },
    [addToast, setValue]
  );

  const onSubmit = async (data: DocumentFormValues) => {
    try {
      const url = doc ? `/api/documents/${doc.id}` : '/api/documents';
      const method = doc ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !result.success) {
        throw new Error(result.error ?? 'Ошибка сохранения');
      }
      addToast({
        type: 'success',
        title: doc ? 'Документ обновлён' : 'Документ создан',
      });
      router.push('/admin/documents');
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ошибка сохранения';
      addToast({ type: 'error', title: 'Ошибка', message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card padding="lg">
        <div className="space-y-4">
          <Input label="Название" {...register('title')} error={errors.title?.message} />
          <div>
            <span className="mb-1 block text-sm text-text-secondary">Тип документа</span>
            <select
              className="w-full rounded-md border border-surface-light bg-surface px-3 py-2 text-sm text-text-primary"
              {...register('docType')}
            >
              {DOC_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {errors.docType?.message ? (
              <p className="mt-1 text-sm text-error">{errors.docType.message}</p>
            ) : null}
          </div>
          <Input
            label="Порядок сортировки"
            type="number"
            {...register('sortOrder', { valueAsNumber: true })}
            error={errors.sortOrder?.message}
          />
          <div>
            <span className="mb-1 block text-sm text-text-secondary">Файл (PDF)</span>
            <div className="flex flex-wrap items-center gap-3">
              <input
                id={fileInputId}
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadPdf(f);
                  e.target.value = '';
                }}
              />
              <label htmlFor={fileInputId}>
                <span className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-surface-light px-3 py-2 text-sm text-text-primary hover:border-accent">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Upload className="h-4 w-4" aria-hidden />
                  )}
                  Загрузить PDF
                </span>
              </label>
            </div>
            <Input
              label="URL файла"
              {...register('fileUrl')}
              error={errors.fileUrl?.message}
              hint="Загрузите PDF или вставьте ссылку вручную"
            />
            {fileUrl ? (
              <p className="mt-2 text-xs text-text-secondary">
                Текущий файл:{' '}
                <a href={fileUrl} className="text-accent hover:underline" target="_blank" rel="noreferrer">
                  открыть
                </a>
              </p>
            ) : null}
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
          {doc ? 'Сохранить' : 'Создать'}
        </Button>
        <Button type="button" variant="outline" as="a" href="/admin/documents">
          Отмена
        </Button>
      </div>
    </form>
  );
}
