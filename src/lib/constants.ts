export const COMPANY_NAME = 'Умная зарядка';
export const COMPANY_PHONE = '+79172100660';
export const COMPANY_PHONE_DISPLAY = '+7 (917) 210-06-60';
export const COMPANY_EMAIL = 'info@tts64.ru';
export const COMPANY_CITY = 'Саратов';
export const COMPANY_USP =
  'Официальный дилер TSS и Pandora. Монтаж «под ключ» с гарантией 5 лет';
export const MAX_COMPARISON_ITEMS = 4;
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tts64.ru';

/**
 * Yandex.Metrika counter — same ID as `yandex_metrika.md`. Override via NEXT_PUBLIC_YANDEX_METRIKA_ID.
 */
export const YANDEX_METRIKA_COUNTER_ID =
  process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID?.trim() || '108179739';

/** Default catalog image when product has no photos */
export const PLACEHOLDER_PRODUCT_IMAGE = '/images/placeholders/product.svg';
export const PLACEHOLDER_PROJECT_IMAGE = '/images/placeholders/project.svg';
export const PLACEHOLDER_BLOG_IMAGE = '/images/placeholders/blog.svg';

/** Full-page background — `public/images/backgrounds/site-bg.png` */
export const SITE_BACKGROUND_IMAGE = '/images/backgrounds/site-bg.png';

/** Homepage hero — `public/content/main1.png`, `public/content/main2.png` */
export const HOME_HERO_IMAGE = '/content/main1.png';
export const HOME_HERO_IMAGE_SECONDARY = '/content/main2.png';

export const COMPANY_ADDRESS = 'г. Саратов';

/** Yandex Maps: [longitude, latitude] — center of Saratov (city center). */
export const COMPANY_MAP_CENTER: [number, number] = [46.0342, 51.5336];

export const COMPANY_WORKTIME = 'Пн–Пт: 9:00–18:00, Сб: 10:00–15:00';
export const COMPANY_INN = '';

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Каталог',
    href: '/catalog',
    children: [
      {
        label: 'Генераторы',
        href: '/catalog/generators',
        children: [
          { label: 'Портативные', href: '/catalog/generators/portable' },
          { label: 'Промышленные', href: '/catalog/generators/industrial' },
        ],
      },
      {
        label: 'Зарядные станции',
        href: '/catalog/charging-stations',
      },
    ],
  },
  {
    label: 'Услуги',
    href: '/services',
    children: [
      { label: 'Монтаж «под ключ»', href: '/services/installation' },
      { label: 'Сервисное обслуживание', href: '/services/maintenance' },
      { label: 'Лизинг и рассрочка', href: '/services/leasing' },
      { label: 'Выезд инженера', href: '/services/engineer-visit' },
    ],
  },
  { label: 'Проекты', href: '/projects' },
  { label: 'Документы', href: '/documents' },
  { label: 'Блог', href: '/blog' },
  { label: 'Тендеры', href: '/tenders' },
  { label: 'Контакты', href: '/contacts' },
];

export const FOOTER_CATALOG_LINKS = [
  { label: 'Портативные генераторы', href: '/catalog/generators/portable' },
  { label: 'Промышленные генераторы', href: '/catalog/generators/industrial' },
  { label: 'Зарядные станции', href: '/catalog/charging-stations' },
];

export const FOOTER_SERVICE_LINKS = [
  { label: 'Монтаж «под ключ»', href: '/services/installation' },
  { label: 'Сервисное обслуживание', href: '/services/maintenance' },
  { label: 'Лизинг и рассрочка', href: '/services/leasing' },
  { label: 'Выезд инженера', href: '/services/engineer-visit' },
];

export const FOOTER_INFO_LINKS = [
  { label: 'Проекты', href: '/projects' },
  { label: 'Документы и сертификаты', href: '/documents' },
  { label: 'Блог', href: '/blog' },
  { label: 'Тендеры и закупки', href: '/tenders' },
];
