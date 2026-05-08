"use client";

import React, { useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/products/types";
import {
  useCart,
  CART_MAX_QTY,
  CART_MIN_QTY,
  FALLBACK_UNIT_PRICE,
} from "@/components/cart/CartContext";

// --- YARDIMCI FONKSİYONLAR ---
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

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function parseDescription(desc: any): string[] {
  if (!desc) return [];
  if (typeof desc === 'string') {
    return desc
      .split('\n')
      .map(s => s.replace(/<\/?[^>]+(>|$)/g, '').trim())
      .filter(Boolean);
  }
  if (Array.isArray(desc)) {
    return desc
      .filter(block => block && block.type === 'paragraph')
      .map(block => {
         if (Array.isArray(block.children)) {
            return block.children.map((child:any) => child.text).join('').trim();
         }
         return "";
      })
      .filter(Boolean);
  }
  return [];
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

  // --- STATELER ---
  const variants = useMemo(() => p.variants || [], [p.variants]);
  const [selectedVariant, setSelectedVariant] = useState<any>(variants.length > 0 ? variants[0] : null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobileImageModalOpen, setIsMobileImageModalOpen] = useState(false);
  const [isDescOpen, setIsDescOpen] = useState(false);
  
  // --- GÖRSELLER ---
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

  // --- AÇIKLAMA ---
  const descriptionParagraphs = useMemo(() => parseDescription(p.description), [p.description]);

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
    const uniqueCartId = selectedVariant ? `${product.id}-${selectedVariant.ColorName}` : product.id;
    addItem({
      id: uniqueCartId,
      title: `${product.title} ${selectedVariant ? `(${selectedVariant.ColorName})` : ""}`,
      price: unitPrice,
      image: activeImg,
      qty: parsedQty,
      minQty: rules.min,
    });
  };

  // --- ZOOM LOGIC ---
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [zoomOn, setZoomOn] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const onMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const img = imgRef.current;
    if (!img) return;
    const imgRect = img.getBoundingClientRect();
    
    // Mouse'un sadece resmin üzerindeki koordinatları (kutunun değil)
    let x = e.clientX - imgRect.left;
    let y = e.clientY - imgRect.top;
    
    const percentX = (x / imgRect.width) * 100;
    const percentY = (y / imgRect.height) * 100;
    
    setOrigin({ x: clamp(percentX, 0, 100), y: clamp(percentY, 0, 100) });
  };

  return (
    <>
      {/* MOBİL TAM EKRAN (LIGHTBOX) */}
      {isMobileImageModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4 md:hidden">
          <button 
            onClick={() => setIsMobileImageModalOpen(false)}
            className="absolute right-4 top-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md"
          >
            ✕
          </button>
          <img src={activeImg} alt={product.title} className="max-h-[90vh] max-w-full object-contain" />
        </div>
      )}

      {/* ANA PANEL */}
      <div className="relative overflow-hidden rounded-3xl border bg-white shadow-2xl transition-all mt-[20px]">
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
                  onClick={() => { if (window.innerWidth < 1024) setIsMobileImageModalOpen(true); }}
                  className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-white border border-slate-100 cursor-zoom-in lg:bg-slate-50"
                  onMouseEnter={() => setZoomOn(true)}
                  onMouseLeave={() => setZoomOn(false)}
                  onMouseMove={onMove}
                >
                  <img
                    ref={imgRef}
                    src={activeImg}
                    alt={product.title}
                    className="absolute inset-0 h-full w-full object-contain mix-blend-multiply"
                  />
                </div>

                {/* ZOOM PENCERESİ (Masaüstü) */}
                {zoomOn && (
                  <div className="hidden lg:block absolute left-[105%] top-0 z-[100] h-full w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl pointer-events-none">
                    <div 
                      className="h-full w-full bg-no-repeat"
                      style={{
                        backgroundImage: `url(${activeImg})`,
                        backgroundPosition: `${origin.x}% ${origin.y}%`,
                        backgroundSize: '250%' // Zoom yakınlaştırma oranı
                      }}
                    />
                  </div>
                )}
              </div>

              {/* THUMBNAIL LİSTESİ */}
              {images.length > 1 && !selectedVariant && (
                <div className="flex flex-wrap gap-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className={`h-16 w-16 overflow-hidden rounded-lg border-2 bg-white transition ${
                        activeIndex === i ? "border-blue-500 ring-2 ring-blue-100" : "border-transparent hover:border-slate-300"
                      }`}
                    >
                      <img src={img} className="h-full w-full object-contain p-1 mix-blend-multiply" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SAĞ: BİLGİ VE AKSİYON ALANI */}
            <div className="flex flex-col">
              
              {/* VARYANTLAR */}
              {variants.length > 0 && (
                <div className="mb-6">
                  <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    Renk Seçenekleri
                  </label>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {variants.map((v: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => { setSelectedVariant(v); setActiveIndex(-1); }}
                        className={`group relative flex-shrink-0 h-10 w-10 rounded-full border-2 transition-all hover:scale-110 ${
                          selectedVariant?.ColorName === v.ColorName ? "border-blue-600 ring-2 ring-blue-100" : "border-slate-200"
                        }`}
                        style={{ backgroundColor: v.ColorCode || "#ccc" }}
                      >
                         <span className="hidden md:block absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold bg-slate-800 text-white px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          {v.ColorName}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ROZETLER */}
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

              {/* SİPARİŞ ADEDİ */}
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

              {/* BUTONLAR */}
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

              {/* AÇIKLAMA (SEO DOSTU TOGGLE) */}
              {descriptionParagraphs.length > 0 && (
                <div className="mt-8 border-t border-slate-100 pt-6">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Ürün Hakkında</h4>
                  <div className={`relative transition-all duration-500 overflow-hidden ${
                    isDescOpen ? "max-h-[2000px]" : "max-h-24"
                  }`}>
                    <div className="text-slate-600 text-sm leading-relaxed space-y-4">
                      {descriptionParagraphs.map((para, i) => (
                        <p key={`desc-${i}`}>{para}</p>
                      ))}
                    </div>
                    {!isDescOpen && (
                      <div className="absolute bottom-0 left-0 h-12 w-full bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    )}
                  </div>
                  <button
                    onClick={() => setIsDescOpen(!isDescOpen)}
                    className="mt-2 text-sm font-bold text-[#7C3AED] hover:underline flex items-center gap-1"
                  >
                    {isDescOpen ? (
                      <>Daha Az Gör <span className="text-xs">▲</span></>
                    ) : (
                      <>Devamını Oku <span className="text-xs">▼</span></>
                    )}
                  </button>
                </div>
              )}

              {/* TEKNİK DETAYLAR */}
              {( (Array.isArray(p.specs) && p.specs.length > 0) || (Array.isArray(p.bullets) && p.bullets.length > 0) ) && (
                <div className="mt-8 rounded-2xl bg-slate-50 p-5">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Teknik Özellikler</h4>
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Array.isArray(p.bullets) && p.bullets.map((s: string, i: number) => (
                      <li key={`bullet-${i}`} className="flex items-start text-sm text-slate-700 font-medium">
                        <span className="mr-2 mt-1.5 block h-2 w-2 min-w-[8px] shrink-0 rounded-full bg-emerald-400" />
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                    {Array.isArray(p.specs) && p.specs.map((s: string, i: number) => (
                      <li key={`spec-${i}`} className="flex items-start text-sm text-slate-600">
                        <span className="mr-2 mt-1.5 block h-2 w-2 min-w-[8px] shrink-0 rounded-full bg-blue-400" />
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}