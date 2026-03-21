import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

const settingsBodySchema = z.record(z.string(), z.string());

/** GET all settings as key → value map */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const settings = await prisma.siteSetting.findMany();
    const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

    return NextResponse.json({ success: true, data: settingsMap });
  } catch (e) {
    console.error('GET /api/settings', e);
    return jsonError('Ошибка сервера', 500);
  }
}

/** POST — upsert key/value pairs (string values only) */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const json = (await req.json()) as unknown;
    const settings = settingsBodySchema.parse(json);

    for (const [key, value] of Object.entries(settings)) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.issues[0]?.message ?? 'Некорректные данные';
      return jsonError(msg, 400);
    }
    console.error('POST /api/settings', e);
    return jsonError('Ошибка сервера', 500);
  }
}
