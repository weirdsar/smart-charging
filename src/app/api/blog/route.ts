import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { blogPostFormSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

const SORT_FIELDS = ['createdAt', 'title', 'publishedAt', 'updatedAt'] as const;

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function parsePublishedAtInput(value: string | null | undefined): Date | null {
  if (value == null || value.trim() === '') return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));
    const search = searchParams.get('search')?.trim() || '';
    const publishedParam = searchParams.get('published');
    const published =
      publishedParam === 'true' ? true : publishedParam === 'false' ? false : undefined;
    const sortByParam = searchParams.get('sortBy') || 'createdAt';
    const sortOrderParam = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    const sortBy = SORT_FIELDS.includes(sortByParam as (typeof SORT_FIELDS)[number])
      ? sortByParam
      : 'createdAt';

    const where: Prisma.BlogPostWhereInput = {
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
      ...(published !== undefined ? { published } : {}),
    };

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { [sortBy]: sortOrderParam },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      success: true,
      data: {
        posts,
        pagination: { page, limit, total, totalPages },
      },
    });
  } catch (e) {
    console.error('GET /api/blog', e);
    return jsonError('Ошибка сервера', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const json = (await req.json()) as unknown;
    const body = await blogPostFormSchema.parseAsync(json);

    const existing = await prisma.blogPost.findUnique({ where: { slug: body.slug } });
    if (existing) {
      return jsonError('Статья с таким slug уже существует', 400);
    }

    const publishedAt = parsePublishedAtInput(body.publishedAt ?? undefined);

    const post = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug: body.slug,
        content: body.content,
        excerpt: body.excerpt?.trim() || null,
        coverImage: body.coverImage?.trim() || null,
        seoTitle: body.seoTitle?.trim() || null,
        seoDescription: body.seoDescription?.trim() || null,
        published: body.published,
        publishedAt,
      },
    });

    revalidatePath('/admin/blog');
    revalidatePath('/blog');
    revalidatePath(`/blog/${body.slug}`);

    return NextResponse.json({ success: true, data: post });
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.issues[0]?.message ?? 'Некорректные данные';
      return jsonError(msg, 400);
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return jsonError('Статья с таким slug уже существует', 400);
    }
    console.error('POST /api/blog', e);
    return jsonError('Ошибка сервера', 500);
  }
}
