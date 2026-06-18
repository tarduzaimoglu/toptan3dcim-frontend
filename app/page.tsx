export const revalidate = 3600; // Sayfa 1 saatte bir arka planda güncellenir.

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

      {/* MODERN E-TİCARET TASARIMI: bg-slate-50 ve çerçevelenmiş alan */}
      <section className="py-24 bg-slate-50 relative">
        <div className="container mx-auto px-4 overflow-visible">
          
          <header className="mb-16 text-center">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight uppercase">
              ÜRÜNLERİMİZ
            </h2>
            <p className="text-slate-500 mt-4 text-lg">İşletmenize özel 3D baskı çözümleri</p>
            <div className="w-24 h-1.5 bg-[#7C3AED] mx-auto mt-6 rounded-full"></div>
          </header>

          <div className="bg-white p-4 md:p-10 rounded-3xl shadow-sm border border-slate-100 overflow-visible">
            {randomProducts.length > 0 ? (
              <ProductCarousel products={randomProducts} />
            ) : (
              <div className="text-center py-20 text-slate-400 italic">
                Sergilenecek ürün bulunamadı.
              </div>
            )}
          </div>
          
          <div className="text-center mt-20 flex justify-center">
            <a href="/products" className="group inline-flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold tracking-widest hover:bg-[#7C3AED] transition-all duration-300 shadow-xl">
              TÜM KATALOĞU KEŞFET
              <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
            </a>
          </div>

        </div>
      </section>
    </main>
  );
}
