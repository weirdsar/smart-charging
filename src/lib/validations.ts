import { z } from 'zod';

const phoneSchema = z
  .string()
  .min(10, 'Укажите корректный телефон')
  .regex(
    /^(\+7|8|7)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/,
    'Неверный формат телефона'
  );

export const callbackFormSchema = z.object({
  name: z.string().min(2, 'Имя должно быть не короче 2 символов'),
  phone: phoneSchema,
});

export const commercialOfferSchema = callbackFormSchema.extend({
  email: z.string().email('Неверный email').optional().or(z.literal('')),
  message: z.string().optional(),
});

export const leasingFormSchema = callbackFormSchema.extend({
  email: z.string().email('Неверный email'),
  productId: z.string().min(1, 'Выберите товар'),
});

export const quizSubmissionSchema = z.object({
  name: z.string().min(2, 'Имя должно быть не короче 2 символов'),
  phone: phoneSchema,
  email: z.string().email('Неверный email'),
  quizAnswers: z.object({
    q1: z.string(),
    q2: z.string(),
    q3: z.string(),
    q4: z.string(),
    q5: z.string(),
  }),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Имя должно быть не короче 2 символов'),
  phone: phoneSchema,
  email: z.string().email('Неверный email').optional().or(z.literal('')),
  message: z.string().optional(),
});

/** API body for POST /api/leads (shared validation rules with client forms). */
export const leadApiSubmissionSchema = z.object({
  type: z.enum(['CALLBACK', 'COMMERCIAL_OFFER', 'LEASING', 'CONTACT']),
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: phoneSchema,
  email: z.union([z.string().email('Некорректный email'), z.literal('')]).optional(),
  message: z.string().optional(),
  productId: z.string().min(1).optional(),
  sourcePage: z.string().url('Некорректный URL источника'),
  utmData: z.record(z.string()).optional(),
  deferNotifications: z.boolean().optional(),
});

export type CallbackFormValues = z.infer<typeof callbackFormSchema>;
export type CommercialOfferFormValues = z.infer<typeof commercialOfferSchema>;
export type LeasingFormValues = z.infer<typeof leasingFormSchema>;
export type QuizSubmissionValues = z.infer<typeof quizSubmissionSchema>;
export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type LeadApiSubmission = z.infer<typeof leadApiSubmissionSchema>;

const slugLatin = z
  .string()
  .min(1)
  .regex(/^[a-z0-9-]+$/, 'Slug должен содержать только латиницу, цифры и дефисы');

export const fuelTypeAdminSchema = z.enum(['DIESEL', 'PETROL', 'GAS', 'HYBRID', 'OTHER']);

export const adminProductCreateSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  slug: slugLatin,
  categoryId: z.string().min(1, 'Некорректный ID категории'),
  price: z.number().positive('Цена должна быть положительной'),
  priceOld: z.union([z.number().positive(), z.null()]).optional(),
  shortDescription: z.string().min(1, 'Краткое описание обязательно').max(200),
  description: z.string().min(1, 'Описание обязательно'),
  specs: z.record(z.string(), z.unknown()).optional(),
  images: z.array(z.string()).optional(),
  powerKw: z.number().positive().optional().nullable(),
  fuelType: fuelTypeAdminSchema.optional().nullable(),
  hasAvr: z.boolean().optional().nullable(),
  noiseLevelDb: z.number().optional().nullable(),
  connectorType: z.string().optional().nullable(),
  purpose: z.string().optional().nullable(),
  seoTitle: z.string().max(70).optional().nullable(),
  seoDescription: z.string().max(160).optional().nullable(),
  published: z.boolean().default(false),
  inStock: z.boolean().optional().default(true),
});

export const adminProductUpdateSchema = adminProductCreateSchema.partial();

export type AdminProductCreateInput = z.infer<typeof adminProductCreateSchema>;
export type AdminProductUpdateInput = z.infer<typeof adminProductUpdateSchema>;

export const adminCategoryCreateSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  slug: slugLatin,
  type: z.enum(['GENERATORS_PORTABLE', 'GENERATORS_INDUSTRIAL', 'CHARGING_STATIONS']),
  parentId: z.union([z.string().min(1, 'Некорректный ID родителя'), z.null()]).optional(),
  sortOrder: z.number().int(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  seoContent: z.string().optional().nullable(),
});

export const adminCategoryUpdateSchema = adminCategoryCreateSchema.partial();

export type AdminCategoryCreateInput = z.infer<typeof adminCategoryCreateSchema>;
export type AdminCategoryUpdateInput = z.infer<typeof adminCategoryUpdateSchema>;

/** Full product form (client): specs as JSON string; parsed to `specs` on submit. */
export const adminProductFormSchema = adminProductCreateSchema
  .omit({ specs: true, fuelType: true, hasAvr: true, published: true, inStock: true })
  .extend({
    specsJson: z.string(),
    fuelType: z.union([fuelTypeAdminSchema, z.literal('')]).optional().nullable(),
    hasAvr: z.enum(['unset', 'yes', 'no']).optional(),
    published: z.boolean(),
    inStock: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const raw = data.specsJson.trim();
    if (!raw) return;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Укажите JSON-объект',
          path: ['specsJson'],
        });
      }
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Некорректный JSON',
        path: ['specsJson'],
      });
    }
  });

export type AdminProductFormValues = z.infer<typeof adminProductFormSchema>;

/** Category admin form: same fields as create (full edit form). */
export const adminCategoryFormSchema = adminCategoryCreateSchema;
export type AdminCategoryFormValues = z.infer<typeof adminCategoryFormSchema>;

/** Admin: projects (API + forms). */
export const projectFormSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  slug: slugLatin,
  images: z.array(z.string()),
  task: z.string().min(1, 'Задача / контекст обязательны'),
  solution: z.string().min(1, 'Решение обязательно'),
  result: z.string().min(1, 'Результат обязателен'),
  reviewText: z.string().optional(),
  reviewAuthor: z.string().optional(),
  published: z.boolean(),
});

export const projectFormUpdateSchema = projectFormSchema.partial();

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

/** Admin: blog posts (API + forms). */
export const blogPostFormSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен'),
  slug: slugLatin,
  content: z.string().min(1, 'Текст статьи обязателен'),
  excerpt: z.string().optional(),
  coverImage: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  published: z.boolean(),
  publishedAt: z.string().optional(),
});

export const blogPostFormUpdateSchema = blogPostFormSchema.partial();

export type BlogPostFormValues = z.infer<typeof blogPostFormSchema>;

/** Admin: documents (API + forms). */
export const documentFormSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  fileUrl: z.string().min(1, 'Укажите файл или загрузите PDF'),
  docType: z.enum(['CERTIFICATE', 'PERMIT', 'GRATITUDE', 'OTHER']),
  sortOrder: z.number().int(),
});

export const documentFormUpdateSchema = documentFormSchema.partial();

export type DocumentFormValues = z.infer<typeof documentFormSchema>;
