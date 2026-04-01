import { prisma } from '@/lib/prisma';
import { sendLeadNotifications } from '@/lib/leadNotifications';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const notifyLeadSchema = z.object({
  leadId: z.string().min(1),
});

function parseUtmData(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const entries = Object.entries(value).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string'
  );

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const { leadId } = notifyLeadSchema.parse(body);

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        type: true,
        name: true,
        phone: true,
        email: true,
        message: true,
        sourcePage: true,
        utmData: true,
        product: {
          select: {
            title: true,
            slug: true,
            category: { select: { type: true } },
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Заявка не найдена' },
        { status: 404 }
      );
    }

    await sendLeadNotifications({
      type: lead.type,
      name: lead.name,
      phone: lead.phone,
      email: lead.email ?? undefined,
      message: lead.message ?? undefined,
      productTitle: lead.product?.title,
      productSlug: lead.product?.slug,
      productCategoryType: lead.product?.category?.type ?? null,
      sourcePage: lead.sourcePage,
      utmData: parseUtmData(lead.utmData),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message ?? 'Некорректные данные' },
        { status: 400 }
      );
    }

    console.error('Lead notification error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера. Попробуйте позже.' },
      { status: 500 }
    );
  }
}
