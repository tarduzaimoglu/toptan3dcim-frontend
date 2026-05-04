"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation"; // ✅ URL parametresini okumak için ekledik
import type { Product } from "@/lib/products/types";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductExpandPanel } from "@/components/products/ProductExpandPanel";
import { CART_MIN_QTY } from "@/components/cart/CartContext";

export function ProductGrid({
  products,
  qtyTextById,
  getQtyText,
  onQtyTextChange,
}: {
  products: Product[];
  qtyTextById: Record<string, string>;
  getQtyText: (id: string) => string;
  onQtyTextChange: (id: string, v: string) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams(); // ✅ URL'deki parametreleri alır

  // ✅ Ana sayfadan gelen 'open' parametresini kontrol et
  useEffect(() => {
    const openParam = searchParams.get("open");
    if (openParam) {
      setOpenId(openParam);
    }
  }, [searchParams]);

  const openIndex = useMemo(() => {
    if (!openId) return -1;
    return products.findIndex((p) => String(p.id) === String(openId));
  }, [openId, products]);

  useEffect(() => {
    if (openId && openRef.current) {
      openRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [openId, openIndex]);

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => {
        const pid = String(p.id);
        const isOpen = pid === String(openId);
        const qtyText =
          qtyTextById[pid] ?? getQtyText(pid) ?? String(CART_MIN_QTY);

        if (isOpen) {
          return (
            <div
              key={pid}
              ref={openRef}
              className="col-span-2 sm:col-span-3 lg:col-span-4 scroll-mt-28"
            >
              <ProductExpandPanel product={p} onClose={() => setOpenId(null)} />
            </div>
          );
        }

        return (
          <ProductCard
            key={pid}
            product={p}
            isOpen={false}
            onOpen={() => setOpenId((prev) => (prev === pid ? null : pid))}
            qtyText={qtyText}
            setQtyText={(v: string) => onQtyTextChange(pid, v)}
          />
        );
      })}
    </div>
  );
}