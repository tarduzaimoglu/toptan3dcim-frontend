"use client";
import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/cart/CartContext';
import { accountRequest } from '@/lib/account-client';
import { money } from '@/lib/order-display';

type Address = { documentId: string; label: string; fullName: string; phone: string; city: string; district: string; addressLine: string; defaultShipping: boolean; defaultBilling: boolean };
type Quote = { cartKey: string; quoteHash: string; grandTotal: number; warnings: string[]; lines: { invalid?: boolean }[] };
const fieldClass = 'w-full min-h-12 rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-violet-500';
export default function CheckoutPage() {
  const router = useRouter();
  const { items, hydrated, accountCart, revision, warnings } = useCart();
  const [buyer, setBuyer] = useState({ name: '', email: '', phone: '', address: { city: '', district: '', addressLine: '' } });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [shippingAddressId, setShipping] = useState(''), [billingAddressId, setBilling] = useState('');
  const [contractAccepted, setContract] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [savedQuote, setQuote] = useState<Quote | null>(null);
  const cartKey = JSON.stringify([revision, accountCart, items.map(i => [i.productId,i.qty,i.variant,i.product.wholesalePrice])]);
  const quote = savedQuote?.cartKey === cartKey ? savedQuote : null;
  const enabled = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true';
  useEffect(() => { if (!enabled) router.replace('/cart'); }, [enabled, router]);
  useEffect(() => {
    const clear = () => { setBuyer({ name: '', email: '', phone: '', address: { city: '', district: '', addressLine: '' } }); setAddresses([]); setShipping(''); setBilling(''); setQuote(null); };
    window.addEventListener('customer-session-changed', clear); return () => window.removeEventListener('customer-session-changed', clear);
  }, []);
  useEffect(() => {
    if (!accountCart) return;
    let live = true;
    Promise.all([accountRequest('me'), accountRequest('addresses')]).then(([me, result]) => {
      if (!live) return;
      setBuyer(prev => ({ ...prev, name: me.user.fullName, email: me.user.email, phone: me.user.phone }));
      setAddresses(result.addresses); setShipping(result.addresses.find((a: Address) => a.defaultShipping)?.documentId || ''); setBilling(result.addresses.find((a: Address) => a.defaultBilling)?.documentId || '');
    }).catch(e => { if (live) setError(e.message); });
    return () => { live = false; };
  }, [accountCart]);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return; setBusy(true); setError('');
    const lines = items.map(i => ({ productId: i.productId, qty: i.qty, variant: i.variant || null, price: i.product.wholesalePrice }));
    try {
      if (!quote) {
        const q = await accountRequest('checkout-quote', { items: lines, revision });
        setQuote({ ...q, cartKey }); if (q.lines.some((l: { invalid?: boolean }) => l.invalid)) setError(q.warnings.join(' '));
      } else {
        const input = { items: lines, revision, buyer, shippingAddressId, billingAddressId, contractAccepted, quoteHash: quote.quoteHash };
        const fingerprint = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(input))))).map(b => b.toString(16).padStart(2,'0')).join('');
        const previous = JSON.parse(sessionStorage.getItem('checkout-request') || 'null');
        const checkoutId = previous?.fingerprint === fingerprint ? previous.id : crypto.randomUUID();
        // Only an idempotency key and non-secret input fingerprint. No session/card tokens.
        sessionStorage.setItem('checkout-request', JSON.stringify({ id: checkoutId, fingerprint }));
        const result = await accountRequest('checkout', { ...input, checkoutId });
        const url = new URL(result.oosUrl);
        if (url.protocol !== 'https:') throw new Error('Banka yönlendirme adresi geçersiz.');
        const form = document.createElement('form'); form.method = 'POST'; form.action = url.href;
        for (const [key, value] of Object.entries(result.formFields)) { const field = document.createElement('input'); field.type = 'hidden'; field.name = key; field.value = String(value); form.appendChild(field); }
        document.body.appendChild(form); form.submit();
      }
    } catch (e) { const message = e instanceof Error ? e.message : 'İşlem tamamlanamadı.'; setError(message); if (message.includes('Fiyat değişti') || message.includes('Sepet değişti')) setQuote(null); }
    finally { setBusy(false); }
  }
  if (!enabled || !hydrated) return <main className="mx-auto max-w-5xl p-6">Sepet yükleniyor…</main>;
  if (!items.length) return <main className="mx-auto max-w-5xl p-6"><h1 className="text-3xl font-bold">Ödeme</h1><p className="my-5">Sepetiniz boş.</p><Link href="/products">Ürünlere göz atın</Link></main>;
  const change = (key: 'name' | 'email' | 'phone', value: string) => { setBuyer(prev => ({ ...prev, [key]: value })); setQuote(null); };
  return <main className="mx-auto max-w-5xl px-4 py-10 text-slate-900"><h1 className="text-3xl font-bold">Ödeme</h1><p className="my-4">{accountCart ? 'Siparişiniz hesabınıza bağlanacak.' : 'Misafir olarak alışveriş yapıyorsunuz.'}</p>
    <form onSubmit={submit} className="grid gap-6 rounded-2xl border border-slate-200 p-5 md:grid-cols-2">
      <div className="space-y-4"><h2 className="text-xl font-semibold">Alıcı Bilgileri</h2>
        {(['name','email','phone'] as const).map((key,i) => <label className="block" key={key}>{['Ad Soyad','E-posta','Telefon'][i]}<input className={fieldClass} placeholder={['Ad Soyad','E-posta','Telefon'][i]} value={buyer[key]} type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'} required readOnly={key === 'email' && accountCart} onChange={e => change(key,e.target.value)} autoComplete={key === 'name' ? 'name' : key === 'email' ? 'email' : 'tel'} /></label>)}
        {addresses.length > 0 && <><label className="block">Teslimat adresi<select className={fieldClass} value={shippingAddressId} onChange={e => { setShipping(e.target.value); setQuote(null); }}><option value="">Yeni adres gir</option>{addresses.map(a => <option key={a.documentId} value={a.documentId}>{a.label} · {a.city}/{a.district}</option>)}</select></label><label className="block">Fatura adresi<select className={fieldClass} value={billingAddressId} onChange={e => { setBilling(e.target.value); setQuote(null); }}><option value="">Teslimat adresiyle aynı</option>{addresses.map(a => <option key={a.documentId} value={a.documentId}>{a.label} · {a.city}/{a.district}</option>)}</select></label></>}
        {!shippingAddressId && (['city','district','addressLine'] as const).map((key,i) => <label className="block" key={key}>{['İl','İlçe','Açık Adres'][i]}<input className={fieldClass} placeholder={['İl','İlçe','Açık Adres'][i]} value={buyer.address[key]} required onChange={e => { setBuyer(prev => ({ ...prev, address: { ...prev.address, [key]: e.target.value } })); setQuote(null); }} /></label>)}
        <label className="flex items-start gap-3"><input className="mt-1 h-5 w-5" type="checkbox" required checked={contractAccepted} onChange={e => setContract(e.target.checked)} /><span><Link href="/distance-selling" target="_blank" className="text-violet-700 underline">Mesafeli Satış Sözleşmesi&apos;ni ve Ön Bilgilendirme Koşullarını</Link> okudum, kabul ediyorum.</span></label>
      </div><div className="space-y-4"><h2 className="text-xl font-semibold">Sipariş Özeti</h2>{items.map(i => <p key={i.id}>{i.product.title} × {i.qty}{i.variant?.colorName ? ` · ${i.variant.colorName}` : ''}</p>)}
        {quote && <div className="rounded-xl bg-violet-50 p-4"><p className="font-bold">Sunucudan doğrulanan toplam: {money(quote.grandTotal)}</p><p className="text-sm">Bu tutarı kontrol edip ödemeye geçerek onaylayın.</p>{quote.warnings.map((w,i) => <p key={i}>{w}</p>)}</div>}
        {warnings.map((w,i) => <p key={i} role="alert">{w}</p>)}{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
        <button disabled={busy || !!quote?.lines.some(l => l.invalid)} className="min-h-12 w-full rounded-xl bg-violet-700 px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Kontrol ediliyor…' : quote ? 'Tutarı Onayla ve Ödemeye Geç' : 'Toplamı Kontrol Et'}</button>
      </div>
    </form></main>;
}
