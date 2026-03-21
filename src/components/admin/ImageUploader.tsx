'use client';

import { useToast } from '@/components/ui/ToastProvider';
import { cn } from '@/lib/utils';
import { Loader2, Upload, X } from 'lucide-react';
import { useCallback, useId, useState } from 'react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  /** Target directory under public/images/ (e.g. products or products/generators/portable) */
  folder?: string;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onChange,
  folder = 'products',
  maxImages = 10,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const { addToast } = useToast();
  const inputId = useId();

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
      if (list.length === 0) return;

      if (images.length + list.length > maxImages) {
        addToast({
          type: 'error',
          title: 'Ошибка',
          message: `Максимум ${maxImages} изображений`,
        });
        return;
      }

      setUploading(true);
      try {
        const uploadPromises = list.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('folder', folder);

          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          const result = (await res.json()) as {
            success: boolean;
            error?: string;
            data?: { url: string };
          };
          if (!result.success || !result.data?.url) {
            throw new Error(result.error ?? 'Ошибка загрузки');
          }
          return result.data.url;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        onChange([...images, ...uploadedUrls]);
        addToast({
          type: 'success',
          title: 'Успешно',
          message:
            uploadedUrls.length === 1
              ? 'Изображение загружено'
              : `Загружено изображений: ${uploadedUrls.length}`,
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Ошибка загрузки';
        addToast({
          type: 'error',
          title: 'Ошибка загрузки',
          message,
        });
      } finally {
        setUploading(false);
      }
    },
    [addToast, folder, images, maxImages, onChange]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!files?.length) return;
    await uploadFiles(files);
    e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploading || images.length >= maxImages) return;
    const { files } = e.dataTransfer;
    if (files?.length) await uploadFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const labelClass = cn(
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary',
    'border border-text-secondary text-text-primary hover:border-accent hover:text-accent',
    'h-8 px-3 text-sm',
    (uploading || images.length >= maxImages) && 'pointer-events-none opacity-50'
  );

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text-primary">Изображения</label>

      <div className="mb-4">
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileChange}
          disabled={uploading || images.length >= maxImages}
          className="sr-only"
        />
        <label htmlFor={inputId} className={labelClass}>
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Upload className="h-4 w-4" aria-hidden />
          )}
          {uploading ? 'Загрузка...' : 'Загрузить изображения'}
        </label>
        <p className="mt-1 text-xs text-text-secondary">
          Максимум {maxImages} изображений. Форматы: JPG, PNG, WebP. Размер до 5 МБ. Можно перетащить
          файлы в область ниже.
        </p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          'rounded-lg border-2 border-dashed border-surface-light p-4 transition-colors',
          !uploading && images.length < maxImages && 'hover:border-accent/50'
        )}
      >
        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="group relative aspect-square overflow-hidden rounded-lg bg-surface-light"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
                <img
                  src={url}
                  alt={`Изображение ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-error text-white opacity-0 transition-opacity group-hover:opacity-100"
                  title="Удалить"
                >
                  <X size={14} />
                </button>
                {index === 0 ? (
                  <div className="absolute bottom-2 left-2 rounded bg-accent px-2 py-1 text-xs text-white">
                    Главное
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-text-secondary">
            Перетащите файлы сюда или нажмите «Загрузить изображения»
          </div>
        )}
      </div>
    </div>
  );
}
