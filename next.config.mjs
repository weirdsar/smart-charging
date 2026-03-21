/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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
