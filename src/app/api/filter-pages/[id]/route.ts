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

const filterPageUpdateSchema = z.object({
  slug: z.string().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  appliedFilters: z.record(z.string(), z.unknown()).optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoContent: z.string().optional().nullable(),
});

interface RouteParams {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const filterPage = await prisma.filterPage.findUnique({
      where: { id: params.id },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    if (!filterPage) {
      return jsonError('Запись не найдена', 404);
    }

    return NextResponse.json({ success: true, data: filterPage });
  } catch (e) {
    console.error('GET /api/filter-pages/[id]', e);
    return jsonError('Ошибка сервера', 500);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const existing = await prisma.filterPage.findUnique({ where: { id: params.id } });
    if (!existing) {
      return jsonError('Запись не найдена', 404);
    }

    const json = (await req.json()) as unknown;
    const data = filterPageUpdateSchema.parse(json);

    if (data.slug !== undefined && data.slug !== existing.slug) {
      const taken = await prisma.filterPage.findUnique({ where: { slug: data.slug } });
      if (taken) {
        return jsonError('Запись с таким slug уже существует', 400);
      }
    }

    const updateData: Prisma.FilterPageUpdateInput = {};
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.categoryId !== undefined) {
      updateData.category = { connect: { id: data.categoryId } };
    }
    if (data.appliedFilters !== undefined) {
      updateData.appliedFilters = data.appliedFilters as unknown as Prisma.InputJsonValue;
    }
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle?.trim() || null;
    if (data.seoDescription !== undefined) {
      updateData.seoDescription = data.seoDescription?.trim() || null;
    }
    if (data.seoContent !== undefined) updateData.seoContent = data.seoContent ?? null;

    const filterPage = await prisma.filterPage.update({
      where: { id: params.id },
      data: updateData,
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    revalidatePath('/catalog');
    revalidatePath('/admin/filter-pages');

    return NextResponse.json({ success: true, data: filterPage });
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.issues[0]?.message ?? 'Некорректные данные';
      return jsonError(msg, 400);
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return jsonError('Запись с таким slug уже существует', 400);
    }
    console.error('PUT /api/filter-pages/[id]', e);
    return jsonError('Ошибка сервера', 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const existing = await prisma.filterPage.findUnique({ where: { id: params.id } });
    if (!existing) {
      return jsonError('Запись не найдена', 404);
    }

    await prisma.filterPage.delete({ where: { id: params.id } });
    revalidatePath('/catalog');
    revalidatePath('/admin/filter-pages');

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/filter-pages/[id]', e);
    return jsonError('Ошибка сервера', 500);
  }
}
