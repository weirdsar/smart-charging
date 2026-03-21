import BlogListClient from './BlogListClient';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Блог | Админ',
};

interface SearchParams {
  page?: string;
  search?: string;
}

export default async function AdminBlogPage({
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

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, title: true, slug: true, published: true },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return (
    <BlogListClient posts={posts} total={total} currentPage={page} limit={limit} />
  );
}
