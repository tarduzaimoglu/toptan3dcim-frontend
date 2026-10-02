"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { accountRequest } from '@/lib/account-client';
import { orderStatuses } from '@/lib/order-display';
import { settleGuestCart } from '@/lib/cart-settlement';
export default function PaymentResult() {
  const params = useSearchParams(), order = params.get('order');
  const [state, setState] = useState(''), [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    if (!order) return;
    accountRequest('payment-result', { orderNumber: order }).then(result => {
      if (!live) return;
      setState(result.paymentState);
      if (result.paymentState === 'paid') {
        // Member cart is settled by the backend. Only the guest cart is in localStorage.
        const key = 'kesiolabs_cart_v1';
        const raw = JSON.parse(localStorage.getItem(key) || '{"items":[]}');
        const value = JSON.stringify(settleGuestCart(Array.isArray(raw) ? { items: raw } : raw, order, result.paidItems));
        localStorage.setItem(key, value);
        window.dispatchEvent(new StorageEvent('storage', { key, newValue: value }));
        window.dispatchEvent(new Event('focus'));
      }
    }).catch(e => { if (live) setError(e.message); });
    return () => { live = false; };
  }, [order]);
  return <main className="mx-auto max-w-2xl px-4 py-14 text-center"><h1 className="text-3xl font-bold">Ödeme sonucu</h1>
    {!order ? <p className="my-5">Doğrulanacak sipariş bulunamadı.</p> : error ? <p role="alert" className="my-5 text-red-700">{error}</p> : <><p className="my-5">{state ? orderStatuses[state] || 'Ödeme sonucu henüz doğrulanamadı.' : 'Sunucudan ödeme sonucu kontrol ediliyor…'}</p>{state && <p className="break-all">Sipariş: {order}</p>}{['pending','unknown'].includes(state) && <p className="my-5">Yeni ödeme başlatmayın. Banka sonucu doğrulandıktan sonra sipariş durumunuz güncellenecek.</p>}</>}
    <div className="mt-6 flex flex-wrap justify-center gap-5"><Link className="min-h-11 py-3 text-violet-700" href="/hesap/siparisler">Siparişlerim</Link><Link className="min-h-11 py-3 text-violet-700" href="/cart">Sepete dön</Link></div></main>;
}
