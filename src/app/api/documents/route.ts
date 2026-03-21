import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { documentFormSchema } from '@/lib/validations';
import type { DocumentType } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

const SORT_FIELDS = ['createdAt', 'title', 'sortOrder', 'updatedAt'] as const;

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
    const docTypeParam = searchParams.get('docType')?.trim() || '';
    const docTypes: DocumentType[] = ['CERTIFICATE', 'PERMIT', 'GRATITUDE', 'OTHER'];
    const docTypeFilter =
      docTypeParam && docTypes.includes(docTypeParam as DocumentType)
        ? (docTypeParam as DocumentType)
        : null;
    const sortByParam = searchParams.get('sortBy') || 'sortOrder';
    const sortOrderParam = searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc';
    const sortBy = SORT_FIELDS.includes(sortByParam as (typeof SORT_FIELDS)[number])
      ? sortByParam
      : 'sortOrder';

    const where: Prisma.DocumentWhereInput = {
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
      ...(docTypeFilter ? { docType: docTypeFilter } : {}),
    };

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { [sortBy]: sortOrderParam },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.document.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      success: true,
      data: {
        documents,
        pagination: { page, limit, total, totalPages },
      },
    });
  } catch (e) {
    console.error('GET /api/documents', e);
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
    const body = await documentFormSchema.parseAsync(json);

    const doc = await prisma.document.create({
      data: {
        title: body.title,
        fileUrl: body.fileUrl,
        docType: body.docType,
        sortOrder: body.sortOrder,
      },
    });

    revalidatePath('/admin/documents');
    revalidatePath('/documents');

    return NextResponse.json({ success: true, data: doc });
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.issues[0]?.message ?? 'Некорректные данные';
      return jsonError(msg, 400);
    }
    console.error('POST /api/documents', e);
    return jsonError('Ошибка сервера', 500);
  }
}
