import Link from 'next/link';
import { notFound } from 'next/navigation';
import { accountBackend } from '@/lib/server/account';
import { date, money, orderStatuses, fulfillmentStatuses } from '@/lib/order-display';
import OrderReturnPanel from '@/components/account/OrderReturnPanel';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let result;
  try { result = await accountBackend('order', { id }); } catch { return <p role="alert">Sipariş yüklenemedi. Lütfen tekrar deneyin.</p>; }
  if (result.status === 404) notFound();
  if (result.status !== 200) return <p role="alert">{result.body.message}</p>;
  const o = result.body.order;
  return <section className="space-y-5"><Link href="/hesap/siparisler" className="inline-block min-h-11 py-3 font-semibold text-[#7C3AED]">← Siparişlerim</Link><div className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="break-all text-xl font-bold">{o.orderNumber}</h2><p className="mt-2 text-slate-600">{date(o.createdAt)} · {orderStatuses[o.status] || 'Durum bilgisi mevcut değil'}</p></div>
    <div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold">Sipariş takibi</h3><p>Ödeme: {orderStatuses[o.paymentState] || 'Bilgi mevcut değil'}</p><p>Hazırlık / teslimat: {fulfillmentStatuses[o.fulfillmentState] || 'Bilgi mevcut değil'}</p>{o.shippingCarrier && <p>Kargo firması: {o.shippingCarrier}</p>}{o.trackingNumber && <p className="break-all">Takip numarası: {o.trackingNumber}</p>}{o.trackingUrl && <a className="inline-block min-h-11 py-3 text-violet-700 underline" href={o.trackingUrl} target="_blank" rel="noopener noreferrer">Kargoyu takip et</a>}</div>
    <div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold">Sipariş kalemleri</h3>{o.items.length ? o.items.map((i: { isim: string; adet: number; satirToplami: number; variant?: { colorName: string } }, n: number) => <div key={n} className="flex flex-wrap justify-between gap-3 border-b border-slate-100 py-4"><span className="break-words">{i.isim} × {i.adet}{i.variant?.colorName ? ` · ${i.variant.colorName}` : ''}</span><span className="font-semibold">{money(i.satirToplami, o.currency)}</span></div>) : <p className="mt-3 text-slate-600">Kalem bilgisi mevcut değil.</p>}
      <dl className="mt-5 space-y-2">{[['Ara toplam', o.subtotal], ['İndirim', o.discountTotal], ['KDV bilgisi', o.vatTotal], ['Kargo', o.shippingCost], ['Genel toplam', o.grandTotal]].map(([label, value]) => <div key={String(label)} className="flex justify-between gap-3"><dt>{label}</dt><dd className="font-semibold">{money(Number(value), o.currency)}</dd></div>)}</dl>
    </div><div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold">Sipariş anındaki alıcı ve teslimat bilgileri</h3><p className="mt-3">{o.buyerName}</p><p className="break-words text-sm text-slate-600">{o.buyerEmail} · {o.buyerPhone}</p>{Object.keys(o.shippingAddress).length ? <p className="mt-3 break-words">{[o.shippingAddress.addressLine, o.shippingAddress.district, o.shippingAddress.city].filter(Boolean).join(', ')}</p> : <p className="mt-3 text-slate-600">Teslimat adresi kaydı mevcut değil.</p>}</div>
    <OrderReturnPanel orderId={o.documentId} />
  </section>;
}
