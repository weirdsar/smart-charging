import { Card } from '@/components/ui';
import {
  COMPANY_EMAIL,
  COMPANY_NAME,
  COMPANY_PHONE_DISPLAY,
} from '@/lib/constants';
import type { Metadata } from 'next';
import { FileText, Lock, Mail, Server, Share2, Shield } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности | Умная зарядка — Саратов',
  description:
    'Политика обработки персональных данных ООО «Умная зарядка»: какие данные собираем, цели, защита и контакты.',
  alternates: {
    canonical: '/privacy',
  },
};

const sections: {
  icon: typeof Shield;
  title: string;
  body: string[];
}[] = [
  {
    icon: FileText,
    title: 'Общие положения',
    body: [
      `Настоящая политика описывает порядок обработки персональных данных посетителей сайта и клиентов ${COMPANY_NAME} (ООО «Умная зарядка», г. Саратов).`,
      'Используя сайт и отправляя формы, вы подтверждаете ознакомление с этой политикой.',
    ],
  },
  {
    icon: Lock,
    title: 'Какие данные мы собираем',
    body: [
      'Имя, номер телефона, адрес электронной почты — при заполнении форм обратной связи, заказа звонка, запроса коммерческого предложения и иных заявок.',
      'Технические данные визита (например, страница источника, UTM-метки) — для понимания эффективности каналов обращения.',
    ],
  },
  {
    icon: Shield,
    title: 'Цели обработки',
    body: [
      'Связь с вами по заявке: консультация, расчёт стоимости, организация выезда инженера.',
      'Направление информации о продуктах и услугах — только если вы дали на это согласие или это следует из характера заявки.',
      'Ведение внутреннего учёта обращений и улучшение качества сервиса.',
    ],
  },
  {
    icon: Share2,
    title: 'Передача данных',
    body: [
      'Мы не продаём персональные данные третьим лицам.',
      'Передача возможна исполнителям, которые помогают в работе сайта и коммуникаций (хостинг, почтовый сервис, мессенджеры), в объёме, необходимом для оказания услуг.',
    ],
  },
  {
    icon: Server,
    title: 'Защита данных',
    body: [
      'Применяются организационные и технические меры: ограничение доступа сотрудников, использование защищённых каналов связи, актуальные обновления ПО на стороне подрядчиков.',
      'Срок хранения данных определяется целями обработки и требованиями закона; вы можете запросить уточнение или удаление — напишите на указанный ниже email.',
    ],
  },
  {
    icon: Mail,
    title: 'Контакты',
    body: [
      `По вопросам персональных данных: ${COMPANY_EMAIL}, тел. ${COMPANY_PHONE_DISPLAY}.`,
      'Ответ предоставляется в разумный срок после проверки обращения.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
          Политика конфиденциальности
        </h1>
        <p className="mt-4 text-lg text-text-secondary">
          Мы уважаем вашу конфиденциальность и обрабатываем данные прозрачно — в соответствии с законодательством РФ о персональных данных.
        </p>
      </div>

      <Card padding="lg" className="mx-auto mt-10 max-w-3xl border-accent/25 bg-surface">
        <p className="text-sm leading-relaxed text-text-secondary">
          <span className="font-semibold text-text-primary">Обработка заявок:</span> при отправке
          заявок через сайт данные дублируются в закрытую рабочую группу в{' '}
          <strong className="text-text-primary">Telegram</strong> и на корпоративную{' '}
          <strong className="text-text-primary">электронную почту</strong> — чтобы менеджер мог оперативно
          ответить. Это служебные каналы {COMPANY_NAME}, а не публичные рассылки.
        </p>
      </Card>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {sections.map((s) => (
          <Card key={s.title} padding="lg" className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10">
                <s.icon className="h-5 w-5 text-accent" aria-hidden />
              </div>
              <h2 className="font-heading text-lg font-bold text-text-primary">{s.title}</h2>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-12 text-center text-sm text-text-secondary">
        Вопросы по политике:{' '}
        <a href={`mailto:${COMPANY_EMAIL}`} className="text-accent hover:text-accent-hover">
          {COMPANY_EMAIL}
        </a>
        {' · '}
        <Link href="/contacts" className="text-accent hover:text-accent-hover">
          Страница контактов
        </Link>
      </p>
    </div>
  );
}
