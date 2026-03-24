import { Card } from '@/components/ui';
import { prisma } from '@/lib/prisma';
import { resolveProjectCover } from '@/lib/project-covers';
import type { Metadata } from 'next';
import { ArrowRight, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Проекты | Умная зарядка — Саратов',
  description:
    'Реализованные проекты: резервное электроснабжение, зарядные станции для бизнеса, промышленные генераторы. Дилер TSS и Pandora.',
  alternates: { canonical: '/projects' },
};

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      images: true,
      task: true,
      result: true,
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">Проекты</h1>
        <p className="mt-4 text-lg text-text-secondary">
          Подборка внедрений: от коттеджных посёлков и отелей до производств и строительных площадок. Контент
          носит ознакомительный характер; точные решения подбираются индивидуально.
        </p>
      </div>

      {projects.length === 0 ? (
        <p className="mt-12 text-text-secondary">Проекты скоро появятся.</p>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const cover = resolveProjectCover(
              project.slug,
              Array.isArray(project.images) ? project.images : []
            );
            const unoptimized = cover.endsWith('.svg') || cover.startsWith('data:');
            return (
            <Card key={project.id} padding="none" hover className="flex h-full flex-col overflow-hidden">
              <Link href={`/projects/${project.slug}`} className="flex h-full flex-col">
                <div className="relative aspect-video overflow-hidden bg-surface-light">
                  <Image
                    src={cover}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    quality={80}
                    unoptimized={unoptimized}
                    referrerPolicy={cover.startsWith('http') ? 'no-referrer' : undefined}
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-heading text-lg font-bold text-text-primary line-clamp-2">
                    {project.title}
                  </h2>
                  <p className="mt-2 text-sm text-text-secondary line-clamp-2">{project.task}</p>
                  {project.result ? (
                    <p className="mt-3 flex items-start gap-2 text-sm text-text-primary">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                      <span className="line-clamp-2">{project.result}</span>
                    </p>
                  ) : null}
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-accent">
                    Подробнее
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                </div>
              </Link>
            </Card>
            );
          })}
        </div>
      )}

      <p className="mt-10 text-center text-sm text-text-secondary">
        Нужен расчёт под ваш объект?{' '}
        <Link href="/contacts" className="font-medium text-accent hover:text-accent-hover">
          Свяжитесь с нами
        </Link>
      </p>
    </div>
  );
}
