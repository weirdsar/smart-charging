import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { adminCategoryUpdateSchema } from '@/lib/validations';
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

    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { products: true } },
        parent: { select: { id: true, name: true } },
      },
    });

    if (!category) {
      return jsonError('Категория не найдена', 404);
    }

    return NextResponse.json({ success: true, data: category });
  } catch (e) {
    console.error('GET /api/categories/[id]', e);
    return jsonError('Ошибка сервера', 500);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const existing = await prisma.category.findUnique({ where: { id: params.id } });
    if (!existing) {
      return jsonError('Категория не найдена', 404);
    }

    const json = (await req.json()) as unknown;
    const body = await adminCategoryUpdateSchema.parseAsync(json);

    if (body.parentId === params.id) {
      return jsonError('Категория не может быть родителем самой себя', 400);
    }

    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.category.findUnique({ where: { slug: body.slug } });
      if (slugExists) {
        return jsonError('Категория с таким slug уже существует', 400);
      }
    }

    const data: Prisma.CategoryUpdateInput = {};

    if (body.name !== undefined) data.name = body.name;
    if (body.slug !== undefined) data.slug = body.slug;
    if (body.type !== undefined) data.type = body.type;
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;
    if (body.seoTitle !== undefined) data.seoTitle = body.seoTitle;
    if (body.seoDescription !== undefined) data.seoDescription = body.seoDescription;
    if (body.seoContent !== undefined) data.seoContent = body.seoContent;

    if (body.parentId !== undefined) {
      if (body.parentId === '' || body.parentId === null) {
        data.parent = { disconnect: true };
      } else {
        data.parent = { connect: { id: body.parentId } };
      }
    }

    const updated = await prisma.category.update({
      where: { id: params.id },
      data,
      include: {
        _count: { select: { products: true } },
        parent: { select: { id: true, name: true } },
      },
    });

    revalidatePath('/admin/categories');
    revalidatePath('/catalog');

    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.errors[0]?.message ?? 'Некорректные данные';
      return jsonError(msg, 400);
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return jsonError('Категория с таким slug уже существует', 400);
    }
    console.error('PUT /api/categories/[id]', e);
    return jsonError('Ошибка сервера', 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const existing = await prisma.category.findUnique({ where: { id: params.id } });
    if (!existing) {
      return jsonError('Категория не найдена', 404);
    }

    const productCount = await prisma.product.count({ where: { categoryId: params.id } });
    if (productCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Невозможно удалить категорию: есть ${productCount} товаров`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id: params.id } });

    revalidatePath('/admin/categories');
    revalidatePath('/catalog');

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/categories/[id]', e);
    return jsonError('Ошибка сервера', 500);
  }
}
