import BlogPostForm from '@/components/admin/BlogPostForm';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Новая статья | Админ' };

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-text-primary">Новая статья</h1>
      <BlogPostForm />
    </div>
  );
}
