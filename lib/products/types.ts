export type ProductCategoryKey =
  | "featured"
  | "flexi"
  | "sport"
  | "vehicle"
  | "gift"
  | "figure";

export type ProductCategory = {
  key: ProductCategoryKey;
  title: string;
};

export type Product = {
  id: string;
  title: string;
  subtitle: string;
  category: Exclude<ProductCategoryKey, "featured">;
  bullets: string[];
  specs: string[];
  wholesalePriceText: string;
  minQtyText: string;
  featured?: boolean;
  createdAtISO: string;
  imageUrl?: string;
};
