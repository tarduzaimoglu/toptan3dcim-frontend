'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { accountRequest } from '@/lib/account-client';
import { money, date } from '@/lib/order-display';
import { DetailRow, Notice, StatusBadge, fieldClass, primaryButtonClass, secondaryButtonClass } from '@/components/account/ui';

type Offer = {
  id: string; version: number; state: string; scope: { characters: number; pets: number; colorChoice: string; designDescription: string; includedParts: string[]; sizeDescription?: string; standIncluded?: boolean | null; boxIncluded?: boolean | null; productionDeliveryNote?: string };
  amountMinor: number; taxMinor: number; shippingMinor: number; totalMinor: number; currency: string; taxShippingDisclosure: string; customerNote: string; validUntil?: string | null; acceptedAt?: string | null; approvalInvalidatedAt?: string | null;
};
type Address = { documentId: string; label: string; city: string; district: string; defaultShipping: boolean; defaultBilling: boolean };
type ExistingOrder = { id: string; orderNumber: string; paymentState: string; paymentAvailable: boolean } | null;
type PaymentStart = { oosUrl: string; formFields: Record<string, string | number | boolean> };

function sendToBank(result: PaymentStart) {
  const url = new URL(result.oosUrl);
  if (url.protocol !== 'https:') throw new Error('Banka yönlendirme adresi geçersiz.');
  const form = document.createElement('form'); form.method = 'POST'; form.action = url.href;
  for (const [key, value] of Object.entries(result.formFields || {})) { const field = document.createElement('input'); field.type = 'hidden'; field.name = key; field.value = String(value); form.appendChild(field); }
  document.body.appendChild(form); form.submit();
}

export default function OfferActions({ requestId, offers, existingOrder, paymentsEnabled }: { requestId: string; offers: Offer[]; existingOrder: ExistingOrder; paymentsEnabled: boolean }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [shipping, setShipping] = useState(''), [billing, setBilling] = useState(''), [acceptedTerms, setAcceptedTerms] = useState(false);
  const [comment, setComment] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  const [order, setOrder] = useState(existingOrder);
  const accepted = offers.find(o => o.state === 'accepted' && !o.approvalInvalidatedAt);

  useEffect(() => { if (accepted && !order && addresses.length === 0) void loadAddresses(); }, [accepted, order, addresses.length]);

  async function loadAddresses() {
    try {
      const response = await accountRequest('addresses');
      const rows: Address[] = response.addresses || [];
      setAddresses(rows); setShipping(rows.find(a => a.defaultShipping)?.documentId || rows[0]?.documentId || '');
      setBilling(rows.find(a => a.defaultBilling)?.documentId || '');
    } catch (e) { setError(e instanceof Error ? e.message : 'Adresler yüklenemedi.'); }
  }
  async function run(action: () => Promise<void>) {
    if (busy) return; setBusy(true); setError(''); setMessage('');
    try { await action(); } catch (e) { setError(e instanceof Error ? e.message : 'İşlem tamamlanamadı.'); }
    finally { setBusy(false); }
  }
  async function acceptOffer(offer: Offer) {
    await run(async () => { await accountRequest('figurine-offer-accept', { requestId, offerId: offer.id }); setMessage('Teklif onayınız kaydedildi.'); window.location.reload(); });
  }
  async function requestChange(offer: Offer) {
    await run(async () => { await accountRequest('figurine-change-request', { requestId, offerId: offer.id, comment, idempotencyKey: crypto.randomUUID().replaceAll('-', '') }); setMessage('Değişiklik isteğiniz kaydedildi.'); window.location.reload(); });
  }
  async function createOrder() {
    if (!accepted) return;
    await run(async () => {
      const created = await accountRequest('figurine-convert-order', { requestId, offerId: accepted.id, shippingAddressId: shipping, billingAddressId: billing || null, contractAccepted: acceptedTerms });
      const paymentAvailable = paymentsEnabled;
      setOrder({ id: created.orderId, orderNumber: created.orderNumber, paymentState: created.paymentState, paymentAvailable });
      if (paymentAvailable) sendToBank(await accountRequest('figurine-start-payment', { orderId: created.orderId }));
      else setMessage('Sipariş kaydedildi. Bu ortamda çevrimiçi ödeme etkin değil; tahsilat yapılmadı.');
      window.location.reload();
    });
  }
  async function retryPayment() {
    if (!order) return;
    await run(async () => sendToBank(await accountRequest('figurine-start-payment', { orderId: order.id })));
  }

  return <section className="account-surface overflow-hidden">
    <div className="account-section"><p className="account-eyebrow">Fiyatlandırma</p><h3 className="text-xl font-extrabold">Teklif</h3><p className="mt-1 text-sm text-slate-600">Kapsamı ve fiyat dökümünü inceleyerek yanıtınızı iletin.</p></div>
    {offers.length === 0 && <div className="account-section"><Notice>Talebiniz inceleniyor. Henüz teklif oluşturulmadı.</Notice></div>}
    {offers.map(offer => <article key={offer.id} className="account-section space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-lg font-extrabold">Teklif · Sürüm {offer.version}</h4><StatusBadge tone={offer.state === 'accepted' ? 'green' : offer.state === 'offered' ? 'purple' : 'neutral'}>{({ offered: 'Yanıtınız bekleniyor', accepted: offer.approvalInvalidatedAt ? 'Önceki onay geçersiz' : 'Onaylandı', superseded: 'Yeni sürümle geçersiz', withdrawn: 'Geri çekildi', expired: 'Süresi doldu', 'changes-requested': 'Değişiklik istendi' } as Record<string,string>)[offer.state] || 'Güncellendi'}</StatusBadge></div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]"><div><p className="text-sm font-semibold text-slate-500">{offer.scope.characters} kişi · {offer.scope.pets} pet · {offer.scope.colorChoice === 'color' ? 'Renkli' : offer.scope.colorChoice === 'monochrome' ? 'Beyaz / tek renk' : 'Özel'}</p><h5 className="mt-4 font-bold">Kapsam</h5><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{offer.scope.designDescription}</p><h5 className="mt-4 font-bold">Dahil olanlar</h5><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">{offer.scope.includedParts.map((part, i) => <li key={`${offer.id}-${i}`}>{part}</li>)}</ul>
      {offer.scope.sizeDescription && <p className="text-sm">Boyut: {offer.scope.sizeDescription}</p>}
      {offer.scope.standIncluded !== null && offer.scope.standIncluded !== undefined && <p className="text-sm">Kaide: {offer.scope.standIncluded ? 'Dahil' : 'Dahil değil'}</p>}
      {offer.scope.boxIncluded !== null && offer.scope.boxIncluded !== undefined && <p className="text-sm">Kutu: {offer.scope.boxIncluded ? 'Dahil' : 'Dahil değil'}</p>}
      {offer.scope.productionDeliveryNote && <p className="whitespace-pre-wrap text-sm">Üretim / teslimat: {offer.scope.productionDeliveryNote}</p>}
      {offer.customerNote && <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm"><p className="font-semibold">Size iletilen not</p><p className="mt-1 whitespace-pre-wrap text-slate-700">{offer.customerNote}</p></div>}</div>
      <aside className="h-fit rounded-xl border border-slate-200 bg-slate-50 p-4"><h5 className="font-bold">Fiyat özeti</h5><dl className="mt-2 text-sm"><DetailRow label="Teklif" value={money(offer.amountMinor, offer.currency)} /><DetailRow label="Vergi" value={money(offer.taxMinor, offer.currency)} /><DetailRow label="Kargo" value={money(offer.shippingMinor, offer.currency)} /><DetailRow strong label="Toplam" value={money(offer.totalMinor, offer.currency)} /></dl><p className="mt-3 text-xs leading-5 text-slate-600">{offer.taxShippingDisclosure}</p>{offer.validUntil && <p className="mt-2 text-xs font-semibold text-slate-700">Son geçerlilik: {date(offer.validUntil)}</p>}</aside></div>
      {offer.state === 'offered' && <div className="grid gap-4 border-t border-slate-200 pt-5 lg:grid-cols-2">
        <div><h5 className="font-bold">Teklifi onayla</h5><p className="mt-1 text-sm leading-6 text-slate-600">Onayınız kaydedilir; ödeme alınmış veya üretim başlamış sayılmaz.</p><button type="button" disabled={busy} onClick={() => void acceptOffer(offer)} className={`${primaryButtonClass} mt-3 w-full`}>Teklif sürüm {offer.version} için onay ver</button></div>
        <div><label className="block text-sm font-bold">Değişiklik isteği<textarea value={comment} onChange={e => setComment(e.target.value)} maxLength={2000} rows={3} className={fieldClass} placeholder="İstediğiniz değişikliği açıklayın" /></label><button type="button" disabled={busy || !comment.trim()} onClick={() => void requestChange(offer)} className={`${secondaryButtonClass} mt-3 w-full`}>Değişiklik iste</button></div>
      </div>}
    </article>)}
    {accepted && !order && !paymentsEnabled && <div className="space-y-3 rounded-xl bg-white p-4"><p className="font-semibold">Teklif onayınız kaydedildi. Bu, ödeme alındığı veya üretimin başladığı anlamına gelmez.</p><p className="text-sm text-slate-600">Kartlı ödeme şu anda kapalı. Sonraki adımları ekibimizle görüşün.</p><div className="flex flex-wrap gap-3"><a className="min-h-11 rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white" target="_blank" rel="noreferrer" href={`https://wa.me/905465868005?text=${encodeURIComponent(`Kişiye özel figür teklifimi onayladım. Talep: ${requestId}`)}`}>WhatsApp ile iletişim</a><a className="min-h-11 rounded-xl border px-4 py-3 font-semibold" href={`mailto:info@kesiolabs.com?subject=${encodeURIComponent('Kişiye özel figür teklifi')}`}>E-posta gönder</a></div></div>}
    {accepted && !order && paymentsEnabled && <div className="space-y-3 rounded-xl bg-white p-4">
      <p className="font-semibold">Sürüm {accepted.version} onaylandı. Sipariş için adres bilgilerinizi seçin.</p>
      {addresses.length === 0 ? <><button type="button" onClick={() => void loadAddresses()} className="min-h-11 rounded-xl border px-4">Adresleri yükle</button><p className="text-sm">Adresiniz yoksa önce <Link className="text-violet-700 underline" href="/hesap/adresler">adres ekleyin</Link>.</p></> : <>
        <label className="block text-sm">Teslimat adresi<select className="mt-1 min-h-11 w-full rounded-xl border p-2" value={shipping} onChange={e => setShipping(e.target.value)}>{addresses.map(a => <option key={a.documentId} value={a.documentId}>{a.label} · {a.city}/{a.district}</option>)}</select></label>
        <label className="block text-sm">Fatura adresi<select className="mt-1 min-h-11 w-full rounded-xl border p-2" value={billing} onChange={e => setBilling(e.target.value)}><option value="">Teslimat adresiyle aynı</option>{addresses.map(a => <option key={a.documentId} value={a.documentId}>{a.label} · {a.city}/{a.district}</option>)}</select></label>
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="mt-1 h-5 w-5" /><span><Link href="/distance-selling" target="_blank" className="text-violet-700 underline">Satış koşullarını</Link> okudum ve sipariş oluşturmayı kabul ediyorum.</span></label>
        <button type="button" disabled={busy || !shipping || !acceptedTerms} onClick={() => void createOrder()} className="min-h-12 w-full rounded-xl bg-violet-700 px-4 py-3 font-bold text-white disabled:opacity-50">Sipariş oluştur</button>
      </>}
    </div>}
    {order && <div className="space-y-3 rounded-xl bg-white p-4"><p className="font-semibold">Sipariş oluşturuldu: {order.orderNumber}</p><p className="text-sm">Ödeme durumu: {order.paymentState === 'paid' ? 'Ödendi' : order.paymentState === 'unknown' ? 'Sonuç doğrulanıyor' : 'Ödeme bekliyor'}</p>
      {order.paymentAvailable && order.paymentState !== 'paid' && <button type="button" onClick={() => void retryPayment()} disabled={busy} className="min-h-11 rounded-xl bg-violet-700 px-4 py-2 font-bold text-white disabled:opacity-50">Güvenli ödemeye devam et</button>}
      {!order.paymentAvailable && order.paymentState !== 'paid' && <p className="text-sm text-amber-800">Bu ortamda çevrimiçi ödeme etkin değil. Gerçek tahsilat başlatılmadı.</p>}
      <Link className="inline-block min-h-11 py-3 text-violet-700 underline" href={`/hesap/siparisler/${order.id}`}>Sipariş detayını aç</Link>
    </div>}
    {error && <div className="account-section"><Notice kind="error">{error}</Notice></div>}{message && <div className="account-section"><Notice kind="success">{message}</Notice></div>}
  </section>;
}
