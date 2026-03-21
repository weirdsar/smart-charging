import { Button, Card } from '@/components/ui';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, CheckCircle2, ListOrdered } from 'lucide-react';
import Link from 'next/link';

export interface ServiceBenefit {
  icon: LucideIcon;
  title: string;
  text: string;
}

export interface ServiceDetailLayoutProps {
  title: string;
  intro: string;
  benefits: ServiceBenefit[];
  steps: string[];
  primaryCta: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
}

export default function ServiceDetailLayout({
  title,
  intro,
  benefits,
  steps,
  primaryCta,
  secondaryCta,
}: ServiceDetailLayoutProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">{title}</h1>
        <p className="mt-4 text-lg text-text-secondary">{intro}</p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {benefits.map((b) => (
          <Card key={b.title} padding="lg" className="flex flex-col gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <b.icon className="h-6 w-6 text-accent" aria-hidden />
            </div>
            <h2 className="font-heading text-lg font-bold text-text-primary">{b.title}</h2>
            <p className="text-sm leading-relaxed text-text-secondary">{b.text}</p>
          </Card>
        ))}
      </div>

      <Card padding="lg" className="mt-12">
        <div className="mb-6 flex items-center gap-2">
          <ListOrdered className="h-6 w-6 text-accent" aria-hidden />
          <h2 className="font-heading text-xl font-bold text-text-primary">Как мы работаем</h2>
        </div>
        <ol className="space-y-4">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
                {i + 1}
              </span>
              <span className="pt-1 text-text-secondary">{step}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card padding="lg" className="mt-10 border-accent/30 bg-primary">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-heading text-lg font-bold text-text-primary">Готовы обсудить задачу?</p>
            <p className="mt-1 text-sm text-text-secondary">
              Оставьте заявку — подберём решение и сроки.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button as="a" href={primaryCta.href} variant="primary" rightIcon={<ArrowRight className="h-4 w-4" />}>
              {primaryCta.label}
            </Button>
            {secondaryCta ? (
              <Button as="a" href={secondaryCta.href} variant="outline">
                {secondaryCta.label}
              </Button>
            ) : null}
          </div>
        </div>
        <p className="mt-4 flex items-start gap-2 text-xs text-text-secondary">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
          Консультация и выезд инженера — по согласованию. Без навязанных услуг.
        </p>
      </Card>

      <p className="mt-8 text-center text-sm text-text-secondary">
        <Link href="/services" className="text-accent hover:text-accent-hover">
          ← Все услуги
        </Link>
      </p>
    </div>
  );
}
