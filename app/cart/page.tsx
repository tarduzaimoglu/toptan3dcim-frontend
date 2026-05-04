"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import {
  useCart,
  CART_MIN_QTY,
  CART_MAX_QTY,
  CART_STEP,
} from "@/components/cart/CartContext";

const WHATSAPP_PHONE = "905537538182"; 
const VAT_RATE = 0.2;
const FREE_SHIPPING_THRESHOLD = 1500; 

const formatTry = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);

function escapeHtml(str: string) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildPrintableHtml(payload: {
  items: Array<{
    title: string;
    qty: number;
    unitBase: number;
    unitEffective: number;
    discountPerUnit: number;
    total: number;
  }>;
  subtotal: number;
  vat: number;
  grandTotal: number;
  savings: number;
  shippingText: string;
  freeShippingHint?: string;
}) {
  const now = new Date();
  const dateStr = now.toLocaleString("tr-TR");

  const rows = payload.items
    .map((x) => {
      const hasDiscount = x.discountPerUnit > 0;
      return `
      <tr>
        <td>${escapeHtml(x.title)}</td>
        <td style="text-align:right;">${x.qty}</td>
        <td style="text-align:right;">
          ${
            hasDiscount
              ? `${escapeHtml(formatTry(x.unitEffective))}<br/><span style="color:#64748b;font-size:11px;text-decoration:line-through;">${escapeHtml(
                  formatTry(x.unitBase)
                )}</span>`
              : `${escapeHtml(formatTry(x.unitBase))}`
          }
        </td>
        <td style="text-align:right;">${escapeHtml(formatTry(x.total))}</td>
      </tr>`;
    })
    .join("");

  const hintLine = payload.freeShippingHint
    ? `<div class="row"><span>Ücretsiz kargo</span><span>${escapeHtml(payload.freeShippingHint)}</span></div>`
    : "";

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="color-scheme" content="light" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>toptan3dcim - Sepet Özeti</title>
  <style>
    *{box-sizing:border-box}
    body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#0f172a;background:#fff}
    h1{margin:0 0 4px;font-size:22px}
    .meta{margin:0 0 18px;color:#334155;font-size:12px}
    table{width:100%;border-collapse:collapse;margin-top:12px}
    th,td{border:1px solid #e2e8f0;padding:10px;font-size:12px;vertical-align:top}
    th{background:#f8fafc;text-align:left}
    .totals{margin-top:14px;display:flex;justify-content:flex-end}
    .box{width:360px;border:1px solid #e2e8f0;border-radius:10px;padding:12px}
    .row{display:flex;justify-content:space-between;font-size:12px;padding:6px 0}
    .sep{height:1px;background:#e2e8f0;margin:6px 0}
    .big{font-size:14px;font-weight:700}
    .save{color:#047857;font-weight:700}
    .note{margin-top:12px;color:#475569;font-size:11px}
    @media print { body{padding:18px} }
  </style>
</head>
<body>
  <h1>toptan3dcim - Sepet Özeti</h1>
  <p class="meta">Tarih: ${escapeHtml(dateStr)}</p>

  <table>
    <thead>
      <tr>
        <th>Ürün</th>
        <th style="text-align:right;">Adet</th>
        <th style="text-align:right;">Birim</th>
        <th style="text-align:right;">Satır Toplam</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="totals">
    <div class="box">
      <div class="row"><span>Ara Toplam (indirimli)</span><span><b>${escapeHtml(formatTry(payload.subtotal))}</b></span></div>
      <div class="row"><span>%20 KDV</span><span><b>${escapeHtml(formatTry(payload.vat))}</b></span></div>
      <div class="row"><span>İndirim Kazancı</span><span class="save">${escapeHtml(formatTry(payload.savings))}</span></div>
      <div class="row"><span>Kargo</span><span><b>${escapeHtml(payload.shippingText)}</b></span></div>
      ${hintLine}
      <div class="sep"></div>
      <div class="row big"><span>Genel Toplam</span><span>${escapeHtml(formatTry(payload.grandTotal))}</span></div>
    </div>
  </div>
  <div class="note">Not: Bu belge otomatik olarak oluşturulmuştur.</div>
</body>
</html>`;
}

export default function CartPage() {
  const {
    items,
    qtyCount,
    clear,
    setQty,
    inc,
    dec,
    remove,
    unitPriceOf,
    discountPerUnitOf,
    effectiveUnitPriceOf,
    lineTotalOf,
    cartTotal,
  } = useCart();

  const [qtyDraft, setQtyDraft] = React.useState<Record<string, string>>({});
  const varietyCount = items.length;

  const mapped = items.map((it) => {
    const id = it.id;
    const title = it.product?.title ?? "Ürün";
    const qty = Number(it.qty ?? (it.product as any)?.minQty ?? CART_MIN_QTY);

    const unitBase = unitPriceOf(id);
    const disc = discountPerUnitOf(id);
    const unitEffective = effectiveUnitPriceOf(id);
    const total = lineTotalOf(id);

    return { id, title, qty, unitBase, discountPerUnit: disc, unitEffective, total, minQty: (it.product as any)?.minQty };
  });

  const subtotal = cartTotal;
  const vat = subtotal * VAT_RATE;
  const grandTotal = subtotal + vat;

  const undiscountedSubtotal = mapped.reduce((sum, x) => sum + x.unitBase * x.qty, 0);
  const savings = Math.max(0, undiscountedSubtotal - subtotal);

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingText = isFreeShipping ? "Ücretsiz" : "Hesaplanacak";

  const freeShippingHint = isFreeShipping
    ? "Koşul sağlandı"
    : `${formatTry(remainingForFree)} daha ekle`;

  const freeShipProgress = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD);

  const handleContinue = () => {
    if (items.length === 0) return;

    // 1. WhatsApp Mesajını Hazırla
    const lines = mapped
      .map((x, i) => {
        const hasDisc = x.discountPerUnit > 0;
        const unitText = hasDisc
          ? `${formatTry(x.unitEffective)} (indirimli) | ${formatTry(x.unitBase)} (liste)`
          : `${formatTry(x.unitBase)}`;
        return `${i + 1}) ${x.title} — ${x.qty} adet — Birim: ${unitText} — Satır: ${formatTry(x.total)}`;
      })
      .join("\n");

    const message =
      `Merhaba, sepet özetimi iletiyorum.\n\n` +
      `${lines}\n\n` +
      `Ara Toplam (indirimli): ${formatTry(subtotal)}\n` +
      `%20 KDV: ${formatTry(vat)}\n` +
      `İndirim Kazancı: ${formatTry(savings)}\n` +
      `Genel Toplam: ${formatTry(grandTotal)}\n` +
      `${isFreeShipping ? "Kargo: Ücretsiz" : "Kargo: Hesaplanacak"}\n\n` +
      `Not: PDF dosyasını bu mesaja ek olarak göndereceğim.`;

    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
    
    // 2. WhatsApp'ı YENİ SEKMEDE aç (Tarayıcı engeline takılmamak için linki hemen tetikliyoruz)
    const waWindow = window.open(url, "_blank");
    if (!waWindow) {
        // Eğer popup engelleyici window.open'ı durdurursa manuel link yöntemi
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // 3. PDF Penceresini 1 saniye sonra aç (WhatsApp penceresinin açılışını bozmaması için)
    setTimeout(() => {
        const html = buildPrintableHtml({
          items: mapped,
          subtotal,
          vat,
          grandTotal,
          savings,
          shippingText,
          freeShippingHint: isFreeShipping ? undefined : freeShippingHint,
        });

        const printWindow = window.open("", "_blank", "width=900,height=700");
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(html);
          printWindow.document.close();
          setTimeout(() => {
            try { printWindow.focus(); printWindow.print(); } catch {}
          }, 500);
        }
    }, 1000);
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 bg-white text-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold">Sepet</h1>
          <div className="mt-2 text-slate-700">
            Sepette toplam <span className="font-semibold">{varietyCount}</span> çeşit üründen <span className="font-semibold">{qtyCount}</span> adet var.
          </div>
        </div>
        {items.length > 0 && (
          <button type="button" onClick={clear} className="h-11 rounded-xl border border-slate-300 px-5 text-sm font-semibold hover:bg-slate-50">
            Sepeti Temizle
          </button>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-700">Sepetiniz şu anda boş.</div>
          ) : (
            <>
              {items.map((it) => {
                const id = it.id;
                const title = it.product?.title ?? "Ürün";
                const img = (it.product as any)?.imageUrl ?? "/products/placeholder.png";
                const minQty = (it.product as any)?.minQty ?? CART_MIN_QTY;
                
                const unitBase = unitPriceOf(id);
                const disc = discountPerUnitOf(id);
                const unitEffective = effectiveUnitPriceOf(id);
                const rowTotal = lineTotalOf(id);

                const draft = qtyDraft[id];
                const inputValue = draft ?? String(it.qty);

                return (
                  <div key={id} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img src={img} alt={title} className="h-14 w-14 rounded-xl object-cover" />
                        <div>
                          <div className="text-[16px] font-semibold">{title}</div>
                          <div className="mt-1 text-[13px] text-slate-700">
                            Birim: <span className="font-semibold">{formatTry(unitEffective)}</span>
                            {disc > 0 && <span className="ml-2 text-slate-500 line-through text-xs">{formatTry(unitBase)}</span>}
                          </div>
                          <div className="mt-1 text-[12px] text-slate-500">
                            Min: <span className="font-medium">{minQty}</span> • Max: <span className="font-medium">{CART_MAX_QTY}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[13px] text-slate-600">Satır Toplam</div>
                        <div className="text-[20px] font-semibold">{formatTry(rowTotal)}</div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="inline-flex items-center gap-2">
                        <button type="button" className="h-10 w-10 rounded-xl border border-slate-300" onClick={() => { dec(id, 1); setQtyDraft((p) => {const c={...p}; delete c[id]; return c;}); }}>–</button>
                        <input
                          value={inputValue}
                          onChange={(e) => setQtyDraft(p => ({ ...p, [id]: e.target.value.replace(/[^\d]/g, "") }))}
                          onBlur={() => {
                            const n = Number(inputValue);
                            if (n < minQty) { alert(`Bu ürün için minimum adet ${minQty}'dir.`); setQty(id, minQty); }
                            else { setQty(id, n); }
                            setQtyDraft((p) => {const c={...p}; delete c[id]; return c;});
                          }}
                          className="h-10 w-[120px] rounded-xl border border-slate-300 text-center font-semibold"
                        />
                        <button type="button" className="h-10 w-10 rounded-xl border border-slate-300" onClick={() => { inc(id, 1); setQtyDraft((p) => {const c={...p}; delete c[id]; return c;}); }}>+</button>
                      </div>
                      <button type="button" onClick={() => remove(id)} className="text-slate-500 hover:text-red-600"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  </div>
                );
              })}
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-[14px] font-semibold">{isFreeShipping ? "Ücretsiz kargo aktif 🎉" : "Ücretsiz kargoya yaklaştın"}</div>
                <div className="mt-4 h-2 w-full rounded-full bg-slate-200">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.round(freeShipProgress * 100)}%` }} />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24 h-fit">
          <div className="text-[18px] font-semibold">Özet</div>
          <div className="mt-5 space-y-3 text-[14px]">
            <div className="flex justify-between"><span>Ara toplam</span><span>{formatTry(subtotal)}</span></div>
            <div className="flex justify-between"><span>%20 KDV</span><span>{formatTry(vat)}</span></div>
            <div className="flex justify-between text-emerald-700"><span>İndirim kazancı</span><span>{formatTry(savings)}</span></div>
            <div className="h-px bg-slate-200 my-2" />
            <div className="flex justify-between font-bold text-lg"><span>Genel toplam</span><span>{formatTry(grandTotal)}</span></div>
            <div className="flex justify-between pt-2"><span>Kargo</span><span className={isFreeShipping ? "text-emerald-700 font-bold" : ""}>{shippingText}</span></div>
          </div>
          <button onClick={handleContinue} className="mt-6 h-12 w-full rounded-xl bg-[#7C3AED] text-white font-semibold hover:bg-[#6D28D9] transition-colors duration-300">Devam Et</button>
          <div className="mt-4 text-[12px] text-slate-600">Not: Adet değişiklikleri kısıtlamalara göre uygulanır.</div>
        </div>
      </div>
    </main>
  );
}