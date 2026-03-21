import ProjectsListClient from './ProjectsListClient';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Проекты | Админ',
};

interface SearchParams {
  page?: string;
  search?: string;
}

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1);
  const limit = 20;
  const search = typeof searchParams.search === 'string' ? searchParams.search.trim() : '';

  const where = search
    ? { title: { contains: search, mode: 'insensitive' as const } }
    : {};

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, title: true, slug: true, published: true },
    }),
    prisma.project.count({ where }),
  ]);

  return (
    <ProjectsListClient
      projects={projects}
      total={total}
      currentPage={page}
      limit={limit}
    />
  );
}
