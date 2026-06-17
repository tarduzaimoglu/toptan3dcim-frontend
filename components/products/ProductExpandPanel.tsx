"use client";

import React, { useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/products/types";
import { useCart, CART_MIN_QTY, FALLBACK_UNIT_PRICE } from "@/components/cart/CartContext";

// --- YARDIMCI FONKSİYONLAR ---
function whatsappUrlForProduct(title: string) {
  const phone = "905537538182";
  const text = `Merhaba, "${title}" hakkında bilgi almak istiyorum.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function parseDescription(desc: any): string[] {
  if (!desc) return [];
  if (typeof desc === 'string') return desc.split('\n').filter(Boolean);
  if (Array.isArray(desc)) return desc.map(b => b.children?.map((c:any) => c.text).join('')).filter(Boolean);
  return [];
}

export function ProductExpandPanel({ product, onClose }: { product: Product; onClose: () => void; }) {
  const { addItem } = useCart();
  const p = product as any;
  const [selectedVariant, setSelectedVariant] = useState<any>(p.variants?.[0] || null);
  const [qtyStr, setQtyStr] = useState<string>(String(p.minQty || CART_MIN_QTY));
  
  const unitPrice = p.wholesalePrice ?? FALLBACK_UNIT_PRICE;
  const minQty = Number(p.minQty || p.minQtyText || CART_MIN_QTY);
  const images = p.imageUrls?.length ? p.imageUrls : [p.imageUrl || p.image || "/products/placeholder.png"];
  const descriptionParagraphs = useMemo(() => parseDescription(p.description), [p.description]);

  const onAdd = () => {
    const qty = Math.max(minQty, Number(qtyStr) || minQty);
    addItem({
      id: selectedVariant ? `${product.id}-${selectedVariant.ColorName}` : product.id,
      title: `${product.title} ${selectedVariant ? `(${selectedVariant.ColorName})` : ""}`,
      price: unitPrice,
      image: selectedVariant?.VariantImage?.url || images[0],
      qty: qty,
      minQty: minQty,
    });
  };

  return (
    <div className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full mx-auto overflow-hidden">
      {/* Kapatma Butonu */}
      <button onClick={onClose} className="absolute right-4 top-4 z-50 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">✕</button>

      {/* Grid Yapısı (Masaüstü: 2 Sütun) */}
      <div className="flex flex-col md:flex-row h-[85vh] md:h-[600px] overflow-y-auto md:overflow-visible">
        
        {/* SOL: GÖRSEL */}
        <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-6 md:p-12 shrink-0">
          <img src={selectedVariant?.VariantImage?.url || images[0]} className="w-full h-auto max-h-[400px] object-contain" alt={product.title} />
        </div>

        {/* SAĞ: DETAYLAR (Sticky Masaüstü) */}
        <div className="md:w-1/2 flex flex-col p-6 md:p-10 md:overflow-y-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.title}</h2>
          <div className="text-2xl font-black text-[#FF5733] mb-6">{unitPrice} TL <span className="text-sm text-gray-400 font-normal">/ adet</span></div>

          {/* Varyantlar */}
          {p.variants?.length > 0 && (
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">Renk Seçenekleri</label>
              <div className="flex gap-3">
                {p.variants.map((v: any, i: number) => (
                  <button key={i} onClick={() => setSelectedVariant(v)} 
                    className={`w-10 h-10 rounded-full border-2 ${selectedVariant?.ColorName === v.ColorName ? "border-black scale-110" : "border-gray-200"}`} 
                    style={{ backgroundColor: v.ColorCode }} />
                ))}
              </div>
            </div>
          )}

          {/* Açıklama */}
          <div className="prose prose-sm text-gray-600 mb-8">
            {descriptionParagraphs.slice(0, 2).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </div>

      {/* SABİT MOBİL BUTON BAR (Tüm ekranlarda sabit footer) */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-3 z-40">
        <div className="flex items-center border rounded-xl overflow-hidden">
          <button onClick={() => setQtyStr(String(Math.max(minQty, Number(qtyStr)-1)))} className="px-4 py-3 bg-gray-50">-</button>
          <input value={qtyStr} onChange={(e) => setQtyStr(e.target.value.replace(/\D/g, ''))} className="w-16 text-center font-bold" />
          <button onClick={() => setQtyStr(String(Number(qtyStr)+1))} className="px-4 py-3 bg-gray-50">+</button>
        </div>
        <button onClick={onAdd} className="flex-1 bg-[#FF5733] text-white font-bold rounded-xl shadow-lg">Sepete Ekle</button>
        <a href={whatsappUrlForProduct(product.title)} target="_blank" className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl">Bilgi Al</a>
      </div>
    </div>
  );
}
