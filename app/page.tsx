// "force-dynamic" ve "revalidate = 0" satırlarını sildik.
// ISR (Incremental Static Regeneration) sayesinde sayfa sunucuda hazır bekler.
export const revalidate = 3600; // Sayfa 1 saatte bir arka planda güncellenir.

import HeroBanner from "@/components/HeroBanner";
import ProductCarousel from "@/components/ProductCarousel";
import { getCatalogProducts } from "@/lib/strapi";

async function getBanners() {
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  try {
    // cache: 'force-cache' ekleyerek sunucunun veriyi önbelleğe almasını sağlıyoruz
    const res = await fetch(`${STRAPI_URL}/api/banners2?populate=*`, { cache: "no-store", });
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    return [];
  }
}

export default async function HomePage() {
  // Promise.all ile veriler eşzamanlı çekilir
  const [banners, allProducts] = await Promise.all([
    getBanners(),
    getCatalogProducts(),
  ]);

  const safeProducts = Array.isArray(allProducts) ? allProducts : [];
  
  // ÖNEMLİ: Statik sayfalarda Math.random() kullanmak hydration hatası verebilir.
  // Bu yüzden rastgeleliği sunucuda yapıp sayfayı statik olarak donduruyoruz.
  const randomProducts = [...safeProducts].sort(() => Math.random() - 0.5);

  return (
    <main className="min-h-screen bg-white">
      <section className="w-full relative overflow-hidden">
        <HeroBanner banners={banners} />
      </section>

      <section className="py-24 overflow-visible relative">
        <div className="container mx-auto px-4 overflow-visible">
          <header className="mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase">
              ÜRÜNLERİMİZ
            </h2>
            <div className="w-20 h-2 bg-[#7C3AED] mx-auto mt-4 rounded-full"></div>
          </header>

          {randomProducts.length > 0 ? (
            <div className="w-full overflow-visible">
              <ProductCarousel products={randomProducts} />
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 italic">
              Sergilenecek ürün bulunamadı.
            </div>
          )}
          
          <div className="text-center mt-20">
            <a href="/products" className="inline-flex items-center justify-center px-12 py-4 bg-slate-900 text-white rounded-full font-bold text-sm tracking-widest hover:bg-[#7C3AED] transition-all duration-300 shadow-xl">
              TÜM KATALOĞU KEŞFET
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
