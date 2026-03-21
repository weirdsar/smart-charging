import ServiceDetailLayout from '@/components/site/ServiceDetailLayout';
import type { Metadata } from 'next';
import { Calculator, MapPin, MessageSquare, Truck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Выезд инженера | Умная зарядка — Саратов',
  description:
    'Выезд специалиста на объект в Саратове и области: замер, подбор мощности генератора или зарядной станции, смета.',
  alternates: {
    canonical: '/services/engineer-visit',
  },
};

export default function EngineerVisitServicePage() {
  return (
    <ServiceDetailLayout
      title="Выезд инженера"
      intro="Инженер приезжает на объект, оценивает ввод, нагрузку, условия установки и подбирает решение под ваш бюджет. Вы получаете понятные рекомендации до покупки оборудования."
      benefits={[
        {
          icon: MapPin,
          title: 'Саратов и область',
          text: 'Выезд в радиусе работы компании — уточняйте доступность даты при заявке.',
        },
        {
          icon: Calculator,
          title: 'Расчёт мощности',
          text: 'Учитываем пусковые токи, фазы, необходимость АВР и перспективу расширения нагрузки.',
        },
        {
          icon: MessageSquare,
          title: 'Понятное заключение',
          text: 'После визита — краткое резюме и рекомендации по моделям без навязанного выбора.',
        },
        {
          icon: Truck,
          title: 'Связка с монтажом',
          text: 'Если решите работать с нами, смету монтажа согласуем на основе того же обследования.',
        },
      ]}
      steps={[
        'Заявка: телефон, адрес объекта, что хотите получить (генератор / зарядка).',
        'Согласование даты и времени выезда.',
        'Замеры и обсуждение на месте, ответы на вопросы.',
        'Письменное предложение или коммерческое предложение по запросу.',
      ]}
      primaryCta={{ href: '/contacts', label: 'Заказать выезд' }}
      secondaryCta={{ href: '/quiz', label: 'Квиз по подбору' }}
    />
  );
}
