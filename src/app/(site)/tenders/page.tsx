import { Button, Card } from '@/components/ui';
import { COMPANY_EMAIL, COMPANY_PHONE, COMPANY_PHONE_DISPLAY } from '@/lib/constants';
import type { Metadata } from 'next';
import type { LucideIcon } from 'lucide-react';
import { Building2, FileStack, Handshake } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Тендеры и закупки | Умная зарядка — Саратов',
  description:
    'Работа с юридическими лицами: комплект документации, технические спецификации, сопровождение закупок и поставка оборудования TSS и Pandora.',
  alternates: {
    canonical: '/tenders',
  },
};

const blocks: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: FileStack,
    title: 'Документы',
    text:
      'Предоставляем карточку предприятия, реквизиты, спецификации и ответы по форме заказчика. Помогаем с приложениями к контракту.',
  },
  {
    icon: Building2,
    title: 'Опыт',
    text:
      'Реализованы проекты для производств, гостиниц, коттеджных посёлков и коммерческих объектов. По запросу — рекомендации и кейсы.',
  },
  {
    icon: Handshake,
    title: 'Условия работы',
    text:
      'Поставка, монтаж «под ключ», сервис и гарантия на работы. Сроки и этапы оплаты согласуем под процедуру закупки.',
  },
];

export default function TendersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
          Тендеры и закупки
        </h1>
        <p className="mt-4 text-lg text-text-secondary">
          Мы работаем с юридическими лицами и государственными заказчиками в рамках регламентов 44-ФЗ / 223-ФЗ и
          коммерческих процедур. Подготовим комплект документов, техническое описание и сопроводим поставку
          генераторов TSS и зарядных станций Pandora.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {blocks.map((b) => (
          <Card key={b.title} padding="lg" className="flex flex-col gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <b.icon className="h-6 w-6 text-accent" aria-hidden />
            </div>
            <h2 className="font-heading text-lg font-bold text-text-primary">{b.title}</h2>
            <p className="text-sm leading-relaxed text-text-secondary">{b.text}</p>
          </Card>
        ))}
      </div>

      <Card padding="lg" className="mx-auto mt-12 max-w-3xl border-accent/25 bg-surface">
        <p className="text-center font-heading text-lg font-bold text-text-primary">
          Свяжитесь с отделом продаж
        </p>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Телефон:{' '}
          <a href={`tel:${COMPANY_PHONE}`} className="font-medium text-accent hover:text-accent-hover">
            {COMPANY_PHONE_DISPLAY}
          </a>
          <br />
          Email:{' '}
          <a href={`mailto:${COMPANY_EMAIL}`} className="font-medium text-accent hover:text-accent-hover">
            {COMPANY_EMAIL}
          </a>
        </p>
        <div className="mt-6 flex justify-center">
          <Button as="a" href="/contacts" variant="primary">
            Форма обратной связи
          </Button>
        </div>
      </Card>

      <p className="mt-8 text-center text-sm text-text-secondary">
        <Link href="/documents" className="text-accent hover:text-accent-hover">
          Документы и сертификаты
        </Link>
        {' · '}
        <Link href="/services" className="text-accent hover:text-accent-hover">
          Услуги
        </Link>
      </p>
    </div>
  );
}
