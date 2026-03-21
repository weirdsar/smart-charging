'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { QuizResult as QuizResultModel } from '@/lib/quizConfig';
import { ArrowRight, Cpu, Zap } from 'lucide-react';
export interface QuizResultProps {
  result: QuizResultModel;
}

export default function QuizResult({ result }: QuizResultProps) {
  const catalogHref =
    result.recommendedType === 'industrial'
      ? '/catalog/generators/industrial'
      : '/catalog/generators/portable';

  const typeLabel =
    result.recommendedType === 'industrial' ? 'Промышленный генератор' : 'Портативный генератор';

  return (
    <Card padding="lg" className="border-accent/30 bg-surface/80">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-accent">Рекомендация</p>
          <h2 className="font-heading text-xl font-bold text-text-primary sm:text-2xl">{typeLabel}</h2>
          <ul className="mt-4 space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              <span>
                Мощность: <strong className="text-text-primary">{result.recommendedPower}</strong>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              <span>
                Ориентир по бюджету: <strong className="text-text-primary">{result.priceRange}</strong>
              </span>
            </li>
            <li>
              Автозапуск (АВР):{' '}
              <strong className="text-text-primary">{result.needsAvr ? 'рекомендуем' : 'по желанию'}</strong>
            </li>
          </ul>
        </div>
        <Button as="a" href={catalogHref} variant="outline" size="sm" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden />}>
          Смотреть в каталоге
        </Button>
      </div>
      <p className="mt-4 text-xs text-text-secondary">
        Итог предварительный — инженер уточнит нагрузку и условия монтажа. Оставьте контакты ниже — пришлём расчёт и
        варианты.
      </p>
    </Card>
  );
}
