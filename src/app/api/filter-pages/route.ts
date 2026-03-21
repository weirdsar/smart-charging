import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

const filterPageCreateSchema = z.object({
  slug: z.string().min(1),
  categoryId: z.string().min(1),
  appliedFilters: z.record(z.string(), z.unknown()).optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoContent: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const filterPages = await prisma.filterPage.findMany({
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { slug: 'asc' },
    });

    return NextResponse.json({ success: true, data: filterPages });
  } catch (e) {
    console.error('GET /api/filter-pages', e);
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
    const data = filterPageCreateSchema.parse(json);

    const applied = (data.appliedFilters !== undefined ? data.appliedFilters : {}) as Prisma.InputJsonValue;

    const filterPage = await prisma.filterPage.create({
      data: {
        slug: data.slug,
        categoryId: data.categoryId,
        appliedFilters: applied,
        seoTitle: data.seoTitle?.trim() || null,
        seoDescription: data.seoDescription?.trim() || null,
        seoContent: data.seoContent ?? null,
      },
    });

    revalidatePath('/catalog');
    revalidatePath('/admin/filter-pages');

    return NextResponse.json({ success: true, data: filterPage }, { status: 201 });
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.issues[0]?.message ?? 'Некорректные данные';
      return jsonError(msg, 400);
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return jsonError('Запись с таким slug уже существует', 400);
    }
    console.error('POST /api/filter-pages', e);
    return jsonError('Ошибка сервера', 500);
  }
}
