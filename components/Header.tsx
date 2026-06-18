"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
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
  
  // YENİ: Geçiş animasyonunun evreleri (idle, loading, done)
  const [navState, setNavState] = useState<'idle' | 'loading' | 'done'>('idle');
  
  const pathname = usePathname();
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

  // YENİ: Sayfa yüklendiği an "Camı Patlatma (done)" evresine geçer
  useEffect(() => {
    if (navState === 'loading') {
      setNavState('done');
      // Cam patlama efekti bittikten sonra idle duruma döner
      const timer = setTimeout(() => setNavState('idle'), 250);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const handleNavClick = (href: string) => {
    if (pathname !== href && !href.startsWith("http")) {
      setNavState('loading');
    }
    setOpen(false);
  };

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
          
          {/* LOGO BÖLÜMÜ - GEÇİŞ EFEKTLERİNİN MERKEZİ */}
          <Link href="/" className="relative group flex items-center shrink min-w-0 z-50" onClick={() => handleNavClick("/")}>
            
            {/* 1. Tıklama Anı: Logoya doğru küçülen mor enerji dalgası */}
            {navState === 'loading' && (
              <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-[#7C3AED] rounded-full pointer-events-none animate-suck-in mix-blend-multiply" />
            )}

            {/* 2. Yükleniyor ve Bitiş: Dönen cam çember ve Patlama */}
            {(navState === 'loading' || navState === 'done') && (
              <div
                className={`absolute top-1/2 left-1/2 w-[110%] h-[140%] sm:w-[105%] sm:h-[130%] rounded-full pointer-events-none
                ${navState === 'loading'
                    ? 'border border-[#7C3AED]/40 border-t-[#FF7A00] bg-white/20 backdrop-blur-sm animate-spin-glass'
                    : 'border-2 border-[#FF7A00] animate-pop-ring'
                }`}
              />
            )}

            {/* Logo Metni (Bitişte Pulse Efekti) */}
            <div className={`flex items-center gap-0.5 relative z-10 transition-transform ${navState === 'done' ? 'animate-logo-pop' : 'group-hover:scale-105'}`}>
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
                  onClick={() => handleNavClick(item.href)}
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
              onClick={() => handleNavClick("/cart")}
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
                  onClick={() => handleNavClick(item.href)}
                  className="flex items-center justify-between py-4 px-5 rounded-2xl text-[16px] font-bold text-slate-800 bg-slate-50/50 border border-transparent hover:border-[#7C3AED]/20 hover:bg-[#7C3AED]/5 hover:text-[#7C3AED] transition-all"
                  style={{ transitionDelay: `${idx * 50}ms` }}
                >
                  {item.label}
                  <svg className="w-4 h-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                </Link>
              ))}
              
              <div className="mt-4 p-5 rounded-2xl bg-slate-900 text-white shadow-inner">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Destek Hattı</p>
                <a href="mailto:info@kesiolabs.com" className="text-[17px] font-black text-[#FF7A00]">info@kesiolabs.com</a>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* YENİ: LOGO ETRAFINDA GERÇEKLEŞEN MİKRO-ANİMASYONLAR */}
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

        /* 1. Logoya doğru çekilen enerji dalgası */
        @keyframes suck-in {
          0% { transform: translate(-50%, -50%) scale(8); opacity: 0; }
          20% { opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; }
        }
        .animate-suck-in {
          animation: suck-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* 2. Dönen cam çember */
        @keyframes spin-glass {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .animate-spin-glass {
          animation: spin-glass 0.4s linear infinite;
        }

        /* 3. Cam çemberin patlayıp yok olması */
        @keyframes pop-ring {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; border-width: 2px; }
          100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; border-width: 8px; }
        }
        .animate-pop-ring {
          animation: pop-ring 0.25s ease-out forwards;
        }

        /* 4. Logonun büyüyerek zıplaması */
        @keyframes logo-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-logo-pop {
          animation: logo-pop 0.25s ease-out forwards;
        }
      `}</style>
    </>
  );
}
