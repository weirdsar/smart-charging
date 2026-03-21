import { Button, Card } from '@/components/ui';
import type { Metadata } from 'next';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Headphones,
  Shield,
  UserRound,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Услуги | Умная зарядка — Саратов',
  description:
    'Монтаж генераторов и зарядных станций «под ключ», сервис, лизинг и выезд инженера. Официальный дилер TSS и Pandora в Саратове.',
  alternates: {
    canonical: '/services',
  },
};

const services: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    href: '/services/installation',
    title: 'Монтаж «под ключ»',
    description:
      'Проектирование ввода, электромонтаж, пусконаладка и обучение персонала. Гарантия 5 лет на работы.',
    icon: Wrench,
  },
  {
    href: '/services/maintenance',
    title: 'Сервисное обслуживание',
    description:
      'Плановое ТО, диагностика, ремонт и оригинальные запчасти. Договор на обслуживание генераторов и станций.',
    icon: Headphones,
  },
  {
    href: '/services/leasing',
    title: 'Лизинг и рассрочка',
    description:
      'Финансирование для юридических и физических лиц. Подбор программы под ваш график платежей.',
    icon: CreditCard,
  },
  {
    href: '/services/engineer-visit',
    title: 'Выезд инженера',
    description:
      'Обследование объекта, расчёт мощности, подбор оборудования и смета — до покупки.',
    icon: UserRound,
  },
];

const trust: { label: string; icon: LucideIcon }[] = [
  { label: 'Гарантия 5 лет', icon: Shield },
  { label: 'Выезд инженера', icon: UserRound },
  { label: 'Официальный дилер', icon: BadgeCheck },
  { label: 'Сервисное обслуживание', icon: Headphones },
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">Услуги</h1>
        <p className="mt-4 text-lg text-text-secondary">
          Помогаем на всех этапах: от выбора генератора или зарядной станции до монтажа, сервиса и финансирования.
          Работаем в Саратове и области, официально представляем бренды TSS и Pandora.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {services.map((s) => (
          <Card
            key={s.href}
            padding="lg"
            className="flex flex-col border-surface-light transition-colors hover:border-accent/40"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <s.icon className="h-6 w-6 text-accent" aria-hidden />
            </div>
            <h2 className="mt-4 font-heading text-xl font-bold text-text-primary">{s.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">{s.description}</p>
            <Button
              as="a"
              href={s.href}
              variant="outline"
              className="mt-6"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Подробнее
            </Button>
          </Card>
        ))}
      </div>

      <div className="mt-14 rounded-lg border border-surface-light bg-surface p-6 sm:p-8">
        <p className="text-center text-sm font-medium uppercase tracking-wide text-text-secondary">
          Нам доверяют
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {trust.map((t) => (
            <div
              key={t.label}
              className="flex flex-col items-center gap-2 rounded-md border border-surface-light bg-primary/50 px-3 py-4 text-center"
            >
              <t.icon className="h-6 w-6 text-accent" aria-hidden />
              <span className="text-sm font-medium text-text-primary">{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-10 text-center text-sm text-text-secondary">
        Нужна консультация?{' '}
        <Link href="/contacts" className="font-medium text-accent hover:text-accent-hover">
          Контакты
        </Link>
        {' · '}
        <Link href="/catalog" className="font-medium text-accent hover:text-accent-hover">
          Каталог
        </Link>
      </p>
    </div>
  );
}
