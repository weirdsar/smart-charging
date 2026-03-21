import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendLeadNotification } from '@/lib/telegram';
import { sendEmail, getAutoReplyHtml } from '@/lib/email';
import { checkRateLimit } from '@/lib/rateLimit';
import { calculateQuizResult } from '@/lib/quizConfig';
import { normalizePhone } from '@/lib/utils';
import { Prisma } from '@prisma/client';

const quizSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.union([z.string().email('Некорректный email'), z.literal('')]).optional(),
  answers: z.record(z.string()),
  sourcePage: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
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
    const data = quizSchema.parse(body);
    const result = calculateQuizResult(data.answers);

    const normalizedPhone = normalizePhone(data.phone);
    const digits = normalizedPhone.replace(/\D/g, '');
    if (digits.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Укажите корректный телефон' },
        { status: 400 }
      );
    }

    const email =
      data.email && typeof data.email === 'string' && data.email.trim().length > 0
        ? data.email.trim()
        : undefined;

    const lead = await prisma.lead.create({
      data: {
        type: 'QUIZ',
        name: data.name.trim(),
        phone: normalizedPhone,
        email,
        quizData: { answers: data.answers, result } as unknown as Prisma.InputJsonValue,
        sourcePage: data.sourcePage,
        status: 'NEW',
      },
    });

    void sendLeadNotification({
      type: 'QUIZ',
      name: data.name.trim(),
      phone: normalizedPhone,
      email,
      message: `Тип: ${result.recommendedType}, Мощность: ${result.recommendedPower}, АВР: ${result.needsAvr ? 'да' : 'нет'}`,
      sourcePage: data.sourcePage,
    }).catch((err: unknown) => console.error('Telegram notification error:', err));

    if (email) {
      void sendEmail({
        to: email,
        subject: 'Результаты подбора генератора — Умная зарядка',
        html: getAutoReplyHtml(data.name.trim(), 'B2C'),
        leadMagnetType: 'B2C',
      }).catch((err: unknown) => console.error('Quiz email error:', err));
    }

    return NextResponse.json({ success: true, data: { id: lead.id, result } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message ?? 'Некорректные данные' },
        { status: 400 }
      );
    }
    console.error('Quiz error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
