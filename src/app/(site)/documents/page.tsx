import { Badge, Card } from '@/components/ui';
import type { DocumentType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { Download, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Документы | Умная зарядка — Саратов',
  description:
    'Сертификаты дилера TSS и Pandora, допуски, лицензии и сопроводительные документы.',
  alternates: { canonical: '/documents' },
};

export const dynamic = 'force-dynamic';

const docTypeLabels: Record<DocumentType, string> = {
  CERTIFICATE: 'Сертификат',
  PERMIT: 'Допуск',
  GRATITUDE: 'Благодарность',
  OTHER: 'Документ',
};

export default async function DocumentsPage() {
  const documents = await prisma.document.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
        Документы и сертификаты
      </h1>
      <p className="mt-4 text-lg text-text-secondary">
        Официальные документы дилера и сопроводительные материалы. По запросу предоставляем дополнительные
        файлы для тендеров и проверок.
      </p>

      {documents.length === 0 ? (
        <p className="mt-12 text-text-secondary">Документы скоро появятся.</p>
      ) : (
        <div className="mt-12 space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id} padding="md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <FileText className="h-6 w-6 text-accent" aria-hidden />
                  </div>
                  <div>
                    <h2 className="font-medium text-text-primary">{doc.title}</h2>
                    <div className="mt-2">
                      <Badge size="sm">{docTypeLabels[doc.docType]}</Badge>
                    </div>
                  </div>
                </div>
                {doc.fileUrl ? (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 text-accent transition-colors hover:text-accent-hover"
                  >
                    <Download className="h-5 w-5" aria-hidden />
                    <span className="hidden sm:inline">Скачать</span>
                  </a>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="mt-10 text-sm text-text-secondary">
        По запросу предоставляем дополнительные документы для участия в тендерах.
      </p>
    </div>
  );
}
