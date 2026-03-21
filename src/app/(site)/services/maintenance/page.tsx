import ServiceDetailLayout from '@/components/site/ServiceDetailLayout';
import type { Metadata } from 'next';
import { ClipboardList, Gauge, RefreshCw, Wrench } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Сервисное обслуживание | Умная зарядка — Саратов',
  description:
    'ТО и ремонт генераторов TSS и зарядных станций Pandora. Оригинальные запчасти, договорное обслуживание, выезд инженера.',
  alternates: {
    canonical: '/services/maintenance',
  },
};

export default function MaintenanceServicePage() {
  return (
    <ServiceDetailLayout
      title="Сервисное обслуживание"
      intro="Регулярное ТО продлевает ресурс агрегата и снижает риск внезапных отказов. Обслуживаем установленное нами оборудование и принимаем на сервис технику, купленную у официальных поставщиков."
      benefits={[
        {
          icon: ClipboardList,
          title: 'Регламентные работы',
          text: 'Масло, фильтры, проверка узлов и системы управления согласно моточасам и условиям эксплуатации.',
        },
        {
          icon: Wrench,
          title: 'Ремонт и диагностика',
          text: 'Находим причину неисправности, используем оригинальные запчасти и даём заключение по результатам.',
        },
        {
          icon: Gauge,
          title: 'Нагрузочные прогоны',
          text: 'Проверяем работу под нагрузкой после длительного простоя или ремонта.',
        },
        {
          icon: RefreshCw,
          title: 'Договор на ТО',
          text: 'Фиксируем периодичность визитов и стоимость — удобно для предприятий и объектов с резервом.',
        },
      ]}
      steps={[
        'Заявка по телефону, почте или через форму на сайте.',
        'Согласование даты и времени выезда инженера.',
        'Диагностика или плановое ТО и акт выполненных работ.',
        'Рекомендации по дальнейшей эксплуатации и следующему визиту.',
      ]}
      primaryCta={{ href: '/contacts', label: 'Заказать сервис' }}
      secondaryCta={{ href: '/catalog', label: 'Смотреть каталог' }}
    />
  );
}
