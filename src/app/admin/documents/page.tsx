import DocumentsListClient from './DocumentsListClient';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Документы | Админ',
};

interface SearchParams {
  page?: string;
  search?: string;
}

export default async function AdminDocumentsPage({
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

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, title: true, docType: true, sortOrder: true },
    }),
    prisma.document.count({ where }),
  ]);

  return (
    <DocumentsListClient
      documents={documents.map((d) => ({
        id: d.id,
        title: d.title,
        docType: d.docType,
        sortOrder: d.sortOrder,
      }))}
      total={total}
      currentPage={page}
      limit={limit}
    />
  );
}
