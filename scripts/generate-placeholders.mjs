import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function write(rel, content) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

const staticPage = (title) => `import type { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return { title: '${title} | Умная зарядка — Саратов' };
}

export default function Page() {
  return (
    <>
      <div>${title} — Coming Soon</div>
    </>
  );
}
`;

const slugPage = `import type { Metadata } from 'next';

interface PageProps {
  params: { slug: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  return { title: \`\${params.slug} | Умная зарядка — Саратов\` };
}

export default function Page({ params }: PageProps) {
  return (
    <>
      <div>Карточка: {params.slug} — Coming Soon</div>
    </>
  );
}
`;

const filtersPage = `import type { Metadata } from 'next';

interface PageProps {
  params: { filters: string[] };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const pathLabel = params.filters?.length ? params.filters.join('/') : 'фильтры';
  return { title: \`\${pathLabel} | Умная зарядка — Саратов\` };
}

export default function Page({ params }: PageProps) {
  return (
    <>
      <div>Фильтры: {params.filters?.join('/') ?? ''} — Coming Soon</div>
    </>
  );
}
`;

const seoSlugPage = `import type { Metadata } from 'next';

interface PageProps {
  params: { seoSlug: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  return { title: \`\${params.seoSlug} | Умная зарядка — Саратов\` };
}

export default function Page({ params }: PageProps) {
  return (
    <>
      <div>SEO: {params.seoSlug} — Coming Soon</div>
    </>
  );
}
`;

const idEditPage = (labelRu) => `import type { Metadata } from 'next';

interface PageProps {
  params: { id: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  return { title: \`${labelRu} \${params.id} | Умная зарядка — Саратов\` };
}

export default function Page({ params }: PageProps) {
  return (
    <>
      <div>${labelRu} {params.id} — Coming Soon</div>
    </>
  );
}
`;

const leadIdPage = `import type { Metadata } from 'next';

interface PageProps {
  params: { id: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  return { title: \`Заявка \${params.id} | Умная зарядка — Саратов\` };
}

export default function Page({ params }: PageProps) {
  return (
    <>
      <div>Заявка {params.id} — Coming Soon</div>
    </>
  );
}
`;

const notImplemented = `import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
}

export async function PUT() {
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
}

export async function DELETE() {
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
}
`;

const staticPages = [
  ['src/app/(site)/page.tsx', 'Главная'],
  ['src/app/(site)/catalog/page.tsx', 'Каталог'],
  ['src/app/(site)/catalog/generators/page.tsx', 'Генераторы'],
  ['src/app/(site)/catalog/generators/portable/page.tsx', 'Портативные генераторы'],
  ['src/app/(site)/catalog/generators/industrial/page.tsx', 'Промышленные генераторы'],
  ['src/app/(site)/catalog/charging-stations/page.tsx', 'Зарядные станции'],
  ['src/app/(site)/services/page.tsx', 'Услуги'],
  ['src/app/(site)/services/installation/page.tsx', 'Монтаж под ключ'],
  ['src/app/(site)/services/maintenance/page.tsx', 'Сервисное обслуживание'],
  ['src/app/(site)/services/leasing/page.tsx', 'Лизинг и рассрочка'],
  ['src/app/(site)/services/engineer-visit/page.tsx', 'Выезд инженера'],
  ['src/app/(site)/projects/page.tsx', 'Проекты'],
  ['src/app/(site)/documents/page.tsx', 'Документы'],
  ['src/app/(site)/blog/page.tsx', 'Блог'],
  ['src/app/(site)/quiz/page.tsx', 'Квиз'],
  ['src/app/(site)/tenders/page.tsx', 'Тендеры'],
  ['src/app/(site)/contacts/page.tsx', 'Контакты'],
  ['src/app/admin/page.tsx', 'Панель администратора'],
  ['src/app/admin/login/page.tsx', 'Вход'],
  ['src/app/admin/products/page.tsx', 'Товары'],
  ['src/app/admin/products/new/page.tsx', 'Новый товар'],
  ['src/app/admin/categories/page.tsx', 'Категории'],
  ['src/app/admin/projects/page.tsx', 'Проекты (админ)'],
  ['src/app/admin/projects/new/page.tsx', 'Новый проект'],
  ['src/app/admin/blog/page.tsx', 'Блог (админ)'],
  ['src/app/admin/blog/new/page.tsx', 'Новая статья'],
  ['src/app/admin/documents/page.tsx', 'Документы (админ)'],
  ['src/app/admin/leads/page.tsx', 'Заявки'],
  ['src/app/admin/pages/page.tsx', 'Страницы'],
  ['src/app/admin/filter-pages/page.tsx', 'SEO-страницы фильтров'],
  ['src/app/admin/settings/page.tsx', 'Настройки'],
];

for (const [file, title] of staticPages) {
  write(file, staticPage(title));
}

write('src/app/(site)/catalog/generators/portable/[...filters]/page.tsx', filtersPage);
write('src/app/(site)/catalog/generators/industrial/[...filters]/page.tsx', filtersPage);
write('src/app/(site)/catalog/charging-stations/[...filters]/page.tsx', filtersPage);
write('src/app/(site)/catalog/generators/[slug]/page.tsx', slugPage);
write('src/app/(site)/catalog/charging-stations/[slug]/page.tsx', slugPage);
write('src/app/(site)/projects/[slug]/page.tsx', slugPage);
write('src/app/(site)/blog/[slug]/page.tsx', slugPage);
write('src/app/(site)/s/[seoSlug]/page.tsx', seoSlugPage);

write('src/app/admin/products/[id]/edit/page.tsx', idEditPage('Редактирование товара'));
write('src/app/admin/projects/[id]/edit/page.tsx', idEditPage('Редактирование проекта'));
write('src/app/admin/blog/[id]/edit/page.tsx', idEditPage('Редактирование статьи'));
write('src/app/admin/pages/[id]/edit/page.tsx', idEditPage('Редактирование страницы'));
write('src/app/admin/filter-pages/[id]/edit/page.tsx', idEditPage('Редактирование SEO-фильтра'));
write('src/app/admin/leads/[id]/page.tsx', leadIdPage);

const apiRoutes = [
  'src/app/api/auth/[...nextauth]/route.ts',
  'src/app/api/products/route.ts',
  'src/app/api/products/[id]/route.ts',
  'src/app/api/categories/route.ts',
  'src/app/api/leads/route.ts',
  'src/app/api/quiz/route.ts',
  'src/app/api/quiz/partial/route.ts',
  'src/app/api/projects/route.ts',
  'src/app/api/projects/[id]/route.ts',
  'src/app/api/blog/route.ts',
  'src/app/api/blog/[id]/route.ts',
  'src/app/api/documents/route.ts',
  'src/app/api/upload/route.ts',
  'src/app/api/comparison/route.ts',
  'src/app/api/pages/[id]/route.ts',
  'src/app/api/filter-pages/route.ts',
  'src/app/api/settings/route.ts',
];

for (const route of apiRoutes) {
  write(route, notImplemented);
}

const placeholderComponent = (name) => `'use client';

export default function ${name}() {
  return <div className="text-text-secondary">${name} — Coming Soon</div>;
}
`;

const serverPlaceholder = (name) => `export default function ${name}() {
  return <div className="text-text-secondary">${name} — Coming Soon</div>;
}
`;

const components = [
  ['src/components/ui/Input.tsx', 'Input'],
  ['src/components/ui/Select.tsx', 'Select'],
  ['src/components/ui/Checkbox.tsx', 'Checkbox'],
  ['src/components/ui/Modal.tsx', 'Modal'],
  ['src/components/ui/Badge.tsx', 'Badge'],
  ['src/components/ui/Card.tsx', 'Card'],
  ['src/components/ui/Skeleton.tsx', 'Skeleton'],
  ['src/components/ui/Toast.tsx', 'Toast'],
  ['src/components/ui/Breadcrumbs.tsx', 'Breadcrumbs'],
  ['src/components/ui/Pagination.tsx', 'Pagination'],
  ['src/components/layout/MobileMenu.tsx', 'MobileMenu'],
  ['src/components/layout/TopBar.tsx', 'TopBar'],
  ['src/components/layout/CookieConsent.tsx', 'CookieConsent'],
  ['src/components/sections/HeroSection.tsx', 'HeroSection'],
  ['src/components/sections/AdvantagesSection.tsx', 'AdvantagesSection'],
  ['src/components/sections/CatalogPreview.tsx', 'CatalogPreview'],
  ['src/components/sections/ProjectsCarousel.tsx', 'ProjectsCarousel'],
  ['src/components/sections/CTASection.tsx', 'CTASection'],
  ['src/components/sections/FAQSection.tsx', 'FAQSection'],
  ['src/components/sections/TestimonialsSection.tsx', 'TestimonialsSection'],
  ['src/components/forms/CallbackForm.tsx', 'CallbackForm'],
  ['src/components/forms/CommercialOfferForm.tsx', 'CommercialOfferForm'],
  ['src/components/forms/LeasingForm.tsx', 'LeasingForm'],
  ['src/components/forms/ContactForm.tsx', 'ContactForm'],
  ['src/components/forms/ExitIntentPopup.tsx', 'ExitIntentPopup'],
  ['src/components/catalog/ProductCard.tsx', 'ProductCard'],
  ['src/components/catalog/ProductGrid.tsx', 'ProductGrid'],
  ['src/components/catalog/FilterSidebar.tsx', 'FilterSidebar'],
  ['src/components/catalog/ActiveFilters.tsx', 'ActiveFilters'],
  ['src/components/catalog/SortSelect.tsx', 'SortSelect'],
  ['src/components/catalog/ProductGallery.tsx', 'ProductGallery'],
  ['src/components/catalog/ProductSpecs.tsx', 'ProductSpecs'],
  ['src/components/catalog/CompareButton.tsx', 'CompareButton'],
  ['src/components/comparison/ComparisonTable.tsx', 'ComparisonTable'],
  ['src/components/comparison/ComparisonBar.tsx', 'ComparisonBar'],
  ['src/components/comparison/ComparisonModal.tsx', 'ComparisonModal'],
  ['src/components/quiz/QuizStepper.tsx', 'QuizStepper'],
  ['src/components/quiz/QuizQuestion.tsx', 'QuizQuestion'],
  ['src/components/quiz/QuizResult.tsx', 'QuizResult'],
  ['src/components/quiz/QuizProgress.tsx', 'QuizProgress'],
  ['src/components/seo/SchemaOrg.tsx', 'SchemaOrg'],
  ['src/components/seo/CanonicalUrl.tsx', 'CanonicalUrl'],
  ['src/components/admin/AdminSidebar.tsx', 'AdminSidebar'],
  ['src/components/admin/AdminHeader.tsx', 'AdminHeader'],
  ['src/components/admin/DataTable.tsx', 'DataTable'],
  ['src/components/admin/FormBuilder.tsx', 'FormBuilder'],
  ['src/components/admin/ImageUploader.tsx', 'ImageUploader'],
  ['src/components/admin/RichTextEditor.tsx', 'RichTextEditor'],
  ['src/components/admin/StatsCard.tsx', 'StatsCard'],
];

for (const [file, name] of components) {
  const isClient =
    file.includes('/forms/') ||
    file.includes('Modal') ||
    file.includes('CookieConsent') ||
    file.includes('MobileMenu') ||
    file.includes('ExitIntent') ||
    file.includes('CompareButton') ||
    file.includes('Comparison') ||
    file.includes('Quiz') ||
    file.includes('RichTextEditor') ||
    file.includes('ImageUploader');
  write(file, isClient ? placeholderComponent(name) : serverPlaceholder(name));
}

write(
  'src/components/quiz/quizConfig.ts',
  `export const quizConfig = {
  steps: [] as const,
};
`
);

write(
  'src/components/ui/index.ts',
  `export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Select } from './Select';
export { default as Checkbox } from './Checkbox';
export { default as Modal } from './Modal';
export { default as Badge } from './Badge';
export { default as Card } from './Card';
export { default as Skeleton } from './Skeleton';
export { default as Toast } from './Toast';
export { default as Breadcrumbs } from './Breadcrumbs';
export { default as Pagination } from './Pagination';
`
);

console.log('Placeholder files generated.');
