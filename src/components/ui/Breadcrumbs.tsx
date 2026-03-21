import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

function toAbsoluteUrl(base: string, href: string): string {
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  const cleanBase = base.replace(/\/$/, '');
  const path = href.startsWith('/') ? href : `/${href}`;
  return `${cleanBase}${path}`;
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tts64.ru';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? toAbsoluteUrl(baseUrl, item.href) : baseUrl,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Навигационная цепочка">
        <ol className="flex flex-wrap items-center gap-1 text-sm">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-1">
                {index > 0 ? (
                  <ChevronRight className="h-4 w-4 shrink-0 text-text-secondary" aria-hidden />
                ) : null}
                {!isLast && item.href ? (
                  <Link
                    href={item.href}
                    className="text-text-secondary transition-colors hover:text-accent"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={
                      isLast ? 'font-medium text-text-primary' : 'text-text-secondary'
                    }
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
