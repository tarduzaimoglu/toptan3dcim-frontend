"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/CartContext"; 

const navItems = [
  { label: "Anasayfa", href: "/" },
  { label: "Ürün Kataloğu", href: "/products" },
  { label: "Özel Sipariş", href: "https://kesiolabs.com/quote" },
  { label: "İletişim", href: "https://wa.me/905465868005" },
];

const PROMOS = [
  "🚀 2000₺ Üzeri Kargo Ücretsiz",
  "💳 9 Aya Varan Taksit İmkânı",
  "💸 Tüm Ürünlerde %3 Havale/EFT İndirimi",
];

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// --- İkonlar ---
function ShoppingCartIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function AnimatedBurger({ open }: { open: boolean }) {
  // Akıcı ve modern "Spring" efekti için özel zamanlama (EASE)
  const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
  const commonLineClass = `absolute left-0 h-[2.5px] w-6 rounded-full bg-slate-700 transform-gpu transition-all duration-300 ${EASE}`;

  return (
    <span className="relative block h-6 w-6" aria-hidden="true">
      {/* Üst Çizgi */}
      <span
        className={[
          commonLineClass,
          "top-[6px]",
          open ? "translate-y-[6px] rotate-45" : "translate-y-0 rotate-0",
        ].join(" ")}
      />
      {/* Orta Çizgi */}
      <span
        className={[
          commonLineClass,
          "top-[12px]",
          open ? "opacity-0 scale-x-50" : "opacity-100 scale-x-100",
        ].join(" ")}
      />
      {/* Alt Çizgi */}
      <span
        className={[
          commonLineClass,
          "top-[18px]",
          open ? "-translate-y-[6px] -rotate-45" : "translate-y-0 rotate-0",
        ].join(" ")}
      />
    </span>
  );
}
export default function Header() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { items } = useCart();

  // DÜZELTİLEN YER: quantity yerine qty kullanıldı
  const cartCount = useMemo(() => {
    return items.reduce((total, item) => total + item.qty, 0);
  }, [items]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      {/* 1. ÜST DUYURU BANDI (Marquee) */}
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

      {/* 2. ANA NAVİGASYON (Sticky + Glassmorphism) */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-slate-200/50 py-3"
            : "bg-white py-5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
          
          {/* Logo Alanı */}
          <Link href="/" className="group flex items-center gap-0.5 transition-transform hover:scale-105" onClick={() => setOpen(false)}>
            <span className="text-2xl font-black italic tracking-tighter text-[#7C3AED]">TOPTAN</span>
            <span className="text-2xl font-black italic tracking-tighter text-[#FF7A00]">3D</span>
            <span className="text-2xl font-black italic tracking-tighter text-[#7C3AED]">CIM</span>
          </Link>

          {/* Masaüstü Menü (Premium Hover Efektli) */}
          <nav className="hidden md:flex items-center gap-10">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
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

          {/* Sağ Alan: Sepet & Mobil Buton */}
          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="group relative flex items-center gap-2.5 rounded-2xl bg-[#7C3AED] px-5 py-2.5 text-sm font-bold text-white shadow-xl shadow-purple-500/25 transition-all hover:-translate-y-0.5 hover:bg-[#6b1add]"
            >
              <ShoppingCartIcon className="transition-transform group-hover:scale-110" />
              <span className="hidden md:inline">Sepetim</span>
              
              {cartCount > 0 && (
                <span className="flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-white text-[11px] font-black text-[#7C3AED] animate-in zoom-in duration-300">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobil Menü Butonu */}
            <button
              type="button"
              className="md:hidden flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
              onClick={() => setOpen((v) => !v)}
            >
              <AnimatedBurger open={open} />
            </button>
          </div>
        </div>

        {/* Mobil Menü Paneli */}
        {open && (
          <div className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-2xl border-b border-slate-200 shadow-2xl md:hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <nav className="flex flex-col p-6 space-y-2">
              {navItems.map((item, idx) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
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
      `}</style>
    </>
  );
}