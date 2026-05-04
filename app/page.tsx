export const dynamic = "force-dynamic";
export const revalidate = 0;

import HeroBanner from "@/components/HeroBanner";
import ProductCarousel from "@/components/ProductCarousel";
import { getCatalogProducts } from "@/lib/strapi";

// Bannerları çekmek için yerel fonksiyon (Mevcut yapına göre)
async function getBanners() {
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  try {
    const res = await fetch(`${STRAPI_URL}/api/banners2?populate=*`, { cache: 'no-store' });
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Banner çekme hatası:", error);
    return [];
  }
}

// Diziyi karıştırmak için güvenli fonksiyon
function shuffleArray(array: any[]) {
  if (!Array.isArray(array)) return [];
  return [...array].sort(() => Math.random() - 0.5);
}

export default async function HomePage() {
  // Verileri çekiyoruz
  const [banners, allProducts] = await Promise.all([
    getBanners(),
    getCatalogProducts(),
  ]);

  // Hata aldığın nokta: allProducts dizi değilse boş dizi ata
  const safeProducts = Array.isArray(allProducts) ? allProducts : [];
  
  // Ürünleri karıştır
  const randomProducts = shuffleArray(safeProducts);

  return (
    <main className="min-h-screen bg-white">
      <section className="w-full relative overflow-hidden">
        <HeroBanner banners={banners} />
      </section>

      {/* Kırpılmayı önlemek için dikey boşluk (py-24) 
          ve Swiper'ın dışarı taşmasına izin veren overflow-visible 
      */}
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
  <a 
    href="/products" 
    className="inline-flex items-center justify-center px-12 py-4 bg-slate-900 text-white rounded-full font-bold text-sm tracking-widest hover:bg-[#7C3AED] transition-all duration-300 shadow-xl"
  >
    TÜM KATALOĞU KEŞFET
  </a>
</div>
        </div>
      </section>
    </main>
  );
}