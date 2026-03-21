'use client';

import DeleteDocumentButton from '@/components/admin/DeleteDocumentButton';
import PaginationWrapper from '@/components/admin/PaginationWrapper';
import DataTable from '@/components/admin/DataTable';
import { Badge, Button } from '@/components/ui';
import { Edit, Plus } from 'lucide-react';
import { Suspense } from 'react';

const DOC_LABELS: Record<string, string> = {
  CERTIFICATE: 'Сертификат',
  PERMIT: 'Разрешение',
  GRATITUDE: 'Благодарность',
  OTHER: 'Другое',
};

interface DocumentRow {
  id: string;
  title: string;
  docType: string;
  sortOrder: number;
}

interface DocumentsListClientProps {
  documents: DocumentRow[];
  total: number;
  currentPage: number;
  limit: number;
}

export default function DocumentsListClient({
  documents,
  total,
  currentPage,
  limit,
}: DocumentsListClientProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-2xl font-bold text-text-primary">Документы</h1>
          <Badge variant="default">{total}</Badge>
        </div>
        <Button
          as="a"
          href="/admin/documents/new"
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" aria-hidden />}
        >
          Добавить документ
        </Button>
      </div>

      <DataTable
        columns={[
          { key: 'title', label: 'Название' },
          {
            key: 'docType',
            label: 'Тип',
            render: (d) => <Badge variant="default">{DOC_LABELS[d.docType] ?? d.docType}</Badge>,
          },
          { key: 'sortOrder', label: 'Порядок' },
        ]}
        data={documents}
        keyExtractor={(d) => d.id}
        actions={(d) => (
          <div className="flex flex-wrap gap-2">
            <Button
              as="a"
              href={`/admin/documents/${d.id}/edit`}
              variant="ghost"
              size="sm"
              leftIcon={<Edit className="h-3.5 w-3.5" aria-hidden />}
            >
              Изменить
            </Button>
            <DeleteDocumentButton id={d.id} />
          </div>
        )}
      />

      <Suspense
        fallback={
          <div className="mt-6 text-center text-sm text-text-secondary">Загрузка пагинации…</div>
        }
      >
        <div className="mt-6 flex justify-center">
          <PaginationWrapper currentPage={currentPage} totalPages={totalPages} />
        </div>
      </Suspense>
    </div>
  );
}
