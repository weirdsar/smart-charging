'use client';

import Card from '@/components/ui/Card';
import { MOCK_TESTIMONIALS } from '@/lib/mockData';
import { fadeInUp, viewportOnce } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function TestimonialsSection() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-4">
        <motion.h2
          className="text-center font-heading text-3xl font-bold text-text-primary sm:text-4xl will-change-transform"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          custom={0}
        >
          Отзывы клиентов
        </motion.h2>

        <div className="mt-12 flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-2 lg:overflow-visible">
          {MOCK_TESTIMONIALS.map((item, index) => (
            <motion.div
              key={item.id}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              custom={index * 0.1}
              className="min-w-[300px] shrink-0 will-change-transform lg:min-w-0"
            >
              <Card padding="lg" className="h-full">
                <div className="mb-4 flex gap-1" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={cn(
                        i < item.rating ? 'fill-accent text-accent' : 'text-surface-light'
                      )}
                    />
                  ))}
                </div>
                <blockquote className="text-sm italic leading-relaxed text-text-primary">
                  <span className="mr-1 font-serif text-4xl leading-none text-accent">«</span>
                  {item.text}
                </blockquote>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                    {item.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{item.author}</p>
                    <p className="text-xs text-text-secondary">{item.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
