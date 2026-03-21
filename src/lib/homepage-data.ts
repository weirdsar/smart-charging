/**
 * Server-only data for homepage sections (projects carousel).
 */
import { prisma } from '@/lib/prisma';

export interface HomepageProjectCard {
  id: string;
  title: string;
  slug: string;
  task: string;
  result: string;
  reviewAuthor: string | null;
  imageUrl: string | null;
}

export async function getHomepageProjects(limit = 6): Promise<HomepageProjectCard[]> {
  const rows = await prisma.project.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      task: true,
      result: true,
      reviewAuthor: true,
      images: true,
    },
  });

  return rows.map((p) => {
    const imgs = Array.isArray(p.images)
      ? p.images.filter((x): x is string => typeof x === 'string' && x.length > 0)
      : [];
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      task: p.task,
      result: p.result,
      reviewAuthor: p.reviewAuthor,
      imageUrl: imgs[0] ?? null,
    };
  });
}
