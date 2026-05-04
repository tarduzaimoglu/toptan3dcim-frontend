import React from 'react';

export default function DeliveryReturnsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Üst Başlık Bölümü */}
      <div className="bg-[#7F22FE] py-16 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Teslimat & İade</h1>
          <p className="text-purple-100 text-lg">
            Üretim ve Teslimat Süreçleri Hakkında Bilgilendirme
          </p>
        </div>
      </div>

      {/* İçerik Bölümü */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <article className="prose prose-slate lg:prose-lg max-w-none text-gray-700 leading-relaxed space-y-8">
          
          <p className="bg-orange-50 border-l-4 border-[#ff7a00] p-6 text-orange-900">
            <strong>Önemli Not:</strong> Toptan3Dcim (KesioLabs) tarafından sunulan ürünlerin tamamına yakını, toptan siparişe özel ve talep doğrultusunda üretilmektedir. Bu nedenle teslimat ve iade süreçleri, standart perakende satışlardan farklı esaslara tabidir.
          </p>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">Teslimat Süreci</h2>
            <p>
              Toptan3Dcim üzerinden verilen siparişler, onay sonrasında üretim planlamasına alınır. Üretim süresi; ürünün niteliğine, adet bilgisine (toptan hacmine) ve teknik gereksinimlere bağlı olarak değişiklik gösterir. Tahmini teslim tarihi, sipariş onayı aşamasında tarafınıza bildirilir.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Üretimi tamamlanan ürünler, endüstriyel standartlarda paketlenir.</li>
              <li>Anlaşmalı lojistik/kargo firmaları aracılığıyla gönderim sağlanır.</li>
              <li>Kargo süresi üretim süresine dahil değildir.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">Teslimat Kontrolü</h2>
            <p>
              Ürün teslimi sırasında alıcının paketi kontrol etmesi önemle tavsiye edilir. Taşıma sırasında oluşabilecek hasarlar, teslim anında tespit edilerek <strong>kargo firmasıyla birlikte tutanak altına alınmalıdır.</strong> Tutanak altına alınmayan taşıma hasarları için sonradan yapılacak talepler değerlendirme kapsamı dışındadır.
            </p>
          </section>

          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">İade Koşulları (Cayma Hakkı İstisnası)</h2>
            <p>
              Toptan3Dcim tarafından üretilen ürünler; kuruma veya projeye özel, siparişe bağlı "Özel Üretim" kapsamında olduğundan dolayı <strong>cayma hakkı kapsamında değildir.</strong> Üretim hatası bulunmadığı sürece iade veya ücret iadesi mümkün değildir.
            </p>
            <p className="mt-4 text-sm font-semibold text-gray-600">Aşağıdaki durumlar iade kapsamında değildir:</p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>Kullanıcı onayıyla üretilmiş ölçü ve tasarım özellikleri.</li>
              <li>Renk tonu veya 3D baskı yüzey dokusuna ilişkin kişisel beklentiler.</li>
              <li>Sipariş onayı sonrası projeden vazgeçme talepleri.</li>
            </ul>
          </div>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">Üretim Hatası Durumu</h2>
            <p>
              Yalnızca teknik olarak tespit edilebilir üretim kusurları (ölçü hataları, yapısal kusurlar) olması durumunda, teslimat tarihinden itibaren makul süre içerisinde yazılı bildirim yapılması şartıyla inceleme başlatılır.
            </p>
            <p>Hata tespit edilmesi halinde Toptan3Dcim öncelikli olarak <strong>ürün onarımı veya yeniden üretim</strong> seçeneğini uygular.</p>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">Yetkisiz Müdahale</h2>
            <p>
              Teslimat sonrasında ürüne yapılan fiziksel müdahaleler, yanlış kullanım veya yetkisiz tamir girişimleri ürünü garanti ve iade kapsamı dışında bırakır.
            </p>
          </section>

          <p className="text-sm text-gray-500 italic border-t pt-8">
            Bu politika, Toptan3Dcim internet sitesinde yayımlandığı tarihte yürürlüğe girer. KesioLabs, hizmet kapsamındaki değişikliklere bağlı olarak bu politikayı güncelleme hakkını saklı tutar.
          </p>

        </article>
      </div>
    </main>
  );
}