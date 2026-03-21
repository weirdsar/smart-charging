import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Необходима авторизация', 401);
    }

    const pages = await prisma.page.findMany({
      orderBy: { title: 'asc' },
    });

    return NextResponse.json({ success: true, data: pages });
  } catch (e) {
    console.error('GET /api/pages', e);
    return jsonError('Ошибка сервера', 500);
  }
}
