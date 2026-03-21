import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { adminProductCreateSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

const SORT_FIELDS = ['createdAt', 'title', 'price', 'updatedAt'] as const;

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
    const category = searchParams.get('category')?.trim() || '';
    const publishedParam = searchParams.get('published');
    const published =
      publishedParam === 'true' ? true : publishedParam === 'false' ? false : undefined;
    const sortByParam = searchParams.get('sortBy') || 'createdAt';
    const sortOrderParam = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    const sortBy = SORT_FIELDS.includes(sortByParam as (typeof SORT_FIELDS)[number])
      ? sortByParam
      : 'createdAt';

    const where: Prisma.ProductWhereInput = {
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
      ...(category ? { categoryId: category } : {}),
      ...(published !== undefined ? { published } : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { [sortBy]: sortOrderParam },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { id: true, name: true, type: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (e) {
    console.error('GET /api/products', e);
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
    const body = await adminProductCreateSchema.parseAsync(json);

    const existing = await prisma.product.findUnique({ where: { slug: body.slug } });
    if (existing) {
      return jsonError('Товар с таким slug уже существует', 400);
    }

    const priceDecimal = new Decimal(body.price);
    const priceOldDecimal =
      body.priceOld != null ? new Decimal(body.priceOld) : null;

    const specsValue =
      body.specs && typeof body.specs === 'object' && Object.keys(body.specs).length > 0
        ? body.specs
        : {};

    const product = await prisma.product.create({
      data: {
        title: body.title,
        slug: body.slug,
        categoryId: body.categoryId,
        price: priceDecimal,
        priceOld: priceOldDecimal,
        inStock: body.inStock ?? true,
        shortDescription: body.shortDescription,
        description: body.description,
        specs: specsValue as Prisma.InputJsonValue,
        images: body.images ?? [],
        powerKw: body.powerKw ?? null,
        fuelType: body.fuelType ?? null,
        hasAvr: body.hasAvr ?? null,
        noiseLevelDb: body.noiseLevelDb ?? null,
        connectorType: body.connectorType ?? null,
        purpose: body.purpose ?? null,
        seoTitle: body.seoTitle ?? null,
        seoDescription: body.seoDescription ?? null,
        published: body.published,
      },
    });

    revalidatePath('/admin/products');
    revalidatePath('/catalog');
    const cat = await prisma.category.findUnique({ where: { id: body.categoryId } });
    if (cat?.type === 'CHARGING_STATIONS') {
      revalidatePath(`/catalog/charging-stations/${body.slug}`);
    } else {
      revalidatePath(`/catalog/generators/${body.slug}`);
    }

    return NextResponse.json({ success: true, data: product });
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.errors[0]?.message ?? 'Некорректные данные';
      return jsonError(msg, 400);
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return jsonError('Товар с таким slug уже существует', 400);
    }
    console.error('POST /api/products', e);
    return jsonError('Ошибка сервера', 500);
  }
}
