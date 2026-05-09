"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CategoryTabs } from "@/components/products/CategoryTabs";
import { ProductGrid } from "@/components/products/ProductGrid";
import CatalogPagination from "@/components/products/CatalogPagination";
import { CartFab } from "@/components/cart/CartIndicator";
import { CART_MIN_QTY } from "@/components/cart/CartContext";

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

  const [active, setActive] = useState<string>(defaultCat);
  const [qtyById, setQtyById] = useState<Record<string, string>>({});

  const pageFromUrl = useMemo(() => {
    const raw = sp?.get("page") ?? "1";
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
  }, [sp]);

  const [page, setPage] = useState<number>(pageFromUrl);

  useEffect(() => {
    setPage(pageFromUrl);
  }, [pageFromUrl]);

  const filteredAll = useMemo(() => {
    if (active === "featured") return smartSort(products);
    return products.filter((p) => p.category === active);
  }, [active, products]);

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
  const setQtyText = (id: any, v: string) =>
    setQtyById((prev) => ({ ...prev, [String(id)]: v }));

  function changePage(nextPage: number) {
    const safe = Math.min(Math.max(1, nextPage), pageCount);
    const next = new URLSearchParams(sp?.toString() ?? "");
    if (safe <= 1) next.delete("page");
    else next.set("page", String(safe));
    router.push(`${pathname}?${next.toString()}`, { scroll: true });
    setPage(safe);
  }

  function changeCategory(nextCat: string) {
    setActive(nextCat);
    const next = new URLSearchParams(sp?.toString() ?? "");
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`, { scroll: true });
    setPage(1);
  }

  return (
    <>
      {/* Fazladan genişlik sınırlamalarını kaldırıp akışı serbest bıraktık */}
      <CategoryTabs
        categories={categories}
        active={active}
        onChange={changeCategory}
      />

      <div className="mt-4"> {/* mt-6'dan mt-4'e düşürerek gridi yaklaştırdık */}
        <ProductGrid
          products={paged}
          qtyTextById={qtyById}
          getQtyText={getQtyText}
          onQtyTextChange={setQtyText}
        />
      </div>

      <div className="mt-12 flex justify-center">
        <CatalogPagination
          page={page}
          pageCount={pageCount}
          onChange={changePage}
        />
      </div>

      <CartFab />
    </>
  );
}