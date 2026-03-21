import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { blogPostFormUpdateSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function parsePublishedAtInput(value: string | null | undefined): Date | null {
  if (value == null || value.trim() === '') return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

interface RouteParams {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
    if (!post) {
      return jsonError('Статья не найдена', 404);
    }

    return NextResponse.json({ success: true, data: post });
  } catch (e) {
    console.error('GET /api/blog/[id]', e);
    return jsonError('Ошибка сервера', 500);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const existing = await prisma.blogPost.findUnique({ where: { id: params.id } });
    if (!existing) {
      return jsonError('Статья не найдена', 404);
    }

    const json = (await req.json()) as unknown;
    const body = await blogPostFormUpdateSchema.parseAsync(json);

    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.blogPost.findUnique({ where: { slug: body.slug } });
      if (slugExists) {
        return jsonError('Статья с таким slug уже существует', 400);
      }
    }

    const data: Prisma.BlogPostUpdateInput = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.slug !== undefined) data.slug = body.slug;
    if (body.content !== undefined) data.content = body.content;
    if (body.excerpt !== undefined) data.excerpt = body.excerpt?.trim() || null;
    if (body.coverImage !== undefined) data.coverImage = body.coverImage?.trim() || null;
    if (body.seoTitle !== undefined) data.seoTitle = body.seoTitle?.trim() || null;
    if (body.seoDescription !== undefined) data.seoDescription = body.seoDescription?.trim() || null;
    if (body.published !== undefined) data.published = body.published;
    if (body.publishedAt !== undefined) {
      data.publishedAt = parsePublishedAtInput(body.publishedAt);
    }

    const updated = await prisma.blogPost.update({
      where: { id: params.id },
      data,
    });

    revalidatePath('/admin/blog');
    revalidatePath('/blog');
    revalidatePath(`/blog/${existing.slug}`);
    if (updated.slug !== existing.slug) {
      revalidatePath(`/blog/${updated.slug}`);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.issues[0]?.message ?? 'Некорректные данные';
      return jsonError(msg, 400);
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return jsonError('Статья с таким slug уже существует', 400);
    }
    console.error('PUT /api/blog/[id]', e);
    return jsonError('Ошибка сервера', 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const existing = await prisma.blogPost.findUnique({ where: { id: params.id } });
    if (!existing) {
      return jsonError('Статья не найдена', 404);
    }

    await prisma.blogPost.delete({ where: { id: params.id } });

    revalidatePath('/admin/blog');
    revalidatePath('/blog');
    revalidatePath(`/blog/${existing.slug}`);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/blog/[id]', e);
    return jsonError('Ошибка сервера', 500);
  }
}
