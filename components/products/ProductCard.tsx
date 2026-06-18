"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import type { Product } from "@/lib/products/types";
import { CART_MIN_QTY, FALLBACK_UNIT_PRICE } from "@/components/cart/CartContext";

// --- RENK EŞLEŞTİRME YARDIMCILARI ---
const STANDARD_COLORS = [
  { id: 'black', hex: '#111111' },
  { id: 'white', hex: '#FFFFFF' },
  { id: 'grey', hex: '#808080' },
  { id: 'red', hex: '#FF0000' },
  { id: 'blue', hex: '#0000FF' },
  { id: 'green', hex: '#008000' },
  { id: 'yellow', hex: '#FFFF00' },
  { id: 'orange', hex: '#FFA500' },
  { id: 'purple', hex: '#800080' },
  { id: 'pink', hex: '#FFC0CB' },
];

function getClosestStandardColorId(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return 'black';
  const r = parseInt(result[1], 16), g = parseInt(result[2], 16), b = parseInt(result[3], 16);
  
  let minDistance = Infinity;
  let closestId = 'black';

  for (const std of STANDARD_COLORS) {
    const stdRgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(std.hex)!;
    const distance = Math.sqrt(
      Math.pow(r - parseInt(stdRgb[1], 16), 2) + 
      Math.pow(g - parseInt(stdRgb[2], 16), 2) + 
      Math.pow(b - parseInt(stdRgb[3], 16), 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestId = std.id;
    }
  }
  return closestId;
}

function resolveThumbSrc(product: any) {
  const raw =
    (typeof product?.imageUrl === "string" && product.imageUrl.trim() && product.imageUrl) ||
    (typeof product?.image === "string" && product.image.trim() && product.image);

  return raw || "/products/placeholder.png";
}

type Props = {
  product: Product;
  onOpen: () => void;
  isOpen?: boolean;
  qtyText?: string;
  setQtyText?: (v: string) => void;
  selectedColors?: string[]; 
};

export function ProductCard({ product, onOpen, isOpen, selectedColors = [] }: Props) {
  
  const displayImageSrc = useMemo(() => {
    const prodAny = product as any;

    if (selectedColors.length > 0 && prodAny.variants && Array.isArray(prodAny.variants)) {
      const matchingVariant = prodAny.variants.find((v: any) => {
        if (!v.ColorCode || !v.VariantImage?.url) return false;
        const stdColorId = getClosestStandardColorId(v.ColorCode);
        return selectedColors.includes(stdColorId);
      });

      if (matchingVariant) {
        return matchingVariant.VariantImage.url;
      }
    }
    
    return resolveThumbSrc(prodAny);
  }, [product, selectedColors]);

  const unitPrice = useMemo(() => {
    const p = (product as any).wholesalePrice;
    return typeof p === "number" ? p : FALLBACK_UNIT_PRICE;
  }, [product]);

  const priceText = useMemo(() => {
    return product.wholesalePriceText ?? `${unitPrice} TL/adet`;
  }, [product.wholesalePriceText, unitPrice]);

  // 🛠️ DÜZELTME: Artık eski minQtyText yerine doğrudan Strapi'den gelen sayısal minQty değerini okuyoruz
  const minQtyValue = useMemo(() => {
    const mq = (product as any).minQty;
    return mq !== undefined && mq !== null ? String(mq) : `${CART_MIN_QTY}`;
  }, [product]);

  const tag = useMemo(() => {
    const t = (product as any)?.badge ?? (product as any)?.tag ?? (product as any)?.categoryTitle;
    return typeof t === "string" && t.trim() ? t.trim() : "";
  }, [product]);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={[
        "group w-full text-left flex flex-col",
        "overflow-hidden rounded-2xl border bg-white shadow-sm",
        "transition hover:shadow-md",
        isOpen ? "border-[#7C3AED] ring-2 ring-[#7C3AED]/20" : "border-slate-200",
      ].join(" ")}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-white border-b border-slate-100">
        <Image
          src={displayImageSrc}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          className="object-contain transition-opacity duration-300" 
        />

        {tag ? (
          <div className="absolute left-3 top-3 z-10">
            <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-sm">
              {tag}
            </span>
          </div>
        ) : null}
      </div>

      <div className="p-4 flex flex-col flex-grow justify-between">
        <div className="text-[14px] font-semibold leading-snug text-slate-900 line-clamp-2">
          {product.title}
        </div>

        <div>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div className="text-[13px] font-semibold text-slate-900">{priceText}</div>
            <div className="text-[11px] text-slate-500">
              {/* 🛠️ DÜZELTME: Değişken minQtyValue olarak güncellendi */}
              Min. <span className="font-semibold text-slate-700">{minQtyValue}</span>
            </div>
          </div>

          <div className="mt-3 text-[12px] font-medium text-[#ff7a00] opacity-90 transition-all group-hover:opacity-100 group-hover:text-[#e66e00]">
            Detayları görüntüle →
          </div>
        </div>
      </div>
    </button>
  );
}
