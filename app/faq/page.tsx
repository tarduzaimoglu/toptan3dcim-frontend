import React from 'react';

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Üst Başlık Bölümü */}
      <div className="bg-[#7F22FE] py-16 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Sık Sorulan Sorular</h1>
          <p className="text-purple-100 text-lg">
            Toptan3Dcim Hizmetleri ve Üretim Süreçleri Hakkında Merak Ettikleriniz
          </p>
        </div>
      </div>

      {/* İçerik Bölümü */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="space-y-6">
          
          {/* Soru Kartı 1 */}
          <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
            <h3 className="text-[#7F22FE] font-bold text-lg mb-2">Toptan3Dcim hangi hizmetleri sunmaktadır?</h3>
            <p className="text-gray-700 leading-relaxed">
              Toptan3Dcim; <strong>KesioLabs</strong> iştiraki olarak endüstriyel tasarım odaklı toptan 3D baskı çözümleri, ürün prototipleme, teknik parça üretimi ve kurumsal/kısmî kişiselleştirilebilir ürün imalatı alanlarında hizmet vermektedir. Tüm üretimler, talebe ve projeye özel olarak planlanmaktadır.
            </p>
          </div>

          {/* Soru Kartı 2 */}
          <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
            <h3 className="text-[#7F22FE] font-bold text-lg mb-2">Teklif alma süreci nasıl ilerlemektedir?</h3>
            <p className="text-gray-700 leading-relaxed">
              Teklif talepleri, web sitemiz üzerinden iletilen bilgiler doğrultusunda değerlendirilir. Ürün ölçüleri, kullanım amacı, adet bilgisi ve teknik gereksinimler incelendikten sonra, kullanıcıya özel toptan fiyatlandırma oluşturulur. Teklif onayı sonrasında üretim süreci başlatılır.
            </p>
          </div>

          {/* Soru Kartı 3 */}
          <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
            <h3 className="text-[#7F22FE] font-bold text-lg mb-2">Hangi malzemelerle üretim yapıyorsunuz?</h3>
            <p className="text-gray-700 leading-relaxed">
              Üretimlerimizde ağırlıklı olarak PLA ve ABS malzemelerin yanı sıra; ASA, PETG ve TPU gibi endüstriyel filamentler kullanılır. Malzeme seçimi; ürünün kullanım alanı, mekanik gereksinimleri ve çevresel koşulları dikkate alınarak belirlenir.
            </p>
          </div>

          {/* Soru Kartı 4 */}
          <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
            <h3 className="text-[#7F22FE] font-bold text-lg mb-2">Sipariş verdikten sonra iptal veya değişiklik yapılabilir mi?</h3>
            <p className="text-gray-700 leading-relaxed">
              Sipariş onayı sonrasında toptan üretim süreci ve hammadde planlaması anlık olarak başlatıldığı için, iptal veya değişiklik talepleri kabul edilmemektedir. Bu durum, siparişe özel "Custom" üretim esaslarından kaynaklanmaktadır.
            </p>
          </div>

          {/* Soru Kartı 5 */}
          <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
            <h3 className="text-[#7F22FE] font-bold text-lg mb-2">3D dosyam yoksa üretim yapılabilir mi?</h3>
            <p className="text-gray-700 leading-relaxed">
              Evet. 3D dosyası bulunmayan müşterilerimiz için <strong>KesioLabs</strong> bünyesindeki tasarım ve modelleme desteği sağlanmaktadır. Ürünün ölçüleri ve referans görselleri doğrultusunda tasarım süreci planlanır. Tasarım hizmeti, üretimden bağımsız olarak ayrıca değerlendirilir.
            </p>
          </div>

          {/* Soru Kartı 6 */}
          <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
            <h3 className="text-[#7F22FE] font-bold text-lg mb-2">Yüklediğim dosyalar gizli mi kalır?</h3>
            <p className="text-gray-700 leading-relaxed">
              Kesinlikle evet. Kullanıcılar tarafından iletilen tüm 3D dosyalar, teknik çizimler ve proje bilgileri gizli kabul edilir. Bu dosyalar üçüncü kişilerle paylaşılmaz, çoğaltılmaz veya izinsiz şekilde reklam amaçlı dahi olsa kullanılmaz.
            </p>
          </div>

          {/* Soru Kartı 7 */}
          <div className="p-6 rounded-2xl border border-slate-100 bg-[#ff7a00]/5 border-dashed">
            <h3 className="text-[#ff7a00] font-bold text-lg mb-2">İade veya ücret iadesi mümkün müdür?</h3>
            <p className="text-gray-700 leading-relaxed">
              Üretim hatası bulunmadığı sürece, kişiye/kuruma özel üretimlerde iade veya ücret iadesi mümkün değildir. Üretim hatası doğrulanması halinde, durum teknik incelemeye alınarak hızlıca onarım veya yeniden üretim sağlanır.
            </p>
          </div>

        </div>

        <div className="mt-16 text-center bg-slate-50 rounded-3xl p-10 border border-slate-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Başka bir sorunuz mu var?</h2>
          <p className="text-gray-600 mb-8">Aradığınız cevabı bulamadıysanız size yardımcı olmaktan mutluluk duyarız.</p>
          <a 
            href="https://wa.me/905465868005" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-[#ff7a00] text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-orange-200 hover:scale-105 transition-transform"
          >
            WhatsApp ile Bize Sorun
          </a>
        </div>
      </div>
    </main>
  );
}