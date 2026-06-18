export const revalidate = 3600;

import HeroBanner from "@/components/HeroBanner";
import ProductCarousel from "@/components/ProductCarousel";
import { getCatalogProducts } from "@/lib/strapi";

async function getBanners() {
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  try {
    const res = await fetch(`${STRAPI_URL}/api/banners2?populate=*`, { next: { revalidate: 3600 } });
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    return [];
  }
}

export default async function HomePage() {
  const [banners, allProducts] = await Promise.all([
    getBanners(),
    getCatalogProducts(),
  ]);

  const safeProducts = Array.isArray(allProducts) ? allProducts : [];
  const randomProducts = [...safeProducts].sort(() => Math.random() - 0.5);

  return (
    <main className="min-h-screen bg-white">
      <section className="w-full relative shadow-2xl overflow-hidden">
        <HeroBanner banners={banners} />
      </section>

      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight uppercase">
              Hızlı Üretim
            </h2>
            <p className="text-slate-500 mt-4 text-lg">İşletmenize özel 3D baskı çözümleri</p>
            <div className="w-32 h-1.5 bg-[#7C3AED] mt-6 rounded-full" />
          </div>

          <div className="bg-white p-6 md:p-12 rounded-3xl shadow-sm border border-slate-100 overflow-visible">
            {randomProducts.length > 0 ? (
              <ProductCarousel products={randomProducts} />
            ) : (
              <div className="text-center py-20 text-slate-400 italic">Sergilenecek ürün bulunamadı.</div>
            )}
          </div>
          
          <div className="flex justify-center mt-16">
            <a href="/products" className="group flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-[#7C3AED] transition-all duration-300 shadow-xl">
              TÜM KATALOĞU KEŞFET 
              <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
