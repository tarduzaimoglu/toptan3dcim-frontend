import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Kullanım Koşulları | TOPTAN3DCİM",
  description: "Toptan3Dcim.com sitesinin kullanımına ilişkin şart ve koşullar, üyelik, sipariş, ödeme ve sorumluluk hükümleri.",
};

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Üst Başlık Bölümü */}
      <div className="bg-[#7F22FE] py-16 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Kullanım Koşulları</h1>
          <p className="text-purple-100 text-lg">
            Son Güncelleme Tarihi: 09.07.2026
          </p>
        </div>
      </div>

      {/* İçerik Bölümü */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <article className="prose prose-slate lg:prose-lg max-w-none text-gray-700 leading-relaxed space-y-8">

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">1. Taraflar ve Kapsam</h2>
            <p>
              İşbu Kullanım Koşulları (&quot;Koşullar&quot;), <strong>Kesiolabs Endüstriyel Tasarım Yazılım Üretim Ticaret Limited Şirketi</strong> (&quot;KesioLabs&quot; veya &quot;Şirket&quot;) tarafından işletilen <strong>toptan3dcim.com</strong> internet sitesinin (&quot;Site&quot;) kullanımına ilişkin şart ve koşulları düzenler. Toptan3Dcim, KesioLabs&apos;a ait bir satış markasıdır; Site üzerinden gerçekleştirilen tüm satış işlemlerinde satıcı taraf Şirket&apos;tir.
            </p>
            <p>
              Siteyi ziyaret eden, üye olan veya Site üzerinden alışveriş yapan tüm gerçek ve tüzel kişiler (&quot;Kullanıcı&quot;), işbu Koşulları okumuş, anlamış ve kabul etmiş sayılır. Bu Koşulları kabul etmiyorsanız lütfen Siteyi kullanmayınız.
            </p>
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
              <p className="font-semibold mb-2">Şirket Bilgileri:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Unvan: Kesiolabs Endüstriyel Tasarım Yazılım Üretim Ticaret Limited Şirketi</li>
                <li>Adres: Acıbadem Mahallesi, Akçaağaç Sokak No: 8 Üsküdar / İstanbul</li>
                <li>E-posta: info@kesiolabs.com</li>
                <li>Telefon: 0546 586 80 05</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">2. Hizmetin Tanımı</h2>
            <p>
              Site, KesioLabs bünyesinde faaliyet gösteren Toptan3Dcim markası altında, işletmelere ve bireysel kullanıcılara yönelik 3D baskı ürünlerinin toptan ve perakende satışının yapıldığı bir elektronik ticaret platformudur.
            </p>
            <p>
              Şirket, Site üzerinden sunulan ürün ve hizmetlerin kapsamını, içeriğini ve fiyatlarını önceden bildirimde bulunmaksızın değiştirme hakkını saklı tutar.
            </p>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">3. Üyelik ve Hesap Güvenliği</h2>
            <p>3.1. Site üzerinden sipariş verebilmek için Kullanıcı&apos;nın doğru, güncel ve eksiksiz bilgi vermesi gerekmektedir.</p>
            <p>3.2. Kullanıcı, hesap bilgilerinin gizliliğinden ve güvenliğinden bizzat sorumludur. Hesap üzerinden gerçekleştirilen tüm işlemler Kullanıcı&apos;nın sorumluluğundadır.</p>
            <p>3.3. Kullanıcı, hesabının yetkisiz kullanıldığını fark etmesi halinde durumu derhal Şirket&apos;e bildirmekle yükümlüdür.</p>
            <p>3.4. Şirket, işbu Koşullara aykırı davranan Kullanıcıların üyeliğini askıya alma veya sonlandırma hakkını saklı tutar.</p>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">4. Kullanıcının Yükümlülükleri</h2>
            <p>Kullanıcı, Siteyi kullanırken:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>4.1. Türkiye Cumhuriyeti mevzuatına, işbu Koşullara ve genel ahlak kurallarına uygun davranmayı,</li>
              <li>4.2. Site&apos;nin işleyişini engelleyecek veya aksatacak herhangi bir yazılım, virüs, bot veya otomatik sistem kullanmamayı,</li>
              <li>4.3. Site içeriğini izinsiz kopyalamamayı, çoğaltmamayı, dağıtmamayı veya ticari amaçla kullanmamayı,</li>
              <li>4.4. Diğer kullanıcıların veya üçüncü kişilerin haklarını ihlal edecek eylemlerde bulunmamayı,</li>
              <li>4.5. Site üzerinden verdiği sipariş ve yaptığı işlemlerde doğru bilgi vermeyi</li>
            </ul>
            <p>kabul ve taahhüt eder.</p>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">5. Fikri Mülkiyet Hakları</h2>
            <p>
              5.1. Site&apos;de yer alan tüm içerik; ürün tasarımları, görseller, logolar, marka isimleri (Toptan3Dcim, KesioLabs), metinler, yazılım ve sair unsurlar KesioLabs&apos;a aittir veya lisanslı olarak kullanılmaktadır ve 5846 sayılı Fikir ve Sanat Eserleri Kanunu ile 6769 sayılı Sınai Mülkiyet Kanunu kapsamında korunmaktadır.
            </p>
            <p>
              5.2. Bu içerikler, Şirket&apos;in yazılı izni olmaksızın kopyalanamaz, çoğaltılamaz, değiştirilemez, yayınlanamaz veya ticari amaçla kullanılamaz.
            </p>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">6. Sipariş ve Ödeme</h2>
            <p>6.1. Site üzerinden verilen siparişler, ödemenin onaylanması ile birlikte işleme alınır.</p>
            <p>6.2. Ödemeler; kredi kartı, banka kartı (sanal POS aracılığıyla) veya havale/EFT yöntemiyle yapılabilir. Kart ile yapılan ödemelerde taksit seçenekleri, ilgili banka ve ödeme kuruluşunun koşullarına tabidir. Ödemelerin muhatabı ve tahsilat yapan taraf Şirket&apos;tir.</p>
            <p>6.3. Ürün fiyatları KDV dahil olarak gösterilmektedir. Kargo ücretleri, sipariş tutarına göre değişiklik gösterebilir ve ödeme sayfasında ayrıca belirtilir.</p>
            <p>6.4. Şirket, fiyat veya ürün bilgilerinde oluşabilecek yazım/sistem hatalarından kaynaklanan siparişleri iptal etme hakkını saklı tutar. Bu durumda tahsil edilen tutar Kullanıcı&apos;ya iade edilir.</p>
            <p>
              6.5. Satış işlemlerine ilişkin detaylı hükümler, sipariş sırasında onaylanan{' '}
              <Link href="/distance-selling" className="text-[#7F22FE] font-semibold hover:underline">
                Mesafeli Satış Sözleşmesi
              </Link>
              &apos;nde düzenlenmiştir.
            </p>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">7. Teslimat ve İade</h2>
            <p>
              Teslimat süreçleri, cayma hakkı ve iade koşullarına ilişkin detaylar{' '}
              <Link href="/delivery-returns" className="text-[#7F22FE] font-semibold hover:underline">
                Teslimat &amp; İade Koşulları
              </Link>{' '}
              sayfasında yer almaktadır. Kullanıcı, sipariş vermeden önce bu koşulları incelemekle yükümlüdür.
            </p>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">8. Kişisel Verilerin Korunması</h2>
            <p>
              Kullanıcılara ait kişisel veriler, veri sorumlusu sıfatıyla Şirket tarafından 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında işlenmektedir. Detaylı bilgi için{' '}
              <Link href="/privacy-policy" className="text-[#7F22FE] font-semibold hover:underline">
                Gizlilik Politikası
              </Link>{' '}
              sayfasını inceleyebilirsiniz.
            </p>
          </section>

          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">9. Sorumluluğun Sınırlandırılması</h2>
            <p>9.1. Şirket, Site&apos;nin kesintisiz ve hatasız çalışacağını garanti etmez. Teknik arızalar, bakım çalışmaları veya mücbir sebeplerden kaynaklanan erişim kesintilerinden Şirket sorumlu tutulamaz.</p>
            <p>9.2. Site&apos;de yer alan ürün görselleri temsili olabilir; 3D baskı üretim yöntemi gereği ürünlerde renk tonu ve yüzey dokusunda küçük farklılıklar oluşabilir.</p>
            <p>9.3. Site üzerinden üçüncü taraf sitelere verilen bağlantıların içeriğinden Şirket sorumlu değildir.</p>
          </div>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">10. Mücbir Sebepler</h2>
            <p>
              Doğal afet, savaş, salgın hastalık, altyapı ve internet arızaları, mevzuat değişiklikleri gibi Şirket&apos;in kontrolü dışında gelişen olaylar mücbir sebep sayılır. Mücbir sebep süresince Şirket&apos;in yükümlülüklerini ifa edememesi, sözleşme ihlali olarak değerlendirilmez.
            </p>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">11. Değişiklikler</h2>
            <p>
              Şirket, işbu Kullanım Koşullarını dilediği zaman tek taraflı olarak güncelleme hakkını saklı tutar. Güncel koşullar Site&apos;de yayınlandığı tarihte yürürlüğe girer. Kullanıcıların Siteyi kullanmaya devam etmesi, güncel koşulları kabul ettiği anlamına gelir.
            </p>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">12. Uygulanacak Hukuk ve Yetkili Mahkeme</h2>
            <p>
              İşbu Koşullardan doğabilecek uyuşmazlıklarda Türkiye Cumhuriyeti hukuku uygulanır. Uyuşmazlıkların çözümünde İstanbul Anadolu Mahkemeleri ve İcra Daireleri yetkilidir. Tüketici sıfatını haiz Kullanıcılar, ayrıca yerleşim yerlerindeki Tüketici Hakem Heyetlerine ve Tüketici Mahkemelerine başvurabilir.
            </p>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">13. İletişim</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>E-posta:</strong> info@kesiolabs.com</li>
              <li><strong>Telefon:</strong> 0546 586 80 05</li>
              <li><strong>Adres:</strong> Acıbadem Mahallesi, Akçaağaç Sokak No: 8 Üsküdar / İstanbul</li>
            </ul>
          </section>

          <p className="text-sm text-gray-500 italic border-t pt-8">
            © 2026 Kesiolabs Endüstriyel Tasarım Yazılım Üretim Ticaret Limited Şirketi. Tüm hakları saklıdır.
          </p>

        </article>
      </div>
    </main>
  );
}
