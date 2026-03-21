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

const pageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  published: z.boolean().optional().default(true),
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

    const page = await prisma.page.findUnique({ where: { id: params.id } });
    if (!page) {
      return jsonError('Страница не найдена', 404);
    }

    return NextResponse.json({ success: true, data: page });
  } catch (e) {
    console.error('GET /api/pages/[id]', e);
    return jsonError('Ошибка сервера', 500);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const existing = await prisma.page.findUnique({ where: { id: params.id } });
    if (!existing) {
      return jsonError('Страница не найдена', 404);
    }

    const json = (await req.json()) as unknown;
    const data = pageSchema.parse(json);

    if (data.slug !== existing.slug) {
      const slugTaken = await prisma.page.findUnique({ where: { slug: data.slug } });
      if (slugTaken) {
        return jsonError('Страница с таким slug уже существует', 400);
      }
    }

    const page = await prisma.page.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        seoTitle: data.seoTitle?.trim() || null,
        seoDescription: data.seoDescription?.trim() || null,
        published: data.published,
      },
    });

    revalidatePath(`/${page.slug}`);
    if (page.slug !== existing.slug) {
      revalidatePath(`/${existing.slug}`);
    }
    revalidatePath('/admin/pages');

    return NextResponse.json({ success: true, data: page });
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.issues[0]?.message ?? 'Некорректные данные';
      return jsonError(msg, 400);
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return jsonError('Страница с таким slug уже существует', 400);
    }
    console.error('PUT /api/pages/[id]', e);
    return jsonError('Ошибка сервера', 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const existing = await prisma.page.findUnique({ where: { id: params.id } });
    if (!existing) {
      return jsonError('Страница не найдена', 404);
    }

    await prisma.page.delete({ where: { id: params.id } });
    revalidatePath(`/${existing.slug}`);
    revalidatePath('/admin/pages');

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/pages/[id]', e);
    return jsonError('Ошибка сервера', 500);
  }
}
