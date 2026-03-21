import { SITE_URL } from '@/lib/constants';
import type { Metadata } from 'next';

const baseUrl = SITE_URL.replace(/\/$/, '');

export function sitePageTitle(pageName: string): Metadata {
  return {
    title: `${pageName} | Умная зарядка — Саратов`,
  };
}

export function generateCanonical(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${p}`;
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ООО «Умная зарядка»',
  url: baseUrl,
  logo: `${baseUrl}/images/logo.png`,
  description:
    'Официальный дилер TSS и Pandora в Саратове. Продажа, монтаж и сервис генераторов и зарядных станций.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Саратов',
    addressRegion: 'Саратовская область',
    addressCountry: 'RU',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+7-917-210-06-60',
    contactType: 'sales',
    availableLanguage: 'Russian',
  },
};

export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'ООО «Умная зарядка»',
  image: `${baseUrl}/images/logo.png`,
  telephone: '+7-917-210-06-60',
  email: 'info@tts64.ru',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Саратов',
    addressRegion: 'Саратовская область',
    addressCountry: 'RU',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '10:00',
      closes: '15:00',
    },
  ],
};
