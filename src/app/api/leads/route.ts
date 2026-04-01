import { prisma } from '@/lib/prisma';
import { sendLeadNotifications } from '@/lib/leadNotifications';
import { checkRateLimit } from '@/lib/rateLimit';
import { leadApiSubmissionSchema } from '@/lib/validations';
import { normalizePhone } from '@/lib/utils';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = req.headers.get('x-real-ip');
  return forwarded ?? realIp ?? 'unknown';
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Слишком много запросов. Попробуйте через ${rateCheck.resetIn} секунд.`,
        },
        { status: 429 }
      );
    }

    const body: unknown = await req.json();
    const data = leadApiSubmissionSchema.parse(body);

    const normalizedPhone = normalizePhone(data.phone);
    const email =
      data.email && data.email.trim().length > 0 ? data.email.trim() : undefined;

    let product: {
      id: string;
      title: string;
      slug: string;
      category: { type: string } | null;
    } | null = null;

    if (data.productId) {
      product = await prisma.product.findUnique({
        where: { id: data.productId },
        select: { id: true, title: true, slug: true, category: { select: { type: true } } },
      });
    }

    const lead = await prisma.lead.create({
      data: {
        type: data.type,
        name: data.name,
        phone: normalizedPhone,
        email,
        message: data.message,
        productId: product?.id,
        sourcePage: data.sourcePage,
        utmData: data.utmData
          ? (data.utmData as Prisma.InputJsonValue)
          : undefined,
        status: 'NEW',
      },
    });

    if (!data.deferNotifications) {
      await sendLeadNotifications({
        type: data.type,
        name: data.name,
        phone: normalizedPhone,
        email,
        message: data.message,
        productTitle: product?.title,
        productSlug: product?.slug,
        productCategoryType: product?.category?.type ?? null,
        sourcePage: data.sourcePage,
        utmData: data.utmData,
      });
    }

    return NextResponse.json({ success: true, data: { id: lead.id } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const first = error.issues[0];
      return NextResponse.json(
        { success: false, error: first?.message ?? 'Некорректные данные' },
        { status: 400 }
      );
    }

    console.error('Lead creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера. Попробуйте позже.' },
      { status: 500 }
    );
  }
}
