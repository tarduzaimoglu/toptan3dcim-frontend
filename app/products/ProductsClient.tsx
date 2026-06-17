"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/products/ProductGrid";
import CatalogPagination from "@/components/products/CatalogPagination";
import { CartFab } from "@/components/cart/CartIndicator";
import { CART_MIN_QTY } from "@/components/cart/CartContext";
import ProductFilter from "@/components/products/ProductFilter";

type Product = any;
type Category = { key: string; label: string };

const PAGE_SIZE = 20;

function smartSort(items: Product[]) {
  return [...items].sort((a, b) => {
    const af = a.featured ? 1 : 0;
    const bf = b.featured ? 1 : 0;
    if (bf !== af) return bf - af;
    return (
      new Date(b.createdAtISO || 0).getTime() -
      new Date(a.createdAtISO || 0).getTime()
    );
  });
}

export default function ProductsClient({
  defaultCat = "featured",
  products,
  categories,
}: {
  defaultCat?: string;
  products: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [qtyById, setQtyById] = useState<Record<string, string>>({});

  // --- URL'den Filtre Parametrelerini Oku ---
  const activeCategory = sp?.get("category") || defaultCat;
  
  // URL'de renkler virgülle ayrılmış olabilir: ?colors=#E31B12,#000000
  const colorsParam = sp?.get("colors");
  const selectedColors = useMemo(() => {
    return colorsParam ? colorsParam.split(",") : [];
  }, [colorsParam]);

  const pageFromUrl = useMemo(() => {
    const raw = sp?.get("page") ?? "1";
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
  }, [sp]);

  const [page, setPage] = useState<number>(pageFromUrl);

  useEffect(() => {
    setPage(pageFromUrl);
  }, [pageFromUrl]);

  // --- STRAPI'DEN BENZERSİZ RENKLERİ ÇIKART ---
  const availableColors = useMemo(() => {
    const colorMap = new Map<string, string>(); // HEX -> İsim eşleşmesi

    products.forEach((p) => {
      // Strapi yapısındaki p.variants kontrolü
      if (p.variants && Array.isArray(p.variants)) {
        p.variants.forEach((v: any) => {
          if (v.ColorCode && v.ColorName) {
            colorMap.set(v.ColorCode, v.ColorName);
          }
        });
      }
    });

    // Map'i [{ code: '#E31B12', name: 'Kırmızı' }, ...] formatına çevir
    return Array.from(colorMap.entries()).map(([code, name]) => ({ code, name }));
  }, [products]);

  // --- FİLTRELEME MANTIĞI ---
  const filteredAll = useMemo(() => {
    let result = products;

    // 1. Kategori Filtresi
    if (activeCategory && activeCategory !== "featured") {
      // Not: Strapi'deki kategori alanınız p.category (string) veya p.category_product?.slug (object) olabilir.
      // Mevcut kodunuzda `p.category === active` olduğu için bunu koruduk. Gerekirse p.category_product.slug yapabilirsiniz.
      result = result.filter((p) => p.category === activeCategory);
    }

    // 2. Renk Filtresi
    if (selectedColors.length > 0) {
      result = result.filter((p) => {
        if (!p.variants || !Array.isArray(p.variants)) return false;
        // Seçili renklerden en az biri, bu ürünün varyantları içinde var mı?
        return p.variants.some((v: any) => selectedColors.includes(v.ColorCode));
      });
    }

    return smartSort(result);
  }, [activeCategory, selectedColors, products]);

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(filteredAll.length / PAGE_SIZE));
  }, [filteredAll.length]);

  useEffect(() => {
    if (page > pageCount) changePage(pageCount);
  }, [pageCount]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAll.slice(start, start + PAGE_SIZE);
  }, [filteredAll, page]);

  const getQtyText = (id: any) => qtyById[String(id)] ?? String(CART_MIN_QTY);
  const setQtyText = (id: any, v: string) => setQtyById((prev) => ({ ...prev, [String(id)]: v }));

  // --- FİLTRE AKSİYONLARI ---
  function changePage(nextPage: number) {
    const safe = Math.min(Math.max(1, nextPage), pageCount);
    const next = new URLSearchParams(sp?.toString() ?? "");
    if (safe <= 1) next.delete("page");
    else next.set("page", String(safe));
    router.push(`${pathname}?${next.toString()}`, { scroll: true });
    setPage(safe);
  }

  function handleCategoryChange(catKey: string) {
    const next = new URLSearchParams(sp?.toString() ?? "");
    if (catKey === "featured") {
      next.delete("category");
    } else {
      next.set("category", catKey);
    }
    next.delete("page"); // Filtre değişince 1. sayfaya dön
    router.push(`${pathname}?${next.toString()}`, { scroll: true });
  }

  function handleColorToggle(colorCode: string) {
    const next = new URLSearchParams(sp?.toString() ?? "");
    let updatedColors = [...selectedColors];

    if (updatedColors.includes(colorCode)) {
      updatedColors = updatedColors.filter(c => c !== colorCode); // Varsa çıkar
    } else {
      updatedColors.push(colorCode); // Yoksa ekle
    }

    if (updatedColors.length > 0) {
      next.set("colors", updatedColors.join(","));
    } else {
      next.delete("colors");
    }

    next.delete("page"); // Filtre değişince 1. sayfaya dön
    router.push(`${pathname}?${next.toString()}`, { scroll: true });
  }

  return (
    <div className="container mx-auto px-4 mt-6 max-w-[1400px]">
      <div className="flex flex-col lg:flex-row relative gap-4 lg:gap-8">
        
        {/* SOL PANEL: FİLTRELER */}
        <ProductFilter 
          categories={categories} 
          availableColors={availableColors}
          selectedCategory={activeCategory}
          selectedColors={selectedColors}
          onCategoryChange={handleCategoryChange}
          onColorToggle={handleColorToggle}
        />
        
        {/* SAĞ PANEL: ÜRÜNLER */}
        <div className="w-full lg:w-3/4 lg:flex-1 flex flex-col min-h-[50vh]">
          {filteredAll.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p className="text-lg">Bu filtrelere uygun ürün bulunamadı.</p>
              <button 
                onClick={() => router.push(pathname)} 
                className="mt-4 text-[#FF5733] hover:underline"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <ProductGrid
              products={paged}
              qtyTextById={qtyById}
              getQtyText={getQtyText}
              onQtyTextChange={setQtyText}
            />
          )}

          <div className="mt-12 mb-24 lg:mb-8 flex justify-center">
            <CatalogPagination
              page={page}
              pageCount={pageCount}
              onChange={changePage}
            />
          </div>
        </div>
      </div>
      <CartFab />
    </div>
  );
}
