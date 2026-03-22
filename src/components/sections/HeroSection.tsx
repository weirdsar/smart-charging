'use client';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { fadeInUp } from '@/lib/animations';
import {
  COMPANY_PHONE,
  HOME_HERO_IMAGE,
  HOME_HERO_IMAGE_SECONDARY,
  PLACEHOLDER_PRODUCT_IMAGE,
} from '@/lib/constants';
import { motion } from 'framer-motion';
import { ArrowRight, Phone } from 'lucide-react';
import { useState } from 'react';

export default function HeroSection() {
  const telHref = `tel:${COMPANY_PHONE.replace(/\s/g, '')}`;
  const [heroPrimarySrc, setHeroPrimarySrc] = useState(HOME_HERO_IMAGE);
  const [heroSecondarySrc, setHeroSecondarySrc] = useState(HOME_HERO_IMAGE_SECONDARY);

  return (
    <section className="relative min-h-[85vh] overflow-hidden bg-gradient-to-br from-primary via-primary to-surface lg:min-h-[calc(100vh-4rem)]">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-accent/5 blur-3xl"
        aria-hidden
      />
      <div className="relative z-[1] mx-auto flex max-w-7xl flex-col items-center px-4 py-16 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:py-20">
        <div className="w-full max-w-2xl lg:w-[60%]">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.1}
            className="will-change-transform"
          >
            <Badge variant="accent">Официальный дилер TSS и Pandora</Badge>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.2}
            className="mt-6 font-heading text-4xl font-bold leading-tight text-text-primary sm:text-5xl lg:text-6xl will-change-transform"
          >
            Генераторы и зарядные станции с монтажом{' '}
            <span className="text-accent">«под ключ»</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.3}
            className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary sm:text-xl will-change-transform"
          >
            Продажа, установка и сервисное обслуживание электростанций TSS и зарядных станций
            Pandora в Саратове. Гарантия на монтаж — 5 лет.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.4}
            className="mt-8 flex flex-col gap-4 sm:flex-row will-change-transform"
          >
            <Button
              as="a"
              href="/quiz"
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="h-5 w-5" aria-hidden />}
            >
              Подобрать оборудование
            </Button>
            <Button
              as="a"
              href={telHref}
              variant="outline"
              size="lg"
              leftIcon={<Phone className="h-5 w-5" aria-hidden />}
            >
              Получить консультацию
            </Button>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.6}
            className="mt-12 flex flex-wrap gap-8 border-t border-surface-light pt-8 sm:gap-12 will-change-transform"
          >
            <div>
              <p className="text-3xl font-bold text-accent">5 лет</p>
              <p className="text-sm text-text-secondary">гарантии на монтаж</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent">100+</p>
              <p className="text-sm text-text-secondary">выполненных проектов</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent">24/7</p>
              <p className="text-sm text-text-secondary">сервисная поддержка</p>
            </div>
          </motion.div>
        </div>

        {/* No Framer Motion here: `hidden: { opacity: 0 }` on the image column could stick after hydration and hide hero photos on some clients. */}
        <div className="relative mt-10 flex w-full max-w-md flex-shrink-0 flex-col items-center justify-center lg:mt-0 lg:w-[40%]">
          <div className="absolute -inset-4 -z-10 rounded-2xl bg-accent/10 blur-3xl" aria-hidden />
          <div className="flex w-full max-w-md flex-col gap-3">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-accent/40 bg-surface shadow-lg">
              {/* Native img: avoids next/image layout edge cases; assets live under /public/content */}
              <img
                src={heroPrimarySrc}
                alt="Генераторы и зарядные станции TSS и Pandora — официальный дилер в Саратове"
                width={800}
                height={600}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                onError={() => setHeroPrimarySrc(PLACEHOLDER_PRODUCT_IMAGE)}
              />
            </div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-accent/30 bg-surface shadow-lg">
              <img
                src={heroSecondarySrc}
                alt="Оборудование TSS и Pandora — монтаж и сервис в Саратове"
                width={800}
                height={600}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                onError={() => setHeroSecondarySrc(PLACEHOLDER_PRODUCT_IMAGE)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
