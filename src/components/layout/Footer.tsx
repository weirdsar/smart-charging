import {
  COMPANY_ADDRESS,
  COMPANY_EMAIL,
  COMPANY_PHONE,
  COMPANY_PHONE_DISPLAY,
  COMPANY_USP,
  FOOTER_CATALOG_LINKS,
  FOOTER_INFO_LINKS,
  FOOTER_SERVICE_LINKS,
} from '@/lib/constants';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();
  const telHref = `tel:${COMPANY_PHONE.replace(/\s/g, '')}`;

  return (
    <footer>
      <div className="border-t border-surface-light bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="flex flex-col">
                <span className="font-heading text-lg font-bold text-text-primary">
                  Умная<span className="text-accent">Зарядка</span>
                </span>
              </Link>
              <p className="mt-3 max-w-[250px] text-sm text-text-secondary">{COMPANY_USP}</p>
              <a
                href={telHref}
                className="mt-4 block text-lg font-bold text-accent transition-colors hover:text-accent-hover"
              >
                {COMPANY_PHONE_DISPLAY}
              </a>
              <a
                href={`mailto:${COMPANY_EMAIL}`}
                className="mt-2 block text-sm text-text-secondary transition-colors hover:text-accent"
              >
                {COMPANY_EMAIL}
              </a>
              <p className="mt-2 text-sm text-text-secondary">{COMPANY_ADDRESS}</p>
            </div>

            <div>
              <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-text-primary">
                Каталог
              </h2>
              <ul className="space-y-1">
                {FOOTER_CATALOG_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block py-1 text-sm text-text-secondary transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-text-primary">
                Услуги
              </h2>
              <ul className="space-y-1">
                {FOOTER_SERVICE_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block py-1 text-sm text-text-secondary transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-text-primary">
                Информация
              </h2>
              <ul className="space-y-1">
                {FOOTER_INFO_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block py-1 text-sm text-text-secondary transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/quiz"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
              >
                Подобрать генератор
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-surface-light py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-4">
          <span className="rounded border border-surface-light px-3 py-1.5 text-xs text-text-secondary">
            Официальный дилер TSS
          </span>
          <span className="rounded border border-surface-light px-3 py-1.5 text-xs text-text-secondary">
            Официальный дилер Pandora
          </span>
        </div>
      </div>

      <div className="border-t border-surface-light bg-primary">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 md:flex-row">
          <p className="text-center text-xs text-text-secondary md:text-left">
            © {year} ООО «Умная зарядка». Все права защищены.
          </p>
          <Link
            href="/privacy"
            className="text-xs text-text-secondary transition-colors hover:text-accent"
          >
            Политика конфиденциальности
          </Link>
        </div>
      </div>
    </footer>
  );
}
