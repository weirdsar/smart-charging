import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  ids: z.array(z.string()).max(4),
});

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const { ids } = schema.parse(body);

    if (ids.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      include: { category: { select: { name: true, type: true } } },
    });

    const map = new Map(products.map((p) => [p.id, p]));
    const ordered = ids.map((id) => map.get(id)).filter((p): p is (typeof products)[number] => p != null);

    const serialized = ordered.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: p.price.toNumber(),
      images: p.images,
      powerKw: p.powerKw,
      fuelType: p.fuelType,
      hasAvr: p.hasAvr,
      noiseLevelDb: p.noiseLevelDb,
      specs: p.specs,
      categoryName: p.category?.name,
      categoryType: p.category?.type,
    }));

    return NextResponse.json({ success: true, data: serialized });
  } catch (error) {
    console.error('POST /api/comparison', error);
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
