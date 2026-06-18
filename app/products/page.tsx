import ProductsClient from "./ProductsClient";
import { getCatalogProducts, getCatalogCategories } from "@/lib/strapi";

// 1. "force-dynamic" ve "revalidate = 0" kaldırıldı.
// 2. Sayfa artık sunucuda önbelleklenebilir (ISR).
// 3. Her 1 saatte bir (3600 saniye) arka planda güncellenir.
export const revalidate = 3600;

export default async function ProductsPage() {
  // Strapi'den ürünleri ve kategorileri eş zamanlı çekiyoruz
  const [products, categories] = await Promise.all([
    getCatalogProducts(),
    getCatalogCategories(),
  ]);

  return (
    <main className="min-h-screen bg-white">
      {/* Header ile ürünlerin arasındaki boşluğu normalize ettik.
        max-w-7xl ve px değerleri ile modern bir e-ticaret layout'u sağladık.
      */}
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 pt-4 pb-12">
        <ProductsClient
          products={products || []}
          categories={categories || []}
        />
      </div>
    </main>
  );
}
