/** Build absolute URL for OG / JSON-LD when `NEXT_PUBLIC_SITE_URL` is set. */
export function absoluteSiteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://tts64.ru').replace(/\/$/, '');
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}
