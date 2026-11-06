"use client";

import React from "react";
import type { Product } from "@/lib/products/types";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton";
import { CART_MIN_QTY } from "@/components/cart/CartContext";

// YENİ: TypeScript hatasını çözmek için 'selectedColors' prop'unu ekledik
type Props = {
  products: Product[];
  qtyTextById: Record<string, string>;
  getQtyText: (id: string) => string;
  onQtyTextChange: (id: string, v: string) => void;
  selectedColors?: string[]; 
};

export function ProductGrid({
  products,
  qtyTextById,
  getQtyText,
  onQtyTextChange,
  selectedColors = [], // Varsayılan değer atadık
}: Props) {
  if (!products || products.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => {
        const pid = String(p.id);
        const qtyText =
          qtyTextById[pid] ?? getQtyText(pid) ?? String(CART_MIN_QTY);

        return (
          <ProductCard
            key={pid}
            product={p}
            isOpen={false}
            selectedColors={selectedColors} // YENİ: Renk bilgisini karta aktardık
            qtyText={qtyText}
            setQtyText={(v: string) => onQtyTextChange(pid, v)}
          />
        );
      })}
    </div>
  );
}
