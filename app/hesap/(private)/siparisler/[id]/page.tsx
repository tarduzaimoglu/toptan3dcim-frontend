import Link from 'next/link';
import { notFound } from 'next/navigation';
import { accountBackend } from '@/lib/server/account';
import { date, money, orderStatuses, fulfillmentStatuses } from '@/lib/order-display';
import OrderReturnPanel from '@/components/account/OrderReturnPanel';
import { DetailRow, PageHeading, StatusBadge } from '@/components/account/ui';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let result;
  try { result = await accountBackend('order', { id }); } catch { return <p role="alert">Sipariş yüklenemedi. Lütfen tekrar deneyin.</p>; }
  if (result.status === 404) notFound();
  if (result.status !== 200) return <p role="alert">{result.body.message}</p>;
  const o = result.body.order;
  return <section className="space-y-5"><Link href="/hesap/siparisler" className="inline-flex min-h-11 items-center font-semibold text-[#7C3AED]">← Siparişlerime dön</Link><PageHeading eyebrow="Sipariş detayı" title={o.orderNumber} description={date(o.createdAt)} action={<div className="flex flex-wrap gap-2"><StatusBadge tone="amber">Ödeme: {orderStatuses[o.paymentState] || 'Bilgi yok'}</StatusBadge><StatusBadge tone="purple">Operasyon: {fulfillmentStatuses[o.fulfillmentState] || 'Bilgi yok'}</StatusBadge></div>} />
    <div className="grid gap-5 lg:grid-cols-2"><section className="account-surface account-section"><h3 className="account-section-title">Sipariş takibi</h3><div className="mt-3 space-y-2 text-sm text-slate-700">{o.shippingCarrier && <p>Kargo firması: <strong>{o.shippingCarrier}</strong></p>}{o.trackingNumber && <p className="break-all">Takip numarası: <strong>{o.trackingNumber}</strong></p>}{!o.shippingCarrier && !o.trackingNumber && <p className="text-slate-500">Henüz kargo bilgisi eklenmedi.</p>}{o.trackingUrl && <a className="account-button account-button-secondary mt-2" href={o.trackingUrl} target="_blank" rel="noopener noreferrer">Kargoyu takip et</a>}</div></section><section className="account-surface account-section"><h3 className="account-section-title">Alıcı ve teslimat bilgileri</h3><p className="mt-3 font-semibold">{o.buyerName}</p><p className="break-words text-sm text-slate-600">{[o.buyerEmail, o.buyerPhone].filter(Boolean).join(' · ')}</p>{Object.keys(o.shippingAddress).length ? <p className="mt-3 break-words text-sm leading-6">{[o.shippingAddress.addressLine, o.shippingAddress.district, o.shippingAddress.city].filter(Boolean).join(', ')}</p> : <p className="mt-3 text-sm text-slate-600">Teslimat adresi kaydı mevcut değil.</p>}</section></div>
    <section className="account-surface overflow-hidden"><div className="account-section"><h3 className="account-section-title">Sipariş kalemleri</h3></div><div className="divide-y divide-slate-100 px-5">{o.items.length ? o.items.map((i: { isim: string; adet: number; satirToplami: number; variant?: { colorName: string } }, n: number) => <div key={n} className="flex flex-wrap justify-between gap-3 py-4"><span className="break-words">{i.isim} × {i.adet}{i.variant?.colorName ? ` · ${i.variant.colorName}` : ''}</span><span className="font-semibold">{money(i.satirToplami, o.currency)}</span></div>) : <p className="py-4 text-slate-600">Kalem bilgisi mevcut değil.</p>}</div>
      <dl className="account-section ml-auto max-w-md text-sm"><DetailRow label="Ara toplam" value={money(Number(o.subtotal), o.currency)} /><DetailRow label="İndirim" value={money(Number(o.discountTotal), o.currency)} /><DetailRow label="KDV bilgisi" value={money(Number(o.vatTotal), o.currency)} /><DetailRow label="Kargo" value={money(Number(o.shippingCost), o.currency)} /><DetailRow strong label="Genel toplam" value={money(Number(o.grandTotal), o.currency)} /></dl>
    </section>
    <OrderReturnPanel orderId={o.documentId} />
  </section>;
}
