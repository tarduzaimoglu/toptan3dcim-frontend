import React from 'react';

export default function CorporatePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Üst Başlık Bölümü */}
      <div className="bg-[#7F22FE] py-16 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Kurumsal</h1>
          <p className="text-purple-100 text-lg">
            KesioLabs Güvencesiyle Toptan 3D Baskı Çözümleri
          </p>
        </div>
      </div>

      {/* İçerik Bölümü */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <article className="prose prose-slate lg:prose-lg max-w-none text-gray-700 leading-relaxed space-y-8">
          
          <p className="font-medium text-xl text-gray-900 border-l-4 border-[#ff7a00] pl-4">
            <strong>Toptan3Dcim</strong>; bir <strong>KesioLabs</strong> iştiraki olup, endüstriyel tasarım, dijital üretim ve 3D baskı teknolojileri alanlarında özellikle yüksek hacimli üretim ve toptan çözümlere odaklanmış profesyonel bir üretim stüdyosudur.
          </p>

          <p>
            Kuruluş amacımız, bireysel ve kurumsal müşterilerin seri üretim ihtiyaçlarına yönelik olarak; teknik doğruluk, üretilebilirlik ve kalite standartlarını esas alan çözümler geliştirmektir. KesioLabs çatısı altında kazandığımız tasarım tecrübesini, Toptan3Dcim ile geniş üretim parkurumuza ve uygun maliyetli toptan iş modelimize aktarıyoruz.
          </p>

          <p>
            Toptan3Dcim bünyesinde yürütülen tüm çalışmalar; tasarım, üretim ve teslimat süreçlerini kapsayan planlı ve kontrollü bir iş akışı çerçevesinde gerçekleştirilmektedir. Projelerin her aşamasında; kullanım amacı, teknik gereksinimler, malzeme özellikleri ve ölçü hassasiyeti dikkate alınarak üretim süreçleri yapılandırılmaktadır. Bu yaklaşım, toptan üretimlerde ve farklı ölçeklerdeki projelerde tutarlı ve tekrarlanabilir sonuçlar elde edilmesini sağlamaktadır.
          </p>

          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">Üretim Altyapımız</h2>
            <p>
              Üretim altyapımız; güncel 3D baskı teknolojileri, profesyonel CAD tabanlı tasarım yazılımları ve kalibrasyonu sağlanmış yüksek kapasiteli üretim sistemleri ile desteklenmektedir. Uygulanan kalite kontrol süreçleri sayesinde; ister prototip üretimi ister binlerce adetlik fonksiyonel parça imalatı olsun, her üründe yüksek doğruluk ve yüzey kalitesi standartları korunmaktadır.
            </p>
          </div>

          <p>
            Hizmet kapsamımız; tasarıma dayalı toptan 3D baskı çözümleri, ürün geliştirme çalışmaları, kurumsal hediyelik eşya üretimi ve sanayi tipi teknik parça imalatını içermektedir. Her proje, talep edilen kullanım alanı ve teknik şartlar doğrultusunda değerlendirilmekte; uygun üretim yöntemi ve malzeme seçimi bu çerçevede belirlenmektedir.
          </p>

          <p>
            Toptan3Dcim, yalnızca bir üretim hizmeti sağlayıcısı olarak değil; <strong>KesioLabs</strong>'in tasarım gücünü arkasına alan bir çözüm ortağı yaklaşımıyla konumlanmaktadır. Müşteri taleplerinin doğru şekilde analiz edilmesi, süreç boyunca şeffaf bilgilendirme sağlanması ve teknik gerekliliklere uygun ilerlenmesi, hizmet anlayışımızın temel unsurlarıdır.
          </p>

          <p className="bg-[#ff7a00]/5 p-6 rounded-lg italic text-gray-800">
            Kurumsal yapımız; kalite, güvenilirlik ve sürdürülebilirlik ilkeleri üzerine inşa edilmiştir. Toptan3Dcim olarak, faaliyet gösterdiğimiz alanlarda güncel üretim teknolojilerini ve sektörel gelişmeleri yakından takip ederek, hizmet altyapımızı sürekli geliştirmeyi ve uzun vadeli, güvene dayalı iş birlikleri oluşturmayı hedeflemekteyiz.
          </p>

        </article>
      </div>
    </main>
  );
}