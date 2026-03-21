'use client';

import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { fadeInUp, viewportOnce } from '@/lib/animations';
import {
  Award,
  Clock,
  CreditCard,
  Headphones,
  Shield,
  Wrench,
} from 'lucide-react';
import { motion } from 'framer-motion';

const ADVANTAGES = [
  {
    icon: Shield,
    title: 'Гарантия 5 лет',
    text: 'На все монтажные работы. Официальная гарантия производителя на оборудование.',
  },
  {
    icon: Wrench,
    title: 'Монтаж «под ключ»',
    text: 'От выезда инженера до запуска. Доставка, установка, подключение, пусконаладка.',
  },
  {
    icon: Award,
    title: 'Официальный дилер',
    text: 'Прямые поставки от TSS и Pandora. Сертифицированное оборудование, актуальные цены.',
  },
  {
    icon: Clock,
    title: 'Быстрые сроки',
    text: 'Монтаж портативного генератора — от 1 дня. Промышленного — от 5 дней.',
  },
  {
    icon: Headphones,
    title: 'Сервис и поддержка',
    text: 'Гарантийный и постгарантийный ремонт. Выездные сервисные бригады по области.',
  },
  {
    icon: CreditCard,
    title: 'Рассрочка и лизинг',
    text: 'Гибкие условия оплаты для физических и юридических лиц. Полный пакет документов.',
  },
] as const;

export default function AdvantagesSection() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          className="mb-16 text-center will-change-transform"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          custom={0}
        >
          <div className="flex justify-center">
            <Badge variant="accent" size="sm">
              Почему мы
            </Badge>
          </div>
          <h2 className="mt-4 font-heading text-3xl font-bold text-text-primary sm:text-4xl">
            Преимущества работы с нами
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
            Мы не просто продаём оборудование — мы решаем задачи энергоснабжения комплексно
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ADVANTAGES.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                custom={index * 0.1}
                className="will-change-transform"
              >
                <Card hover padding="lg" className="h-full">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                    <Icon className="h-6 w-6 text-accent" aria-hidden />
                  </div>
                  <h3 className="mb-2 font-heading text-lg font-bold text-text-primary">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-text-secondary">{item.text}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
