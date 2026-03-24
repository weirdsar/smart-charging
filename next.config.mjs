import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Stable hash of hero PNG bytes at build time. Changes whenever main1/main2 change, so `?v=` updates
 * even if the filename stays the same (fixes stale Vercel edge cache).
 */
function getHeroContentHash() {
  const base = join(process.cwd(), 'public', 'content');
  const h = createHash('sha256');
  for (const name of ['main1.png', 'main2.png']) {
    const p = join(base, name);
    if (existsSync(p)) {
      h.update(readFileSync(p));
    }
  }
  const digest = h.digest('hex');
  return digest.length === 0 ? '' : digest.slice(0, 16);
}

const heroContentHash = getHeroContentHash();

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? '',
    NEXT_PUBLIC_HERO_CONTENT_HASH: heroContentHash,
  },
  output: 'standalone',
  experimental: {
    // Avoid bundling ~600MB of static product images into the upload API serverless bundle (Vercel 300MB limit).
    outputFileTracingExcludes: {
      '/api/upload': ['./public/images/**/*'],
    },
  },
  async headers() {
    return [
      {
        source: '/content/main1.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=3600, must-revalidate',
          },
        ],
      },
      {
        source: '/content/main2.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=3600, must-revalidate',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/**' },
      { protocol: 'https', hostname: 'localhost', pathname: '/**' },
      { protocol: 'https', hostname: 'tts64.ru', pathname: '/**' },
      { protocol: 'https', hostname: 'www.tts64.ru', pathname: '/**' },
      { protocol: 'https', hostname: 'www.tss.ru', pathname: '/**' },
      { protocol: 'https', hostname: 'tss.ru', pathname: '/**' },
      { protocol: 'https', hostname: 'static.tildacdn.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;
