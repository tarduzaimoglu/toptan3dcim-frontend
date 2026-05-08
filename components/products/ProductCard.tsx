"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import type { Product } from "@/lib/products/types";
import { CART_MIN_QTY, FALLBACK_UNIT_PRICE } from "@/components/cart/CartContext";

// Eski Supabase karmaşasını temizledik. Sadece temiz URL'i alıyoruz.
// Next.js <Image> bileşeni bunu otomatik olarak WebP yapıp optimize edecek!
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
};

export function ProductCard({ product, onOpen, isOpen }: Props) {
  const imgSrc = resolveThumbSrc(product as any);

  const unitPrice = useMemo(() => {
    const p = (product as any).wholesalePrice;
    return typeof p === "number" ? p : FALLBACK_UNIT_PRICE;
  }, [product]);

  const priceText = useMemo(() => {
    return product.wholesalePriceText ?? `${unitPrice} TL/adet`;
  }, [product.wholesalePriceText, unitPrice]);

  const minQtyText = useMemo(() => {
    return product.minQtyText ?? `${CART_MIN_QTY}`;
  }, [product.minQtyText]);

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
      {/* YENİ: aspect-[3/4] yaparak 3000x4000px görsellerinin 
        tam olarak buraya oturmasını sağladık. Kenarlarda boşluk kalmayacak.
      */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-50">
        <Image
          src={imgSrc}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          className="object-contain p-2 mix-blend-multiply"
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
              Min. <span className="font-semibold text-slate-700">{minQtyText}</span>
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