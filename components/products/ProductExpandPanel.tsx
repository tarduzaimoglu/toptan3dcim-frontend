"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { Product } from "@/lib/products/types";
import {
  useCart,
  CART_MAX_QTY,
  CART_MIN_QTY,
  CART_STEP,
  FALLBACK_UNIT_PRICE,
} from "@/components/cart/CartContext";

const PRODUCT_MAX_QTY = 2000;
const ORANGE = "bg-orange-500 hover:bg-orange-600";
const BLUE = "bg-blue-600 hover:bg-blue-700";

function whatsappUrlForProduct(title: string) {
  const phone = "905537538182";
  const text = `Merhaba, "${title}" hakkında bilgi almak istiyorum.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

function toSafeInt(v: any): number | null {
  if (v === null || v === undefined) return null;
  const n =
    typeof v === "number" ? v : Number(String(v ?? "").replace(/[^\d]/g, ""));
  if (!Number.isFinite(n)) return null;
  const i = Math.floor(n);
  return i > 0 ? i : null;
}

function pickQtyRules(product: Product) {
  const p: any = product;

  // 1. Önce Strapi'deki sayısal 'minQty' alanına bak
  const minFromField = toSafeInt(p.minQty);
  
  // 2. Yoksa 'minQtyText' (Min 20 Adet gibi metin) içinden sayı ayıkla
  const minFromText = toSafeInt(p.minQtyText);
  
  // 3. İkisi de yoksa Context'teki 1 değerini kullan
  const min = minFromField ?? minFromText ?? CART_MIN_QTY;

  const max = 2000; 

  // Katlarda gitmemesi için adımı 1 yapıyoruz
  const step = 1; 

  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);

  return { min: safeMin, max: safeMax, step };
}

function resolveImageSrc(product: any) {
  if (typeof product?.imageUrl === "string" && product.imageUrl.trim())
    return product.imageUrl;
  if (typeof product?.image === "string" && product.image.trim())
    return product.image;
  return "/products/placeholder.png";
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
  qtyText,
  setQtyText,
}: {
  product: Product;
  onClose: () => void;
  qtyText?: string;
  setQtyText?: (v: string) => void;
}) {
  const { addItem } = useCart();

  const rules = useMemo(() => pickQtyRules(product), [product]);

  const images = useMemo<string[]>(() => {
    const p: any = product;

    if (Array.isArray(p?.imageUrls) && p.imageUrls.length) {
      return p.imageUrls
        .filter((x: unknown): x is string => typeof x === "string" && x.trim().length > 0);
    }

    const single =
      typeof p?.imageUrl === "string"
        ? p.imageUrl
        : typeof p?.image === "string"
        ? p.image
        : "/products/placeholder.png";

    return [single].filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  }, [product]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImg =
    images[Math.min(activeIndex, Math.max(0, images.length - 1))] ??
    resolveImageSrc(product as any);

  const canPrev = activeIndex > 0;
  const canNext = activeIndex < images.length - 1;
  const prevImg = () => setActiveIndex((i) => Math.max(0, i - 1));
  const nextImg = () =>
    setActiveIndex((i) => Math.min(images.length - 1, i + 1));

  const unitPrice = useMemo(() => {
    const p = (product as any).wholesalePrice;
    return typeof p === "number" ? p : FALLBACK_UNIT_PRICE;
  }, [product]);

  const priceText = useMemo(() => `${unitPrice} TL/adet`, [unitPrice]);

  const vars = useMemo(
    () => ({
      price: priceText,
      min: String(rules.min),
      max: String(rules.max),
      step: String(rules.step),
    }),
    [priceText, rules.min, rules.max, rules.step]
  );

  const qtyNoteRich = ((product as any).qtyNoteRich as string) || "";
  const specs = Array.isArray((product as any).specs)
    ? (product as any).specs
    : [];

  // Adet input: Ürün değiştiğinde veya kurallar güncellendiğinde minQty'den başlar
  const [qtyStr, setQtyStr] = useState<string>(String(rules.min));

  useEffect(() => {
    setQtyStr(String(rules.min));
  }, [rules.min]);

  const parsedQty = useMemo(() => {
    const s = qtyStr.trim();
    if (!s) return null;
    const n = Number(s);
    if (!Number.isFinite(n)) return null;
    return Math.floor(n);
  }, [qtyStr]);

  const qtyError = useMemo(() => {
    if (parsedQty === null) return "Adet girin.";
    if (parsedQty > rules.max) return `Maksimum adet ${rules.max}.`;
    if (parsedQty < rules.min) return `Minimum adet ${rules.min}.`;
    return null;
  }, [parsedQty, rules.max, rules.min]);

  const qtyValid = qtyError === null && parsedQty !== null;

  const commitQty = () => {
    if (parsedQty === null) {
      setQtyStr(String(rules.min));
      return;
    }
    const q = clamp(parsedQty, rules.min, rules.max);
    setQtyStr(String(q));
  };

  const inc = () => {
    const base = qtyValid ? (parsedQty as number) : rules.min;
    const next = clamp(base + rules.step, rules.min, rules.max);
    setQtyStr(String(next));
  };

  const dec = () => {
    const base = qtyValid ? (parsedQty as number) : rules.min;
    const next = clamp(base - rules.step, rules.min, rules.max);
    setQtyStr(String(next));
  };

  const onAdd = () => {
    if (!qtyValid || parsedQty === null) return;
    addItem({
      id: product.id,
      title: product.title,
      price: unitPrice,
      image: activeImg,
      qty: parsedQty,
      minQty: rules.min, // Strapi'den gelen minQty artık sepete gönderiliyor
    });
  };

  const mainWrapRef = useRef<HTMLDivElement | null>(null);
  const [zoomOn, setZoomOn] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const LENS_PX = 120;
  const ZOOM_SCALE = 3;
  const popupSize = { w: 520, h: 520 };

  const onEnter = () => setZoomOn(true);
  const onLeave = () => setZoomOn(false);

  const onMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const el = mainWrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setOrigin({ x: clamp(x, 0, 100), y: clamp(y, 0, 100) });
  };

  const lensPx = useMemo(() => {
    const el = mainWrapRef.current;
    if (!el) return { left: 0, top: 0 };
    const r = el.getBoundingClientRect();
    return {
      left: (origin.x / 100) * r.width - LENS_PX / 2,
      top: (origin.y / 100) * r.height - LENS_PX / 2,
    };
  }, [origin.x, origin.y]);

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-white shadow-sm">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full border bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        aria-label="Kapat"
      >
        ✕
      </button>

      <div className="p-6">
        <div className="text-2xl font-semibold text-black">{product.title}</div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="w-full">
            <div className="relative overflow-visible">
              <div
                ref={mainWrapRef}
                className="relative overflow-hidden rounded-2xl bg-gray-100"
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
                onMouseMove={onMove}
              >
                <img
                  src={activeImg}
                  alt={product.title}
                  loading="lazy"
                  draggable={false}
                  className="aspect-square w-full object-cover"
                />

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImg}
                      disabled={!canPrev}
                      className={[
                        "absolute left-3 top-1/2 -translate-y-1/2",
                        "p-2 rounded-full",
                        "text-white/75 drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]",
                        "hover:text-white transition",
                        canPrev ? "opacity-100" : "opacity-25 cursor-not-allowed",
                      ].join(" ")}
                    >
                      <span className="text-3xl leading-none">‹</span>
                    </button>

                    <button
                      type="button"
                      onClick={nextImg}
                      disabled={!canNext}
                      className={[
                        "absolute right-3 top-1/2 -translate-y-1/2",
                        "p-2 rounded-full",
                        "text-white/75 drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]",
                        "hover:text-white transition",
                        canNext ? "opacity-100" : "opacity-25 cursor-not-allowed",
                      ].join(" ")}
                    >
                      <span className="text-3xl leading-none">›</span>
                    </button>
                  </>
                )}

                <div className={`hidden md:block ${zoomOn ? "opacity-100" : "opacity-0"} transition-opacity`}>
                  <div
                    className="absolute pointer-events-none rounded-lg border-2 border-black/60 bg-white/20"
                    style={{
                      width: LENS_PX,
                      height: LENS_PX,
                      left: lensPx.left,
                      top: lensPx.top,
                    }}
                  />
                </div>
              </div>

              {zoomOn && (
                <div
                  className="hidden md:block absolute z-50"
                  style={{
                    left: "calc(100% + 14px)",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: popupSize.w,
                    height: popupSize.h,
                  }}
                >
                  <div className="h-full w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.16)]">
                    <div className="relative h-full w-full overflow-hidden">
                      <img
                        src={activeImg}
                        alt=""
                        draggable={false}
                        className="absolute left-0 top-0 h-full w-full select-none object-cover"
                        style={{
                          transform: `scale(${ZOOM_SCALE})`,
                          transformOrigin: `${origin.x}% ${origin.y}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {images.map((src, i) => {
                  const active = i === activeIndex;
                  return (
                    <button
                      key={`${src}-${i}`}
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      className={[
                        "h-14 w-14 overflow-hidden rounded-xl border bg-white",
                        active ? "border-blue-600 ring-2 ring-blue-200" : "border-slate-200 hover:border-slate-300",
                      ].join(" ")}
                    >
                      <img src={src} alt={`${product.title} ${i + 1}`} className="h-full w-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="w-full text-black">
            {product.bullets?.length ? (
              <ul className="list-disc space-y-2 pl-5">
                {product.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-[12px] text-slate-700">
                <span className="text-slate-500">Fiyat</span>
                <span className="font-semibold text-slate-900">{priceText}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-[12px] text-slate-700">
                <span className="text-slate-500">Min</span>
                <span className="font-semibold text-slate-900">{rules.min}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-[12px] text-slate-700">
                <span className="text-slate-500">Maks</span>
                <span className="font-semibold text-slate-900">{rules.max}</span>
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="text-[13px] text-slate-700">Adet</div>
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  className="h-10 w-10 rounded-xl border border-slate-300 text-slate-900 hover:bg-slate-50"
                  onClick={dec}
                >–</button>
                <input
                  value={qtyStr}
                  onChange={(e) => setQtyStr(e.target.value.replace(/[^\d]/g, ""))}
                  onBlur={commitQty}
                  inputMode="numeric"
                  className={[
                    "h-10 w-[130px] rounded-xl border px-3 text-center text-[14px] font-semibold outline-none transition",
                    qtyError ? "border-red-500 text-red-600" : "border-slate-300 text-slate-900",
                  ].join(" ")}
                />
                <button
                  type="button"
                  className="h-10 w-10 rounded-xl border border-slate-300 text-slate-900 hover:bg-slate-50"
                  onClick={inc}
                >+</button>
              </div>

              {qtyError ? (
                <div className="text-[12px] text-red-600">{qtyError}</div>
              ) : qtyNoteRich ? (
                <div className="text-[12px] text-slate-500 prose prose-sm max-w-none">
                  <ReactMarkdown>{applyVars(qtyNoteRich, vars)}</ReactMarkdown>
                </div>
              ) : null}
            </div>

            <div className="mt-6 w-full">
              <button
                type="button"
                onClick={onAdd}
                disabled={!qtyValid}
                className={[
                  "w-full h-12 flex items-center justify-center rounded-xl",
                  "text-[15px] font-bold text-white shadow-sm hover:shadow-md active:scale-[0.98]",
                  "transition-all duration-300",
                  "bg-[#4ADE80] hover:bg-[#22C55E]", 
                  !qtyValid ? "opacity-50 cursor-not-allowed hover:bg-[#4ADE80]" : ""
                ].join(" ")}
              >
                Sepete Ekle
              </button>
            </div>

            {specs.length > 0 && (
              <div className="mt-6 w-full">
                <div className="w-full rounded-xl bg-slate-50 px-5 py-4">
                  <div className="mb-2 text-[13px] font-medium text-slate-600">Teknik Özellikler</div>
                  <ul className="m-0 w-full list-disc space-y-1 pl-5 text-[13px] text-slate-500">
                    {specs.map((s: string) => <li key={s} className="w-full">{s}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}