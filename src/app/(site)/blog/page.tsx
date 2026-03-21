import { Card } from '@/components/ui';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Блог | Умная зарядка — Саратов',
  description:
    'Полезные статьи о генераторах TSS, зарядных станциях Pandora, монтаже и сервисе. Материалы от официального дилера.',
  alternates: { canonical: '/blog' },
};

export const dynamic = 'force-dynamic';

function formatRuDate(iso: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(iso);
}

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">Блог</h1>
        <p className="mt-4 text-lg text-text-secondary">
          Практические заметки для владельцев домов и бизнеса: подбор мощности, монтаж, сервис. Материалы
          обновляются по мере появления новых публикаций.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="mt-12 text-text-secondary">Статьи скоро появятся.</p>
      ) : (
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} padding="none" hover className="flex h-full flex-col overflow-hidden">
              <Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
                <div className="relative aspect-[16/10] bg-surface-light">
                  {post.coverImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element -- remote + local URLs from DB */
                    <img
                      src={post.coverImage}
                      alt={`Обложка: ${post.title}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-text-secondary">
                      [Обложка]
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  {post.publishedAt ? (
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Calendar className="h-3.5 w-3.5" aria-hidden />
                      <time dateTime={post.publishedAt.toISOString()}>{formatRuDate(post.publishedAt)}</time>
                    </div>
                  ) : null}
                  <h2 className="mt-3 font-heading text-lg font-bold text-text-primary line-clamp-2">
                    {post.title}
                  </h2>
                  {post.excerpt ? (
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary line-clamp-3">
                      {post.excerpt}
                    </p>
                  ) : null}
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-accent">
                    Читать
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}

      <p className="mt-10 text-center text-sm text-text-secondary">
        Есть вопрос по статье?{' '}
        <Link href="/contacts" className="font-medium text-accent hover:text-accent-hover">
          Напишите нам
        </Link>
      </p>
    </div>
  );
}
