"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import type { Product } from "@/lib/products/types";
import { CART_MIN_QTY, FALLBACK_UNIT_PRICE } from "@/components/cart/CartContext";

function resolveThumbSrc(product: any) {
  const raw =
    (typeof product?.imageUrl === "string" && product.imageUrl.trim() && product.imageUrl) ||
    (typeof product?.image === "string" && product.image.trim() && product.image);

  if (!raw) return "/products/placeholder.png";

  // ✅ Supabase değilse dokunma
  if (!raw.includes("/storage/v1/object/public/media/")) return raw;

  // ✅ Eğer zaten webp/avif ise: thumbs'a yönlendirme (thumb üretilmemiş olabilir)
  if (/\.(webp|avif)$/i.test(raw)) return raw;

  // ✅ jpg/jpeg/png ise: thumbs webp kullan
  return raw
    .replace("/media/", "/media/thumbs/")
    .replace(/\.(jpg|jpeg|png)$/i, ".webp");
}

type Props = {
  product: Product;
  onOpen: () => void;
  isOpen?: boolean;

  // ✅ ProductListWithExpand'ten geliyor — tasarımı bozmadan destekleyelim
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
    // Strapi’den hazır text varsa onu kullan, yoksa sayıya dön
    return product.wholesalePriceText ?? `${unitPrice} TL/adet`;
  }, [product.wholesalePriceText, unitPrice]);

  const minQtyText = useMemo(() => {
    return product.minQtyText ?? `${CART_MIN_QTY}`;
  }, [product.minQtyText]);

  // küçük üst etiket (varsa)
  const tag = useMemo(() => {
    const t = (product as any)?.badge ?? (product as any)?.tag ?? (product as any)?.categoryTitle;
    return typeof t === "string" && t.trim() ? t.trim() : "";
  }, [product]);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={[
        "group w-full text-left",
        "overflow-hidden rounded-2xl border bg-white shadow-sm",
        "transition hover:shadow-md",
        // Kart açıldığında/seçildiğinde mor kenarlık
        isOpen ? "border-[#7C3AED] ring-2 ring-[#7C3AED]/20" : "border-slate-200",
      ].join(" ")}
    >
      {/* Görsel */}
      <div className="relative aspect-[1/1] w-full overflow-hidden bg-slate-100">
        <Image
          src={imgSrc}
          alt={product.title}
          width={800}
          height={800}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          className="h-full w-full object-contain bg-slate-100"
        />

        {/* küçük etiket */}
        {tag ? (
          <div className="absolute left-3 top-3">
            <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-sm">
              {tag}
            </span>
          </div>
        ) : null}
      </div>

      {/* Metin alanı */}
      <div className="p-4">
        <div className="text-[14px] font-semibold leading-snug text-slate-900 line-clamp-2">
          {product.title}
        </div>

        <div className="mt-2 flex items-end justify-between gap-3">
          <div className="text-[13px] font-semibold text-slate-900">{priceText}</div>

          <div className="text-[11px] text-slate-500">
            Min. <span className="font-semibold text-slate-700">{minQtyText}</span>
          </div>
        </div>

        {/* İncele ipucu - Turuncu Renk */}
        <div className="mt-3 text-[12px] font-medium text-[#ff7a00] opacity-90 transition-all group-hover:opacity-100 group-hover:text-[#e66e00]">
          Detayları görüntüle →
        </div>
      </div>
    </button>
  );
}