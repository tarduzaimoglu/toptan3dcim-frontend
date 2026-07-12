import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi | TOPTAN3DCİM",
  description: "6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca hazırlanan Mesafeli Satış Sözleşmesi.",
};

export default function DistanceSellingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Üst Başlık Bölümü */}
      <div className="bg-[#7F22FE] py-16 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Mesafeli Satış Sözleşmesi</h1>
          <p className="text-purple-100 text-lg">
            6502 Sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği Uyarınca
          </p>
        </div>
      </div>

      {/* İçerik Bölümü */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <article className="prose prose-slate lg:prose-lg max-w-none text-gray-700 leading-relaxed space-y-8">

          <p>
            İşbu Mesafeli Satış Sözleşmesi (&quot;Sözleşme&quot;), 6502 sayılı Tüketicinin Korunması Hakkında Kanun (&quot;Kanun&quot;) ve Mesafeli Sözleşmeler Yönetmeliği (&quot;Yönetmelik&quot;) hükümleri uyarınca, aşağıda bilgileri yer alan Satıcı ile Alıcı arasında, <strong>toptan3dcim.com</strong> (&quot;Site&quot;) üzerinden elektronik ortamda kurulan mesafeli satış sözleşmelerinin şartlarını belirlemek amacıyla düzenlenmiştir. Satıcı taraf, <strong>Kesiolabs Endüstriyel Tasarım Yazılım Üretim Ticaret Limited Şirketi</strong> (&quot;KesioLabs&quot; veya &quot;Şirket&quot;) olup; Toptan3Dcim, Site&apos;nin işletildiği satış markası olarak anılmaktadır ve işbu Sözleşme kapsamındaki satıcı taraf her koşulda Şirket&apos;tir.
          </p>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">1. Taraflar</h2>
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 mb-6">
              <p className="font-semibold mb-2">SATICI</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Unvan: Kesiolabs Endüstriyel Tasarım Yazılım Üretim Ticaret Limited Şirketi</li>
                <li>Adres: Acıbadem Mah. Akçaağaç Sk. No:8 Üsküdar/İstanbul</li>
                <li>E-posta: info@kesiolabs.com</li>
                <li>Telefon: 0546 586 80 05</li>
                <li>Satış Kanalı: toptan3dcim.com</li>
              </ul>
            </div>
            <p>
              <strong>ALICI:</strong> Site üzerinden sipariş sırasında ad-soyad, adres, e-posta ve telefon bilgilerini beyan eden ve işbu Sözleşme&apos;yi elektronik ortamda onaylayan gerçek veya tüzel kişi (&quot;Alıcı&quot; veya &quot;Tüketici&quot;).
            </p>
            <p>
              Alıcı, Site üzerinden sipariş vermekle birlikte Satıcı&apos;nın kimlik ve iletişim bilgilerini, satışa konu ürünün temel nitelikleri, vergiler dahil satış fiyatı, ödeme şekli, teslimat koşulları ile cayma hakkına ilişkin bilgileri okuyup edindiğini kabul eder.
            </p>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">2. Sözleşmenin Konusu</h2>
            <p>
              İşbu Sözleşme&apos;nin konusu; Alıcı&apos;nın Satıcı&apos;ya ait Site üzerinden elektronik ortamda siparişini verdiği, niteliği, satış fiyatı, ödeme şekli ve teslimata ilişkin bilgileri sipariş formunda/onay ekranında belirtilen ürünün satışı ve teslimi ile ilgili olarak Kanun ve Yönetmelik hükümleri uyarınca tarafların hak ve yükümlülüklerinin belirlenmesidir.
            </p>
            <p>
              Alıcı, sipariş konusu ürünün temel özellikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri Site üzerinde sipariş onayından önce okuduğunu ve elektronik ortamda gerekli teyidi verdiğini kabul eder.
            </p>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">3. Ürün ve Ödeme Bilgileri</h2>
            <p>
              3.1. Sözleşme konusu ürünün türü, adedi, modeli/rengi, satış bedeli (KDV dahil), teslimat bilgileri ve varsa kargo ücreti, sipariş onay ekranında ve Alıcı&apos;ya iletilen sipariş özetinde/faturada belirtildiği gibidir; bu bilgiler işbu Sözleşme&apos;nin ayrılmaz parçasıdır.
            </p>
            <p>
              3.2. Ödeme; kredi kartı, banka kartı (sanal POS aracılığıyla tek çekim veya taksitli) ya da havale/EFT yöntemleriyle yapılabilir. Taksit imkânları ilgili bankanın kampanyalarına tabidir ve Satıcı&apos;yı bağlamaz.
            </p>
            <p>
              3.3. Sipariş bedelinin tahsilatı, Satıcı Şirket adına yapılır. Alıcı, ödeme aracı kuruluşuna ilettiği kart bilgilerinin doğruluğundan sorumludur.
            </p>
            <p>
              3.4. Ürün fiyatlarında ve stok durumunda ilan tarihinden sonra değişiklik yapma hakkı Satıcı&apos;ya aittir; ancak Alıcı tarafından onaylanmış bir siparişin bedeli, açık bir sistem/yazım hatası bulunmadıkça tek taraflı olarak değiştirilemez.
            </p>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">4. Teslimat</h2>
            <p>
              4.1. Ürün, Alıcı&apos;nın sipariş sırasında bildirdiği adrese, siparişte belirtilen teslimat süresi içinde, anlaşmalı kargo/lojistik firmaları aracılığıyla teslim edilir. Teslimat süresi, ürünün toptan/özel üretime konu olması halinde üretim süresine bağlı olarak değişebilir ve bu husus sipariş onayı aşamasında Alıcı&apos;ya ayrıca bildirilir.
            </p>
            <p>
              4.2. Yasal düzenlemeler uyarınca teslimat süresi, açıkça aksi belirtilmediği sürece otuz (30) günü geçemez; bu süre içinde teslimatın yapılamayacağının anlaşılması halinde Alıcı, Satıcı tarafından bilgilendirilir ve dilerse siparişini iptal edebilir.
            </p>
            <p>
              4.3. Teslimat sırasında ürünün hasarlı veya eksik olduğunun tespiti halinde durum, kargo görevlisine tutanakla bildirilmeli ve durum en kısa sürede Satıcı&apos;ya iletilmelidir.
            </p>
            <p>
              4.4. Detaylı teslimat esasları için ayrıca{' '}
              <Link href="/delivery-returns" className="text-[#7F22FE] font-semibold hover:underline">
                Teslimat &amp; İade Koşulları
              </Link>{' '}
              sayfası geçerlidir.
            </p>
            <p>
              4.5. Kargo ücreti, sepet tutarına (kademeli indirim uygulanmış, KDV dahil) göre belirlenir: sepet tutarı 1.500 TL ve üzerinde ise kargo ücretsizdir; bu tutarın altındaki siparişlerde sabit 200 TL kargo ücreti uygulanır. Uygulanacak kargo ücreti, ödeme/sipariş onay ekranında ayrıca gösterilir.
            </p>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">5. Cayma Hakkı</h2>
            <p>
              5.1. Alıcı; hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin, ürünün kendisine veya gösterdiği üçüncü kişiye teslim edildiği tarihten itibaren <strong>on dört (14) gün</strong> içinde sözleşmeden cayma hakkına sahiptir.
            </p>
            <p>
              5.2. Cayma hakkının kullanılması için bu süre içinde Satıcı&apos;ya info@kesiolabs.com adresi, 0546 586 80 05 numaralı telefon veya yazılı bildirim yoluyla açık talebin ulaştırılması yeterlidir.
            </p>
            <p>
              5.3. Cayma hakkının kullanılması halinde Alıcı, ürünü işbu bildirimi takip eden 10 gün içinde, faturası ile birlikte ve olağan kullanım dışında bir yıpranma olmaksızın Satıcı&apos;ya geri göndermekle yükümlüdür.
            </p>
            <p>
              5.4. Satıcı, cayma bildiriminin kendisine ulaşmasından itibaren en geç 14 gün içinde, varsa ürünü teslim alan kargo firmasına bildirilen tutarı da içerecek şekilde, Alıcı&apos;dan tahsil edilen toplam bedeli, ürünün kendisine ulaşmasını takiben Alıcı&apos;nın ödemeyi gerçekleştirdiği yöntemle iade eder.
            </p>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">6. Cayma Hakkının İstisnaları</h2>
            <p>Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesi uyarınca, aşağıdaki hallerde Alıcı cayma hakkını kullanamaz:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fiyatı finansal piyasalardaki dalgalanmalara bağlı olarak değişen ve Satıcı&apos;nın kontrolünde olmayan mal veya hizmetlere ilişkin sözleşmeler,</li>
              <li><strong>Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan, ölçüye/talebe özel üretilen veya kişiye/işletmeye özel olarak tasarım, renk, boyut, model gibi hususlarda özelleştirilerek üretilen 3D baskı ürünleri</strong> (Toptan3Dcim ürünlerinin önemli bir kısmı bu kapsamdadır),</li>
              <li>Çabuk bozulabilen veya son kullanma tarihi geçebilecek mallar,</li>
              <li>Tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olan ve iadesi sağlık ve hijyen açısından uygun olmayan mallar,</li>
              <li>Tesliminden sonra başka ürünlerle karışan ve doğası gereği ayrıştırılması mümkün olmayan mallar,</li>
              <li>Elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayri maddi mallar (ör. dijital 3D tasarım dosyaları).</li>
            </ul>
            <p>
              Alıcı, sipariş konusu ürünün kişiye özel/talebe özel üretim kapsamında olup olmadığını sipariş onayı aşamasında Satıcı tarafından bilgilendirilir.
            </p>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">7. İade Prosedürü</h2>
            <p>
              7.1. Cayma hakkı kapsamında iade edilecek ürünler; kutusu, ambalajı, varsa standart aksesuarları ile birlikte eksiksiz ve hasarsız olarak, faturası eklenmek suretiyle Satıcı&apos;nın bildireceği adrese gönderilir.
            </p>
            <p>
              7.2. Cayma hakkının kullanılmasından kaynaklanan iade kargo bedeli, aksi Satıcı tarafından yazılı olarak taahhüt edilmedikçe Alıcı&apos;ya aittir.
            </p>
            <p>
              7.3. Ayıplı/hasarlı ürün teslimi halinde Alıcı, Kanun&apos;un 11. maddesinde düzenlenen ücretsiz onarım, ayıpsız misli ile değiştirme, bedel indirimi veya sözleşmeden dönme haklarından birini kullanabilir.
            </p>
            <p>
              7.4. İade süreciyle ilgili tüm başvurular info@kesiolabs.com adresi veya 0546 586 80 05 numaralı telefon üzerinden Satıcı&apos;ya iletilir.
            </p>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">8. Temerrüt Hükümleri</h2>
            <p>
              8.1. Alıcı&apos;nın temerrüde düşmesi: Alıcı&apos;nın kredi kartı ile yaptığı işlemlerde temerrüde düşmesi halinde, kart sahibi banka ile arasındaki kredi kartı sözleşmesi çerçevesinde faiz ödeyeceğini ve bankaya karşı sorumlu olacağını kabul eder; bu durum Satıcı&apos;nın herhangi bir sorumluluğunu doğurmaz.
            </p>
            <p>
              8.2. Satıcı&apos;nın temerrüde düşmesi: Satıcı&apos;nın sözleşmesel yükümlülüklerini haklı bir sebep olmaksızın yerine getirmemesi halinde Alıcı, Kanun ve Yönetmelik&apos;te tanınan tüm yasal haklarını (ifa, fesih, tazminat talebi dahil) kullanabilir.
            </p>
            <p>
              8.3. Tarafların işbu Sözleşme&apos;den doğan yükümlülüklerini yerine getirmemesi, mücbir sebep (doğal afet, salgın, altyapı arızaları, mevzuat değişiklikleri vb.) hallerinden kaynaklanıyorsa, ilgili taraf sorumlu tutulamaz.
            </p>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">9. Uyuşmazlık Çözümü</h2>
            <p>
              9.1. İşbu Sözleşme&apos;nin uygulanmasından doğabilecek uyuşmazlıklarda, Ticaret Bakanlığı&apos;nca her yıl ilan edilen parasal sınırlar dahilinde Alıcı&apos;nın yerleşim yerindeki veya işlemin yapıldığı yerdeki <strong>Tüketici Hakem Heyetleri</strong>, bu sınırları aşan uyuşmazlıklarda ise <strong>Tüketici Mahkemeleri</strong> yetkilidir.
            </p>
            <p>
              9.2. Taraflar arasında Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri&apos;nin görev alanı dışında kalan uyuşmazlıkların çözümünde <strong>İstanbul Anadolu Mahkemeleri ve İcra Daireleri</strong> yetkilidir.
            </p>
            <p>
              9.3. İşbu Sözleşme, Türkiye Cumhuriyeti kanunlarına tabidir.
            </p>
          </section>

          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">10. Yürürlük</h2>
            <p>
              Alıcı, Site üzerinden verdiği siparişi onaylamakla; sipariş konusu ürünün temel özellikleri, satış fiyatı, ödeme şekli, teslimat koşulları ile cayma hakkı ve istisnalarına ilişkin ön bilgilendirmeyi eksiksiz okuduğunu, anladığını ve işbu Mesafeli Satış Sözleşmesi hükümlerini elektronik ortamda kabul ettiğini beyan eder. Sözleşme, sipariş onayının Satıcı sistemine ulaştığı anda yürürlüğe girer.
            </p>
          </div>

          <p className="text-sm text-gray-500 italic border-t pt-8">
            Bu Mesafeli Satış Sözleşmesi, Toptan3Dcim internet sitesinde yayımlandığı tarihte yürürlüğe girer. KesioLabs, mevzuat değişikliklerine bağlı olarak bu sözleşmeyi güncelleme hakkını saklı tutar.
          </p>

        </article>
      </div>
    </main>
  );
}
