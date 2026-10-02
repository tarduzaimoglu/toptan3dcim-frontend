import Link from 'next/link';
import { accountBackend } from '@/lib/server/account';
import { date, money, orderStatuses, fulfillmentStatuses } from '@/lib/order-display';
export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  let result;
  try { result = await accountBackend('orders', { page: page || 1 }); }
  catch { result = null; }
  if (!result) return <p role="alert">Siparişler yüklenemedi. Lütfen tekrar deneyin.</p>;
    if (result.status !== 200) return <p role="alert">{result.body.message}</p>;
    const data = result.body;
    return <section><h2 className="text-xl font-bold">Siparişlerim</h2>{!data.orders.length ? <p className="mt-5 rounded-2xl bg-slate-50 p-6 text-slate-600">Hesabınıza bağlı sipariş bulunmuyor. Misafir siparişleri bu aşamada hesabınıza otomatik bağlanmaz.</p> : <div className="mt-5 space-y-3">{data.orders.map((o: { documentId: string; orderNumber: string; createdAt: string; status: string; paymentState?: string; fulfillmentState?: string; grandTotal: number; currency: string }) => <Link key={o.documentId} href={`/hesap/siparisler/${o.documentId}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 hover:border-purple-300"><div><p className="break-all font-bold">{o.orderNumber}</p><p className="mt-1 text-sm text-slate-600">{date(o.createdAt)}</p></div><div className="text-sm"><p>Ödeme: {orderStatuses[o.paymentState || o.status] || 'Bilgi mevcut değil'}</p><p>Hazırlık: {fulfillmentStatuses[o.fulfillmentState || ''] || 'Bilgi mevcut değil'}</p><p className="mt-1 font-bold">{money(o.grandTotal, o.currency)}</p></div><span className="text-sm font-semibold text-[#7C3AED]">Detayı görüntüle →</span></Link>)}</div>}<nav aria-label="Sipariş sayfaları" className="mt-5 flex gap-4 text-[#7C3AED]">{data.page > 1 && <Link className="min-h-11 py-3" href={`?page=${data.page - 1}`}>Önceki</Link>}{data.page * 20 < data.total && <Link className="min-h-11 py-3" href={`?page=${data.page + 1}`}>Sonraki</Link>}</nav></section>;
}
