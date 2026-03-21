import DocumentForm, { type DocumentFormDoc } from '@/components/admin/DocumentForm';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const doc = await prisma.document.findUnique({
    where: { id: params.id },
    select: { title: true },
  });
  if (!doc) {
    return { title: 'Документ не найден | Админ' };
  }
  return { title: `${doc.title} | Админ` };
}

export default async function EditDocumentPage({ params }: PageProps) {
  const row = await prisma.document.findUnique({ where: { id: params.id } });
  if (!row) {
    notFound();
  }

  const formDoc: DocumentFormDoc = {
    id: row.id,
    title: row.title,
    fileUrl: row.fileUrl,
    docType: row.docType,
    sortOrder: row.sortOrder,
  };

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">
        Редактирование: {row.title}
      </h1>
      <DocumentForm document={formDoc} />
    </div>
  );
}
