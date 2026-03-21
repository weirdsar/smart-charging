import QuizPageClient from '@/components/quiz/QuizPageClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Квиз — подбор генератора | Умная зарядка — Саратов',
  description:
    'Пять вопросов — подберём тип электростанции, ориентир по мощности и бюджету. Оставьте контакты для расчёта и консультации.',
  alternates: {
    canonical: '/quiz',
  },
};

export default function QuizPage() {
  return <QuizPageClient />;
}
