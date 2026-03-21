import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { projectFormSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

const SORT_FIELDS = ['createdAt', 'title', 'updatedAt'] as const;

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
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

    const where: Prisma.ProjectWhereInput = {
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
      ...(published !== undefined ? { published } : {}),
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { [sortBy]: sortOrderParam },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      success: true,
      data: {
        projects,
        pagination: { page, limit, total, totalPages },
      },
    });
  } catch (e) {
    console.error('GET /api/projects', e);
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
    const body = await projectFormSchema.parseAsync(json);

    const existing = await prisma.project.findUnique({ where: { slug: body.slug } });
    if (existing) {
      return jsonError('Проект с таким slug уже существует', 400);
    }

    const project = await prisma.project.create({
      data: {
        title: body.title,
        slug: body.slug,
        images: body.images ?? [],
        task: body.task,
        solution: body.solution,
        result: body.result,
        reviewText: body.reviewText?.trim() || null,
        reviewAuthor: body.reviewAuthor?.trim() || null,
        published: body.published,
      },
    });

    revalidatePath('/admin/projects');
    revalidatePath('/projects');
    revalidatePath(`/projects/${body.slug}`);

    return NextResponse.json({ success: true, data: project });
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.issues[0]?.message ?? 'Некорректные данные';
      return jsonError(msg, 400);
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return jsonError('Проект с таким slug уже существует', 400);
    }
    console.error('POST /api/projects', e);
    return jsonError('Ошибка сервера', 500);
  }
}
