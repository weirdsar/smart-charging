/** Serialized product row from POST /api/comparison */
export interface ComparisonProductRow {
  id: string;
  title: string;
  slug: string;
  price: number;
  images: string[];
  powerKw: number | null;
  fuelType: string | null;
  hasAvr: boolean | null;
  noiseLevelDb: number | null;
  specs: unknown;
  categoryName?: string;
  categoryType?: string;
}
