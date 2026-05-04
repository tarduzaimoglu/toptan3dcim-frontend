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

const LOGO_CLASS = "h-6 md:h-[26px] w-auto object-contain";
const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
const BRAND_PURPLE = "#7C3AED"; 
const BRAND_PURPLE_RGB = "124, 58, 237";
const SCROLL_STEP = 260;
const ARROW_COL = "w-[44px]";

function ShoppingCartIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
  );
}

function ChevronLeft({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AnimatedBurger({ open }: { open: boolean }) {
  return (
    <span className={["relative block h-6 w-6 transition-transform duration-300", EASE, open ? "scale-[0.98]" : "scale-100"].join(" ")} aria-hidden="true">
      <span className={["absolute left-0 top-[6px] h-[2px] w-6 rounded-full bg-slate-700 transform-gpu transition-all duration-300", EASE, open ? "translate-y-[6px] rotate-45" : "translate-y-0 rotate-0"].join(" ")} />
      <span className={["absolute left-0 top-[12px] h-[2px] w-6 rounded-full bg-slate-700 transform-gpu transition-all duration-200", EASE, open ? "opacity-0 scale-x-50" : "opacity-100 scale-x-100"].join(" ")} />
      <span className={["absolute left-0 top-[18px] h-[2px] w-6 rounded-full bg-slate-700 transform-gpu transition-all duration-300", EASE, open ? "-translate-y-[6px] -rotate-45" : "translate-y-0 rotate-0"].join(" ")} />
    </span>
  );
}

function ArrowButton({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) {
  const commonClass = [
    "h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 border bg-transparent",
    EASE,
    "shadow-[0_6px_18px_rgba(15,23,42,0.08)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.10)] active:scale-[0.98]",
  ].join(" ");

  const style: React.CSSProperties = {
    borderColor: `rgba(${BRAND_PURPLE_RGB}, 0.2)`,
    background: dir === "left"
      ? `linear-gradient(to right, rgba(${BRAND_PURPLE_RGB}, 0.08), rgba(${BRAND_PURPLE_RGB}, 0.00))`
      : `linear-gradient(to left, rgba(${BRAND_PURPLE_RGB}, 0.08), rgba(${BRAND_PURPLE_RGB}, 0.00))`,
  };

  return (
    <button type="button" onClick={onClick} className={commonClass} style={style}>
      {dir === "left" ? <ChevronLeft className="text-[#7C3AED]" /> : <ChevronRight className="text-[#7C3AED]" />}
    </button>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const activePath = useMemo(() => pathname || "", [pathname]);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const cartContext = useCart();
  const cartCount = cartContext?.qtyCount || 0; 

  const updateOverflowState = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const overflow = el.scrollWidth > el.clientWidth + 1;
    setHasOverflow(overflow);
    setCanLeft(overflow && el.scrollLeft > 2);
    setCanRight(overflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  const scrollByDir = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -SCROLL_STEP : SCROLL_STEP, behavior: "smooth" });
  };

  const onWheelHorizontal = (e: React.WheelEvent) => {
    const el = scrollerRef.current;
    if (!el || !hasOverflow) return;
    const move = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    e.preventDefault();
    el.scrollLeft += move;
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    updateOverflowState();
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => updateOverflowState();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateOverflowState);
    return () => {
      window.removeEventListener("resize", updateOverflowState);
      el.removeEventListener("scroll", onScroll);
    };
  }, [activePath]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
        
        <div className="w-full bg-black text-white text-[11px] md:text-[13px] py-2 overflow-hidden whitespace-nowrap flex items-center">
          <div className="animate-marquee inline-flex gap-24 px-4 font-medium tracking-wide">
            <span>🚀 2000₺ Üzeri Kargo Ücretsiz</span>
            <span>💳 9 Aya Varan Taksit İmkanı</span>
            <span>💸 Tüm Ürünlerde %3 Havale/EFT İndirimi</span>
            <span>🚀 2000₺ Üzeri Kargo Ücretsiz</span>
            <span>💳 9 Aya Varan Taksit İmkanı</span>
            <span>💸 Tüm Ürünlerde %3 Havale/EFT İndirimi</span>
            <span>🚀 2000₺ Üzeri Kargo Ücretsiz</span>
            <span>💳 9 Aya Varan Taksit İmkanı</span>
            <span>💸 Tüm Ürünlerde %3 Havale/EFT İndirimi</span>
          </div>
        </div>

        <div className="w-full px-4 md:px-6">
          <div className="flex h-20 items-center justify-between w-full relative">
            
            <div className="flex flex-1 items-center justify-start min-w-0">
              <Link href="/" className="inline-flex" onClick={() => setOpen(false)}>
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className={LOGO_CLASS} 
                  draggable={false} 
                />
              </Link>
            </div>

            <div className="hidden md:flex flex-shrink-0 items-center justify-center">
              <div className={["flex-shrink-0 flex items-center justify-center transition-[width,opacity] duration-200", EASE, hasOverflow ? ARROW_COL : "w-0", hasOverflow && canLeft ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")}>
                {hasOverflow && <ArrowButton dir="left" onClick={() => scrollByDir("left")} />}
              </div>

              <nav className="flex justify-center max-w-[45vw] lg:max-w-[50vw]">
                <div ref={scrollerRef} className="no-scrollbar flex items-center gap-8 overflow-x-auto whitespace-nowrap scroll-smooth" onWheel={onWheelHorizontal}>
                  {navItems.map((item, i) => (
                    <div key={item.href} className="flex items-center gap-8">
                      <Link
                        href={item.href}
                        className={`shrink-0 transition-colors duration-200 text-[15px] ${
                          activePath === item.href ? "text-[#7C3AED] font-bold" : "text-slate-700 hover:text-[#7C3AED] font-medium"
                        }`}
                      >
                        {item.label}
                      </Link>
                      {i !== navItems.length - 1 && <span className="h-4 w-px bg-slate-300 shrink-0" />}
                    </div>
                  ))}
                </div>
              </nav>

              <div className={["flex-shrink-0 flex items-center justify-center transition-[width,opacity] duration-200", EASE, hasOverflow ? ARROW_COL : "w-0", hasOverflow && canRight ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")}>
                {hasOverflow && <ArrowButton dir="right" onClick={() => scrollByDir("right")} />}
              </div>
            </div>

            <div className="flex flex-1 items-center justify-end gap-2 md:gap-4 min-w-0">
              
              <Link 
                href="/cart" 
                className="flex items-center gap-2 bg-[#7C3AED] text-white px-3 py-2 md:px-4 md:py-2.5 rounded-xl hover:bg-[#6D28D9] transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
              >
                <ShoppingCartIcon />
                <span className="hidden md:inline font-bold text-sm">Sepetim</span>
                {cartCount > 0 && (
                  <span className="flex items-center justify-center bg-white text-[#7C3AED] text-[11px] md:text-xs font-black h-5 min-w-[20px] px-1.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center rounded-xl p-2 hover:bg-slate-100 transition-colors"
                onClick={() => setOpen((v) => !v)}
              >
                <AnimatedBurger open={open} />
              </button>
            </div>

          </div>
        </div>

        <div className={["md:hidden fixed inset-0 z-[60]", open ? "pointer-events-auto" : "pointer-events-none"].join(" ")} aria-hidden={!open}>
          <button onClick={() => setOpen(false)} className={["absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300", EASE, open ? "opacity-100" : "opacity-0"].join(" ")} />
          
          <div className={["absolute right-0 top-0 h-full w-[86%] max-w-[420px] bg-white border-l border-slate-200 shadow-2xl transform-gpu transition-all duration-300 flex flex-col", EASE, open ? "translate-x-0 opacity-100 scale-100" : "translate-x-full opacity-0 scale-[0.98]"].join(" ")}>
            <div className="flex h-20 items-center justify-between px-6 border-b border-slate-100">
              <Link href="/" onClick={() => setOpen(false)}>
                <img src="/logo.png" alt="Logo" className="h-6 w-auto" /> 
              </Link>
              <button type="button" className="rounded-2xl p-2 hover:bg-slate-100 transition" onClick={() => setOpen(false)}>
                <AnimatedBurger open={true} />
              </button>
            </div>

            <nav className="px-6 py-8 flex-1 overflow-y-auto">
              <ul className="flex flex-col gap-4">
                {navItems.map((item, idx) => {
                  const isActive = activePath === item.href;
                  const isExternal = item.href.startsWith("http");

                  return (
                    <li 
                      key={item.href} 
                      className={["transform-gpu transition-all duration-300", EASE, open ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"].join(" ")} 
                      style={{ transitionDelay: open ? `${100 + idx * 50}ms` : "0ms" }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        className={`block w-full rounded-2xl px-5 py-4 text-[17px] font-bold border transition-colors ${
                          isActive 
                            ? "text-[#ff7a00] border-[#ff7a00]/30 bg-[#ff7a00]/5" 
                            : "text-slate-800 bg-white border-slate-100 hover:bg-slate-50 hover:text-[#ff7a00]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <p className="text-sm text-slate-500 font-medium">Bize Ulaşın</p>
              <a href="mailto:info@kesiolabs.com" className="text-[#ff7a00] font-bold text-lg">info@kesiolabs.com</a>
            </div>
          </div>
        </div>
      </header>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
}