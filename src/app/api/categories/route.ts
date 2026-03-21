import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { adminCategoryCreateSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { products: true } },
        parent: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (e) {
    console.error('GET /api/categories', e);
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
    const body = await adminCategoryCreateSchema.parseAsync(json);

    const existing = await prisma.category.findUnique({ where: { slug: body.slug } });
    if (existing) {
      return jsonError('Категория с таким slug уже существует', 400);
    }

    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: body.slug,
        type: body.type,
        sortOrder: body.sortOrder,
        seoTitle: body.seoTitle ?? null,
        seoDescription: body.seoDescription ?? null,
        seoContent: body.seoContent ?? null,
        ...(body.parentId
          ? { parent: { connect: { id: body.parentId } } }
          : { parentId: null }),
      },
      include: {
        _count: { select: { products: true } },
        parent: { select: { id: true, name: true } },
      },
    });

    revalidatePath('/admin/categories');
    revalidatePath('/catalog');

    return NextResponse.json({ success: true, data: category });
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.errors[0]?.message ?? 'Некорректные данные';
      return jsonError(msg, 400);
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return jsonError('Категория с таким slug уже существует', 400);
    }
    console.error('POST /api/categories', e);
    return jsonError('Ошибка сервера', 500);
  }
}
