"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import type { Product } from "@/lib/products/types";
import { useCart, CART_MIN_QTY, FALLBACK_UNIT_PRICE } from "@/components/cart/CartContext";

// --- YARDIMCI FONKSİYONLAR ---
function whatsappUrlForProduct(title: string) {
  const phone = "905537538182";
  const text = `Merhaba, "${title}" hakkında bilgi almak istiyorum.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
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

  // --- STATELER ---
  const [selectedVariant, setSelectedVariant] = useState<any>(p.variants?.[0] || null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [qtyStr, setQtyStr] = useState<string>(String(p.minQty || CART_MIN_QTY));
  const [zoomOn, setZoomOn] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  // --- HIZLANDIRMA: VARYANT ÖN YÜKLEME (0ms tepki için) ---
  useEffect(() => {
    if (p.variants && Array.isArray(p.variants)) {
      p.variants.forEach((v: any) => {
        if (v.VariantImage?.url) {
          const img = new Image();
          img.src = v.VariantImage.url;
        }
      });
    }
  }, [p.variants]);

  // --- VERİLER ---
  const images = useMemo(() => p.imageUrls?.length ? p.imageUrls : [p.imageUrl || p.image || "/products/placeholder.png"], [p]);
  const activeImg = selectedVariant?.VariantImage?.url || images[activeIndex];
  const unitPrice = p.wholesalePrice ?? FALLBACK_UNIT_PRICE;
  const minQty = Number(p.minQty || p.minQtyText || CART_MIN_QTY);
  const descriptionParagraphs = useMemo(() => parseDescription(p.description), [p.description]);

  const onAdd = () => {
    const qty = Math.max(minQty, Number(qtyStr) || minQty);
    addItem({
      id: selectedVariant ? `${product.id}-${selectedVariant.ColorName}` : product.id,
      title: `${product.title} ${selectedVariant ? `(${selectedVariant.ColorName})` : ""}`,
      price: unitPrice,
      image: activeImg,
      qty: qty,
      minQty: minQty,
    });
  };

  return (
    <div className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full mx-auto overflow-hidden">
      <button onClick={onClose} className="absolute right-4 top-4 z-50 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">✕</button>

      <div className="flex flex-col md:flex-row h-[85vh] md:h-[600px]">
        {/* SOL: GÖRSEL VE ZOOM ALANI */}
        <div className="md:w-1/2 bg-gray-50 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
          <div 
            className="relative w-full aspect-square cursor-zoom-in"
            onMouseEnter={() => setZoomOn(true)}
            onMouseLeave={() => setZoomOn(false)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setOrigin({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
            }}
          >
            <img src={activeImg} className="w-full h-full object-contain mix-blend-multiply" alt={product.title} />
          </div>

          {/* Zoom Kutusu (Masaüstü) */}
          {zoomOn && (
            <div className="hidden md:block absolute left-full top-0 z-50 w-full h-full bg-white border shadow-2xl pointer-events-none"
              style={{ backgroundImage: `url(${activeImg})`, backgroundPosition: `${origin.x}% ${origin.y}%`, backgroundSize: '250%' }} />
          )}

          {/* Thumbnail Galeri */}
          {!selectedVariant && images.length > 1 && (
            <div className="flex gap-2 mt-6">
              {images.map((img: string, i: number) => (
                <button key={i} onClick={() => setActiveIndex(i)} className={`border-2 rounded-lg p-1 ${activeIndex === i ? 'border-[#FF5733]' : 'border-transparent'}`}>
                  <img src={img} className="w-12 h-12 object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SAĞ: BİLGİLER */}
        <div className="md:w-1/2 flex flex-col p-6 md:p-10 overflow-y-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.title}</h2>
          <div className="text-2xl font-black text-[#FF5733] mb-6">{unitPrice} TL <span className="text-sm text-gray-400 font-normal">/ adet</span></div>

          {/* Renk Seçenekleri */}
          {p.variants?.length > 0 && (
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-400 uppercase mb-3 block">Renk Seçenekleri</label>
              <div className="flex flex-wrap gap-3">
                {p.variants.map((v: any, i: number) => (
                  <button key={i} onClick={() => setSelectedVariant(v)} 
                    className={`w-10 h-10 rounded-full border-4 transition-all ${selectedVariant?.ColorName === v.ColorName ? "border-gray-300 scale-110" : "border-transparent"}`} 
                    style={{ backgroundColor: v.ColorCode }} title={v.ColorName} />
                ))}
              </div>
            </div>
          )}

          <div className="prose prose-sm text-gray-600 mb-auto">
            {descriptionParagraphs.slice(0, 3).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </div>

      {/* SABİT ALT BAR */}
      <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3 z-40 items-center">
        <div className="flex border rounded-xl overflow-hidden items-center">
          <button onClick={() => setQtyStr(String(Math.max(minQty, Number(qtyStr)-1)))} className="px-4 py-3 bg-gray-50">-</button>
          <input value={qtyStr} onChange={(e) => setQtyStr(e.target.value.replace(/\D/g, ''))} className="w-16 text-center font-bold" />
          <button onClick={() => setQtyStr(String(Number(qtyStr)+1))} className="px-4 py-3 bg-gray-50">+</button>
        </div>
        <button onClick={onAdd} className="flex-1 bg-[#FF5733] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#FF5733]/30">Sepete Ekle</button>
        <a href={whatsappUrlForProduct(product.title)} target="_blank" className="px-6 py-3.5 bg-gray-900 text-white font-bold rounded-xl">Bilgi Al</a>
      </div>
    </div>
  );
}
