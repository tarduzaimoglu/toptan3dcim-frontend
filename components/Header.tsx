"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation"; 
import { useCart } from "@/components/cart/CartContext"; 

const navItems = [
  { label: "Anasayfa", href: "/" },
  { label: "Ürün Kataloğu", href: "/products" },
  { label: "Özel Sipariş", href: "https://kesiolabs.com/quote" },
  { label: "İletişim", href: "/contact" },
];

const PROMOS = [
  "🚀 2000₺ Üzeri Kargo Ücretsiz",
  "💳 9 Aya Varan Taksit İmkânı",
  "💸 Tüm Ürünlerde %3 Havale/EFT İndirimi",
];

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

function ShoppingCartIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function AnimatedBurger({ open }: { open: boolean }) {
  const commonLineClass = `absolute left-0 h-[2.5px] w-6 rounded-full bg-slate-700 transform-gpu transition-all duration-300 ${EASE}`;

  return (
    <span className="relative block h-6 w-6" aria-hidden="true">
      <span className={[commonLineClass, "top-[6px]", open ? "translate-y-[6px] rotate-45" : "translate-y-0 rotate-0"].join(" ")} />
      <span className={[commonLineClass, "top-[12px]", open ? "opacity-0 scale-x-50" : "opacity-100 scale-x-100"].join(" ")} />
      <span className={[commonLineClass, "top-[18px]", open ? "-translate-y-[6px] -rotate-45" : "translate-y-0 rotate-0"].join(" ")} />
    </span>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Evreler: idle -> active (iç sayfa mor geçiş) -> leaving -> kesio (Kesiolabs endüstriyel geçiş)
  const [navState, setNavState] = useState<'idle' | 'active' | 'leaving' | 'kesio'>('idle');
  
  const pathname = usePathname();
  const router = useRouter();
  const { items } = useCart();

  const cartCount = useMemo(() => {
    return items.reduce((total, item) => total + item.qty, 0);
  }, [items]);

  const displayCartCount = cartCount > 99 ? "99+" : cartCount;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === href) return; 

    // 🛠️ KESIOLABS INTERCEPT: Eğer link dış bağlantı Kesiolabs ise özel teknoloji portalı geçişini tetikle
    if (href.includes("kesiolabs.com")) {
      e.preventDefault();
      setOpen(false);
      setNavState('kesio');
      
      // Kullanıcının sinematik marka geçişini deneyimlemesi için 1.2 saniye (1200ms) bekletip yönlendiriyoruz
      setTimeout(() => {
        window.location.href = href;
      }, 1200);
      return;
    }
    
    if (href.startsWith("http")) return; // Farklı bir dış link senaryosu için koruma
    
    e.preventDefault(); 
    setOpen(false); 
    
    setNavState('active');
    router.push(href);
  };

  useEffect(() => {
    if (navState === 'active') {
      const timer = setTimeout(() => {
        setNavState('leaving'); 
        setTimeout(() => setNavState('idle'), 400); 
      }, 600); 
      
      return () => clearTimeout(timer);
    }
  }, [pathname, navState]);

  return (
    <>
      <div className="relative flex overflow-hidden bg-slate-900 py-2.5 text-[11px] font-bold uppercase tracking-widest text-white/90 border-b border-white/10">
        <div className="animate-marquee flex whitespace-nowrap">
          {[...PROMOS, ...PROMOS, ...PROMOS].map((promo, index) => (
            <span key={index} className="mx-12 flex items-center shrink-0">
              {promo}
              <span className="mx-12 text-slate-700">•</span>
            </span>
          ))}
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-200/50 py-3"
            : "bg-white py-5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          <Link href="/" className="group flex items-center shrink min-w-0" onClick={(e) => handleNavClick(e, "/")}>
            <div className="flex items-center gap-0.5 transition-transform group-hover:scale-105">
              <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-[#7C3AED]">TOPTAN</span>
              <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-[#FF7A00]">3D</span>
              <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-[#7C3AED]">CIM</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`relative text-[14px] font-bold transition-colors ${
                    isActive ? "text-[#7C3AED]" : "text-slate-600 hover:text-slate-900"
                  } group`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-[2.5px] bg-[#7C3AED] rounded-full transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link
              href="/cart"
              onClick={(e) => handleNavClick(e, "/cart")}
              className="group relative flex items-center gap-1.5 sm:gap-2.5 rounded-2xl bg-[#7C3AED] px-3 sm:px-5 py-2 sm:py-2.5 text-sm font-bold text-white shadow-xl shadow-purple-500/25 transition-all hover:-translate-y-0.5 hover:bg-[#6b1add]"
            >
              <ShoppingCartIcon className="transition-transform group-hover:scale-110" />
              <span className="hidden md:inline">Sepetim</span>
              
              {cartCount > 0 && (
                <span className="flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-white text-[11px] font-black text-[#7C3AED] animate-in zoom-in duration-300">
                  {displayCartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              className="md:hidden flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-700 shrink-0"
              onClick={() => setOpen((v) => !v)}
            >
              <AnimatedBurger open={open} />
            </button>
          </div>
        </div>

        {open && (
          <div className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-2xl border-b border-slate-200 shadow-2xl md:hidden animate-in fade-in slide-in-from-top-4 duration-300 max-h-[85vh] overflow-y-auto overscroll-contain">
            <nav className="flex flex-col p-6 space-y-2 pb-10">
              {navItems.map((item, idx) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="flex items-center justify-between py-4 px-5 rounded-2xl text-[16px] font-bold text-slate-800 bg-slate-50/50 border border-transparent hover:border-[#7C3AED]/20 hover:bg-[#7C3AED]/5 hover:text-[#7C3AED] transition-all"
                  style={{ transitionDelay: `${idx * 50}ms` }}
                >
                  {item.label}
                  <svg className="w-4 h-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* TOPTAN3DCIM İÇ SAYFA GEÇİŞ EKRANI */}
      {navState === 'active' && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center opacity-100 bg-[#7C3AED]/80 backdrop-blur-2xl transition-all duration-400"
        >
          <div className="flex items-center gap-1 md:gap-1.5 relative z-10 animate-pop-in drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]">
            <span className="inline-block pr-2 text-4xl sm:text-6xl font-black italic tracking-tighter text-white animate-float-wave" style={{ animationDelay: '0s' }}>TOPTAN</span>
            <span className="inline-block pr-1.5 text-4xl sm:text-6xl font-black italic tracking-tighter text-[#FF7A00] animate-float-wave drop-shadow-[0_0_20px_rgba(255,122,0,0.5)]" style={{ animationDelay: '0.15s' }}>3D</span>
            <span className="inline-block pr-2 text-2xl sm:text-4xl font-black italic tracking-tighter text-white mt-3 sm:mt-5 animate-float-wave" style={{ animationDelay: '0.3s' }}>CIM</span>
          </div>
        </div>
      )}

      {/* ERİYEREK GEÇİŞ YAPMA EFEKTİ (LEAVING) */}
      {navState === 'leaving' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center opacity-0 bg-[#7C3AED]/0 backdrop-blur-none transition-all duration-400">
          <div className="flex items-center gap-1 md:gap-1.5 relative z-10 opacity-0 transition-opacity duration-300">
            <span className="text-4xl sm:text-6xl font-black italic text-white">TOPTAN</span>
            <span className="text-4xl sm:text-6xl font-black italic text-[#FF7A00]">3D</span>
            <span className="text-2xl sm:text-4xl font-black italic text-white mt-5">CIM</span>
          </div>
        </div>
      )}

      {/* 🚀 KESIOLABS GÜVENLİ DIŞ BAĞLANTI GEÇİŞ EKRANI (1200ms) */}
      {navState === 'kesio' && (
        <div 
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B132B]/90 backdrop-blur-3xl animate-in fade-in duration-300"
        >
          <div className="text-center flex flex-col items-center gap-6 max-w-md px-6 animate-pop-in">
            
            {/* Üst Bağlantı Köprüsü Sinyali */}
            <div className="flex items-center gap-3 opacity-60 text-white text-[10px] tracking-widest uppercase font-black">
              <span>TOPTAN3DCİM</span>
              <svg className="w-4 h-4 animate-pulse text-[#FF7A00]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
              <span>KESIOLABS</span>
            </div>

            {/* Kesiolabs Orijinal Logotür Canlandırması */}
            <div className="flex items-center relative z-10 drop-shadow-[0_0_35px_rgba(0,195,255,0.3)]">
              {/* KESIO - Turkuaz / Siyan - pr-1.5 Kesilme Koruması */}
              <span 
                className="inline-block pr-1.5 text-4xl sm:text-6xl font-black italic tracking-tighter text-[#00C3FF] username animate-float-wave"
                style={{ animationDelay: '0s' }}
              >
                KESIO
              </span>
              {/* L - Turuncu - pr-1 Kesilme Koruması */}
              <span 
                className="inline-block pr-1 text-4xl sm:text-6xl font-black italic tracking-tighter text-[#FFA500] animate-float-wave drop-shadow-[0_0_15px_rgba(255,165,0,0.4)]"
                style={{ animationDelay: '0.15s' }}
              >
                L
              </span>
              {/* ABS - Derin Canlı Mavi - pr-2 Kesilme Koruması */}
              <span 
                className="inline-block pr-2 text-4xl sm:text-6xl font-black italic tracking-tighter text-[#2266FF] animate-float-wave"
                style={{ animationDelay: '0.3s' }}
              >
                ABS
              </span>
            </div>

            {/* Endüstriyel Bilgilendirme Altyazısı */}
            <p className="text-xs sm:text-sm text-slate-300/80 font-bold leading-relaxed max-w-xs animate-pulse">
              Endüstriyel imalat ve ileri seviye 3D modelleme sipariş portalına güvenli geçiş yapılıyor...
            </p>

          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }

        /* LOGO BELİRME EFEKTİ */
        @keyframes pop-in {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
          animation: pop-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* DALGALANMA / UZAYDA SÜZÜLME EFEKTİ */
        @keyframes float-wave {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-12px) scale(1.02); }
        }
        .animate-float-wave {
          animation: float-wave 1s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
