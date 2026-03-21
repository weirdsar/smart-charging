import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { adminProductUpdateSchema } from '@/lib/validations';
import { CategoryType, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function revalidateProductCatalog(slug: string, categoryType: CategoryType) {
  revalidatePath('/admin/products');
  revalidatePath('/catalog');
  if (categoryType === 'CHARGING_STATIONS') {
    revalidatePath(`/catalog/charging-stations/${slug}`);
  } else {
    revalidatePath(`/catalog/generators/${slug}`);
  }
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

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { category: true },
    });

    if (!product) {
      return jsonError('Товар не найден', 404);
    }

    return NextResponse.json({ success: true, data: product });
  } catch (e) {
    console.error('GET /api/products/[id]', e);
    return jsonError('Ошибка сервера', 500);
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const existing = await prisma.product.findUnique({
      where: { id: params.id },
      include: { category: { select: { type: true } } },
    });
    if (!existing) {
      return jsonError('Товар не найден', 404);
    }

    const json = (await req.json()) as unknown;
    const body = await adminProductUpdateSchema.parseAsync(json);

    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.product.findUnique({ where: { slug: body.slug } });
      if (slugExists) {
        return jsonError('Товар с таким slug уже существует', 400);
      }
    }

    const data: Prisma.ProductUpdateInput = {};

    if (body.title !== undefined) data.title = body.title;
    if (body.slug !== undefined) data.slug = body.slug;
    if (body.categoryId !== undefined) data.category = { connect: { id: body.categoryId } };
    if (body.price !== undefined) data.price = new Decimal(body.price);
    if (body.priceOld !== undefined) {
      data.priceOld = body.priceOld == null ? null : new Decimal(body.priceOld);
    }
    if (body.shortDescription !== undefined) data.shortDescription = body.shortDescription;
    if (body.description !== undefined) data.description = body.description;
    if (body.specs !== undefined) {
      data.specs =
        body.specs && typeof body.specs === 'object'
          ? (body.specs as Prisma.InputJsonValue)
          : {};
    }
    if (body.images !== undefined) data.images = body.images;
    if (body.powerKw !== undefined) data.powerKw = body.powerKw;
    if (body.fuelType !== undefined) data.fuelType = body.fuelType;
    if (body.hasAvr !== undefined) data.hasAvr = body.hasAvr;
    if (body.noiseLevelDb !== undefined) data.noiseLevelDb = body.noiseLevelDb;
    if (body.connectorType !== undefined) data.connectorType = body.connectorType;
    if (body.purpose !== undefined) data.purpose = body.purpose;
    if (body.seoTitle !== undefined) data.seoTitle = body.seoTitle;
    if (body.seoDescription !== undefined) data.seoDescription = body.seoDescription;
    if (body.published !== undefined) data.published = body.published;
    if (body.inStock !== undefined) data.inStock = body.inStock;

    const updated = await prisma.product.update({
      where: { id: params.id },
      data,
      include: { category: { select: { type: true } } },
    });

    revalidateProductCatalog(existing.slug, existing.category.type);
    if (
      updated.slug !== existing.slug ||
      updated.category.type !== existing.category.type
    ) {
      revalidateProductCatalog(updated.slug, updated.category.type);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.errors[0]?.message ?? 'Некорректные данные';
      return jsonError(msg, 400);
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return jsonError('Товар с таким slug уже существует', 400);
    }
    console.error('PUT /api/products/[id]', e);
    return jsonError('Ошибка сервера', 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const existing = await prisma.product.findUnique({
      where: { id: params.id },
      include: { category: { select: { type: true } } },
    });
    if (!existing) {
      return jsonError('Товар не найден', 404);
    }

    await prisma.product.delete({ where: { id: params.id } });

    revalidatePath('/admin/products');
    revalidatePath('/catalog');
    if (existing.category.type === 'CHARGING_STATIONS') {
      revalidatePath(`/catalog/charging-stations/${existing.slug}`);
    } else {
      revalidatePath(`/catalog/generators/${existing.slug}`);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/products/[id]', e);
    return jsonError('Ошибка сервера', 500);
  }
}
