'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { accountRequest } from '@/lib/account-client';
import { money, date } from '@/lib/order-display';

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

  return <section className="space-y-4 rounded-2xl border border-violet-200 bg-violet-50 p-5 sm:p-6">
    <h3 className="text-xl font-bold">Teklif ve sipariş</h3>
    {offers.length === 0 && <p className="text-sm text-slate-700">Talebiniz inceleniyor. Henüz teklif oluşturulmadı.</p>}
    {offers.map(offer => <article key={offer.id} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-bold">Teklif · Sürüm {offer.version}</h4><span className="text-sm text-slate-600">{({ offered: 'Yanıt bekliyor', accepted: offer.approvalInvalidatedAt ? 'Önceki onay geçersiz' : 'Teklif onaylandı', superseded: 'Yeni sürümle geçersiz', withdrawn: 'Geri çekildi', expired: 'Süresi doldu', 'changes-requested': 'Değişiklik istendi' } as Record<string,string>)[offer.state] || offer.state}</span></div>
      <p className="text-sm">{offer.scope.characters} karakter · {offer.scope.pets} pet · {offer.scope.colorChoice === 'color' ? 'Renkli' : offer.scope.colorChoice === 'monochrome' ? 'Beyaz / tek renk' : 'Özel'}</p>
      <p className="whitespace-pre-wrap text-sm">{offer.scope.designDescription}</p>
      <ul className="list-disc pl-5 text-sm">{offer.scope.includedParts.map((part, i) => <li key={`${offer.id}-${i}`}>{part}</li>)}</ul>
      {offer.scope.sizeDescription && <p className="text-sm">Boyut: {offer.scope.sizeDescription}</p>}
      {offer.scope.standIncluded !== null && offer.scope.standIncluded !== undefined && <p className="text-sm">Kaide: {offer.scope.standIncluded ? 'Dahil' : 'Dahil değil'}</p>}
      {offer.scope.boxIncluded !== null && offer.scope.boxIncluded !== undefined && <p className="text-sm">Kutu: {offer.scope.boxIncluded ? 'Dahil' : 'Dahil değil'}</p>}
      {offer.scope.productionDeliveryNote && <p className="whitespace-pre-wrap text-sm">Üretim / teslimat: {offer.scope.productionDeliveryNote}</p>}
      {offer.customerNote && <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm">{offer.customerNote}</p>}
      <dl className="space-y-1 border-t pt-3 text-sm"><div className="flex justify-between"><dt>Teklif</dt><dd>{money(offer.amountMinor, offer.currency)}</dd></div><div className="flex justify-between"><dt>Vergi</dt><dd>{money(offer.taxMinor, offer.currency)}</dd></div><div className="flex justify-between"><dt>Kargo</dt><dd>{money(offer.shippingMinor, offer.currency)}</dd></div><div className="flex justify-between font-bold"><dt>Ödenecek toplam</dt><dd>{money(offer.totalMinor, offer.currency)}</dd></div></dl>
      <p className="text-xs text-slate-600">{offer.taxShippingDisclosure}{offer.validUntil ? ` · Son geçerlilik: ${date(offer.validUntil)}` : ''}</p>
      {offer.state === 'offered' && <div className="space-y-3 border-t pt-3">
        <button type="button" disabled={busy} onClick={() => void acceptOffer(offer)} className="min-h-11 w-full rounded-xl bg-violet-700 px-4 py-3 font-bold text-white disabled:opacity-50">Teklif sürüm {offer.version} için onay ver</button>
        <label className="block text-sm font-medium">Değişiklik isteği<textarea value={comment} onChange={e => setComment(e.target.value)} maxLength={2000} rows={3} className="mt-1 w-full rounded-xl border p-3" placeholder="İstediğiniz değişikliği açıklayın" /></label>
        <button type="button" disabled={busy || !comment.trim()} onClick={() => void requestChange(offer)} className="min-h-11 rounded-xl border border-violet-300 px-4 py-2 font-semibold text-violet-800 disabled:opacity-50">Değişiklik iste</button>
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
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}{message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
  </section>;
}
