import ProjectForm from '@/components/admin/ProjectForm';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Новый проект | Админ' };

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">Новый проект</h1>
      <ProjectForm />
    </div>
  );
}
