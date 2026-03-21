'use client';

import Button from '@/components/ui/Button';
import { MOCK_FAQ } from '@/lib/mockData';
import { fadeInUp, viewportOnce } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: MOCK_FAQ.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

export default function FAQSection() {
  return (
    <section className="bg-primary py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-4">
        <motion.div
          className="will-change-transform"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          custom={0}
        >
          <h2 className="text-center font-heading text-3xl font-bold text-text-primary sm:text-4xl">
            Часто задаваемые вопросы
          </h2>
          <p className="mt-3 text-center text-text-secondary">
            Не нашли ответ? Свяжитесь с нами — мы поможем
          </p>
        </motion.div>

        <div className="mt-12 space-y-3">
          {MOCK_FAQ.map((item) => (
            <Disclosure key={item.question}>
              {({ open }) => (
                <div className="overflow-hidden rounded-lg border border-surface-light bg-surface">
                  <DisclosureButton
                    className={cn(
                      'flex w-full items-center justify-between px-5 py-4 text-left transition-colors',
                      open && 'bg-surface-light/50'
                    )}
                  >
                    <span className="pr-4 text-sm font-medium text-text-primary">{item.question}</span>
                    <ChevronDown
                      className={cn(
                        'h-5 w-5 shrink-0 text-text-secondary transition-transform duration-200',
                        open && 'rotate-180'
                      )}
                      aria-hidden
                    />
                  </DisclosureButton>
                  <DisclosurePanel
                    transition
                    className="origin-top text-sm leading-relaxed text-text-secondary transition duration-200 ease-out data-[closed]:pointer-events-none data-[closed]:-translate-y-2 data-[closed]:opacity-0"
                  >
                    <div className="px-5 pb-4">{item.answer}</div>
                  </DisclosurePanel>
                </div>
              )}
            </Disclosure>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button
            as="a"
            href="/contacts"
            variant="outline"
            leftIcon={<MessageSquare className="h-4 w-4" aria-hidden />}
          >
            Задать свой вопрос
          </Button>
        </div>
      </div>
    </section>
  );
}
