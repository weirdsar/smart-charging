import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { Button, Card } from '@/components/ui';
import { SITE_URL } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { resolveProjectImages } from '@/lib/project-covers';
import { sanitizeHtml } from '@/lib/sanitize';
import type { Metadata } from 'next';
import { CheckCircle, Quote } from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await prisma.project.findFirst({
    where: { slug: params.slug, published: true },
    select: { title: true, task: true },
  });

  if (!project) {
    return {
      title: 'Проект не найден | Умная зарядка — Саратов',
      alternates: { canonical: `/projects/${params.slug}` },
    };
  }

  return {
    title: `${project.title} | Проекты | Умная зарядка — Саратов`,
    description: project.task,
    alternates: { canonical: `/projects/${params.slug}` },
  };
}

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({ params }: PageProps) {
  const project = await prisma.project.findFirst({
    where: { slug: params.slug, published: true },
  });

  if (!project) {
    notFound();
  }

  const gallery = resolveProjectImages(
    project.slug,
    Array.isArray(project.images) ? project.images : []
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Главная',
        item: `${SITE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Проекты',
        item: `${SITE_URL}/projects`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: project.title,
        item: `${SITE_URL}/projects/${project.slug}`,
      },
    ],
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-12">
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Проекты', href: '/projects' },
            { label: project.title },
          ]}
        />

        <h1 className="mt-6 font-heading text-3xl font-bold text-text-primary sm:text-4xl">
          {project.title}
        </h1>

        {gallery.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {gallery.slice(0, 4).map((img, i) => (
              <div
                key={`${project.id}-${i}`}
                className="relative aspect-video w-full overflow-hidden rounded-lg bg-surface-light"
              >
                <Image
                  src={img}
                  alt={`${project.title} — фото ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  quality={80}
                  unoptimized={img.endsWith('.svg') || img.startsWith('data:')}
                  referrerPolicy={img.startsWith('http') ? 'no-referrer' : undefined}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-lg border border-surface-light bg-surface-light">
            <div className="flex aspect-video items-center justify-center text-text-secondary">
              Фото проекта — скоро
            </div>
          </div>
        )}

        <div className="mt-10 space-y-6">
          <Card padding="lg">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Задача</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-primary">{project.task}</p>
          </Card>

          <Card padding="lg">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Решение</h2>
            <div
              className="prose prose-invert mt-2 max-w-none prose-p:text-text-primary prose-li:text-text-secondary prose-strong:text-text-primary"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(project.solution) }}
            />
          </Card>

          <Card padding="lg">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Результат</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-primary">
              <CheckCircle className="mr-1 inline h-4 w-4 shrink-0 text-success align-text-bottom" />
              {project.result}
            </p>
          </Card>

          {project.reviewText ? (
            <Card padding="lg" className="border-accent/20 bg-primary">
              <Quote className="h-8 w-8 text-accent/80" aria-hidden />
              <blockquote className="mt-4 text-lg leading-relaxed text-text-primary">{project.reviewText}</blockquote>
              {project.reviewAuthor ? (
                <p className="mt-4 text-sm text-text-secondary">— {project.reviewAuthor}</p>
              ) : null}
            </Card>
          ) : project.reviewAuthor ? (
            <p className="text-sm italic text-text-secondary">— {project.reviewAuthor}</p>
          ) : null}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button as="a" href="/contacts" variant="primary">
            Обсудить похожий проект
          </Button>
          <Button as="a" href="/projects" variant="ghost">
            ← Все проекты
          </Button>
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
