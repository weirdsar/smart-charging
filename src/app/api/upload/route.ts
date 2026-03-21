import { auth } from '@/lib/auth';
import crypto from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { type NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PDF_BYTES = 20 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function sanitizeFolder(folder: string | null): string | null {
  const raw = (folder ?? 'products').trim().replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  if (!raw) return 'products';
  const parts = raw.split('/').filter(Boolean);
  const roots = new Set(['products', 'projects', 'blog', 'documents']);
  if (!roots.has(parts[0] ?? '')) {
    return null;
  }
  if (parts[0] === 'documents' && parts.length !== 1) {
    return null;
  }
  for (const p of parts) {
    if (!/^[a-zA-Z0-9_-]+$/.test(p)) {
      return null;
    }
  }
  if (parts.length > 8) {
    return null;
  }
  return parts.join('/');
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Не авторизован', 401);
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const folderField = formData.get('folder');

    if (!(file instanceof File)) {
      return jsonError('Файл не передан', 400);
    }

    const folder = sanitizeFolder(typeof folderField === 'string' ? folderField : null);
    if (!folder) {
      return jsonError('Недопустимая папка загрузки', 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (folder === 'documents') {
      if (file.type !== 'application/pdf') {
        return jsonError('Для документов допустим только PDF', 400);
      }
      if (file.size > MAX_PDF_BYTES) {
        return jsonError('PDF слишком большой (максимум 20 МБ)', 400);
      }
      const filename = `${crypto.randomBytes(16).toString('hex')}.pdf`;
      const uploadDir = join(process.cwd(), 'public', 'docs');
      await mkdir(uploadDir, { recursive: true });
      const filepath = join(uploadDir, filename);
      await writeFile(filepath, buffer);
      const publicUrl = `/docs/${filename}`;
      return NextResponse.json({ success: true, data: { url: publicUrl } });
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return jsonError('Допустимы только JPEG, PNG и WebP', 400);
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return jsonError('Файл слишком большой (максимум 5 МБ)', 400);
    }

    const ext = MIME_TO_EXT[file.type];
    if (!ext) {
      return jsonError('Неподдерживаемый тип файла', 400);
    }

    const filename = `${crypto.randomBytes(16).toString('hex')}.${ext}`;
    const uploadDir = join(process.cwd(), 'public', 'images', folder);
    await mkdir(uploadDir, { recursive: true });
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const publicUrl = `/images/${folder}/${filename}`;

    return NextResponse.json({ success: true, data: { url: publicUrl } });
  } catch (error) {
    console.error('Upload error:', error);
    return jsonError('Ошибка загрузки', 500);
  }
}

export function GET() {
  return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 });
}

export function PUT() {
  return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 });
}

export function DELETE() {
  return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 });
}
