import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { SITE_URL } from '@/lib/constants';
import { absoluteSiteUrl } from '@/lib/absolute-url';
import { prisma } from '@/lib/prisma';
import { sanitizeHtml } from '@/lib/sanitize';
import type { Metadata } from 'next';
import { Calendar } from 'lucide-react';
import { notFound } from 'next/navigation';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await prisma.blogPost.findFirst({
    where: { slug: params.slug, published: true },
    select: {
      title: true,
      excerpt: true,
      seoTitle: true,
      seoDescription: true,
      coverImage: true,
      publishedAt: true,
    },
  });

  if (!post) {
    return {
      title: 'Статья не найдена | Умная зарядка — Саратов',
      alternates: { canonical: `/blog/${params.slug}` },
    };
  }

  const title = post.seoTitle ?? `${post.title} | Блог | Умная зарядка — Саратов`;
  const description = post.seoDescription ?? post.excerpt ?? post.title;

  return {
    title,
    description,
    alternates: { canonical: `/blog/${params.slug}` },
    openGraph: {
      title: post.title,
      description: description ?? undefined,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverImage ? [{ url: absoluteSiteUrl(post.coverImage), alt: post.title }] : undefined,
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function BlogArticlePage({ params }: PageProps) {
  const post = await prisma.blogPost.findFirst({
    where: { slug: params.slug, published: true },
  });

  if (!post) {
    notFound();
  }

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? post.title,
    image: post.coverImage ? absoluteSiteUrl(post.coverImage) : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    publisher: {
      '@type': 'Organization',
      name: 'ООО «Умная зарядка»',
      url: SITE_URL,
    },
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Блог', href: '/blog' },
          { label: post.title },
        ]}
      />

      <article className="mt-8">
        {post.coverImage ? (
          <div className="mb-8 overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element -- URLs from DB */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="aspect-video w-full object-cover"
            />
          </div>
        ) : null}

        <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">{post.title}</h1>

        {post.publishedAt ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
            <Calendar className="h-4 w-4 shrink-0" aria-hidden />
            <time dateTime={post.publishedAt.toISOString()}>
              {new Intl.DateTimeFormat('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }).format(post.publishedAt)}
            </time>
          </div>
        ) : null}

        <div
          className="prose prose-invert mt-8 max-w-none prose-headings:font-heading prose-headings:text-text-primary prose-p:text-text-secondary prose-li:text-text-secondary prose-strong:text-text-primary"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
        />
      </article>
    </div>
  );
}
