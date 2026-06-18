"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/products/ProductGrid";
import CatalogPagination from "@/components/products/CatalogPagination";
import { CartFab } from "@/components/cart/CartIndicator";
import { ProductExpandPanel } from "@/components/products/ProductExpandPanel";
import ProductFilter from "@/components/products/ProductFilter";

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
  const initialPage = Number(sp?.get("page") ?? "1");
  const openId = sp?.get("open");

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCats);
  const [selectedColors, setSelectedColors] = useState<string[]>(initialColors);
  const [sortOption, setSortOption] = useState(initialSort);
  const [page, setPage] = useState<number>(initialPage);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (openId && products) {
      const found = products.find((p: any) => String(p.id) === String(openId));
      if (found) setSelectedProduct(found);
    }
  }, [openId, products]);

  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const next = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) next.delete(key);
      else next.set(key, value);
    });
    router.replace(next.toString() ? `${pathname}?${next.toString()}` : pathname, { scroll: false });
  }, [pathname, router]);

  // Renk paleti hesaplama
  const availableColors = useMemo(() => {
    // getClosestStandardColor fonksiyonun burada veya dışarıda tanımlı olmalı
    return []; // Örn: Standard renk listeni buraya bağla
  }, [products]);

  const filteredAll = useMemo(() => {
    let result = products || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => String(p.title || "").toLowerCase().includes(q));
    }
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }
    return [...result].sort((a, b) => {
      const priceA = Number(a.wholesalePrice) || 0;
      const priceB = Number(b.wholesalePrice) || 0;
      return sortOption === "price_asc" ? priceA - priceB : sortOption === "price_desc" ? priceB - priceA : 0;
    });
  }, [searchQuery, selectedCategories, sortOption, products]);

  return (
    <div className="container mx-auto px-4 mt-4 max-w-[1400px]">
      <div className="flex flex-col lg:flex-row relative gap-4 lg:gap-8">
        
        <ProductFilter 
          categories={categories} 
          allProducts={products}
          availableColors={availableColors}
          selectedCategories={selectedCategories}
          selectedColors={selectedColors}
          searchQuery={searchQuery}
          sortOption={sortOption}
          onCategoryToggle={(key) => {
             const updated = selectedCategories.includes(key) ? selectedCategories.filter(c => c !== key) : [...selectedCategories, key];
             setSelectedCategories(updated);
             updateUrl({ cats: updated.join(",") });
          }}
          onColorToggle={(colorId) => {
             const updated = selectedColors.includes(colorId) ? selectedColors.filter(c => c !== colorId) : [...selectedColors, colorId];
             setSelectedColors(updated);
             updateUrl({ colors: updated.join(",") });
          }}
          onSearchChange={setSearchQuery}
          onSearchSubmit={(q) => updateUrl({ q: q || null })}
          onSortChange={(s) => { setSortOption(s); updateUrl({ sort: s }); }}
          onClearAll={() => { setSelectedCategories([]); setSelectedColors([]); updateUrl({ cats: null, colors: null, q: null }); }}
        />
        
        <div className="w-full lg:w-3/4">
          <ProductGrid
            products={filteredAll.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
            onProductClick={(p: Product) => {
              setSelectedProduct(p);
              router.push(`?open=${p.id}`, { scroll: false });
            }}
          />
          <CatalogPagination 
            page={page} 
            pageCount={Math.max(1, Math.ceil(filteredAll.length / PAGE_SIZE))} 
            onChange={(p) => { setPage(p); updateUrl({ page: String(p) }); }} 
          />
        </div>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <ProductExpandPanel 
            product={selectedProduct} 
            onClose={() => { setSelectedProduct(null); router.replace(pathname, { scroll: false }); }} 
          />
        </div>
      )}
      <CartFab />
    </div>
  );
}
