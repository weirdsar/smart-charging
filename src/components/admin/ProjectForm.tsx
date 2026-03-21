'use client';

import ImageUploader from '@/components/admin/ImageUploader';
import { Button, Card, Checkbox, Input, Textarea } from '@/components/ui';
import { useToast } from '@/components/ui/ToastProvider';
import { projectFormSchema, type ProjectFormValues } from '@/lib/validations';
import { slugify } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

export interface ProjectFormProject {
  id: string;
  title: string;
  slug: string;
  images: string[];
  task: string;
  solution: string;
  result: string;
  reviewText: string | null;
  reviewAuthor: string | null;
  published: boolean;
}

interface ProjectFormProps {
  project?: ProjectFormProject;
}

function emptyToNull(s: string | null | undefined): string | null {
  if (s == null || s.trim() === '') return null;
  return s;
}

function getDefaults(project?: ProjectFormProject): ProjectFormValues {
  if (!project) {
    return {
      title: '',
      slug: '',
      images: [],
      task: '',
      solution: '',
      result: '',
      reviewText: '',
      reviewAuthor: '',
      published: false,
    };
  }
  return {
    title: project.title,
    slug: project.slug,
    images: project.images ?? [],
    task: project.task,
    solution: project.solution,
    result: project.result,
    reviewText: project.reviewText ?? '',
    reviewAuthor: project.reviewAuthor ?? '',
    published: project.published,
  };
}

export default function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: getDefaults(project),
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
    reset(getDefaults(project));
  }, [project, reset]);

  const handleTitleBlur = () => {
    const title = getValues('title');
    const currentSlug = getValues('slug');
    if (!currentSlug && title) {
      setValue('slug', slugify(title), { shouldValidate: true });
    }
  };

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      const payload = {
        title: data.title,
        slug: data.slug,
        images: data.images ?? [],
        task: data.task,
        solution: data.solution,
        result: data.result,
        reviewText: emptyToNull(data.reviewText ?? undefined),
        reviewAuthor: emptyToNull(data.reviewAuthor ?? undefined),
        published: data.published,
      };

      const url = project ? `/api/projects/${project.id}` : '/api/projects';
      const method = project ? 'PUT' : 'POST';
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
        title: project ? 'Проект обновлён' : 'Проект создан',
      });
      router.push('/admin/projects');
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
            name="published"
            control={control}
            render={({ field }) => (
              <Checkbox
                label="Опубликован на сайте"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Изображения</h2>
        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <ImageUploader images={field.value} onChange={field.onChange} folder="projects" maxImages={12} />
          )}
        />
      </Card>

      <Card padding="lg">
        <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Содержание</h2>
        <div className="space-y-4">
          <Textarea label="Задача / контекст" rows={4} {...register('task')} error={errors.task?.message} />
          <Textarea label="Решение" rows={4} {...register('solution')} error={errors.solution?.message} />
          <Textarea label="Результат" rows={4} {...register('result')} error={errors.result?.message} />
          <Textarea label="Текст отзыва" rows={3} {...register('reviewText')} error={errors.reviewText?.message} />
          <Input label="Автор отзыва" {...register('reviewAuthor')} error={errors.reviewAuthor?.message} />
        </div>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
          {project ? 'Сохранить' : 'Создать проект'}
        </Button>
        <Button type="button" variant="outline" as="a" href="/admin/projects">
          Отмена
        </Button>
      </div>
    </form>
  );
}
