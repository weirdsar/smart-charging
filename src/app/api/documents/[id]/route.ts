import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { documentFormUpdateSchema } from '@/lib/validations';
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

    const doc = await prisma.document.findUnique({ where: { id: params.id } });
    if (!doc) {
      return jsonError('Документ не найден', 404);
    }

    return NextResponse.json({ success: true, data: doc });
  } catch (e) {
    console.error('GET /api/documents/[id]', e);
    return jsonError('Ошибка сервера', 500);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const existing = await prisma.document.findUnique({ where: { id: params.id } });
    if (!existing) {
      return jsonError('Документ не найден', 404);
    }

    const json = (await req.json()) as unknown;
    const body = await documentFormUpdateSchema.parseAsync(json);

    const data: Prisma.DocumentUpdateInput = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.fileUrl !== undefined) data.fileUrl = body.fileUrl;
    if (body.docType !== undefined) data.docType = body.docType;
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;

    const updated = await prisma.document.update({
      where: { id: params.id },
      data,
    });

    revalidatePath('/admin/documents');
    revalidatePath('/documents');

    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.issues[0]?.message ?? 'Некорректные данные';
      return jsonError(msg, 400);
    }
    console.error('PUT /api/documents/[id]', e);
    return jsonError('Ошибка сервера', 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const existing = await prisma.document.findUnique({ where: { id: params.id } });
    if (!existing) {
      return jsonError('Документ не найден', 404);
    }

    await prisma.document.delete({ where: { id: params.id } });

    revalidatePath('/admin/documents');
    revalidatePath('/documents');

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/documents/[id]', e);
    return jsonError('Ошибка сервера', 500);
  }
}
