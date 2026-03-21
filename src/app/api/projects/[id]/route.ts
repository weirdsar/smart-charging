import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { projectFormUpdateSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
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

    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) {
      return jsonError('Проект не найден', 404);
    }

    return NextResponse.json({ success: true, data: project });
  } catch (e) {
    console.error('GET /api/projects/[id]', e);
    return jsonError('Ошибка сервера', 500);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const existing = await prisma.project.findUnique({ where: { id: params.id } });
    if (!existing) {
      return jsonError('Проект не найден', 404);
    }

    const json = (await req.json()) as unknown;
    const body = await projectFormUpdateSchema.parseAsync(json);

    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.project.findUnique({ where: { slug: body.slug } });
      if (slugExists) {
        return jsonError('Проект с таким slug уже существует', 400);
      }
    }

    const data: Prisma.ProjectUpdateInput = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.slug !== undefined) data.slug = body.slug;
    if (body.images !== undefined) data.images = body.images;
    if (body.task !== undefined) data.task = body.task;
    if (body.solution !== undefined) data.solution = body.solution;
    if (body.result !== undefined) data.result = body.result;
    if (body.reviewText !== undefined) data.reviewText = body.reviewText?.trim() || null;
    if (body.reviewAuthor !== undefined) data.reviewAuthor = body.reviewAuthor?.trim() || null;
    if (body.published !== undefined) data.published = body.published;

    const updated = await prisma.project.update({
      where: { id: params.id },
      data,
    });

    revalidatePath('/admin/projects');
    revalidatePath('/projects');
    revalidatePath(`/projects/${existing.slug}`);
    if (updated.slug !== existing.slug) {
      revalidatePath(`/projects/${updated.slug}`);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.issues[0]?.message ?? 'Некорректные данные';
      return jsonError(msg, 400);
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return jsonError('Проект с таким slug уже существует', 400);
    }
    console.error('PUT /api/projects/[id]', e);
    return jsonError('Ошибка сервера', 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const existing = await prisma.project.findUnique({ where: { id: params.id } });
    if (!existing) {
      return jsonError('Проект не найден', 404);
    }

    await prisma.project.delete({ where: { id: params.id } });

    revalidatePath('/admin/projects');
    revalidatePath('/projects');
    revalidatePath(`/projects/${existing.slug}`);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/projects/[id]', e);
    return jsonError('Ошибка сервера', 500);
  }
}
