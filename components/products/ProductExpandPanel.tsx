"use client";

import React, { useMemo, useState, useEffect } from "react";
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
  const [isExpanded, setIsExpanded] = useState(false);

  // --- TÜM BENZERSİZ GÖRSELLERİ BİRLEŞTİRME (Varyasyonlar Dahil) ---
  const allImages = useMemo(() => {
    const list = p.imageUrls?.length ? [...p.imageUrls] : [p.imageUrl || p.image || "/products/placeholder.png"];
    // Eğer varyantların kendine özel resimleri varsa onları da galeri listesine ekle
    if (p.variants && Array.isArray(p.variants)) {
      p.variants.forEach((v: any) => {
        if (v.VariantImage?.url && !list.includes(v.VariantImage.url)) {
          list.push(v.VariantImage.url);
        }
      });
    }
    return list;
  }, [p]);

  // Varyant seçildiğinde ana görseli o varyantın görsel indeksine taşır
  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant);
    if (variant.VariantImage?.url) {
      const idx = allImages.indexOf(variant.VariantImage.url);
      if (idx !== -1) {
        setActiveIndex(idx);
      }
    }
  };

  // Hızlandırma için tüm görselleri önceden yükle
  useEffect(() => {
    allImages.forEach((src: string) => {
      const img = new Image();
      img.src = src;
    });
  }, [allImages]);

  const activeImg = allImages[activeIndex];
  const unitPrice = p.wholesalePrice ?? FALLBACK_UNIT_PRICE;
  const minQty = Number(p.minQty || p.minQtyText || CART_MIN_QTY);
  const descriptionParagraphs = useMemo(() => parseDescription(p.description), [p.description]);
  const isLongDescription = descriptionParagraphs.join(" ").length > 150;

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
    // 🛠️ DÜZELTME: Mobilde sayfa arkasına kaçmayı önleyen izole fixed modal arka planı
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Boşluğa tıklayınca kapatma */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Ana Panel Gövdesi */}
      <div className="relative bg-white w-full h-full sm:h-auto sm:max-h-[90vh] md:max-h-[85vh] sm:rounded-3xl shadow-2xl max-w-5xl mx-auto flex flex-col overflow-hidden z-10 animate-in slide-in-from-bottom-6 duration-300">
        
        {/* 🛠️ DÜZELTME: Header'ın altına kaçmayan, her zaman görünür şık kapatma butonu */}
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 z-50 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all focus:outline-none"
        >
          ✕
        </button>

        {/* İÇ İÇERİK ALANI (Kaydırılabilir alan alt bar hariç tutularak izole edildi) */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto pb-24 md:pb-0">
          
          {/* SOL: PREMIUM GÖRSEL SERGİLEME KUTUSU */}
          <div className="w-full md:w-1/2 bg-slate-50/60 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col items-center p-4 md:p-8 relative shrink-0">
            <div 
              className="relative w-full max-w-[320px] md:max-w-none aspect-square cursor-zoom-in bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center justify-center overflow-hidden"
              onMouseEnter={() => setZoomOn(true)}
              onMouseLeave={() => setZoomOn(false)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setOrigin({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
              }}
            >
              <img src={activeImg} className="max-w-full max-h-full w-auto h-auto object-contain mix-blend-multiply transition-all duration-300" alt={product.title} />
            </div>

            {zoomOn && (
              <div className="hidden md:block absolute left-full top-0 z-50 w-full h-full bg-white border border-slate-200 shadow-2xl pointer-events-none rounded-2xl overflow-hidden"
                style={{ backgroundImage: `url(${activeImg})`, backgroundPosition: `${origin.x}% ${origin.y}%`, backgroundSize: '220%' }} />
          )}

            {/* 🛠️ DÜZELTME: Tüm varyasyon ve ek fotoğrafları her koşulda gösteren kusursuz galeri şeridi */}
            {allImages.length > 1 && (
              <div className="flex flex-wrap justify-center gap-2 mt-5 max-h-[68px] overflow-y-auto py-1 w-full">
                {allImages.map((img: string, i: number) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveIndex(i)} 
                    className={`border-2 rounded-xl p-0.5 bg-white transition-all overflow-hidden shadow-sm shrink-0 ${activeIndex === i ? 'border-[#7C3AED] scale-105 shadow-purple-500/10' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <img src={img} className="w-10 h-10 object-contain rounded-lg" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SAĞ: DETAYLI ÜRÜN BİLGİLERİ */}
          <div className="w-full md:w-1/2 flex flex-col p-5 md:p-10 md:overflow-y-auto">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-2 pr-8">{product.title}</h2>
            
            <div className="mb-6 flex items-center gap-2.5 flex-wrap">
              <span className="text-xl md:text-2xl font-black text-[#FF5733]">
                {unitPrice} TL <span className="text-sm text-gray-400 font-normal">/ adet</span>
              </span>
              <span className="text-[11px] md:text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60 shadow-inner">
                {minQty} Adet / Min
              </span>
            </div>

            {/* Renk Seçenekleri */}
            {p.variants?.length > 0 && (
              <div className="mb-6 border-b border-slate-100 pb-5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 block">Renk Seçenekleri</label>
                <div className="flex flex-wrap gap-2.5">
                  {p.variants.map((v: any, i: number) => (
                    <button 
                      key={i} 
                      onClick={() => handleVariantSelect(v)} 
                      className={`w-9 h-9 rounded-full border-4 shadow-sm transition-all ${selectedVariant?.ColorName === v.ColorName ? "border-slate-300 scale-110 shadow-md ring-2 ring-[#7C3AED]/20" : "border-transparent hover:scale-105"}`} 
                      style={{ backgroundColor: v.ColorCode }} 
                      title={v.ColorName} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Öne Çıkan Özellikler */}
            {p.bullets && p.bullets.length > 0 && (
              <div className="mb-6">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Öne Çıkan Özellikler</label>
                <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-700 space-y-1.5 font-medium">
                  {p.bullets.map((bullet: string, i: number) => (
                    <li key={i} className="marker:text-[#FF5733]">{bullet}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ürün Açıklaması */}
            <div className="mb-6">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1.5 block">Ürün Açıklaması</label>
              <div className={`prose prose-sm text-xs sm:text-sm text-gray-600 transition-all duration-300 ${!isExpanded ? "line-clamp-3" : ""}`}>
                {descriptionParagraphs.map((p, i) => <p key={i} className="mb-1">{p}</p>)}
              </div>
              {isLongDescription && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-[#7C3AED] font-bold text-xs mt-1.5 hover:underline focus:outline-none"
                >
                  {isExpanded ? "Daha Az Göster" : "Devamını Oku..."}
                </button>
              )}
            </div>

            {/* Teknik Özellikler */}
            {p.specs && p.specs.length > 0 && (
              <div className="mb-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Teknik Özellikler</label>
                <div className="grid grid-cols-1 gap-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-600 font-medium">
                  {p.specs.map((spec: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#FF5733] font-bold select-none">•</span>
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 🛠️ DÜZELTME: Mobilde kaybolmayan, her boyutta yazıları sığdıran akıllı alt bar */}
        <div className="absolute md:relative bottom-0 left-0 w-full bg-white border-t border-slate-100 p-3.5 flex gap-2 sm:gap-3 items-center shrink-0 z-20 shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
          
          {/* Adet Seçici */}
          <div className="flex border border-slate-200 rounded-xl overflow-hidden items-center bg-slate-50 shrink-0 shadow-sm">
            <button onClick={() => setQtyStr(String(Math.max(minQty, Number(qtyStr)-1)))} className="px-3 py-2.5 bg-slate-100/70 hover:bg-slate-200/80 font-black transition text-slate-500 text-sm">-</button>
            <input value={qtyStr} onChange={(e) => setQtyStr(e.target.value.replace(/\D/g, ''))} className="w-9 sm:w-14 text-center font-bold outline-none bg-transparent text-xs sm:text-sm text-slate-800" />
            <button onClick={() => setQtyStr(String(Number(qtyStr)+1))} className="px-3 py-2.5 bg-slate-100/70 hover:bg-slate-200/80 font-black transition text-slate-500 text-sm">+</button>
          </div>

          {/* Sepete Ekle Butonu */}
          <button 
            onClick={onAdd} 
            className="flex-1 bg-[#FF5733] hover:bg-[#e64e2e] text-white font-bold py-3 px-1.5 sm:px-4 rounded-xl shadow-md shadow-[#FF5733]/10 text-[11px] sm:text-xs tracking-wider uppercase transition-all whitespace-nowrap text-center"
          >
            Sepete Ekle
          </button>

          {/* Bilgi Al Butonu */}
          <a 
            href={whatsappUrlForProduct(product.title)} 
            target="_blank" 
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-2.5 sm:px-5 rounded-xl text-[11px] sm:text-xs tracking-wider uppercase transition-all whitespace-nowrap text-center shrink-0"
          >
            Bilgi Al
          </a>
        </div>

      </div>
    </div>
  );
}
