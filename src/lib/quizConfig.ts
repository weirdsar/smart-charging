export interface QuizOption {
  value: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'object',
    question: 'Какой объект нужно обеспечить электричеством?',
    options: [
      { value: 'house', label: 'Частный дом / коттедж' },
      { value: 'dacha', label: 'Дача / садовый участок' },
      { value: 'production', label: 'Производство / склад' },
      { value: 'shop', label: 'Магазин / офис' },
      { value: 'construction', label: 'Стройплощадка' },
      { value: 'other', label: 'Другое' },
    ],
  },
  {
    id: 'power',
    question: 'Какая мощность вам нужна?',
    options: [
      { value: '0-5', label: 'До 5 кВт (освещение, холодильник, ТВ)' },
      { value: '5-15', label: '5–15 кВт (+ насос, электроинструмент)' },
      { value: '15-50', label: '15–50 кВт (небольшое производство)' },
      { value: '50-100', label: '50–100 кВт (среднее производство)' },
      { value: '100+', label: 'Более 100 кВт' },
      { value: 'unknown', label: 'Не знаю, нужна консультация' },
    ],
  },
  {
    id: 'avr',
    question: 'Нужен ли автозапуск при отключении электричества?',
    options: [
      { value: 'yes', label: 'Да, обязательно (АВР)' },
      { value: 'no', label: 'Нет, ручной запуск устроит' },
      { value: 'unknown', label: 'Не знаю, нужна консультация' },
    ],
  },
  {
    id: 'budget',
    question: 'Какой у вас бюджет?',
    options: [
      { value: '0-50', label: 'До 50 000 ₽' },
      { value: '50-200', label: '50 000 – 200 000 ₽' },
      { value: '200-500', label: '200 000 – 500 000 ₽' },
      { value: '500+', label: 'Более 500 000 ₽' },
      { value: 'unknown', label: 'Бюджет не определён' },
    ],
  },
  {
    id: 'leasing',
    question: 'Интересует ли рассрочка или лизинг?',
    options: [
      { value: 'yes', label: 'Да, рассмотрю варианты' },
      { value: 'no', label: 'Нет, оплачу сразу' },
      { value: 'maybe', label: 'Возможно, зависит от условий' },
    ],
  },
];

export interface QuizResult {
  recommendedType: 'portable' | 'industrial';
  recommendedPower: string;
  priceRange: string;
  needsAvr: boolean;
}

export function calculateQuizResult(answers: Record<string, string>): QuizResult {
  const power = answers.power || 'unknown';
  const isIndustrial = ['50-100', '100+'].includes(power) || answers.object === 'production';

  let priceRange = '50 000 – 150 000 ₽';
  if (power === '15-50') priceRange = '150 000 – 500 000 ₽';
  if (power === '50-100') priceRange = '500 000 – 1 500 000 ₽';
  if (power === '100+') priceRange = 'от 1 500 000 ₽';

  const powerLabel =
    power === 'unknown' ? 'требуется расчёт' : `${power.replace(/-/g, '–')} кВт`;

  return {
    recommendedType: isIndustrial ? 'industrial' : 'portable',
    recommendedPower: powerLabel,
    priceRange,
    needsAvr: answers.avr === 'yes',
  };
}
