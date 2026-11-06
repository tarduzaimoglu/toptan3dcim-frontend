"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/products/ProductGrid";
import CatalogPagination from "@/components/products/CatalogPagination";
import { CART_MIN_QTY } from "@/components/cart/CartContext";
import ProductFilter from "@/components/products/ProductFilter";
import { STANDARD_COLORS, getClosestStandardColor } from "@/lib/products/colors";

// ProductExpandPanel yolunu kendi projene göre ayarla:
import { catalogReturn } from "@/lib/products/navigation";

type Product = any;
type Category = { key: string; label: string };

const PAGE_SIZE = 20;

export default function ProductsClient({ products, categories }: { products: Product[]; categories: Category[]; }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const router = useRouter();

  const initialSearch = sp?.get("q") || "";
  const initialCats = useMemo(() => sp?.get("cats") ? sp!.get("cats")!.split(",") : [], [sp]);
  const initialColors = useMemo(() => sp?.get("colors") ? sp!.get("colors")!.split(",") : [], [sp]);
  const initialSort = sp?.get("sort") || "newest";
  const initialPage = Math.max(1, Math.floor(Number(sp?.get("page")) || 1));


  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCats);
  const [selectedColors, setSelectedColors] = useState<string[]>(initialColors);
  const [sortOption, setSortOption] = useState(initialSort);
  const [page, setPage] = useState<number>(initialPage);
  const [qtyById, setQtyById] = useState<Record<string, string>>({});



  useEffect(() => {
    setSelectedCategories(sp?.get("cats") ? sp!.get("cats")!.split(",") : []);
    setSelectedColors(sp?.get("colors") ? sp!.get("colors")!.split(",") : []);
    setSortOption(sp?.get("sort") || "newest");
    setPage(Math.max(1, Math.floor(Number(sp?.get("page")) || 1)));
    setSearchQuery(sp?.get("q") || "");
  }, [sp]);

  useEffect(() => {
    const key = `catalog-scroll:${catalogReturn(`/products?${sp}`)}`;
    let frame = 0;
    try {
      const y = Number(sessionStorage.getItem(key));
      if (y > 0) frame = requestAnimationFrame(() => window.scrollTo(0, y));
    } catch {}
    return () => cancelAnimationFrame(frame);
  }, [sp]);

  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const next = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) next.delete(key);
      else next.set(key, value);
    });
    const newUrl = next.toString() ? `${pathname}?${next.toString()}` : pathname;
    router.push(newUrl, { scroll: false });
  }, [pathname, router]);

  const availableColors = useMemo(() => {
    const usedStandardColorIds = new Set<string>();
    if (!products) return [];
    products.forEach((p) => {
      if (p.variants && Array.isArray(p.variants)) {
        p.variants.forEach((v: any) => {
          if (v.ColorCode) usedStandardColorIds.add(getClosestStandardColor(v.ColorCode).id);
        });
      }
    });
    return STANDARD_COLORS.filter(color => usedStandardColorIds.has(color.id));
  }, [products]);

  const filteredAll = useMemo(() => {
    let result = products || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        String(p.title || "").toLowerCase().includes(q) ||
        String(p.description || "").toLowerCase().includes(q)
      );
    }
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }
    if (selectedColors.length > 0) {
      result = result.filter((p) => {
        const hasNoColors = !p.variants || !Array.isArray(p.variants) || p.variants.length === 0;
        if (hasNoColors) return true;

        return p.variants.some((v: any) => {
          if (!v.ColorCode) return false;
          return selectedColors.includes(getClosestStandardColor(v.ColorCode).id);
        });
      });
    }
    return [...result].sort((a, b) => {
      const priceA = Number(a.wholesalePrice) || 0;
      const priceB = Number(b.wholesalePrice) || 0;
      const minQtyA = parseInt(a.minQty || a.minQtyText) || 1;
      const minQtyB = parseInt(b.minQty || b.minQtyText) || 1;
      const dateA = new Date(a.createdAtISO || 0).getTime();
      const dateB = new Date(b.createdAtISO || 0).getTime();

      switch (sortOption) {
        case "price_asc": return priceA - priceB;
        case "price_desc": return priceB - priceA;
        case "minqty_asc": return minQtyA - minQtyB;
        case "minqty_desc": return minQtyB - minQtyA;
        default: return dateB - dateA;
      }
    });
  }, [searchQuery, selectedCategories, selectedColors, sortOption, products]);

  const pageCount = Math.max(1, Math.ceil(filteredAll.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filteredAll.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function changePage(nextPage: number) {
    setPage(nextPage);
    updateUrl({ page: String(nextPage) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const handleSearchSubmit = useCallback((query: string) => {
    updateUrl({ q: query || null, page: null });
  }, [updateUrl]);

  function handleSortChange(sort: string) {
    setSortOption(sort);
    setPage(1);
    updateUrl({ sort: sort === "newest" ? null : sort, page: null });
  }

  function handleCategoryToggle(catKey: string) {
    let updated = [...selectedCategories];
    if (updated.includes(catKey)) updated = updated.filter(c => c !== catKey);
    else updated.push(catKey);

    setSelectedCategories(updated);
    setPage(1);
    updateUrl({ cats: updated.length > 0 ? updated.join(",") : null, page: null });
  }

  function handleColorToggle(colorId: string) {
    let updated = [...selectedColors];
    if (updated.includes(colorId)) updated = updated.filter(c => c !== colorId);
    else updated.push(colorId);

    setSelectedColors(updated);
    setPage(1);
    updateUrl({ colors: updated.length > 0 ? updated.join(",") : null, page: null });
  }

  function clearAllFilters() {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedColors([]);
    setSortOption("newest");
    setPage(1);
    updateUrl({ q: null, cats: null, colors: null, sort: null, page: null });
  }

  return (
    <div className="container mx-auto px-4 mt-4 max-w-[1400px]">
      <div className="flex flex-col lg:flex-row relative gap-4 lg:gap-8">

        <ProductFilter
          categories={categories}
          availableColors={availableColors}
          selectedCategories={selectedCategories}
          selectedColors={selectedColors}
          searchQuery={searchQuery}
          sortOption={sortOption}
          allProducts={products}
          onCategoryToggle={handleCategoryToggle}
          onColorToggle={handleColorToggle}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          onSortChange={handleSortChange}
          onClearAll={clearAllFilters}
        />

        <div className="w-full lg:w-3/4 lg:flex-1 flex flex-col min-h-[50vh] relative pt-2 lg:pt-0">

          <div className="lg:hidden mb-4 text-sm text-gray-500 font-medium px-1">
            {filteredAll.length} ürün listeleniyor
          </div>

          {filteredAll.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-gray-500 font-medium text-lg mb-4">Aradığınız kriterlere uygun ürün bulunamadı.</p>
              <button onClick={clearAllFilters} className="px-6 py-2 bg-[#FF5733] text-white rounded-full font-medium hover:bg-[#e64a2e] transition-colors">
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <ProductGrid
              products={paged}
              selectedColors={selectedColors}
              qtyTextById={qtyById}
              getQtyText={(id: any) => qtyById[String(id)] ?? String(CART_MIN_QTY)}
              onQtyTextChange={(id: any, v: string) => setQtyById((prev) => ({ ...prev, [String(id)]: v }))}
            />
          )}

          <div className="mt-12 mb-28 lg:mb-8 flex justify-center">
            <CatalogPagination page={currentPage} pageCount={pageCount} onChange={changePage} />
          </div>
        </div>
      </div>

      {/* ✅ <CartFab /> buradan tamamen kaldırıldı.
        Artık ekranda yüzen sepet butonu çıkmayacak.
      */}

    </div>
  );
}
