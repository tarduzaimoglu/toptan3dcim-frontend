"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/products/ProductGrid";
import CatalogPagination from "@/components/products/CatalogPagination";
import { CartFab } from "@/components/cart/CartIndicator";
import { CART_MIN_QTY } from "@/components/cart/CartContext";
import ProductFilter from "@/components/products/ProductFilter";

type Product = any;
type Category = { key: string; label: string };

const PAGE_SIZE = 20;

// AKILLI RENK GRUPLAMA (ANA RENKLER)
const STANDARD_COLORS = [
  { id: 'black', label: 'Siyah', hex: '#111111' },
  { id: 'white', label: 'Beyaz', hex: '#FFFFFF' },
  { id: 'grey', label: 'Gri', hex: '#808080' },
  { id: 'red', label: 'Kırmızı', hex: '#FF0000' },
  { id: 'blue', label: 'Mavi', hex: '#0000FF' },
  { id: 'green', label: 'Yeşil', hex: '#008000' },
  { id: 'yellow', label: 'Sarı', hex: '#FFFF00' },
  { id: 'orange', label: 'Turuncu', hex: '#FFA500' },
  { id: 'purple', label: 'Mor', hex: '#800080' },
  { id: 'pink', label: 'Pembe', hex: '#FFC0CB' },
];

// HEX Kodunu RGB'ye çevirip en yakın Ana Rengi bulur
export function getClosestStandardColor(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return STANDARD_COLORS[0];
  const r = parseInt(result[1], 16), g = parseInt(result[2], 16), b = parseInt(result[3], 16);
  
  let minDistance = Infinity;
  let closest = STANDARD_COLORS[0];

  for (const std of STANDARD_COLORS) {
    const stdRgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(std.hex)!;
    const distance = Math.sqrt(
      Math.pow(r - parseInt(stdRgb[1], 16), 2) + 
      Math.pow(g - parseInt(stdRgb[2], 16), 2) + 
      Math.pow(b - parseInt(stdRgb[3], 16), 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closest = std;
    }
  }
  return closest;
}

export default function ProductsClient({ products, categories }: { products: Product[]; categories: Category[]; }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  
  // YÜKLENİYOR DURUMU İÇİN (Performans İyileştirmesi)
  const [isPending, startTransition] = useTransition();

  const [qtyById, setQtyById] = useState<Record<string, string>>({});

  // URL'den Filtre Parametrelerini Oku
  const activeCategory = sp?.get("category") || "all";
  const colorsParam = sp?.get("colors");
  const selectedColors = useMemo(() => colorsParam ? colorsParam.split(",") : [], [colorsParam]);
  const pageFromUrl = useMemo(() => Number(sp?.get("page") ?? "1"), [sp]);
  const [page, setPage] = useState<number>(pageFromUrl);

  // Müşterinin ürünlerinden Ana Renkleri çıkart
  const availableColors = useMemo(() => {
    const usedStandardColorIds = new Set<string>();
    products.forEach((p) => {
      if (p.variants && Array.isArray(p.variants)) {
        p.variants.forEach((v: any) => {
          if (v.ColorCode) {
            const standardColor = getClosestStandardColor(v.ColorCode);
            usedStandardColorIds.add(standardColor.id);
          }
        });
      }
    });
    return STANDARD_COLORS.filter(color => usedStandardColorIds.has(color.id));
  }, [products]);

  // Filtreleme Mantığı
  const filteredAll = useMemo(() => {
    let result = products;

    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (selectedColors.length > 0) {
      result = result.filter((p) => {
        if (!p.variants || !Array.isArray(p.variants)) return false;
        return p.variants.some((v: any) => {
          const stdColor = getClosestStandardColor(v.ColorCode);
          return selectedColors.includes(stdColor.id);
        });
      });
    }

    // Tarihe göre sırala
    return [...result].sort((a, b) => new Date(b.createdAtISO || 0).getTime() - new Date(a.createdAtISO || 0).getTime());
  }, [activeCategory, selectedColors, products]);

  const pageCount = Math.max(1, Math.ceil(filteredAll.length / PAGE_SIZE));
  const paged = filteredAll.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function changePage(nextPage: number) {
    startTransition(() => {
      const next = new URLSearchParams(sp?.toString() ?? "");
      next.set("page", String(nextPage));
      router.push(`${pathname}?${next.toString()}`, { scroll: true });
    });
  }

  function handleCategoryChange(catKey: string) {
    startTransition(() => {
      const next = new URLSearchParams(sp?.toString() ?? "");
      if (catKey === "all") next.delete("category");
      else next.set("category", catKey);
      next.delete("page");
      router.push(`${pathname}?${next.toString()}`, { scroll: true });
    });
  }

  function handleColorToggle(colorId: string) {
    startTransition(() => {
      const next = new URLSearchParams(sp?.toString() ?? "");
      let updatedColors = [...selectedColors];
      if (updatedColors.includes(colorId)) updatedColors = updatedColors.filter(c => c !== colorId);
      else updatedColors.push(colorId);

      if (updatedColors.length > 0) next.set("colors", updatedColors.join(","));
      else next.delete("colors");
      
      next.delete("page");
      router.push(`${pathname}?${next.toString()}`, { scroll: true });
    });
  }

  return (
    <div className="container mx-auto px-4 mt-6 max-w-[1400px]">
      <div className="flex flex-col lg:flex-row relative gap-4 lg:gap-8">
        
        {/* Filtreye isPending gönderiyoruz */}
        <ProductFilter 
          categories={categories} 
          availableColors={availableColors}
          selectedCategory={activeCategory}
          selectedColors={selectedColors}
          onCategoryChange={handleCategoryChange}
          onColorToggle={handleColorToggle}
          isLoading={isPending}
        />
        
        <div className="w-full lg:w-3/4 lg:flex-1 flex flex-col min-h-[50vh] relative">
          
          {/* YÜKLENİYOR OVERLAY EFEKTİ */}
          {isPending && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-start justify-center pt-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF5733]"></div>
            </div>
          )}

          {filteredAll.length === 0 ? (
             <div className="flex items-center justify-center h-64 text-gray-500">Bu filtrelere uygun ürün bulunamadı.</div>
          ) : (
            // Seçili rengi ProductGrid'e gönderiyoruz (Görsel değişimi için)
            <ProductGrid
              products={paged}
              selectedColors={selectedColors} // YENİ EKLENDİ
              qtyTextById={qtyById}
              getQtyText={(id: any) => qtyById[String(id)] ?? String(CART_MIN_QTY)}
              onQtyTextChange={(id: any, v: string) => setQtyById((prev) => ({ ...prev, [String(id)]: v }))}
            />
          )}

          <div className="mt-12 mb-24 lg:mb-8 flex justify-center">
            <CatalogPagination page={page} pageCount={pageCount} onChange={changePage} />
          </div>
        </div>
      </div>
      <CartFab />
    </div>
  );
}
