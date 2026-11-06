'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/products/types';
import { useCart, CART_MAX_QTY } from '@/components/cart/CartContext';
import { SHOW_PRICES, PRICE_HIDDEN_TEXT } from '@/lib/config';
import { effectiveUnitPriceTRY } from '@/lib/pricing';

const money = (n: number) => n.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });

function ProductImage({ src, alt, sizes, priority = false }: { src?: string; alt: string; sizes: string; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return <span className="absolute inset-0 flex items-center justify-center bg-slate-50 p-4 text-center text-sm text-slate-400">Görsel mevcut değil</span>;
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-contain p-3" onError={() => setFailed(true)} />;
}

export default function ProductDetail({ product }: { product: Product }) {
  const { addItem, hydrated, warnings } = useCart();
  const [variantIndex, setVariantIndex] = useState(0);
  const variant = product.variants?.[variantIndex];
  const images = [...new Set([...(product.imageUrls || []), ...(product.variants || []).map(v => v.VariantImage?.url)].filter((s): s is string => !!s))];
  const [active, setActive] = useState(variant?.VariantImage?.url || images[0]);
  const sources = new Map((product.galleryImages || []).map(i => [i.original, i]));
  for (const v of product.variants || []) if (v.VariantImage?.url && !sources.has(v.VariantImage.url)) sources.set(v.VariantImage.url, { original: v.VariantImage.url, display: v.VariantImage.displayUrl || v.VariantImage.url, thumb: v.VariantImage.thumbUrl || v.VariantImage.url });
  const [zoom, setZoom] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const zoomButton = useRef<HTMLButtonElement>(null);
  const minQty = Math.max(1, Number(product.minQty) || 1);
  const [qtyText, setQtyText] = useState(String(minQty));
  const quantity = Math.min(CART_MAX_QTY, Math.max(minQty, Math.floor(Number(qtyText)) || minQty));
  const [added, setAdded] = useState(false);
  const base = product.wholesalePrice;
  const priced = typeof base === 'number' && Number.isFinite(base) && base >= 0;
  const unitPrice = priced ? effectiveUnitPriceTRY(base, quantity) : undefined;
  useEffect(() => {
    if (zoom) dialog.current?.showModal();
    else if (dialog.current?.open) { dialog.current.close(); zoomButton.current?.focus(); }
  }, [zoom]);

  function add() {
    if (!priced || !hydrated) return;
    setQtyText(String(quantity));
    addItem({ id: product.id, title: product.title, price: base, image: variant?.VariantImage?.url || product.imageUrl, qty: quantity, minQty,
      variant: variant ? { colorName: variant.ColorName } : null });
    setAdded(true);
  }

  return <>
    <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-14">
      <section aria-label="Ürün görselleri" className="min-w-0">
        <button ref={zoomButton} onClick={() => setZoom(true)} aria-label="Ürün görselini büyüt" disabled={!active} className="relative block aspect-square w-full overflow-hidden rounded-3xl border border-slate-200 bg-white cursor-zoom-in">
          <ProductImage src={active ? sources.get(active)?.display || active : undefined} alt={product.title} priority sizes="(max-width: 1024px) 100vw, 50vw" />
          {active && <span className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xs text-slate-600 shadow-sm">Büyüt ↗</span>}
        </button>
        {images.length > 1 && <div className="mt-3 flex gap-3 overflow-x-auto pb-2">{images.map((src, i) => <button key={src} aria-label={`${i + 1}. görsel`} aria-pressed={active === src} onClick={() => { setActive(src); const i = product.variants?.findIndex(v => v.VariantImage?.url === src) ?? -1; if (i >= 0) { setVariantIndex(i); setAdded(false); } }} className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border ${active === src ? 'border-[#7C3AED] ring-1 ring-[#7C3AED]' : 'border-slate-200'}`}>
          <ProductImage src={sources.get(src)?.thumb || src} alt={`${product.title}, görsel ${i + 1}`} sizes="80px" />
        </button>)}</div>}
      </section>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8">
        {SHOW_PRICES && unitPrice !== undefined ? <div><p className="text-3xl font-bold text-[#FF5733]">{money(unitPrice)} <span className="text-sm font-normal text-slate-500">/ adet</span></p><p className="mt-1 text-xs text-slate-500">KDV dahil</p></div> : <p className="font-semibold text-[#FF5733]">{PRICE_HIDDEN_TEXT}</p>}
        <p className="mt-4 text-sm text-slate-600">Minimum sipariş: <strong>{minQty} adet</strong></p>
        {!!product.variants?.length && <fieldset className="mt-7"><legend className="mb-3 text-sm font-semibold">Renk: {variant?.ColorName}</legend><div className="flex flex-wrap gap-2">{product.variants.map((v, i) => <button key={`${v.ColorName}-${i}`} type="button" aria-pressed={i === variantIndex} onClick={() => {
          setVariantIndex(i); setActive(v.VariantImage?.url || images[0]); setAdded(false);
        }} className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${i === variantIndex ? 'border-[#7C3AED] ring-1 ring-[#7C3AED]' : 'border-slate-200'}`}><span className="h-5 w-5 rounded-full border border-slate-200" style={{ backgroundColor: v.ColorCode }} />{v.ColorName}</button>)}</div></fieldset>}
        <div className="mt-7"><label htmlFor="product-quantity" className="mb-2 block text-sm font-semibold">Adet</label><div className="flex items-center gap-3">
          <button aria-label="Adedi azalt" onClick={() => { setQtyText(String(Math.max(minQty, quantity - 1))); setAdded(false); }} className="h-11 w-11 rounded-xl border border-slate-200">−</button>
          <input id="product-quantity" type="number" inputMode="numeric" min={minQty} max={CART_MAX_QTY} step={1} value={qtyText} onChange={e => { setQtyText(e.target.value); setAdded(false); }} onBlur={() => setQtyText(String(quantity))} className="h-11 w-24 rounded-xl border border-slate-200 text-center" />
          <button aria-label="Adedi artır" onClick={() => { setQtyText(String(Math.min(CART_MAX_QTY, quantity + 1))); setAdded(false); }} className="h-11 w-11 rounded-xl border border-slate-200">+</button>
        </div></div>
        {SHOW_PRICES && priced && <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm"><p className="font-semibold">Kademeli birim fiyatlar</p><div className="mt-2 grid grid-cols-2 gap-2">{[500, 1000, 1500, 2000].filter(q => q >= minQty).map(q => <p key={q}>{q} adet: {money(effectiveUnitPriceTRY(base, q))}</p>)}</div><p className="mt-4 font-semibold">Ürün toplamı: {money(unitPrice! * quantity)}</p></div>}
        <button onClick={add} disabled={!priced || !hydrated} className="mt-7 w-full rounded-xl bg-[#FF5733] px-5 py-4 font-bold text-white transition hover:bg-[#e64e2e] disabled:opacity-50">Sepete ekle</button>
        <p role="status" className="mt-2 text-sm text-slate-600">{warnings.length ? warnings.join(' ') : added ? 'Sepetiniz güncellendi.' : ''}</p>
        <a href={`https://wa.me/905465868005?text=${encodeURIComponent(`Merhaba, "${product.title}" hakkında bilgi almak istiyorum.`)}`} target="_blank" rel="noopener noreferrer" className="mt-3 block rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold">WhatsApp ile bilgi al</a>
        {!!product.bullets?.length && <ul className="mt-7 list-disc space-y-2 pl-5 text-sm text-slate-600">{product.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>}
      </section>
    </div>
    <div className="mt-12 grid gap-8 border-t border-slate-100 pt-8 md:grid-cols-2">
      {!!product.description?.length && <section><h2 className="mb-4 text-lg font-bold">Ürün açıklaması</h2><div className="space-y-3 text-sm leading-7 text-slate-600">{product.description.map((p, i) => <p key={i}>{p}</p>)}</div></section>}
      {!!product.specs?.length && <section><h2 className="mb-4 text-lg font-bold">Teknik bilgiler</h2><ul className="divide-y divide-slate-100 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">{product.specs.map((s, i) => <li className="py-3" key={i}>{s}</li>)}</ul></section>}
    </div>
    <dialog ref={dialog} onCancel={() => setZoom(false)} onClick={e => { if (e.target === e.currentTarget) setZoom(false); }} className="fixed inset-0 m-auto h-[90vh] w-[95vw] max-w-6xl rounded-2xl bg-white p-5 backdrop:bg-slate-950/80">
      <button autoFocus onClick={() => setZoom(false)} className="absolute right-4 top-3 z-10 rounded-full bg-white px-4 py-2 shadow" aria-label="Büyütülmüş görseli kapat">Kapat ×</button>
      <div className="relative h-full w-full">{zoom && <ProductImage src={active} alt={product.title} sizes="95vw" />}</div>
    </dialog>
  </>;
}
