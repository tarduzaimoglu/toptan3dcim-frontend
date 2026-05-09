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
      setShowLeftArrow(scrollLeft > 15);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 15);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 250;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    // py-8 yerine py-4 yaparak dikey mesafeyi daralttık
    <div className="relative w-full overflow-visible py-4 px-0">
      
      {/* Navigasyon Okları */}
      {showLeftArrow && (
        <div className="hidden md:flex absolute left-0 top-1/2 z-30 -translate-y-1/2 h-full items-center bg-gradient-to-r from-white via-white/80 to-transparent pr-12 pointer-events-none">
          <button onClick={() => scroll("left")} className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-all hover:border-[#ff7a00] hover:text-[#ff7a00]">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
          </button>
        </div>
      )}

      {/* Menü Akışı */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        // overflow-x-auto yanlardan kesilmeyi önlemek için px-1 kullanıyoruz
        className="no-scrollbar flex w-full items-center gap-3 overflow-x-auto py-2 px-1 scroll-smooth"
      >
        {categories.map((c) => {
          const isActive = c.key === active;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => onChange(c.key)}
              className={[
                "relative flex h-10 shrink-0 items-center justify-center rounded-full px-7 text-[14px] font-bold tracking-tight transition-all duration-300",
                isActive
                  ? "bg-[#ff7a00] text-white shadow-md scale-[1.03] z-10"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-800 active:scale-95",
              ].join(" ")}
            >
              {isActive && (
                 <span className="absolute -top-1 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white border-2 border-[#ff7a00]"></span>
                 </span>
              )}
              {c.label}
            </button>
          );
        })}
      </div>

      {showRightArrow && (
        <div className="hidden md:flex absolute right-0 top-1/2 z-30 -translate-y-1/2 h-full items-center bg-gradient-to-l from-white via-white/80 to-transparent pl-12 pointer-events-none">
          <button onClick={() => scroll("right")} className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-all hover:border-[#ff7a00] hover:text-[#ff7a00]">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}