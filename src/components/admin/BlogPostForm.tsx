'use client';

import ImageUploader from '@/components/admin/ImageUploader';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { Button, Card, Checkbox, Input, Textarea } from '@/components/ui';
import { useToast } from '@/components/ui/ToastProvider';
import { blogPostFormSchema, type BlogPostFormValues } from '@/lib/validations';
import { slugify } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

export interface BlogPostFormPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  published: boolean;
  publishedAt: Date | null;
}

interface BlogPostFormProps {
  post?: BlogPostFormPost;
}

function toDatetimeLocal(d: Date | null): string {
  if (!d) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getDefaults(post?: BlogPostFormPost): BlogPostFormValues {
  if (!post) {
    return {
      title: '',
      slug: '',
      content: '<p></p>',
      excerpt: '',
      coverImage: '',
      seoTitle: '',
      seoDescription: '',
      published: false,
      publishedAt: '',
    };
  }
  return {
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt ?? '',
    coverImage: post.coverImage ?? '',
    seoTitle: post.seoTitle ?? '',
    seoDescription: post.seoDescription ?? '',
    published: post.published,
    publishedAt: toDatetimeLocal(post.publishedAt),
  };
}

export default function BlogPostForm({ post }: BlogPostFormProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: getDefaults(post),
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
    reset(getDefaults(post));
  }, [post, reset]);

  const handleTitleBlur = () => {
    const title = getValues('title');
    const currentSlug = getValues('slug');
    if (!currentSlug && title) {
      setValue('slug', slugify(title), { shouldValidate: true });
    }
  };

  const onSubmit = async (data: BlogPostFormValues) => {
    try {
      const payload = {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        published: data.published,
        publishedAt: data.publishedAt?.trim() ? data.publishedAt : '',
      };

      const url = post ? `/api/blog/${post.id}` : '/api/blog';
      const method = post ? 'PUT' : 'POST';
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
        title: post ? 'Статья обновлена' : 'Статья создана',
      });
      router.push('/admin/blog');
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ошибка сохранения';
      addToast({ type: 'error', title: 'Ошибка', message });
    }
  };

  const titleField = register('title');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card padding="lg">
        <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Основное</h2>
        <div className="space-y-4">
          <Input
            label="Заголовок"
            {...titleField}
            error={errors.title?.message}
            onBlur={(e) => {
              titleField.onBlur(e);
              handleTitleBlur();
            }}
          />
          <Input label="Slug" {...register('slug')} error={errors.slug?.message} />
          <Textarea label="Краткое описание (анонс)" rows={3} {...register('excerpt')} error={errors.excerpt?.message} />
          <div>
            <span className="mb-1 block text-sm text-text-secondary">Текст статьи</span>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <RichTextEditor value={field.value} onChange={field.onChange} placeholder="Текст статьи…" />
              )}
            />
            {errors.content?.message ? (
              <p className="mt-1 text-sm text-error">{errors.content.message}</p>
            ) : null}
          </div>
          <Controller
            name="published"
            control={control}
            render={({ field }) => (
              <Checkbox
                label="Опубликована на сайте"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Input
            label="Дата публикации (локальное время)"
            type="datetime-local"
            {...register('publishedAt')}
            error={errors.publishedAt?.message}
          />
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Обложка</h2>
        <Controller
          name="coverImage"
          control={control}
          render={({ field }) => (
            <ImageUploader
              images={field.value ? [field.value] : []}
              onChange={(urls) => field.onChange(urls[0] ?? '')}
              folder="blog"
              maxImages={1}
            />
          )}
        />
      </Card>

      <Card padding="lg">
        <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">SEO</h2>
        <div className="space-y-4">
          <Input label="SEO title" {...register('seoTitle')} error={errors.seoTitle?.message} />
          <Textarea label="SEO description" rows={2} {...register('seoDescription')} error={errors.seoDescription?.message} />
        </div>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
          {post ? 'Сохранить' : 'Создать статью'}
        </Button>
        <Button type="button" variant="outline" as="a" href="/admin/blog">
          Отмена
        </Button>
      </div>
    </form>
  );
}
