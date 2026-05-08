import Link from "next/link";

const ADDRESS_LINE_1 = "Fındıklı Mahallesi, Ermiş Sokak No: 17";
const ADDRESS_LINE_2 = "Maltepe / İstanbul";
const FULL_ADDRESS = `${ADDRESS_LINE_1} ${ADDRESS_LINE_2}`;

const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(FULL_ADDRESS)}`;

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-slate-900 pt-16 pb-8 border-t-[6px] border-[#7F22FE]">
      {/* Arka Plan Efektleri */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7F22FE] rounded-full blur-[150px] transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px] transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Üst Kısım: Ana Bilgiler & Menüler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-12 border-b border-slate-800">
          
          {/* 1. Sütun: Marka & Hakkımızda */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-black text-white tracking-tight mb-4 flex items-center gap-2">
              <span className="text-[#7F22FE]">Toptan</span>3Dcim
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              KesioLabs bünyesinde, işletmeler için yüksek kapasiteli ve kaliteli 3D baskı çözümleri sunuyoruz. Hızlı üretim, uygun maliyet.
            </p>
            
            {/* Güven Rozeti (B2B için önemli) */}
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
               <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               <div className="text-xs font-semibold text-slate-300">
                 Türkiye'nin Her Yerine <br/> <span className="text-white">Sigortalı Teslimat</span>
               </div>
            </div>
          </div>

          {/* 2. Sütun: İletişim & Adres */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Bize Ulaşın</h4>
            <ul className="space-y-4">
              <li>
                <a href="tel:+905333839438" className="group flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-[#7F22FE] transition-colors">📞</div>
                  <span className="text-sm font-medium">0533 383 94 38</span>
                </a>
              </li>
              <li>
                <a href="tel:+905537538182" className="group flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-[#7F22FE] transition-colors">📞</div>
                  <span className="text-sm font-medium">0553 753 81 82</span>
                </a>
              </li>
              <li>
                <a href="mailto:info@kesiolabs.com" className="group flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-[#7F22FE] transition-colors">✉️</div>
                  <span className="text-sm font-medium">info@kesiolabs.com</span>
                </a>
              </li>
              <li>
                <a href={MAPS_DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3 text-slate-400 hover:text-white transition-colors mt-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-[#7F22FE] transition-colors shrink-0">📍</div>
                  <span className="text-sm leading-relaxed">{ADDRESS_LINE_1}<br/>{ADDRESS_LINE_2}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* 3. Sütun: Hızlı Menü */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Kurumsal</h4>
            <ul className="space-y-3">
              {[
                { name: 'Hakkımızda', href: '/corporate' },
                { name: 'Gizlilik Politikası', href: '/privacy-policy' },
                { name: 'Mesafeli Satış Sözleşmesi', href: '/distance-selling' }, // B2B için eklendi
                { name: 'Teslimat & İade Koşulları', href: '/delivery-returns' },
                { name: 'Sık Sorulan Sorular', href: '/faq' },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm font-medium text-slate-400 hover:text-[#7F22FE] hover:pl-2 transition-all duration-300">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Sütun: Çalışma Saatleri & Sosyal Medya */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Çalışma Saatleri</h4>
            <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
              <div className="flex justify-between items-center py-2 border-b border-slate-700/50 text-sm">
                <span className="text-slate-400">Hafta İçi</span>
                <span className="text-white font-medium">08:00 - 20:00</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-700/50 text-sm">
                <span className="text-slate-400">Cumartesi</span>
                <span className="text-white font-medium">08:00 - 16:00</span>
              </div>
              <div className="flex justify-between items-center py-2 text-sm">
                <span className="text-slate-400">Pazar</span>
                <span className="text-red-400 font-medium">Kapalı</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <a href="https://instagram.com/kesiolabs" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 hover:bg-gradient-to-tr hover:from-orange-500 hover:to-purple-600 text-white transition-all transform hover:scale-110">
                IG
              </a>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Bizi Takip Edin</span>
            </div>
          </div>

        </div>

        {/* Alt Kısım: Telif & Yasal Bilgiler */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-500 text-xs text-center md:text-left">
            <p>© {new Date().getFullYear()} <span className="text-white font-semibold">KesioLabs</span> Bilişim ve Teknoloji. Tüm hakları saklıdır.</p>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-slate-600">
             <span>Vergi No: <span className="text-slate-400">Gerekli İse Eklenebilir</span></span>
             <span>|</span>
             <span>Mersis No: <span className="text-slate-400">Gerekli İse Eklenebilir</span></span>
          </div>
        </div>

      </div>
    </footer>
  );
}