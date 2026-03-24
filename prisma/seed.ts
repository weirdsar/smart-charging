import { CategoryType, DocumentType, PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PROJECT_IMAGE_SETS } from '../src/lib/project-covers';
import { loadPandoraJsonList, mapPandoraListToSeedProducts } from './seed-pandora-mapper';
import { loadTssJsonList, mapTssListToSeedProducts, type SeedProductRow } from './seed-tss-mapper';

const prisma = new PrismaClient();

async function upsertDocumentByTitle(data: {
  title: string;
  fileUrl: string;
  docType: DocumentType;
  sortOrder: number;
}) {
  const existing = await prisma.document.findFirst({ where: { title: data.title } });
  if (existing) {
    await prisma.document.update({
      where: { id: existing.id },
      data: {
        fileUrl: data.fileUrl,
        docType: data.docType,
        sortOrder: data.sortOrder,
      },
    });
  } else {
    await prisma.document.create({ data });
  }
}

async function main() {
  console.log('🌱 Seeding database...');

  const adminPassword = await bcrypt.hash('admin123!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@tts64.ru' },
    update: {},
    create: {
      email: 'admin@tts64.ru',
      passwordHash: adminPassword,
      name: 'Администратор',
      role: UserRole.ADMIN,
    },
  });

  const categories = [
    {
      name: 'Портативные генераторы',
      slug: 'portable',
      type: CategoryType.GENERATORS_PORTABLE,
      sortOrder: 1,
      seoTitle: 'Портативные генераторы до 10 кВт — купить в Саратове | Умная зарядка',
      seoDescription:
        'Портативные бензиновые и дизельные генераторы до 10 кВт с доставкой и монтажом в Саратове. Официальный дилер TSS.',
    },
    {
      name: 'Промышленные генераторы',
      slug: 'industrial',
      type: CategoryType.GENERATORS_INDUSTRIAL,
      sortOrder: 2,
      seoTitle: 'Промышленные генераторы от 10 кВт — купить в Саратове | Умная зарядка',
      seoDescription:
        'Промышленные дизельные и газовые генераторы от 10 до 1000+ кВт. Монтаж «под ключ» с гарантией 5 лет.',
    },
    {
      name: 'Зарядные станции',
      slug: 'charging-stations',
      type: CategoryType.CHARGING_STATIONS,
      sortOrder: 3,
      seoTitle: 'Зарядные станции для электромобилей Pandora — купить в Саратове | Умная зарядка',
      seoDescription:
        'Домашние и коммерческие зарядные станции для электромобилей Pandora. Установка «под ключ» в Саратове.',
    },
  ] as const;

  const categoryMap: Record<string, string> = {};
  for (const c of categories) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        type: c.type,
        sortOrder: c.sortOrder,
        seoTitle: c.seoTitle,
        seoDescription: c.seoDescription,
      },
      create: {
        name: c.name,
        slug: c.slug,
        type: c.type,
        sortOrder: c.sortOrder,
        seoTitle: c.seoTitle,
        seoDescription: c.seoDescription,
      },
    });
    categoryMap[c.slug] = row.id;
  }

  const portableId = categoryMap['portable'];
  const industrialId = categoryMap['industrial'];
  const chargingId = categoryMap['charging-stations'];

  const removedGenerators = await prisma.product.deleteMany({
    where: { categoryId: { in: [portableId, industrialId] } },
  });
  console.log(
    `   Cleared ${removedGenerators.count} generator product row(s) (portable + industrial).`
  );

  const removedCharging = await prisma.product.deleteMany({
    where: { categoryId: chargingId },
  });
  console.log(`   Cleared ${removedCharging.count} charging station product row(s).`);

  const portableTss = mapTssListToSeedProducts(
    loadTssJsonList('scripts/tss-products-generators-portable.json'),
    portableId
  );
  const industrialTss = mapTssListToSeedProducts(
    loadTssJsonList('scripts/tss-products-generators-industrial.json'),
    industrialId
  );

  const pandoraParsed = loadPandoraJsonList('scripts/pandora-products-charging-stations.json');
  const chargingProducts: SeedProductRow[] =
    pandoraParsed.length > 0
      ? mapPandoraListToSeedProducts(pandoraParsed, chargingId)
      : [
          {
            categoryId: chargingId,
            title: 'Pandora Wallbox 7.4',
            slug: 'pandora-wallbox-74',
            price: 75000,
            priceOld: 85000,
            inStock: true,
            description:
              '<p>Настенная зарядная станция Pandora Wallbox 7.4 кВт с разъёмом Type 2 для домашней и полукоммерческой эксплуатации. Компактный корпус, защита IP54 и интуитивное управление.</p><p>Поддержка динамической балансировки нагрузки и интеграция с мобильным приложением. Установка на стену или столб с фиксацией кабеля.</p>',
            shortDescription: 'Домашняя зарядная станция 7.4 кВт, Type 2',
            specs: {
              connectorType: 'Type 2',
              cableLength: '5 м (опционально)',
              protection: 'IP54',
              display: 'LED',
              authentication: 'RFID / приложение',
            },
            images: ['/images/placeholders/product.svg'],
            hasAvr: null,
            fuelType: null,
            powerKw: 7.4,
            noiseLevelDb: null,
            connectorType: 'Type 2',
            purpose: 'Частные дома, офисы',
            seoTitle: 'Pandora Wallbox 7.4 — домашняя зарядка | Умная зарядка',
            seoDescription: 'Зарядная станция Pandora 7.4 кВт — продажа и монтаж в Саратове.',
            published: true,
          },
          {
            categoryId: chargingId,
            title: 'Pandora Wallbox 22',
            slug: 'pandora-wallbox-22',
            price: 145000,
            priceOld: null,
            inStock: true,
            description:
              '<p>Станция Pandora Wallbox 22 кВт для быстрой зарядки электромобилей на парковках бизнес-центров, отелей и торговых комплексов. Трёхфазное подключение и стабильный ток на длительных сессиях.</p><p>Металлический корпус, защита от перегрева и полный набор протоколов безопасности. Совместимость с системами учёта и ограничения мощности.</p>',
            shortDescription: 'Настенная зарядная станция 22 кВт, Type 2',
            specs: {
              connectorType: 'Type 2',
              cableLength: '7 м',
              protection: 'IP54',
              display: 'OLED',
              authentication: 'RFID / OCPP',
            },
            images: ['/images/placeholders/product.svg'],
            hasAvr: null,
            fuelType: null,
            powerKw: 22,
            noiseLevelDb: null,
            connectorType: 'Type 2',
            purpose: 'Бизнес, гостиницы, ТЦ',
            seoTitle: 'Pandora Wallbox 22 — зарядка 22 кВт | Умная зарядка',
            seoDescription: 'Коммерческая зарядная станция Pandora 22 кВт в Саратове.',
            published: true,
          },
          {
            categoryId: chargingId,
            title: 'Pandora DC Fast 60',
            slug: 'pandora-dc-fast-60',
            price: 1800000,
            priceOld: null,
            inStock: true,
            description:
              '<p>Скоростная станция постоянного тока Pandora DC Fast 60 кВт с выходами CCS2 и CHAdeMO. Предназначена для трасс, АЗС и городских хабов с высокой проходимостью.</p><p>Модульная архитектура, удалённый мониторинг и готовность к интеграции с платёжными системами. Обслуживание по регламенту от официального дилера.</p>',
            shortDescription: 'Быстрая зарядная станция 60 кВт, CCS2 + CHAdeMO',
            specs: {
              connectorType: 'CCS2 + CHAdeMO',
              cableLength: 'кабель на кронштейне',
              protection: 'IP54',
              display: '7" сенсор',
              authentication: 'RFID / банковская карта / приложение',
            },
            images: ['/images/placeholders/product.svg'],
            hasAvr: null,
            fuelType: null,
            powerKw: 60,
            noiseLevelDb: null,
            connectorType: 'CCS2 + CHAdeMO',
            purpose: 'Трассы, АЗС, городские хабы',
            seoTitle: 'Pandora DC Fast 60 — DC-зарядка 60 кВт | Умная зарядка',
            seoDescription: 'Скоростная зарядная станция Pandora 60 кВт — проекты под ключ.',
            published: true,
          },
        ];

  if (pandoraParsed.length === 0) {
    console.warn(
      '   ⚠️  scripts/pandora-products-charging-stations.json missing or empty — using 3 demo Pandora rows. Run: npx tsx scripts/parse-pandora-products.ts && npx tsx scripts/download-pandora-images.ts'
    );
  }

  const products: SeedProductRow[] = [...portableTss, ...industrialTss, ...chargingProducts];
  console.log(
    `   Seeding ${products.length} products (${portableTss.length} portable TSS + ${industrialTss.length} industrial TSS + ${chargingProducts.length} Pandora).`
  );

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        categoryId: p.categoryId,
        title: p.title,
        price: p.price,
        priceOld: p.priceOld,
        inStock: p.inStock,
        description: p.description,
        shortDescription: p.shortDescription,
        specs: p.specs,
        images: p.images,
        hasAvr: p.hasAvr,
        fuelType: p.fuelType,
        powerKw: p.powerKw,
        noiseLevelDb: p.noiseLevelDb,
        connectorType: p.connectorType,
        purpose: p.purpose,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        published: p.published,
      },
      create: {
        categoryId: p.categoryId,
        title: p.title,
        slug: p.slug,
        price: p.price,
        priceOld: p.priceOld,
        inStock: p.inStock,
        description: p.description,
        shortDescription: p.shortDescription,
        specs: p.specs,
        images: p.images,
        hasAvr: p.hasAvr,
        fuelType: p.fuelType,
        powerKw: p.powerKw,
        noiseLevelDb: p.noiseLevelDb,
        connectorType: p.connectorType,
        purpose: p.purpose,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        published: p.published,
      },
    });
  }

  const projects = [
    {
      title: 'Резервное электроснабжение коттеджного посёлка «Волжский»',
      slug: 'cottage-volzhsky',
      images: [...PROJECT_IMAGE_SETS['cottage-volzhsky']],
      task: 'Обеспечить бесперебойное электроснабжение 12 коттеджей при отключении сети.',
      solution:
        'Спроектирована схема резервирования с общим узлом АВР и распределением на линии посёлка. Подобран генератор с запасом по мощности с учётом пусковых токов и сезонных пиков.',
      result:
        'Установлен промышленный генератор TSS 100 кВт с АВР. Время переключения — 8 секунд.',
      reviewText: null as string | null,
      reviewAuthor: 'Иванов А.П., управляющий посёлком',
      published: true,
    },
    {
      title: 'Зарядная инфраструктура для отеля «Саратов Плаза»',
      slug: 'hotel-saratov-plaza',
      images: [...PROJECT_IMAGE_SETS['hotel-saratov-plaza']],
      task: 'Установить зарядные станции для электромобилей гостей на парковке отеля.',
      solution:
        'Выполнен расчёт нагрузки по фазам, согласовано подключение с сетевой организацией и выбраны четыре станции с балансировкой мощности. Прокладка кабельных трасс с учётом ландшафта.',
      result: 'Смонтированы 4 станции Pandora по 22 кВт. Окупаемость — 14 месяцев.',
      reviewText: null,
      reviewAuthor: 'Петрова Е.В., директор отеля',
      published: true,
    },
    {
      title: 'Аварийное электроснабжение завода «СарПласт»',
      slug: 'factory-sarplast',
      images: [...PROJECT_IMAGE_SETS['factory-sarplast']],
      task: 'Предотвратить потерю продукции при отключении электричества на производстве.',
      solution:
        'Проведён аудит потребителей критичных линий, установлен дизельный агрегат с синхронизацией щита и тестами под нагрузкой. Обучен персонал работе с резервом.',
      result: 'Установлен дизельный генератор TSS 250 кВт. Потери продукции сократились на 100%.',
      reviewText: null,
      reviewAuthor: 'Козлов Д.М., главный энергетик',
      published: true,
    },
    {
      title: 'Генератор для строительной площадки ЖК «Кристалл»',
      slug: 'construction-kristall',
      images: [...PROJECT_IMAGE_SETS['construction-kristall']],
      task: 'Обеспечить электроснабжение на этапе строительства до подключения к сети.',
      solution:
        'Поставлен передвижной контейнер с генератором, организованы временные линии к башенным кранам и бытовкам. Настроено техобслуживание по графику смен.',
      result:
        'Поставлен и смонтирован генератор TSS 150 кВт. Работает 18 часов в сутки без сбоев.',
      reviewText: null,
      reviewAuthor: null,
      published: true,
    },
  ];

  for (const pr of projects) {
    await prisma.project.upsert({
      where: { slug: pr.slug },
      update: {
        title: pr.title,
        images: pr.images,
        task: pr.task,
        solution: pr.solution,
        result: pr.result,
        reviewText: pr.reviewText,
        reviewAuthor: pr.reviewAuthor,
        published: pr.published,
      },
      create: {
        title: pr.title,
        slug: pr.slug,
        images: pr.images,
        task: pr.task,
        solution: pr.solution,
        result: pr.result,
        reviewText: pr.reviewText,
        reviewAuthor: pr.reviewAuthor,
        published: pr.published,
      },
    });
  }

  const blogPosts: Array<{
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    coverImage: string;
    seoTitle: string;
    seoDescription: string;
    published: boolean;
    publishedAt: Date;
  }> = [
    {
      title: 'Как выбрать генератор для дома: полное руководство',
      slug: 'kak-vybrat-generator-dlya-doma',
      content: `
<h2>Оценка потребляемой мощности</h2>
<p>Перед покупкой генератора составьте список потребителей, которые должны работать при отключении сети: освещение, насос, котёл, холодильник и т.д. Сложите номинальные мощности и добавьте запас 20–30% на пусковые токи компрессоров и двигателей.</p>
<h2>Тип топлива</h2>
<p>Бензиновые модели проще в обслуживании и дешевле в закупке; дизельные экономичнее при длительной работе и предпочтительны для мощностей от 5–7 кВт, если планируется частое использование.</p>
<ul>
<li>Бензин — для эпизодических отключений и дачи.</li>
<li>Дизель — для длительной автономной работы и высоких нагрузок.</li>
</ul>
<h2>АВР и автозапуск</h2>
<p>Если вас нет дома, автоматический ввод резерва (АВР) переключит питание на генератор без участия человека. Убедитесь, что выбранная модель совместима с вашим электрощитом и согласована с монтажной организацией.</p>
<p>Закажите бесплатный выезд инженера «Умной зарядки» — мы поможем подобрать оптимальную мощность и схему подключения.</p>
      `.trim(),
      excerpt:
        'Разбираемся, на что обратить внимание при выборе генератора для коттеджа или дачи: мощность, тип топлива, уровень шума, наличие АВР.',
      coverImage: '/images/placeholders/blog.svg',
      seoTitle: 'Как выбрать генератор для дома — руководство 2025 | Умная зарядка',
      seoDescription:
        'Подробное руководство по выбору генератора для частного дома и дачи. Расчёт мощности, сравнение типов топлива, советы экспертов.',
      published: true,
      publishedAt: new Date('2025-01-15'),
    },
    {
      title: 'Зарядная станция для электромобиля дома: что нужно знать',
      slug: 'zaryadnaya-stantsiya-dlya-elektromobilya-doma',
      content: `
<h2>Электросеть и ввод</h2>
<p>Для домашней зарядки 7–22 кВт важно, чтобы ввод и автоматы выдерживали длительную нагрузку. Часто требуется отдельная линия от щита до станции с УЗО и защитой от перегрузки.</p>
<h2>Выбор мощности</h2>
<p>Большинство владельцев электромобилей достаточно 7–11 кВт на одну машину. Если планируется две машины или быстрая зарядка, мощность и кабельный трассу нужно закладывать с запасом.</p>
<h2>Монтаж и согласование</h2>
<p>Установка «под ключ» включает подбор места, крепление, подключение и тестирование. Мы оформляем необходимые акты и консультируем по эксплуатации и приложению Pandora.</p>
<ul>
<li>Проверка фаз и заземления.</li>
<li>Настройка лимитов мощности.</li>
<li>Инструктаж пользователя.</li>
</ul>
      `.trim(),
      excerpt:
        'Всё о домашних зарядных станциях: требования к электросети, выбор мощности, стоимость установки.',
      coverImage: '/images/placeholders/blog.svg',
      seoTitle: 'Домашняя зарядная станция для электромобиля — установка в Саратове | Умная зарядка',
      seoDescription:
        'Как установить зарядную станцию для электромобиля дома. Требования, стоимость, сроки монтажа в Саратове.',
      published: true,
      publishedAt: new Date('2025-02-10'),
    },
  ];

  for (const b of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: b.slug },
      update: {
        title: b.title,
        content: b.content,
        excerpt: b.excerpt,
        coverImage: b.coverImage || null,
        seoTitle: b.seoTitle,
        seoDescription: b.seoDescription,
        published: b.published,
        publishedAt: b.publishedAt,
      },
      create: {
        title: b.title,
        slug: b.slug,
        content: b.content,
        excerpt: b.excerpt,
        coverImage: b.coverImage || null,
        seoTitle: b.seoTitle,
        seoDescription: b.seoDescription,
        published: b.published,
        publishedAt: b.publishedAt,
      },
    });
  }

  await upsertDocumentByTitle({
    title: 'Сертификат дилера TSS',
    fileUrl: '/docs/cert-tss.pdf',
    docType: DocumentType.CERTIFICATE,
    sortOrder: 1,
  });
  await upsertDocumentByTitle({
    title: 'Сертификат дилера Pandora',
    fileUrl: '/docs/cert-pandora.pdf',
    docType: DocumentType.CERTIFICATE,
    sortOrder: 2,
  });
  await upsertDocumentByTitle({
    title: 'Допуск СРО',
    fileUrl: '/docs/sro.pdf',
    docType: DocumentType.PERMIT,
    sortOrder: 3,
  });

  const settings = [
    { key: 'company_phone', value: '+79172100660' },
    { key: 'company_email', value: 'info@tts64.ru' },
    { key: 'company_address', value: 'г. Саратов' },
    { key: 'telegram_support', value: '' },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }

  console.log('✅ Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
