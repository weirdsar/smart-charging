import BlogPostForm, { type BlogPostFormPost } from '@/components/admin/BlogPostForm';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { id: params.id },
    select: { title: true },
  });
  if (!post) {
    return { title: 'Статья не найдена | Админ' };
  }
  return { title: `${post.title} | Админ` };
}

export default async function EditBlogPostPage({ params }: PageProps) {
  const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!post) {
    notFound();
  }

  const formPost: BlogPostFormPost = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    published: post.published,
    publishedAt: post.publishedAt,
  };

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">
        Редактирование: {post.title}
      </h1>
      <BlogPostForm post={formPost} />
    </div>
  );
}
