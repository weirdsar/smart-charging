import sanitizeHtmlLib from 'sanitize-html';

/**
 * Sanitize untrusted HTML for `dangerouslySetInnerHTML` (e.g. CMS / TipTap output).
 * Uses `sanitize-html` with an allowlist (same intent as DOMPurify in `.cursorrules`).
 * `isomorphic-dompurify`/jsdom is avoided here so Next.js SSG does not pull jsdom’s browser assets.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  return sanitizeHtmlLib(html, {
    allowedTags: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'a', 'img'],
    allowedAttributes: {
      a: ['href', 'target', 'rel', 'title'],
      img: ['src', 'alt', 'title'],
    },
  });
}
