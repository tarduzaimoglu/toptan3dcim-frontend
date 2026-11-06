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

// YENİ: Renk varyantlarımızın kimlik kartı
export type ProductVariant = {
  ColorName: string;
  ColorCode: string;
  VariantImage?: {
    url: string;
    displayUrl?: string;
    thumbUrl?: string; // Kart/liste görünümleri için küçük varyant (bant genişliği optimizasyonu)
  };
};

export type Product = {
  documentId?: string;
  slug?: string;
  categoryTitle?: string;
  description?: string[];
  id: string;
  title: string;
  subtitle: string;
  category: Exclude<ProductCategoryKey, "featured">;
  bullets: string[];
  specs: string[];
  wholesalePriceText: string;
  wholesalePrice?: number; // Expand panel için gerekli
  minQtyText: string;
  minQty?: number; // Expand panel için gerekli
  featured?: boolean;
  createdAtISO: string;
  imageUrl?: string;
  galleryImages?: { original: string; display: string; thumb: string }[];
  imageUrls?: string[]; // Expand panel için gerekli
  imageThumbUrl?: string; // Kart/liste görünümleri için küçük varyant (bant genişliği optimizasyonu)
  variants?: ProductVariant[]; // YENİ: Renk seçeneklerimiz buraya gelecek
};
