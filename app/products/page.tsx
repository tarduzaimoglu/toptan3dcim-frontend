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
      {/* py-8 yerine pt-4 ile Header'a yaklaştırdık, max-width'i standartlaştırdık */}
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 pt-4 pb-12">
        <ProductsClient
          products={products}
          categories={categories}
          defaultCat="featured"
        />
      </div>
    </main>
  );
}