"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { Product } from "@/lib/products/types";
import {
  useCart,
  CART_MAX_QTY,
  CART_MIN_QTY,
  FALLBACK_UNIT_PRICE,
} from "@/components/cart/CartContext";

// WhatsApp URL Oluşturucu
function whatsappUrlForProduct(title: string) {
  const phone = "905537538182";
  const text = `Merhaba, "${title}" hakkında bilgi almak istiyorum.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

function toSafeInt(v: any): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(/[^\d]/g, ""));
  if (!Number.isFinite(n)) return null;
  const i = Math.floor(n);
  return i > 0 ? i : null;
}

function pickQtyRules(product: Product) {
  const p: any = product;
  const minFromField = toSafeInt(p.minQty);
  const minFromText = toSafeInt(p.minQtyText);
  const min = minFromField ?? minFromText ?? CART_MIN_QTY;
  const max = 2000;
  return { min, max, step: 1 };
}

function applyVars(markdown: string, vars: Record<string, string>) {
  return markdown.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => vars[key] ?? "");
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function ProductExpandPanel({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const rules = useMemo(() => pickQtyRules(product), [product]);
  const p = product as any;

  // --- VARYANT VE RENK YÖNETİMİ ---
  const variants = useMemo(() => p.variants || [], [p.variants]);
  const [selectedVariant, setSelectedVariant] = useState<any>(variants.length > 0 ? variants[0] : null);

  // Ana Görsel Seçimi: Varyant seçiliyse onun görseli, yoksa ürünün ana görselleri
  const [activeIndex, setActiveIndex] = useState(0);
  
  const images = useMemo<string[]>(() => {
    if (Array.isArray(p?.imageUrls) && p.imageUrls.length) {
      return p.imageUrls.filter((x: any) => typeof x === "string" && x.trim().length > 0);
    }
    return [p.imageUrl || p.image || "/products/placeholder.png"];
  }, [p]);

  const activeImg = useMemo(() => {
    if (selectedVariant?.VariantImage?.url) return selectedVariant.VariantImage.url;
    return images[Math.min(activeIndex, images.length - 1)];
  }, [selectedVariant, images, activeIndex]);

  // --- FİYAT VE ADET ---
  const unitPrice = useMemo(() => {
    const val = p.wholesalePrice;
    return typeof val === "number" ? val : FALLBACK_UNIT_PRICE;
  }, [p]);

  const [qtyStr, setQtyStr] = useState<string>(String(rules.min));
  const parsedQty = useMemo(() => {
    const n = Number(qtyStr);
    return Number.isFinite(n) ? Math.floor(n) : null;
  }, [qtyStr]);

  const qtyError = useMemo(() => {
    if (parsedQty === null) return "Adet girin.";
    if (parsedQty > rules.max) return `Maks: ${rules.max}`;
    if (parsedQty < rules.min) return `Min: ${rules.min}`;
    return null;
  }, [parsedQty, rules.max, rules.min]);

  const qtyValid = qtyError === null && parsedQty !== null;

  const onAdd = () => {
    if (!qtyValid || parsedQty === null) return;
    addItem({
      id: product.id,
      title: `${product.title} ${selectedVariant ? `(${selectedVariant.ColorName})` : ""}`,
      price: unitPrice,
      image: activeImg,
      qty: parsedQty,
      minQty: rules.min,
    });
  };

  // --- ZOOM LOGIC (Masaüstü için) ---
  const mainWrapRef = useRef<HTMLDivElement | null>(null);
  const [zoomOn, setZoomOn] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const onMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const el = mainWrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setOrigin({ x: clamp(x, 0, 100), y: clamp(y, 0, 100) });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-white shadow-2xl transition-all mt-[20px]">
      {/* Kapatma Butonu */}
      {/* 'absolute' pozisyonu ile sadece beyaz panelin sağ üst köşesine sabitlenir. 
          'z-10' (veya benzeri düşük bir değer) vererek, butonun sadece panel içeriğinin üstünde, 
          ancak Header'ın (genelde z-50'dir) altında kalmasını sağlıyoruz. */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border bg-white/80 text-gray-500 backdrop-blur-sm hover:bg-white hover:text-black shadow-sm transition"
      >
        ✕
      </button>

      <div className="p-4 md:p-8">
        <h2 className="text-xl md:text-3xl font-bold text-slate-900 pr-10">{product.title}</h2>
        
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          
          {/* SOL: GÖRSEL ALANI */}
          <div className="space-y-4">
            <div className="relative">
              <div
                ref={mainWrapRef}
                className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 cursor-zoom-in"
                onMouseEnter={() => setZoomOn(true)}
                onMouseLeave={() => setZoomOn(false)}
                onMouseMove={onMove}
              >
                <img
                  src={activeImg}
                  alt={product.title}
                  className="h-full w-full object-cover transition-transform duration-500"
                />
              </div>

              {/* Zoom Penceresi (Desktop) */}
              {zoomOn && (
                <div className="hidden lg:block absolute left-[105%] top-0 z-[100] h-full w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  <img
                    src={activeImg}
                    className="absolute h-full w-full max-w-none scale-[2.5]"
                    style={{ transformOrigin: `${origin.x}% ${origin.y}%` }}
                  />
                </div>
              )}
            </div>

            {/* Thumbnail Listesi */}
            {images.length > 1 && !selectedVariant && (
              <div className="flex flex-wrap gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition ${
                      activeIndex === i ? "border-blue-500 ring-2 ring-blue-100" : "border-transparent hover:border-slate-300"
                    }`}
                  >
                    <img src={img} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SAĞ: BİLGİ VE AKSİYON ALANI */}
          <div className="flex flex-col">
            
            {/* Renk Seçenekleri (Varyantlar) */}
            {variants.length > 0 && (
              <div className="mb-6">
                <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  Renk Seçenekleri
                </label>
                <div className="mt-3 flex flex-wrap gap-3">
                  {variants.map((v: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedVariant(v);
                        setActiveIndex(-1); // Varyant seçildiğinde thumbnail seçimini sıfırla
                      }}
                      className={`group relative h-10 w-10 rounded-full border-2 transition-all hover:scale-110 ${
                        selectedVariant?.ColorName === v.ColorName ? "border-blue-600 ring-2 ring-blue-100" : "border-slate-200"
                      }`}
                      style={{ backgroundColor: v.ColorCode || "#ccc" }}
                    >
                      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        {v.ColorName}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bilgi Badge'leri */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="rounded-xl bg-blue-50 px-4 py-2 border border-blue-100">
                <div className="text-[10px] uppercase font-bold text-blue-400">Birim Fiyat</div>
                <div className="text-lg font-bold text-blue-700">{unitPrice} TL</div>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-2 border border-slate-100">
                <div className="text-[10px] uppercase font-bold text-slate-400">Minimum Adet</div>
                <div className="text-lg font-bold text-slate-700">{rules.min}</div>
              </div>
            </div>

            {/* Adet Seçimi */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Sipariş Adedi</label>
              <div className="flex items-center gap-4">
                <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button 
                    onClick={() => setQtyStr(String(clamp((parsedQty || 0) - 1, rules.min, rules.max)))}
                    className="h-10 w-10 rounded-lg text-xl hover:bg-white transition shadow-sm"
                  >–</button>
                  <input
                    value={qtyStr}
                    onChange={(e) => setQtyStr(e.target.value.replace(/[^\d]/g, ""))}
                    className="w-20 bg-transparent text-center font-bold text-slate-900 outline-none"
                  />
                  <button 
                    onClick={() => setQtyStr(String(clamp((parsedQty || 0) + 1, rules.min, rules.max)))}
                    className="h-10 w-10 rounded-lg text-xl hover:bg-white transition shadow-sm"
                  >+</button>
                </div>
                {qtyError && <span className="text-xs font-bold text-red-500">{qtyError}</span>}
              </div>
            </div>

            {/* Butonlar */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                onClick={onAdd}
                disabled={!qtyValid}
                className="flex h-14 items-center justify-center rounded-2xl bg-emerald-500 text-lg font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-600 hover:shadow-emerald-300 disabled:opacity-50 active:scale-95"
              >
                Sepete Ekle
              </button>
              <a
                href={whatsappUrlForProduct(product.title)}
                target="_blank"
                className="flex h-14 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-lg font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
              >
                Bilgi Al
              </a>
            </div>

            {/* Teknik Detaylar */}
            {Array.isArray(p.specs) && p.specs.length > 0 && (
              <div className="mt-8 rounded-2xl bg-slate-50 p-5">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Ürün Detayları</h4>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {p.specs.map((s: string, i: number) => (
                    <li key={i} className="flex items-center text-sm text-slate-600">
                      <span className="mr-2 h-1.5 w-1.5 rounded-full bg-blue-400" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}