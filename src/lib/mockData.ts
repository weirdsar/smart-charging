import type { IProduct, IProject } from '@/types';

export const MOCK_PRODUCTS: Pick<
  IProduct,
  | 'id'
  | 'title'
  | 'slug'
  | 'price'
  | 'priceOld'
  | 'shortDescription'
  | 'images'
  | 'powerKw'
  | 'fuelType'
  | 'hasAvr'
  | 'categoryType'
  | 'inStock'
>[] = [
  {
    id: '1',
    title: 'Бензогенератор TSS SGG 2000N',
    slug: 'benzogenerator_tss_sgg_2000n_059999',
    price: 24687,
    priceOld: null,
    shortDescription: '2 кВт · арт. 059999',
    images: [],
    powerKw: 2,
    fuelType: 'PETROL',
    hasAvr: false,
    categoryType: 'GENERATORS_PORTABLE',
    inStock: true,
  },
  {
    id: '2',
    title: 'Бензогенератор TSS SGG 2800N',
    slug: 'benzogenerator_tss_sgg_2800n_060005',
    price: 27950,
    priceOld: null,
    shortDescription: '2.8 кВт · арт. 060005',
    images: [],
    powerKw: 2.8,
    fuelType: 'PETROL',
    hasAvr: false,
    categoryType: 'GENERATORS_PORTABLE',
    inStock: true,
  },
  {
    id: '3',
    title: 'Дизельный генератор ТСС АД-15С-Т400-1РМ9',
    slug: 'dizelnyy_generator_tss_ad_15s_t400_1rm9_045652',
    price: 0,
    priceOld: null,
    shortDescription: '15 кВт · арт. 045652',
    images: [],
    powerKw: 15,
    fuelType: 'DIESEL',
    hasAvr: false,
    categoryType: 'GENERATORS_INDUSTRIAL',
    inStock: true,
  },
  {
    id: '4',
    title: 'Pandora Wallbox 7.4',
    slug: 'pandora-wallbox-74',
    price: 75000,
    priceOld: 85000,
    shortDescription: 'Домашняя зарядная станция 7.4 кВт, Type 2',
    images: [],
    powerKw: 7.4,
    fuelType: null,
    hasAvr: null,
    categoryType: 'CHARGING_STATIONS',
    inStock: true,
  },
  {
    id: '5',
    title: 'Бензогенератор TSS SGG 2800EN',
    slug: 'benzogenerator_tss_sgg_2800en_060004',
    price: 30589,
    priceOld: null,
    shortDescription: '2.8 кВт · арт. 060004',
    images: [],
    powerKw: 2.8,
    fuelType: 'PETROL',
    hasAvr: false,
    categoryType: 'GENERATORS_PORTABLE',
    inStock: true,
  },
  {
    id: '6',
    title: 'Pandora DC Fast 60',
    slug: 'pandora-dc-fast-60',
    price: 1800000,
    priceOld: null,
    shortDescription: 'Быстрая зарядная станция 60 кВт, CCS2 + CHAdeMO',
    images: [],
    powerKw: 60,
    fuelType: null,
    hasAvr: null,
    categoryType: 'CHARGING_STATIONS',
    inStock: true,
  },
];

/** Extended mock project for listing + detail pages (carousel uses a subset of fields). */
export interface MockProject
  extends Pick<
    IProject,
    'id' | 'title' | 'slug' | 'images' | 'task' | 'result' | 'reviewAuthor'
  > {
  solution: string;
  quote?: string;
}

export const MOCK_PROJECTS: MockProject[] = [
  {
    id: '1',
    title: 'Резервное электроснабжение коттеджного посёлка «Волжский»',
    slug: 'cottage-volzhsky',
    images: [],
    task: 'Обеспечить бесперебойное электроснабжение 12 коттеджей при отключении сети.',
    solution:
      'Подобрали генератор по нагрузке, согласовали ввод АВР с местной сетевой организацией, выполнили монтаж кабельных линий и пусконаладку.',
    result:
      'Установлен промышленный генератор TSS 100 кВт с АВР. Время переключения — 8 секунд.',
    reviewAuthor: 'Иванов А.П., управляющий посёлком',
    quote:
      'Команда взяла на себя весь цикл — от проекта до сдачи. Жители перестали беспокоиться о брошюрах и отключениях.',
  },
  {
    id: '2',
    title: 'Зарядная инфраструктура для отеля «Саратов Плаза»',
    slug: 'hotel-saratov-plaza',
    images: [],
    task: 'Установить зарядные станции для электромобилей гостей на парковке отеля.',
    solution:
      'Распределили мощность по фазам, установили учёт и защиту, смонтировали 4 настенные станции Pandora с управлением доступом.',
    result: 'Смонтированы 4 станции Pandora по 22 кВт. Окупаемость — 14 месяцев.',
    reviewAuthor: 'Петрова Е.В., директор отеля',
    quote:
      'Гости с электромобилями выбирают нас чаще — зарядка стала частью сервиса отеля.',
  },
  {
    id: '3',
    title: 'Аварийное электроснабжение завода «СарПласт»',
    slug: 'factory-sarplast',
    images: [],
    task: 'Предотвратить потерю продукции при отключении электричества на производстве.',
    solution:
      'Провели аудит нагрузок, установили дизельную электростанцию с синхронизацией щита и обучили персонал работе с резервом.',
    result: 'Установлен дизельный генератор TSS 250 кВт. Потери продукции сократились на 100%.',
    reviewAuthor: 'Козлов Д.М., главный энергетик',
    quote:
      'После ввода резерва простои линии из-за сети практически исчезли. Документация для надзорных органов подготовлена полностью.',
  },
  {
    id: '4',
    title: 'Генератор для строительной площадки ЖК «Кристалл»',
    slug: 'construction-kristall',
    images: [],
    task: 'Обеспечить электроснабжение на этапе строительства до подключения к сети.',
    solution:
      'Поставили мобильный дизельный агрегат в шумозащитном кожухе, организовали топливный контур и график обслуживания на период стройки.',
    result:
      'Поставлен и смонтирован генератор TSS 150 кВт. Работает 18 часов в сутки без сбоев.',
    reviewAuthor: null,
  },
];

export interface MockTestimonial {
  id: string;
  author: string;
  role: string;
  text: string;
  rating: number;
}

export const MOCK_TESTIMONIALS: MockTestimonial[] = [
  {
    id: '1',
    author: 'Алексей Иванов',
    role: 'Владелец коттеджа',
    text: 'Установили генератор за 2 дня. Теперь при отключении света даже не замечаем — автозапуск работает мгновенно. Спасибо команде за профессионализм!',
    rating: 5,
  },
  {
    id: '2',
    author: 'Елена Петрова',
    role: 'Директор отеля «Саратов Плаза»',
    text: 'Зарядные станции для электромобилей стали конкурентным преимуществом нашего отеля. Гости довольны, а мы получаем дополнительный доход.',
    rating: 5,
  },
  {
    id: '3',
    author: 'Дмитрий Козлов',
    role: 'Главный энергетик ООО «СарПласт»',
    text: 'Генератор работает уже второй год без единого сбоя. Сервисная бригада приезжает на ТО точно в срок. Рекомендую как надёжного подрядчика.',
    rating: 5,
  },
  {
    id: '4',
    author: 'Марина Сидорова',
    role: 'Владелец электромобиля',
    text: 'Долго искала домашнюю зарядку, в «Умной зарядке» помогли подобрать станцию и установили всё за один день. Очень довольна!',
    rating: 5,
  },
];

export interface MockFaqItem {
  question: string;
  answer: string;
}

export const MOCK_FAQ: MockFaqItem[] = [
  {
    question: 'Какой генератор выбрать для дома?',
    answer:
      'Для среднего коттеджа достаточно генератора мощностью 5–10 кВт. Если нужен автоматический запуск при отключении электричества, выбирайте модели с АВР (автоматический ввод резерва). Мы поможем рассчитать точную мощность — закажите бесплатный выезд инженера.',
  },
  {
    question: 'Сколько стоит монтаж генератора «под ключ»?',
    answer:
      'Стоимость монтажа зависит от мощности генератора, удалённости объекта и объёма электромонтажных работ. Ориентировочно: от 15 000 ₽ для портативных и от 50 000 ₽ для промышленных. Точную стоимость рассчитаем после выезда инженера.',
  },
  {
    question: 'Какие гарантии вы предоставляете?',
    answer:
      'На монтажные работы — гарантия 5 лет. На оборудование действует гарантия производителя (от 1 до 3 лет в зависимости от модели). Мы являемся авторизованным сервисным центром TSS и Pandora.',
  },
  {
    question: 'Можно ли купить генератор в рассрочку или лизинг?',
    answer:
      'Да, мы предлагаем рассрочку для физических лиц и лизинг для юридических лиц. Условия обсуждаются индивидуально. Оставьте заявку — менеджер подберёт оптимальный вариант.',
  },
  {
    question: 'Вы работаете только в Саратове?',
    answer:
      'Мы работаем в Саратове и Саратовской области. Выезд инженера, доставка и монтаж доступны в радиусе 200 км от города.',
  },
  {
    question: 'Как быстро вы можете установить генератор?',
    answer:
      'Стандартные сроки: 1–3 дня для портативных генераторов и 5–10 дней для промышленных (включая проектирование). При наличии оборудования на складе — монтаж возможен в течение 2–3 рабочих дней.',
  },
  {
    question: 'Нужно ли обслуживать зарядную станцию?',
    answer:
      'Зарядные станции Pandora практически не требуют обслуживания. Рекомендуется ежегодный осмотр и проверка контактов. Мы предлагаем договор на сервисное обслуживание с выездом специалиста.',
  },
];
