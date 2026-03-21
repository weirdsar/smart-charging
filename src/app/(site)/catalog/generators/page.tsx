import { Card } from '@/components/ui';
import type { Metadata } from 'next';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Factory, Zap } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Генераторы и электростанции | Умная зарядка — Саратов',
  description:
    'Каталог портативных и промышленных генераторов TSS. Официальный дилер, монтаж и сервис в Саратове.',
  alternates: {
    canonical: '/catalog/generators',
  },
};

const hubs: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    href: '/catalog/generators/portable',
    title: 'Портативные генераторы',
    description: 'До ~10 кВт: дача, дом, небольшой бизнес. Бензин и дизель, с АВР и без.',
    icon: Zap,
  },
  {
    href: '/catalog/generators/industrial',
    title: 'Промышленные генераторы',
    description: 'Свыше 10 кВт: производства, стройплощадки, объекты с повышенными требованиями к резерву.',
    icon: Factory,
  },
];

export default function GeneratorsHubPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">Генераторы</h1>
        <p className="mt-4 text-lg text-text-secondary">
          Официальный дилер TSS: портативные и стационарные электростанции с доставкой и монтажом «под ключ».
          Выберите категорию или вернитесь к общему каталогу.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {hubs.map((h) => (
          <Link key={h.href} href={h.href} className="group block">
            <Card
              padding="lg"
              className="h-full border-surface-light transition-colors group-hover:border-accent/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <h.icon className="h-6 w-6 text-accent" aria-hidden />
              </div>
              <h2 className="mt-4 font-heading text-xl font-bold text-text-primary group-hover:text-accent">
                {h.title}
              </h2>
              <p className="mt-2 text-sm text-text-secondary">{h.description}</p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-accent">
                Смотреть каталог
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Card>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-text-secondary">
        <Link href="/catalog" className="font-medium text-accent hover:text-accent-hover">
          ← Весь каталог
        </Link>
      </p>
    </div>
  );
}
