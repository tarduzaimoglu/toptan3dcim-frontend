import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Üst Başlık Bölümü */}
      <div className="bg-[#7F22FE] py-16 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Gizlilik Politikası</h1>
          <p className="text-purple-100 text-lg">
            Veri Güvenliğiniz Bizim İçin Önemlidir
          </p>
        </div>
      </div>

      {/* İçerik Bölümü */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <article className="prose prose-slate lg:prose-lg max-w-none text-gray-700 leading-relaxed space-y-8">
          
          <p>
            <strong>KesioLabs Endüstriyel Tasarım Yazılım Üretim Ticaret Ltd. Şti.</strong> (“KesioLabs” veya “Şirket”) olarak, <strong>Toptan3Dcim</strong> markamız altında sunduğumuz hizmetlerde kişisel verilerin korunması ve gizliliğin sağlanması hususunda azami hassasiyet göstermekteyiz. İşbu Gizlilik Politikası, Toptan3Dcim’e ait internet sitesi üzerinden elde edilen kişisel verilerin; hangi kapsamda, hangi amaçlarla işlendiğini ve nasıl korunduğunu açıklamak amacıyla hazırlanmıştır.
          </p>

          <p>
            KesioLabs, kişisel verilerin işlenmesinde başta 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) olmak üzere, yürürlükte bulunan ilgili mevzuata uygun hareket etmeyi ilke edinmiştir.
          </p>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">Kişisel Verilerin Toplanma Yöntemi</h2>
            <p>
              Kişisel veriler; Toptan3Dcim’e ait internet sitesi üzerinden doldurulan iletişim, teklif ve toptan sipariş formları, elektronik posta yoluyla yapılan yazışmalar ve kullanıcılar tarafından gönüllü olarak paylaşılan bilgiler aracılığıyla toplanmaktadır. Toplanan veriler, yalnızca kullanıcıların kendi iradeleriyle iletmiş olduğu bilgilerle sınırlıdır.
            </p>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">İşlenen Kişisel Veri Türleri</h2>
            <p>KesioLabs tarafından işlenebilecek kişisel veri türleri şunlardır:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ad ve soyad</li>
              <li>E-posta adresi ve telefon numarası</li>
              <li>Firma adı, Vergi Dairesi ve Vergi Numarası (Toptan satışlar için)</li>
              <li>Teslimat ve fatura adresi</li>
              <li>Talep, teklif ve proje içerikleri</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">Kişisel Verilerin İşlenme Amaçları</h2>
            <p>Toplanan kişisel veriler, aşağıda belirtilen amaçlarla işlenmektedir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Toptan ürün taleplerinin ve teklif başvurularının değerlendirilmesi</li>
              <li>Üretim, lojistik ve teslimat süreçlerinin yönetilmesi</li>
              <li>Sipariş onayı ve teknik detaylar için kullanıcılarla iletişime geçilmesi</li>
              <li>Sözleşmesel ve hukuki yükümlülüklerin yerine getirilmesi</li>
              <li>İlgili mevzuattan doğan yükümlülüklerin ifası</li>
            </ul>
          </section>

          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">Saklama ve Güvenlik</h2>
            <p>
              KesioLabs, kişisel verilerin gizliliğini sağlamak amacıyla uygun teknik tedbirleri almaktadır. Verileriniz yetkisiz erişime karşı korunmakta ve sadece yetkili personelin erişimine açık tutulmaktadır. Kişisel veriler, işlenme amacının gerektirdiği süre boyunca saklanır ve süre sonunda anonim hale getirilir.
            </p>
          </div>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">Kişisel Verilerin Aktarılması</h2>
            <p>
              KesioLabs, kişisel verileri açık rıza olmaksızın veya yasal zorunluluklar haricinde ticari/pazarlama amaçlı üçüncü kişilerle paylaşmaz. Ancak, kargo/lojistik süreçlerinin yürütülmesi amacıyla gerekli adres bilgileri ilgili iş ortaklarıyla paylaşılabilir.
            </p>
          </section>

          <section>
            <h2 className="text-[#7F22FE] text-2xl font-bold mb-4">Veri Sahibinin Hakları</h2>
            <p>
              KVKK’nın 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini talep etme haklarına sahipsiniz. Taleplerinizi <strong>info@kesiolabs.com</strong> üzerinden yazılı olarak iletebilirsiniz.
            </p>
          </section>

          <p className="text-sm text-gray-500 italic border-t pt-8">
            Bu Gizlilik Politikası, Toptan3Dcim internet sitesinde yayımlandığı tarihte yürürlüğe girer. KesioLabs, mevzuat değişikliklerine bağlı olarak bu politikayı güncelleme hakkını saklı tutar.
          </p>

        </article>
      </div>
    </main>
  );
}