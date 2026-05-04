export const dynamic = "force-dynamic";
export const revalidate = 0;

import ProductsClient from "./ProductsClient";
import { getCatalogProducts, getCatalogCategories } from "@/lib/strapi";

export default async function ProductsPage() {
  const [products, cats] = await Promise.all([
    getCatalogProducts(),
    getCatalogCategories(),
  ]);

  const categories = [{ key: "featured", label: "Öne Çıkanlar" }, ...cats];

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mt-6">
          <ProductsClient
            products={products}
            categories={categories}
            defaultCat="featured"
          />
        </div>
      </div>
    </main>
  );
}