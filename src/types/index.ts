export interface ICategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  type: string;
}

export interface IProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  priceOld?: number | null;
  categoryId: string;
  published: boolean;
  categoryType?: string;
  shortDescription?: string;
  images?: string[];
  powerKw?: number | null;
  fuelType?: string | null;
  hasAvr?: boolean | null;
  inStock: boolean;
}

export interface IProject {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  images?: string[];
  task?: string;
  result?: string;
  reviewAuthor?: string | null;
}

export interface IBlogPost {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  publishedAt: string | null;
}

export interface ILead {
  id: string;
  type: string;
  name: string;
  phone: string;
  status: string;
}

export interface IFilterPage {
  id: string;
  slug: string;
  categoryId: string;
}

export interface IPage {
  id: string;
  title: string;
  slug: string;
  published: boolean;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
