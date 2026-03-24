import type { StaticImageData } from 'next/image';
import heroMain1 from '@/assets/hero/main1.png';
import heroMain2 from '@/assets/hero/main2.png';

/**
 * Source: `src/assets/hero/main1.png`, `main2.png` (sync from `public/content/` when updating files).
 * Bundled → `/_next/static/media/...` (content hash in filename; avoids stale `/public` CDN).
 */
export const HERO_MAIN1: StaticImageData = heroMain1;
export const HERO_MAIN2: StaticImageData = heroMain2;
