'use client';

import Button from '@/components/ui/Button';
import { fadeInUp, viewportOnce } from '@/lib/animations';
import { COMPANY_PHONE } from '@/lib/constants';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Phone } from 'lucide-react';

export default function CTASection() {
  const telHref = `tel:${COMPANY_PHONE.replace(/\s/g, '')}`;

  return (
    <section className="relative overflow-hidden bg-primary py-20">
      <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-accent/5 blur-3xl" aria-hidden />
      <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-accent/5 blur-3xl" aria-hidden />

      <motion.div
        className="relative z-10 mx-auto max-w-4xl px-4 text-center will-change-transform"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        custom={0}
      >
        <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
          Не знаете, какой генератор выбрать?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
          Ответьте на 5 простых вопросов, и мы подберём оптимальное решение с расчётом стоимости. Это
          бесплатно и займёт 2 минуты.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            as="a"
            href="/quiz"
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight className="h-5 w-5" aria-hidden />}
          >
            Пройти подбор
          </Button>
          <Button
            as="a"
            href={telHref}
            variant="ghost"
            size="lg"
            leftIcon={<Phone className="h-5 w-5" aria-hidden />}
          >
            Или позвоните нам
          </Button>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-text-secondary">
          <span className="inline-flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0 text-success" aria-hidden />
            Бесплатная консультация
          </span>
          <span className="inline-flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0 text-success" aria-hidden />
            Расчёт за 2 минуты
          </span>
          <span className="inline-flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0 text-success" aria-hidden />
            Без обязательств
          </span>
        </div>
      </motion.div>
    </section>
  );
}
