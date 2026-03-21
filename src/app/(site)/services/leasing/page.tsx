import ServiceDetailLayout from '@/components/site/ServiceDetailLayout';
import type { Metadata } from 'next';
import { BadgeRussianRuble, Building2, FileSpreadsheet, Handshake } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Лизинг и рассрочка | Умная зарядка — Саратов',
  description:
    'Лизинг генераторов и зарядных станций для юридических лиц, рассрочка для физических. Подбор программы под ваш бюджет.',
  alternates: {
    canonical: '/services/leasing',
  },
};

export default function LeasingServicePage() {
  return (
    <ServiceDetailLayout
      title="Лизинг и рассрочка"
      intro="Помогаем приобрести оборудование без разового крупного платежа: для компаний и ИП — лизинг с учётом налоговой оптимизации; для частных клиентов — рассрочка по согласованию с банком-партнёром."
      benefits={[
        {
          icon: Building2,
          title: 'Для бизнеса',
          text: 'Лизинг дизельных и бензиновых станций, зарядной инфраструктуры — график платежей под ваш денежный поток.',
        },
        {
          icon: BadgeRussianRuble,
          title: 'Рассрочка',
          text: 'Физические лица могут оформить рассрочку на отдельные позиции каталога — условия уточняйте у менеджера.',
        },
        {
          icon: FileSpreadsheet,
          title: 'Пакет документов',
          text: 'Помогаем с комплектом для банка или лизинговой компании: спецификации, счета, акты.',
        },
        {
          icon: Handshake,
          title: 'Прозрачные условия',
          text: 'Без скрытых платежей в договоре поставки и монтажа — смета согласована до старта.',
        },
      ]}
      steps={[
        'Заявка и короткий бриф: юрлицо / физлицо, сумма, срок.',
        'Подбор оборудования и предварительный расчёт вместе с финансовым партнёром.',
        'Согласование договора поставки и монтажа.',
        'Подписание, поставка и ввод в эксплуатацию.',
      ]}
      primaryCta={{ href: '/contacts', label: 'Запросить условия' }}
      secondaryCta={{ href: '/services/installation', label: 'Монтаж «под ключ»' }}
    />
  );
}
