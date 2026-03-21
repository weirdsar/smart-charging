import ProjectForm, { type ProjectFormProject } from '@/components/admin/ProjectForm';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { title: true },
  });
  if (!project) {
    return { title: 'Проект не найден | Админ' };
  }
  return { title: `${project.title} | Админ` };
}

export default async function EditProjectPage({ params }: PageProps) {
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) {
    notFound();
  }

  const formProject: ProjectFormProject = {
    id: project.id,
    title: project.title,
    slug: project.slug,
    images: project.images,
    task: project.task,
    solution: project.solution,
    result: project.result,
    reviewText: project.reviewText,
    reviewAuthor: project.reviewAuthor,
    published: project.published,
  };

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">
        Редактирование: {project.title}
      </h1>
      <ProjectForm project={formProject} />
    </div>
  );
}
