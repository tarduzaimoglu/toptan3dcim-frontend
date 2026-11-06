import { notFound, permanentRedirect } from "next/navigation";
import { productPath, catalogReturn } from "@/lib/products/navigation";
import { Suspense } from "react";
import ProductsClient from "./ProductsClient";
import { getCatalogProducts, getCatalogCategories, getProductByLegacyId } from "@/lib/strapi";

export const revalidate = 3600;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  if (typeof query.open === 'string') {
    const product = await getProductByLegacyId(query.open);
    if (!product?.slug) notFound();
    const rest = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) if (typeof value === 'string' && key !== 'open') rest.set(key, value);
    permanentRedirect(`${productPath(product)}?from=${encodeURIComponent(catalogReturn(`/products?${rest}`))}`);
  }
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
