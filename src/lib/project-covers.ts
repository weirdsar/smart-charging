import { PLACEHOLDER_PROJECT_IMAGE } from '@/lib/constants';

/**
 * Thematic project photos (Unsplash — free to use). Used when DB has no photos or only SVG placeholder.
 * Replace with real project photography when available.
 */
export const PROJECT_IMAGE_SETS: Record<string, string[]> = {
  'cottage-volzhsky': [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=1200&q=80&auto=format&fit=crop',
  ],
  'hotel-saratov-plaza': [
    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80&auto=format&fit=crop',
  ],
  'factory-sarplast': [
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1581092918056-0c4c3ac0b784?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1565043666747-69f1076aef03?w=1200&q=80&auto=format&fit=crop',
  ],
  'construction-kristall': [
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503389152951-9f343605f76e?w=1200&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1590644368357-23ada047fdd3?w=1200&q=80&auto=format&fit=crop',
  ],
};

function isPlaceholderPath(url: string): boolean {
  return url.includes('/placeholders/project.svg');
}

/** Resolved gallery URLs for carousel, listing, and detail (DB wins if real files exist). */
export function resolveProjectImages(slug: string, images: string[]): string[] {
  const trimmed = images.map((u) => u.trim()).filter(Boolean);
  const real = trimmed.filter((u) => !isPlaceholderPath(u));
  if (real.length > 0) {
    return real;
  }
  return PROJECT_IMAGE_SETS[slug] ?? [];
}

export function resolveProjectCover(slug: string, images: string[]): string {
  const list = resolveProjectImages(slug, images);
  return list[0] ?? PLACEHOLDER_PROJECT_IMAGE;
}
