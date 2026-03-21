import ContactForm from '@/components/forms/ContactForm';
import YandexMap from '@/components/site/YandexMap';
import { Card } from '@/components/ui';
import {
  COMPANY_ADDRESS,
  COMPANY_EMAIL,
  COMPANY_PHONE,
  COMPANY_PHONE_DISPLAY,
  COMPANY_WORKTIME,
} from '@/lib/constants';
import { localBusinessSchema } from '@/lib/seo';
import type { Metadata } from 'next';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Контакты | Умная зарядка — Саратов',
  description:
    'Контакты ООО «Умная зарядка» в Саратове. Телефон, адрес, режим работы. Форма обратной связи.',
  alternates: {
    canonical: '/contacts',
  },
};

export default function ContactsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <h1 className="mb-8 font-heading text-3xl font-bold text-text-primary">Контакты</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <Card padding="lg">
            <div className="mb-4 flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <Phone className="h-5 w-5 text-accent" aria-hidden />
              </div>
              <div>
                <h2 className="mb-1 text-sm font-medium text-text-secondary">Телефон</h2>
                <a href={`tel:${COMPANY_PHONE}`} className="text-lg font-bold text-accent hover:text-accent-hover">
                  {COMPANY_PHONE_DISPLAY}
                </a>
              </div>
            </div>

            <div className="mb-4 flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <Mail className="h-5 w-5 text-accent" aria-hidden />
              </div>
              <div>
                <h2 className="mb-1 text-sm font-medium text-text-secondary">Email</h2>
                <a
                  href={`mailto:${COMPANY_EMAIL}`}
                  className="text-lg text-text-primary hover:text-accent"
                >
                  {COMPANY_EMAIL}
                </a>
              </div>
            </div>

            <div className="mb-4 flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <MapPin className="h-5 w-5 text-accent" aria-hidden />
              </div>
              <div>
                <h2 className="mb-1 text-sm font-medium text-text-secondary">Адрес</h2>
                <p className="text-lg text-text-primary">{COMPANY_ADDRESS}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <Clock className="h-5 w-5 text-accent" aria-hidden />
              </div>
              <div>
                <h2 className="mb-1 text-sm font-medium text-text-secondary">Режим работы</h2>
                <p className="text-lg text-text-primary">{COMPANY_WORKTIME}</p>
              </div>
            </div>
          </Card>

          <Card padding="none">
            <YandexMap height="400px" />
          </Card>
        </div>

        <Card padding="lg">
          <h2 className="mb-4 font-heading text-xl font-bold text-text-primary">Обратная связь</h2>
          <p className="mb-6 text-text-secondary">
            Оставьте заявку, и мы свяжемся с вами в ближайшее время
          </p>
          <ContactForm />
        </Card>
      </div>
    </div>
  );
}
