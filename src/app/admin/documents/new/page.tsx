import DocumentForm from '@/components/admin/DocumentForm';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Новый документ | Админ' };

export default function NewDocumentPage() {
  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">Новый документ</h1>
      <DocumentForm />
    </div>
  );
}
