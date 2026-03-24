/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bust CDN/browser cache for static assets that keep the same filename (e.g. hero PNGs in /public/content).
  env: {
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? '',
  },
  output: 'standalone',
  experimental: {
    // Avoid bundling ~600MB of static product images into the upload API serverless bundle (Vercel 300MB limit).
    outputFileTracingExcludes: {
      '/api/upload': ['./public/images/**/*'],
    },
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
