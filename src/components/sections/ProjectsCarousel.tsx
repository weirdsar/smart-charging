'use client';

import Card from '@/components/ui/Card';
import { PLACEHOLDER_PROJECT_IMAGE } from '@/lib/constants';
import type { HomepageProjectCard } from '@/lib/homepage-data';
import { MOCK_PROJECTS } from '@/lib/mockData';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

function chunkProjects<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

function toCarouselProjects(db: HomepageProjectCard[]): HomepageProjectCard[] {
  if (db.length > 0) return db;
  return MOCK_PROJECTS.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    task: p.task ?? '',
    result: p.result ?? '',
    reviewAuthor: p.reviewAuthor ?? null,
    imageUrl: p.images?.[0] ?? null,
  }));
}

interface ProjectsCarouselProps {
  projects: HomepageProjectCard[];
}

export default function ProjectsCarousel({ projects }: ProjectsCarouselProps) {
  const isLg = useMediaQuery('(min-width: 1024px)');
  const isMd = useMediaQuery('(min-width: 768px)');
  const visibleCount = isLg ? 3 : isMd ? 2 : 1;

  const list = useMemo(() => toCarouselProjects(projects), [projects]);

  const pages = useMemo(
    () => chunkProjects(list, visibleCount),
    [list, visibleCount]
  );

  const [currentPage, setCurrentPage] = useState(0);
  const maxPage = Math.max(0, pages.length - 1);

  useEffect(() => {
    setCurrentPage((p) => Math.min(p, maxPage));
  }, [maxPage]);

  const goPrev = () => setCurrentPage((p) => Math.max(0, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(maxPage, p + 1));

  const pageCount = pages.length;

  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
            Реализованные проекты
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={currentPage <= 0}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border border-surface-light text-text-secondary transition-colors',
                'hover:border-accent hover:text-accent',
                'disabled:pointer-events-none disabled:opacity-40'
              )}
              aria-label="Предыдущие проекты"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={currentPage >= maxPage}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border border-surface-light text-text-secondary transition-colors',
                'hover:border-accent hover:text-accent',
                'disabled:pointer-events-none disabled:opacity-40'
              )}
              aria-label="Следующие проекты"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        <div className="mt-10 overflow-hidden">
          <motion.div
            className="flex will-change-transform"
            style={{ width: pageCount > 0 ? `${pageCount * 100}%` : '100%' }}
            animate={{ x: pageCount > 0 ? `-${(currentPage * 100) / pageCount}%` : '0%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {pages.map((page, pageIndex) => (
              <div
                key={pageIndex}
                className="flex shrink-0 gap-6"
                style={{ width: pageCount > 0 ? `${100 / pageCount}%` : '100%' }}
              >
                {page.map((project) => (
                  <div key={project.id} className="min-w-0 flex-1">
                    <ProjectCard project={project} />
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>

        <div className="mt-6 flex justify-center gap-2 md:hidden">
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentPage(i)}
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                i === currentPage ? 'bg-accent' : 'bg-surface-light'
              )}
              aria-label={`Страница ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: HomepageProjectCard }) {
  const src = project.imageUrl ?? PLACEHOLDER_PROJECT_IMAGE;

  return (
    <Card padding="none" className="h-full overflow-hidden">
      <div className="relative aspect-video w-full overflow-hidden bg-surface-light">
        {/* eslint-disable-next-line @next/next/no-img-element -- project cover + placeholder */}
        <img
          src={src}
          alt={project.title}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          referrerPolicy={src.startsWith('http') ? 'no-referrer' : undefined}
        />
      </div>
      <div className="p-5">
        <h3 className="font-heading text-lg font-bold text-text-primary">
          <Link href={`/projects/${project.slug}`} className="transition-colors hover:text-accent">
            {project.title}
          </Link>
        </h3>
        {project.task ? (
          <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{project.task}</p>
        ) : null}
        {project.result ? (
          <p className="mt-3 line-clamp-2 text-sm font-medium text-text-primary">
            <CheckCircle
              className="mr-1 inline h-4 w-4 shrink-0 text-success align-text-bottom"
              aria-hidden
            />
            {project.result}
          </p>
        ) : null}
        {project.reviewAuthor ? (
          <p className="mt-3 text-xs italic text-text-secondary">— {project.reviewAuthor}</p>
        ) : null}
        <Link
          href={`/projects/${project.slug}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
        >
          Подробнее
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </Card>
  );
}
