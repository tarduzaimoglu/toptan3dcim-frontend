"use client";

import React, { useRef, useState, useEffect } from "react";

export type CatalogCategoryTab = {
  key: string;
  label: string;
};

export function CategoryTabs({
  categories,
  active,
  onChange,
}: {
  categories: CatalogCategoryTab[];
  active: string;
  onChange: (key: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("scroll", checkScroll);
  }, [categories]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    // Dış kapsayıcı: Üstten Header ile mesafeyi korur
    <div className="group relative w-full overflow-visible pt-8 pb-4">
      
      {/* Sol Ok */}
      {showLeftArrow && (
        <div className="hidden md:flex absolute left-0 top-1/2 z-20 -translate-y-1/2 h-full items-center bg-gradient-to-r from-white via-white/80 to-transparent pr-12 pointer-events-none">
          <button
            onClick={() => scroll("left")}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md transition-all hover:scale-110 hover:border-[#ff7a00] hover:text-[#ff7a00]"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
        </div>
      )}

      {/* Sağ Ok */}
      {showRightArrow && (
        <div className="hidden md:flex absolute right-0 top-1/2 z-20 -translate-y-1/2 h-full items-center bg-gradient-to-l from-white via-white/80 to-transparent pl-12 pointer-events-none">
          <button
            onClick={() => scroll("right")}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-md transition-all hover:scale-110 hover:border-[#ff7a00] hover:text-[#ff7a00]"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      )}

      {/* Menü Konteyneri */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        // KRİTİK DÜZELTME: py-5 (dikey padding) ekledik ki gölge ve ping noktası kırpılmasın.
        // -my-5 (negatif margin) ile bu padding'in yarattığı fazla boşluğu dengeledik.
        className="no-scrollbar flex w-full items-center gap-4 overflow-x-auto py-5 px-2 -my-5 scroll-smooth"
      >
        {categories.map((c) => {
          const isActive = c.key === active;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => onChange(c.key)}
              className={[
                "relative flex h-11 shrink-0 items-center justify-center rounded-2xl px-7 text-[14.5px] font-bold tracking-tight transition-all duration-300",
                isActive
                  ? "bg-[#ff7a00] text-white shadow-[0_12px_24px_-8px_rgba(255,122,0,0.6)] scale-105 z-10"
                  : "bg-slate-100/60 text-slate-500 border border-transparent hover:bg-white hover:border-slate-200 hover:text-slate-900 active:scale-95",
              ].join(" ")}
            >
              {isActive && (
                 <span className="absolute -top-1.5 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff7a00] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ff7a00]"></span>
                 </span>
              )}
              {c.label}
            </button>
          );
        })}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}