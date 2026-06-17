export const dynamic = "force-dynamic";
export const revalidate = 0;

import ProductsClient from "./ProductsClient";
import { getCatalogProducts, getCatalogCategories } from "@/lib/strapi";

export default async function ProductsPage() {
  // Strapi'den ürünleri ve kategorileri eş zamanlı çekiyoruz
  const [products, categories] = await Promise.all([
    getCatalogProducts(),
    getCatalogCategories(),
  ]);

  return (
    <main className="min-h-screen bg-white">
      {/* py-8 yerine pt-4 ile Header'a yaklaştırdık, max-width'i standartlaştırdık */}
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 pt-4 pb-12">
        <ProductsClient
          products={products}
          categories={categories}
        />
      </div>
    </main>
  );
}
