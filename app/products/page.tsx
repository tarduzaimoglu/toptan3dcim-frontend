import { Suspense } from "react";
import ProductsClient from "./ProductsClient";
import { getCatalogProducts, getCatalogCategories } from "@/lib/strapi";

export const revalidate = 3600;

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getCatalogProducts(),
    getCatalogCategories(),
  ]);

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 pt-4 pb-12">
        {/* Suspense, useSearchParams içeren bileşeni statik build sırasında "beklemeye" alır */}
        <Suspense fallback={<div className="py-20 text-center">Yükleniyor...</div>}>
          <ProductsClient
            products={products || []}
            categories={categories || []}
          />
        </Suspense>
      </div>
    </main>
  );
}
