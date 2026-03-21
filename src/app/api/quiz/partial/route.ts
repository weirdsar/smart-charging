import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const partialSchema = z.object({
  answers: z.record(z.string()),
  step: z.number(),
});

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const data = partialSchema.parse(body);

    // For now, just acknowledge receipt
    // In production, could save to Redis or DB for remarketing
    console.log('[Quiz Partial]', data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Quiz Partial]', error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
