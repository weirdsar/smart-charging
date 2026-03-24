import AdvantagesSection from '@/components/sections/AdvantagesSection';
import CatalogPreview from '@/components/sections/CatalogPreview';
import CTASection from '@/components/sections/CTASection';
import FAQSection from '@/components/sections/FAQSection';
import HeroSection from '@/components/sections/HeroSection';
import ProjectsCarousel from '@/components/sections/ProjectsCarousel';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import { getHomepageProjects } from '@/lib/homepage-data';
import type { Metadata } from 'next';
import { HOME_HERO_IMAGE, HOME_HERO_IMAGE_SECONDARY, SITE_URL } from '@/lib/constants';

/** Avoid build-time DB requirement when `DATABASE_URL` is unset (same pattern as catalog). */
export const dynamic = 'force-dynamic';

const ogImages = [
  {
    url: `${SITE_URL}${HOME_HERO_IMAGE}`,
    width: 1200,
    height: 630,
    alt: 'Умная зарядка — генераторы и зарядные станции',
  },
  {
    url: `${SITE_URL}${HOME_HERO_IMAGE_SECONDARY}`,
    width: 1200,
    height: 630,
    alt: 'Умная зарядка — оборудование TSS и Pandora',
  },
];

export const metadata: Metadata = {
  title: 'Генераторы и зарядные станции с монтажом «под ключ» | Умная зарядка — Саратов',
  description:
    'Официальный дилер TSS и Pandora в Саратове. Продажа, монтаж и сервис электростанций и зарядных станций для электромобилей. Гарантия 5 лет на монтаж.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Генераторы и зарядные станции с монтажом «под ключ» | Умная зарядка',
    description:
      'Официальный дилер TSS и Pandora. Монтаж «под ключ» с гарантией 5 лет в Саратове и области.',
    url: 'https://tts64.ru',
    siteName: 'Умная зарядка',
    locale: 'ru_RU',
    type: 'website',
    images: ogImages,
  },
  twitter: {
    card: 'summary_large_image',
    images: ogImages.map((i) => i.url),
  },
};

export default async function HomePage() {
  const homepageProjects = await getHomepageProjects(6);

  return (
    <>
      <HeroSection />
      <AdvantagesSection />
      <CatalogPreview />
      <ProjectsCarousel projects={homepageProjects} />
      <CTASection />
      <TestimonialsSection />
      <FAQSection />
    </>
  );
}
